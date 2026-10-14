import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';

/**
 * Headless DOM test tools exposed to card harnesses as `dom`.
 * They work against the page's real DOM in the browser and against jsdom in tests:
 * components are rendered into detached-from-layout containers appended to document.body,
 * wrapped in React's act() so effects and state updates flush synchronously.
 */

export class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  readonly elements = new Set<Element>();
  disconnected = false;
  readonly callback: (entries: Array<Partial<IntersectionObserverEntry>>, observer: MockIntersectionObserver) => void;
  readonly options?: unknown;
  constructor(
    callback: (entries: Array<Partial<IntersectionObserverEntry>>, observer: MockIntersectionObserver) => void,
    options?: unknown
  ) {
    this.callback = callback;
    this.options = options;
    MockIntersectionObserver.instances.push(this);
  }
  observe(el: Element) {
    this.elements.add(el);
  }
  unobserve(el: Element) {
    this.elements.delete(el);
  }
  disconnect() {
    this.disconnected = true;
    this.elements.clear();
  }
  takeRecords() {
    return [];
  }
}

export interface RenderResult {
  container: HTMLElement;
  rerender(ui: React.ReactElement): void;
  unmount(): void;
}

export interface HookResult<R> {
  /** Latest returned value. */
  result: { current: R; history: R[] };
  rerender(props?: unknown): void;
  unmount(): void;
}

/**
 * act() replacement for production React builds, where React.act does not exist.
 * Sync callbacks run inside flushSync (so state updates and passive effects flush immediately);
 * async callbacks are awaited and then given a few macrotasks for the scheduler to settle.
 */
export function fallbackAct(callback: () => unknown): PromiseLike<void> {
  let result: unknown;
  flushSync(() => {
    result = callback();
  });
  const settle = async () => {
    for (let i = 0; i < 3; i++) await new Promise<void>((r) => setTimeout(r, 2));
    flushSync(() => {});
  };
  if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
    return (result as PromiseLike<unknown>).then(settle) as PromiseLike<void>;
  }
  return { then: (resolve?: (v: void) => unknown) => Promise.resolve().then(() => resolve?.()) } as PromiseLike<void>;
}

export function createDomTools() {
  if (typeof document === 'undefined') {
    throw new Error('DOM harness tools need a DOM (document is not available in this environment).');
  }
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  const forceFallback = Boolean((globalThis as { __FORCE_FALLBACK_ACT?: boolean }).__FORCE_FALLBACK_ACT);
  const act = (!forceFallback && typeof React.act === 'function' ? React.act : fallbackAct) as typeof React.act;
  const mounted: Array<{ root: Root; container: HTMLElement; unmounted: boolean }> = [];
  const sleepReal = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  MockIntersectionObserver.instances = [];

  function render(ui: React.ReactElement): RenderResult {
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-10000px;top:0;';
    document.body.appendChild(container);
    const root = createRoot(container);
    const entry = { root, container, unmounted: false };
    mounted.push(entry);
    act(() => {
      root.render(ui);
    });
    return {
      container,
      rerender(next) {
        act(() => {
          root.render(next);
        });
      },
      unmount() {
        if (entry.unmounted) return;
        entry.unmounted = true;
        act(() => {
          root.unmount();
        });
        container.remove();
      },
    };
  }

  function renderHook<P, R>(
    hook: (props: P) => R,
    options: { initialProps?: P; wrapper?: React.ComponentType<{ children: React.ReactNode }> } = {}
  ): HookResult<R> {
    const result = { current: undefined as R, history: [] as R[] };
    let lastProps = options.initialProps as P;
    function Probe({ p }: { p: P }) {
      const value = hook(p);
      result.current = value;
      result.history.push(value);
      return null;
    }
    const Wrapper = options.wrapper;
    const element = (p: P) =>
      Wrapper
        ? React.createElement(Wrapper, { children: React.createElement(Probe, { p }) })
        : React.createElement(Probe, { p });
    const r = render(element(lastProps));
    return {
      result,
      rerender(props?: unknown) {
        if (props !== undefined) lastProps = props as P;
        r.rerender(element(lastProps));
      },
      unmount: r.unmount,
    };
  }

  /** Renders `ui` inside an error boundary and returns the error it threw (or null). */
  function renderError(ui: React.ReactElement): Error | null {
    let caught: Error | null = null;
    class Boundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
      state = { failed: false };
      static getDerivedStateFromError() {
        return { failed: true };
      }
      componentDidCatch(error: Error) {
        caught = error;
      }
      render() {
        return this.state.failed ? null : this.props.children;
      }
    }
    const originalError = console.error;
    console.error = () => {};
    try {
      render(React.createElement(Boundary, null, ui));
    } finally {
      console.error = originalError;
    }
    return caught;
  }

  const fire = {
    click(el: Element) {
      act(() => {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
    },
    /** Types a value into an input/textarea like a user would (fires React's onChange). */
    change(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      act(() => {
        setter?.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    },
    /** Dispatches keydown and returns the event so callers can inspect defaultPrevented. */
    keyDown(el: Element, key: string, init: KeyboardEventInit = {}) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
      act(() => {
        el.dispatchEvent(event);
      });
      return event;
    },
    /** Dispatches submit and returns the event (check defaultPrevented). */
    submit(el: Element) {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      act(() => {
        el.dispatchEvent(event);
      });
      return event;
    },
    focus(el: HTMLElement) {
      act(() => {
        el.focus();
      });
    },
    /** Dispatches any DOM event inside act() (mousedown, scroll, storage, mouseover, ...). */
    event(target: EventTarget, event: Event) {
      act(() => {
        target.dispatchEvent(event);
      });
      return event;
    },
  };

  return {
    act,
    render,
    renderHook,
    renderError,
    fire,
    /** First element matching a selector (document-wide by default). */
    q: (selector: string, root: ParentNode = document.body) => root.querySelector<HTMLElement>(selector),
    qa: (selector: string, root: ParentNode = document.body) => Array.from(root.querySelectorAll<HTMLElement>(selector)),
    /** Waits `ms` real milliseconds inside act() so timers, promises and state updates flush. */
    async wait(ms = 0) {
      await act(async () => {
        await sleepReal(ms);
      });
    },
    /** Flushes already-resolved promises and effects. */
    async flush() {
      await act(async () => {});
    },
    /** Active IntersectionObserver mocks (installed as the global IntersectionObserver in harnesses). */
    observers: () => MockIntersectionObserver.instances,
    /** Simulates the observed element entering/leaving the viewport for every live observer. */
    intersect(isIntersecting = true) {
      act(() => {
        for (const o of MockIntersectionObserver.instances) {
          if (o.disconnected) continue;
          o.callback(
            [...o.elements].map((target) => ({ isIntersecting, target, intersectionRatio: isIntersecting ? 1 : 0 })),
            o
          );
        }
      });
    },
    /** Unmounts everything and removes leftover portal nodes. Called automatically after a harness run. */
    cleanup() {
      for (const m of mounted) {
        if (!m.unmounted) {
          m.unmounted = true;
          act(() => {
            m.root.unmount();
          });
        }
        m.container.remove();
      }
      mounted.length = 0;
      MockIntersectionObserver.instances = [];
      document.body.removeAttribute('style');
    },
  };
}

export type DomTools = ReturnType<typeof createDomTools>;
