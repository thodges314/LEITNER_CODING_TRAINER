// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import seedTopics from '../data/topics.json';
import { transpileForExecution } from './runner';
import type { TopicItem } from './leitner';

// Configure React act environment for jsdom
// @ts-expect-error IS_REACT_ACT_ENVIRONMENT is a React global flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

if (typeof globalThis.IntersectionObserver === 'undefined') {
  // @ts-expect-error mock IntersectionObserver for jsdom test runner
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

describe('React preview guard: every previewCode mounts with the reference solution', () => {
  const topics = seedTopics as unknown as TopicItem[];
  const previewCards = topics.filter(
    (t) => typeof t.previewCode === 'string' && t.previewCode.trim().length > 0
  );

  let container: HTMLDivElement | null = null;
  let root: ReactDOMClient.Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOMClient.createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
  });

  it('has at least 2 sample preview cards defined', () => {
    expect(previewCards.length).toBeGreaterThanOrEqual(2);
    expect(previewCards.map((c) => c.id)).toContain('switch-toggle-a11y');
    expect(previewCards.map((c) => c.id)).toContain('star-rating-component');
  });

  for (const card of previewCards) {
    it(`mounts "${card.id}" without throwing, produces non-empty DOM, and log callbacks do not throw`, async () => {
      const referenceSolution = card.referenceSolution || card.solution || '';
      expect(referenceSolution.trim().length, `Card ${card.id} must have a reference solution`).toBeGreaterThan(0);

      const combined = `${referenceSolution}\n\n${card.previewCode}`;
      const transpiled = await transpileForExecution(combined, 'js');
      expect(
        transpiled.ok,
        `Transpilation failed for ${card.id}: ${transpiled.diagnostics.map((d) => d.formatted).join('; ')}`
      ).toBe(true);

      if (card.referenceSolutionTs) {
        const { checkAndTranspileTS } = await import('../utils/typeChecker');
        const tsResult = checkAndTranspileTS(card.referenceSolutionTs);
        expect(
          tsResult.success,
          `TypeScript reference solution check failed for ${card.id}: ${tsResult.diagnostics.map((d) => d.formatted).join('; ')}`
        ).toBe(true);

        const combinedTs = `${card.referenceSolutionTs}\n\n${card.previewCode}`;
        const transpiledTs = await transpileForExecution(combinedTs, 'js');
        expect(
          transpiledTs.ok,
          `Preview transpilation with TS reference solution failed for ${card.id}: ${transpiledTs.diagnostics.map((d) => d.formatted).join('; ')}`
        ).toBe(true);
      }

      const logCallbacks: Array<(...args: unknown[]) => unknown> = [];
      const loggedEvents: Array<{ name: string; args: unknown[] }> = [];

      const mockLog = (name: string, returnValue?: unknown) => {
        const fn = (...args: unknown[]) => {
          loggedEvents.push({ name, args });
          return returnValue;
        };
        logCallbacks.push(fn);
        return fn;
      };

      const scope = {
        React,
        ReactDOM: { ...ReactDOM, ...ReactDOMClient },
        useState: React.useState,
        useEffect: React.useEffect,
        useLayoutEffect: React.useLayoutEffect,
        useRef: React.useRef,
        useReducer: React.useReducer,
        useMemo: React.useMemo,
        useCallback: React.useCallback,
        useContext: React.useContext,
        useId: React.useId,
        useTransition: React.useTransition,
        startTransition: React.startTransition,
        useDeferredValue: React.useDeferredValue,
        useImperativeHandle: React.useImperativeHandle,
        useSyncExternalStore: React.useSyncExternalStore,
        useActionState: (React as unknown as Record<string, unknown>).useActionState,
        use: (React as unknown as Record<string, unknown>).use,
        useOptimistic: (React as unknown as Record<string, unknown>).useOptimistic,
        createContext: React.createContext,
        forwardRef: React.forwardRef,
        Suspense: React.Suspense,
        IntersectionObserver: globalThis.IntersectionObserver,
        log: mockLog,
        exports: {},
        require: (mod: string) => {
          if (mod === 'react') return React;
          if (mod === 'react-dom' || mod === 'react-dom/client') return ReactDOMClient;
          throw new Error(`Cannot find module '${mod}' in preview test`);
        },
      };

      const fn = new Function(
        ...Object.keys(scope),
        `return eval(${JSON.stringify(transpiled.code)});`
      );

      let element: unknown;
      expect(() => {
        element = fn(...Object.values(scope));
      }).not.toThrow();

      expect(React.isValidElement(element), `Expected valid React element from previewCode for ${card.id}`).toBe(true);

      // Mount the element inside React.act
      await act(async () => {
        root?.render(element as React.ReactElement);
      });

      // Assert non-empty DOM
      expect(container?.innerHTML.trim().length, `DOM for ${card.id} must not be empty`).toBeGreaterThan(0);
      expect(container?.children.length, `DOM for ${card.id} must have child elements`).toBeGreaterThan(0);

      // Verify that every created log callback does not throw when invoked
      for (const cb of logCallbacks) {
        expect(() => cb('sample_arg', 42, true)).not.toThrow();
      }

      // Also simulate clicking any interactive buttons in the rendered preview
      const buttons = container?.querySelectorAll('button') ?? [];
      for (const button of Array.from(buttons)) {
        if (!(button as HTMLButtonElement).disabled) {
          await act(async () => {
            (button as HTMLElement).click();
          });
        }
      }
    });
  }
});
