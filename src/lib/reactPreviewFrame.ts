import { REACT_PREVIEW_BUNDLE } from './reactPreviewBundle';

export function createPreviewSrcDoc(theme: 'dark' | 'apple-gsos' = 'dark', envKey = ''): string {
  const isLight = theme === 'apple-gsos';
  const bg = isLight ? '#f8fafc' : '#030712';
  const text = isLight ? '#0f172a' : '#f1f5f9';
  const safeBundle = REACT_PREVIEW_BUNDLE.replace(/<\/script/gi, '<\\/script');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: ${text};
      background-color: ${bg};
      overflow-wrap: break-word;
    }
    button, input, select, textarea {
      font-family: inherit;
      font-size: inherit;
    }
    button {
      cursor: pointer;
    }
    :focus-visible {
      outline: 2px solid #06b6d4;
      outline-offset: 2px;
    }
  </style>
  <script>${safeBundle}</script>
</head>
<body>
  <div id="preview-root"></div>
  <script>
  (function() {
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    if (!React || !ReactDOM) {
      window.parent.postMessage({ type: 'leitner-preview:error', message: 'Failed to load React in preview sandbox.' }, '*');
      return;
    }

    // Expose React and hook globals
    window.useState = React.useState;
    window.useEffect = React.useEffect;
    window.useLayoutEffect = React.useLayoutEffect;
    window.useRef = React.useRef;
    window.useReducer = React.useReducer;
    window.useMemo = React.useMemo;
    window.useCallback = React.useCallback;
    window.useContext = React.useContext;
    window.useId = React.useId;
    window.useTransition = React.useTransition;
    window.startTransition = React.startTransition;
    window.useDeferredValue = React.useDeferredValue;
    window.useImperativeHandle = React.useImperativeHandle;
    window.useSyncExternalStore = React.useSyncExternalStore;
    window.useActionState = React.useActionState;
    window.use = React.use;
    window.useOptimistic = React.useOptimistic;
    window.createContext = React.createContext;
    window.forwardRef = React.forwardRef;
    window.Suspense = React.Suspense;
    window.createPortal = ReactDOM.createPortal;

    // Safe mock shims for $dom, $test, and mount so that any test harness code
    // evaluated inside the preview frame runs safely without throwing ReferenceErrors.
    window.mount = function() {};

    window.$dom = {
      render: function() {
        return {
          container: document.createElement('div'),
          unmount: function() {},
          rerender: function() {}
        };
      },
      renderHook: function(hook) {
        let result = { current: undefined };
        try { result.current = typeof hook === 'function' ? hook() : undefined; } catch (_) {}
        return { result: result, unmount: function() {}, rerender: function() {} };
      },
      renderError: function() { return { error: null }; },
      fire: {
        click: function(el) { try { el?.click?.(); } catch (_) {} return { defaultPrevented: false }; },
        change: function(el, val) {
          if (el) {
            el.value = typeof val === 'object' && val && 'target' in val ? val.target.value : (val !== undefined ? val : '');
            try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
            try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (_) {}
          }
          return { defaultPrevented: false };
        },
        keyDown: function() { return { defaultPrevented: false }; },
        submit: function(el) {
          try { el?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); } catch (_) {}
          return { defaultPrevented: true };
        },
        focus: function(el) { try { el?.focus?.(); } catch (_) {} },
        event: function() { return { defaultPrevented: false }; },
      },
      q: function(sel, root) { return (root || document).querySelector(sel) || document.createElement('div'); },
      qa: function(sel, root) { return Array.from((root || document).querySelectorAll(sel)); },
      wait: function() { return Promise.resolve(); },
      flush: function() { return Promise.resolve(); },
      act: function(fn) { return fn ? fn() : undefined; },
      intersect: function() {},
      cleanup: function() {},
    };

    window.$test = {
      check: function() {},
      equal: function() {},
      run: function() {},
      rejects: function() { return Promise.resolve(); },
      logs: function() {},
      sleep: function() { return Promise.resolve(); },
    };

    let activeRenderId = null;

    function stringify(arg) {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'number' || typeof arg === 'boolean' || arg === null || arg === undefined) return String(arg);
      if (typeof arg === 'function') return '[Function ' + (arg.name || 'anonymous') + ']';
      if (arg instanceof Error) return arg.name + ': ' + arg.message;
      try {
        return JSON.stringify(arg, function(k, v) {
          if (typeof v === 'function') return '[Function]';
          if (v === undefined) return 'undefined';
          return v;
        });
      } catch (e) {
        return String(arg);
      }
    }

    // log(name, ...callArgs) helper: appends to event log and returns optional return value
    window.log = function log(name, ...callArgs) {
      function sendEvent(args) {
        window.parent.postMessage({
          type: 'leitner-preview:event',
          name: String(name),
          args: args.map(stringify),
          timestamp: Date.now()
        }, '*');
      }
      if (callArgs.length > 0 && typeof callArgs[0] !== 'undefined') {
        sendEvent(callArgs);
      }
      return function(...args) {
        sendEvent(args);
        return callArgs[0];
      };
    };

    // Intercept console
    const orig = { log: console.log, info: console.info, warn: console.warn, error: console.error };
    ['log', 'info', 'warn', 'error'].forEach(function(method) {
      console[method] = function(...args) {
        try { orig[method].apply(console, args); } catch (_) {}
        window.parent.postMessage({
          type: 'leitner-preview:console',
          method: method,
          args: args.map(stringify),
          timestamp: Date.now()
        }, '*');
      };
    });

    window.addEventListener('error', function(e) {
      const msg = e.error ? (e.error.stack || e.error.message || String(e.error)) : (e.message || 'Unknown error');
      window.parent.postMessage({
        type: 'leitner-preview:error',
        renderId: activeRenderId,
        message: msg,
        timestamp: Date.now()
      }, '*');
    });

    window.addEventListener('unhandledrejection', function(e) {
      const msg = e.reason ? (e.reason.stack || e.reason.message || String(e.reason)) : 'Unhandled rejection';
      window.parent.postMessage({
        type: 'leitner-preview:error',
        renderId: activeRenderId,
        message: msg,
        timestamp: Date.now()
      }, '*');
    });

    class PreviewErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
      }
      componentDidCatch(error) {
        window.parent.postMessage({
          type: 'leitner-preview:error',
          renderId: this.props.renderId,
          message: 'Render error: ' + (error?.message || String(error)),
          timestamp: Date.now()
        }, '*');
      }
      render() {
        if (this.state.hasError) {
          return React.createElement('div', {
            role: 'alert',
            style: {
              color: '#f87171',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              fontSize: '12.5px',
              fontFamily: 'monospace'
            }
          }, 'Render Error: ' + (this.state.error?.message || String(this.state.error)));
        }
        return this.props.children;
      }
    }

    function RenderNotifier(props) {
      React.useEffect(function() {
        window.parent.postMessage({ type: 'leitner-preview:rendered', renderId: props.renderId }, '*');
      }, [props.renderId]);
      return null;
    }

    let root = null;
    const container = document.getElementById('preview-root');

    // Render-loop watchdog: React never stops an effect that sets state on every render, so count commits.
    // More than 100 commits in one second means a loop (normal UI, even 60fps animation, stays below that).
    let commitTimes = [];
    let loopTripped = false;
    function onProfilerRender() {
      const now = Date.now();
      commitTimes.push(now);
      while (commitTimes.length && now - commitTimes[0] > 1000) commitTimes.shift();
      if (commitTimes.length > 100 && !loopTripped) {
        loopTripped = true;
        setTimeout(function() {
          if (root) { root.unmount(); root = null; }
          window.parent.postMessage({
            type: 'leitner-preview:error',
            renderId: activeRenderId,
            message: 'Possible infinite render loop: the component re-rendered more than 100 times in one second, so it was stopped. Check for an effect that sets state on every render.',
            timestamp: Date.now()
          }, '*');
        }, 0);
      }
    }

    window.addEventListener('message', function(event) {
      const data = event.data;
      if (!data || data.type !== 'leitner-preview:render') return;
      const code = data.code;
      const renderId = data.renderId;
      activeRenderId = renderId;
      commitTimes = [];
      loopTripped = false;

      try {
        if (!root) {
          root = ReactDOM.createRoot(container);
        }

        window.exports = window.exports || {};
        window.module = window.module || { exports: window.exports };
        window.require = function(mod) {
          if (mod === 'react') return React;
          if (mod === 'react-dom' || mod === 'react-dom/client') return ReactDOM;
          throw new Error("Cannot find module '" + mod + "' in preview sandbox");
        };

        const element = (0, eval)(code);

        if (React.isValidElement(element)) {
          root.render(
            React.createElement(React.Profiler, { id: 'preview', onRender: onProfilerRender },
              React.createElement(PreviewErrorBoundary, { key: renderId, renderId: renderId },
                React.createElement(React.Fragment, null,
                  element,
                  React.createElement(RenderNotifier, { renderId: renderId })
                )
              )
            )
          );
        } else {
          window.parent.postMessage({
            type: 'leitner-preview:error',
            renderId: renderId,
            message: 'Preview code did not evaluate to a valid React element. The last statement must be a JSX element (e.g. <Demo />).'
          }, '*');
        }
      } catch (err) {
        const msg = err ? (err.stack || err.message || String(err)) : 'Execution failed';
        window.parent.postMessage({
          type: 'leitner-preview:error',
          renderId: renderId,
          message: msg,
          timestamp: Date.now()
        }, '*');
      }
    });

    window.parent.postMessage({ type: 'leitner-preview:ready', envKey: ${JSON.stringify(envKey)} }, '*');
  })();
  </script>
</body>
</html>`;
}
