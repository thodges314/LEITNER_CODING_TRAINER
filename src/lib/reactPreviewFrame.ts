import { REACT_PREVIEW_BUNDLE } from './reactPreviewBundle';

export function createPreviewSrcDoc(theme: 'dark' | 'apple-gsos' = 'dark'): string {
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

    // log(name, returnValue) helper: appends to event log and returns optional return value
    window.log = function log(name, returnValue) {
      return function(...args) {
        window.parent.postMessage({
          type: 'leitner-preview:event',
          name: String(name),
          args: args.map(stringify),
          timestamp: Date.now()
        }, '*');
        return returnValue;
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

    window.addEventListener('message', function(event) {
      const data = event.data;
      if (!data || data.type !== 'leitner-preview:render') return;
      const code = data.code;
      const renderId = data.renderId;
      activeRenderId = renderId;

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
            React.createElement(PreviewErrorBoundary, { key: renderId, renderId: renderId },
              React.createElement(React.Fragment, null,
                element,
                React.createElement(RenderNotifier, { renderId: renderId })
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

    window.parent.postMessage({ type: 'leitner-preview:ready' }, '*');
  })();
  </script>
</body>
</html>`;
}
