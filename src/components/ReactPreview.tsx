import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Layers,
  RotateCcw,
  X,
  AlertTriangle,
  Trash2,
  Terminal,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Minimize2,
} from 'lucide-react';
import type { TopicItem } from '../lib/leitner';
import { transpileForExecution } from '../lib/runner';
import type { ExecutionMode } from '../lib/runner';
import { stripTestRunnerBlock } from '../lib/stripTestRunner';
import { isTsOnlyCard } from '../lib/tsOnly';
// The preview runtime (about 220 KB of bundled React) is loaded on demand, only for cards that show a preview.
type PreviewFrameModule = typeof import('../lib/reactPreviewFrame');

export interface ReactPreviewProps {
  card: TopicItem;
  code: string;
  executionMode: ExecutionMode;
  theme?: 'dark' | 'apple-gsos';
  isLive?: boolean;
  runTrigger?: number;
  onClose?: () => void;
}

export interface PreviewLogItem {
  id: string;
  type: 'event' | 'console';
  name?: string;
  method?: string;
  args: string[];
  timestamp: number;
}

export const ReactPreview: React.FC<ReactPreviewProps> = ({
  card,
  code,
  executionMode,
  theme = 'dark',
  isLive = false,
  runTrigger = 0,
  onClose,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [status, setStatus] = useState<'idle' | 'compiling' | 'rendering' | 'live' | 'error' | 'timeout'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<PreviewLogItem[]>([]);
  const popupWindowRef = useRef<Window | null>(null);
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  const isLight = theme === 'apple-gsos';
  const currentEnvKey = `${iframeKey}-${theme}-${isPoppedOut ? 'popup' : 'inline'}`;
  const [frameModule, setFrameModule] = useState<PreviewFrameModule | null>(null);
  useEffect(() => {
    let alive = true;
    void import('../lib/reactPreviewFrame').then((m) => {
      if (alive) setFrameModule(m);
    });
    return () => {
      alive = false;
    };
  }, []);
  const [readyEnvKey, setReadyEnvKey] = useState<string | null>(null);
  const isIframeReady = readyEnvKey === currentEnvKey;

  const currentRenderIdRef = useRef<string>('');
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTimedOutRef = useRef(false);

  const clearWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  // PostMessage listener
  const handleMessage = useCallback((event: MessageEvent) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (typeof data.type !== 'string' || !data.type.startsWith('leitner-preview:')) return;

    if (data.type === 'leitner-preview:ready') {
      setReadyEnvKey(data.envKey ?? currentEnvKey);
    } else if (data.type === 'leitner-preview:rendered') {
      if (data.renderId === currentRenderIdRef.current) {
        clearWatchdog();
        setStatus('live');
        setErrorMessage(null);
      }
    } else if (data.type === 'leitner-preview:error') {
      if (!data.renderId || data.renderId === currentRenderIdRef.current) {
        clearWatchdog();
        setStatus('error');
        setErrorMessage(data.message || 'Execution error');
      }
    } else if (data.type === 'leitner-preview:event') {
      setLogs((prev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'event',
          name: data.name,
          args: data.args || [],
          timestamp: data.timestamp || Date.now(),
        },
        ...prev.slice(0, 49),
      ]);
    } else if (data.type === 'leitner-preview:console') {
      setLogs((prev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: 'console',
          method: data.method,
          args: data.args || [],
          timestamp: data.timestamp || Date.now(),
        },
        ...prev.slice(0, 49),
      ]);
    }
  }, [clearWatchdog, currentEnvKey]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearWatchdog();
    };
  }, [handleMessage, clearWatchdog]);

  // Transpile and send code to iframe
  const sendToIframe = useCallback(async () => {
    const popup = popupWindowRef.current;
    let targetWindow =
      iframeRef.current?.contentWindow ||
      (popup && !popup.closed ? (popup.document.querySelector('iframe')?.contentWindow as Window | null) : null) ||
      (document.querySelector('.react-preview-window iframe') as HTMLIFrameElement | null)?.contentWindow ||
      null;

    if (!targetWindow) {
      await new Promise((r) => setTimeout(r, 50));
      targetWindow =
        iframeRef.current?.contentWindow ||
        (popup && !popup.closed ? (popup.document.querySelector('iframe')?.contentWindow as Window | null) : null) ||
        (document.querySelector('.react-preview-window iframe') as HTMLIFrameElement | null)?.contentWindow ||
        null;
    }

    if (!card.previewCode || !targetWindow) return;

    setStatus('compiling');
    const userComponentCode = stripTestRunnerBlock(code);
    const combined = `${userComponentCode}\n\n${card.previewCode}`;
    const mode = isTsOnlyCard(card) ? 'ts' : executionMode;
    const transpiled = await transpileForExecution(combined, mode, 800);

    if (!transpiled.ok) {
      setStatus('error');
      setErrorMessage(
        transpiled.diagnostics.map((d) => d.formatted).join('\n') || 'Transpilation error'
      );
      return;
    }

    const renderId = `${Date.now()}-${Math.random()}`;
    currentRenderIdRef.current = renderId;
    setStatus('rendering');
    setErrorMessage(null);

    // Watchdog timer (2000ms): if infinite loop or freeze happens, restart iframe
    clearWatchdog();
    watchdogTimerRef.current = setTimeout(() => {
      hasTimedOutRef.current = true;
      setStatus('timeout');
      setErrorMessage('Preview timed out (infinite loop or runaway code). Sandboxed iframe was reset.');
      setIframeKey((k) => k + 1);
    }, 2000);

    try {
      targetWindow.postMessage(
        {
          type: 'leitner-preview:render',
          code: transpiled.code,
          renderId,
        },
        '*'
      );
    } catch (err) {
      clearWatchdog();
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }, [card.previewCode, card.track, code, executionMode, clearWatchdog]);

  // Reset timeout halt whenever user changes code
  useEffect(() => {
    hasTimedOutRef.current = false;
  }, [code]);

  // Whenever the iframe becomes ready while live, or when isLive becomes true while ready, immediately render!
  useEffect(() => {
    if (isLive && isIframeReady && !hasTimedOutRef.current) {
      void sendToIframe();
    }
  }, [isLive, isIframeReady, sendToIframe]);

  // When runTrigger fires (e.g. user clicks "Run Code / Test" button), re-compile immediately!
  const prevRunTriggerRef = useRef(runTrigger);
  useEffect(() => {
    if (runTrigger !== prevRunTriggerRef.current) {
      prevRunTriggerRef.current = runTrigger;
      if (isLive && !hasTimedOutRef.current) {
        setReadyEnvKey(currentEnvKey);
        void sendToIframe();
      }
    }
  }, [runTrigger, isLive, currentEnvKey, sendToIframe]);

  // Re-render debounced (500ms) on typing when live
  const prevCodeRef = useRef(code);
  useEffect(() => {
    if (!isLive || !isIframeReady || hasTimedOutRef.current) {
      prevCodeRef.current = code;
      return;
    }
    if (prevCodeRef.current === code) return;
    prevCodeRef.current = code;

    const timer = setTimeout(() => {
      void sendToIframe();
    }, 500);

    return () => clearTimeout(timer);
  }, [code, isIframeReady, isLive, sendToIframe]);

  // Sync popup window styling when theme changes
  useEffect(() => {
    const popup = popupWindowRef.current;
    if (!popup || popup.closed) return;
    try {
      popup.document.body.style.backgroundColor = isLight ? '#f8fafc' : '#030712';
      popup.document.body.style.color = isLight ? '#0f172a' : '#f1f5f9';
    } catch {
      // Ignore cross-window errors
    }
  }, [isLight, isPoppedOut]);

  // Listen to message events from popup window if active
  useEffect(() => {
    const popup = popupWindowRef.current;
    if (!popup || popup.closed) return;
    popup.addEventListener('message', handleMessage);
    return () => {
      try {
        popup.removeEventListener('message', handleMessage);
      } catch {
        // Ignore
      }
    };
  }, [isPoppedOut, handleMessage]);

  const handleRestart = () => {
    hasTimedOutRef.current = false;
    clearWatchdog();
    setStatus('compiling');
    setErrorMessage(null);
    setIframeKey((k) => k + 1);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleIframeLoad = useCallback(() => {
    setReadyEnvKey(currentEnvKey);
  }, [currentEnvKey]);

  const handlePopOut = useCallback(() => {
    const existing = popupWindowRef.current;
    if (existing && !existing.closed) {
      existing.focus();
      return;
    }

    const w = 640;
    const h = 760;
    const left = typeof window.screenX === 'number' ? window.screenX + Math.max(0, (window.outerWidth - w) / 2) : 100;
    const top = typeof window.screenY === 'number' ? window.screenY + Math.max(0, (window.outerHeight - h) / 2) : 100;

    const popup = (() => {
      try {
        return window.open(
          'about:blank',
          'leitner_react_preview',
          `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );
      } catch {
        return null;
      }
    })();

    if (!popup) {
      return;
    }

    try {
      popup.document.title = `Preview: ${card.title} — Leitner Coding Trainer`;
      popup.document.head.innerHTML = '';
      for (const el of Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))) {
        popup.document.head.appendChild(el.cloneNode(true));
      }
      popup.document.body.style.margin = '0';
      popup.document.body.style.padding = '12px';
      popup.document.body.style.backgroundColor = isLight ? '#f8fafc' : '#030712';
      popup.document.body.style.color = isLight ? '#0f172a' : '#f1f5f9';
      popup.document.body.style.fontFamily = getComputedStyle(document.body).fontFamily;
      popup.document.body.style.boxSizing = 'border-box';
      popup.document.body.style.height = '100vh';
      popup.document.body.style.display = 'flex';
      popup.document.body.style.flexDirection = 'column';

      popup.addEventListener('pagehide', () => {
        popupWindowRef.current = null;
        setPortalContainer(null);
        setIsPoppedOut(false);
      });

      popup.addEventListener('message', (ev) => {
        handleMessage(ev);
      });
    } catch {
      // Ignore cross-window document configuration failures
    }

    popupWindowRef.current = popup;
    setPortalContainer(popup.document.body);
    setIsPoppedOut(true);
  }, [card.title, isLight, handleMessage]);

  const handleDockBack = useCallback(() => {
    const popup = popupWindowRef.current;
    if (popup && !popup.closed) {
      try {
        popup.close();
      } catch {
        // Ignore
      }
    }
    popupWindowRef.current = null;
    setPortalContainer(null);
    setIsPoppedOut(false);
  }, []);

  // Clean up popup window on unmount
  useEffect(() => {
    return () => {
      const popup = popupWindowRef.current;
      if (popup && !popup.closed) {
        try {
          popup.close();
        } catch {
          // Ignore
        }
      }
      popupWindowRef.current = null;
    };
  }, []);

  // Heartbeat to detect popup closure via OS close button
  useEffect(() => {
    if (!isPoppedOut) return;
    const timer = setInterval(() => {
      const popup = popupWindowRef.current;
      if (!popup || popup.closed) {
        popupWindowRef.current = null;
        setPortalContainer(null);
        setIsPoppedOut(false);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [isPoppedOut]);

  const previewPane = (
    <div
      className="react-preview-window"
      data-testid={isPoppedOut ? 'react-preview-popout-window' : 'react-preview-window'}
      style={{
        borderRadius: isPoppedOut ? '0px' : '8px',
        border: isPoppedOut ? 'none' : '1px solid rgba(6, 182, 212, 0.35)',
        backgroundColor: isLight ? '#ffffff' : '#030712',
        overflow: 'hidden',
        boxShadow: isPoppedOut ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '0px',
        flex: isPoppedOut ? 1 : undefined,
        height: isPoppedOut ? '100%' : undefined,
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: isLight ? '#f1f5f9' : '#061320',
          borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="#06b6d4" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#0f172a' : '#f1f5f9' }}>
            Live React Preview Window {isPoppedOut ? '(Pop-out)' : ''}
          </span>

          {/* Status Badge */}
          {!isLive && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#94a3b8',
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.25)',
              }}
              data-testid="preview-status-badge"
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#94a3b8',
                }}
              />
              Ready
            </span>
          )}
          {isLive && (status === 'compiling' || status === 'idle') && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              <Loader2 size={11} className="animate-spin" /> Compiling...
            </span>
          )}
          {isLive && status === 'rendering' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#fbbf24',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              <Loader2 size={11} className="animate-spin" /> Rendering...
            </span>
          )}
          {isLive && status === 'live' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#34d399',
                backgroundColor: 'rgba(52, 211, 153, 0.12)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(52, 211, 153, 0.35)',
              }}
              data-testid="preview-status-badge"
            >
              <CheckCircle2 size={11} color="#10b981" /> Live
            </span>
          )}
          {isLive && status === 'error' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#f87171',
                backgroundColor: 'rgba(248, 113, 113, 0.12)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(248, 113, 113, 0.35)',
              }}
              data-testid="preview-status-badge"
            >
              <AlertTriangle size={11} color="#f87171" /> Error
            </span>
          )}
          {isLive && status === 'timeout' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#fb923c',
                backgroundColor: 'rgba(251, 146, 60, 0.12)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(251, 146, 60, 0.35)',
              }}
              data-testid="preview-status-badge"
            >
              <AlertTriangle size={11} color="#fb923c" /> Timed Out
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleRestart}
            data-testid="preview-restart-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
              padding: '3px 8px',
              borderRadius: '4px',
            }}
            title="Restart preview sandbox"
          >
            <RotateCcw size={12} /> Restart
          </button>

          {isPoppedOut ? (
            <button
              type="button"
              onClick={handleDockBack}
              data-testid="preview-dock-btn"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11.5px',
                padding: '3px 8px',
                borderRadius: '4px',
              }}
              title="Dock preview back into main window"
            >
              <Minimize2 size={12} /> Dock back
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePopOut}
              data-testid="preview-popout-btn"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11.5px',
                padding: '3px 8px',
                borderRadius: '4px',
              }}
              title="Open preview in a pop-out window"
            >
              <ExternalLink size={12} /> Pop out
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={() => {
                if (isPoppedOut) handleDockBack();
                onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '3px 6px',
                borderRadius: '4px',
              }}
              title="Close preview"
              aria-label="Close preview"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Error Notice Box (if any and live) */}
      {isLive && errorMessage && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            maxHeight: '120px',
            overflowY: 'auto',
          }}
        >
          <strong>Preview Error:</strong> {errorMessage}
        </div>
      )}

      {/* When not live yet, show clean, quiet ready state */}
      {!isLive && (
        <div
          data-testid="preview-ready-placeholder"
          style={{
            width: '100%',
            height: isPoppedOut ? '380px' : '240px',
            flex: isPoppedOut ? '1 1 auto' : undefined,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px 12px',
            color: '#64748b',
            backgroundColor: isLight ? '#f8fafc' : '#030712',
          }}
        >
          <Layers size={28} color="#0891b2" style={{ marginBottom: '8px', opacity: 0.7 }} />
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
            Ready to Preview
          </div>
          <div style={{ fontSize: '11.5px', maxWidth: '320px', lineHeight: 1.5, color: '#64748b' }}>
            Run code to start live component preview.
          </div>
        </div>
      )}

      {/* Sandboxed Iframe Window (initialized in background, visible once live) */}
      <div
        style={{
          width: '100%',
          height: isPoppedOut ? '380px' : '240px',
          flex: isPoppedOut ? '1 1 auto' : undefined,
          backgroundColor: isLight ? '#f8fafc' : '#030712',
          position: 'relative',
          display: isLive ? 'block' : 'none',
        }}
      >
        {frameModule && (
        <iframe
          key={currentEnvKey}
          ref={iframeRef}
          title="React Component Preview"
          sandbox="allow-scripts"
          srcDoc={frameModule.createPreviewSrcDoc(theme, currentEnvKey)}
          onLoad={handleIframeLoad}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
        )}
      </div>

      {/* Event Log & Console Panel (rendered once live) */}
      {isLive && (
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.4)',
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: isPoppedOut ? '220px' : '160px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11.5px',
              color: 'var(--text-dim)',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={12} color="#94a3b8" />
              <span style={{ fontWeight: 600 }}>Event Log & Output</span>
              {logs.length > 0 && (
                <span
                  style={{
                    fontSize: '10.5px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {logs.length}
                </span>
              )}
            </div>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '11px',
                  padding: '2px 4px',
                }}
                title="Clear log"
              >
                <Trash2 size={11} /> Clear
              </button>
            )}
          </div>

          <div
            style={{
              overflowY: 'auto',
              maxHeight: isPoppedOut ? '180px' : '120px',
              fontSize: '11.5px',
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>
                No callback events or logs captured yet. Interact with the preview to test callbacks.
              </div>
            ) : (
              logs.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      color: item.type === 'event' ? '#38bdf8' : '#a855f7',
                      backgroundColor:
                        item.type === 'event'
                          ? 'rgba(56, 189, 248, 0.12)'
                          : 'rgba(168, 85, 247, 0.12)',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      flexShrink: 0,
                    }}
                  >
                    {item.type === 'event' ? 'event' : item.method}
                  </span>
                  <span style={{ color: isLight ? '#0f172a' : '#cbd5e1' }}>
                    {item.type === 'event' ? (
                      <>
                        <strong style={{ color: '#38bdf8' }}>{item.name}</strong>(
                        {item.args.join(', ')})
                      </>
                    ) : (
                      item.args.join(' ')
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isPoppedOut && portalContainer) {
    return (
      <>
        <div
          className="react-preview-window react-preview-docked"
          data-testid="react-preview-window"
          style={{
            borderRadius: '8px',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            backgroundColor: isLight ? '#ffffff' : '#030712',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="#06b6d4" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#0f172a' : '#f1f5f9' }}>
                Live React Preview Window (Pop-out Active)
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                Preview is running in a separate window. Code edits sync live.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDockBack}
              data-testid="preview-main-dock-btn"
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', gap: '5px' }}
            >
              <Minimize2 size={13} /> Dock back
            </button>
            {onClose && (
              <button
                type="button"
                onClick={() => {
                  handleDockBack();
                  onClose();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '3px 6px',
                  borderRadius: '4px',
                }}
                title="Close preview"
                aria-label="Close preview"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
        {createPortal(previewPane, portalContainer)}
      </>
    );
  }

  return previewPane;
};
