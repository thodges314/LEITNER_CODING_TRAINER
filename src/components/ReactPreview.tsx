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
import { createPreviewSrcDoc } from '../lib/reactPreviewFrame';

export interface ReactPreviewProps {
  card: TopicItem;
  code: string;
  executionMode: ExecutionMode;
  theme?: 'dark' | 'apple-gsos';
  onClose: () => void;
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
  onClose,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [status, setStatus] = useState<'idle' | 'compiling' | 'rendering' | 'live' | 'error' | 'timeout'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<PreviewLogItem[]>([]);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);

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
    if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
      return;
    }
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (typeof data.type !== 'string' || !data.type.startsWith('leitner-preview:')) return;

    if (data.type === 'leitner-preview:ready') {
      setIsIframeReady(true);
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
  }, [clearWatchdog]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearWatchdog();
    };
  }, [handleMessage, clearWatchdog]);

  useEffect(() => {
    if (!popupWindow) return;
    popupWindow.addEventListener('message', handleMessage);
    return () => {
      popupWindow.removeEventListener('message', handleMessage);
    };
  }, [popupWindow, handleMessage]);

  // Transpile and send code to iframe
  const sendToIframe = useCallback(async () => {
    if (!card.previewCode || !iframeRef.current?.contentWindow) return;

    setStatus('compiling');
    const combined = `${code}\n\n${card.previewCode}`;
    const mode = card.track === 'typescript-patterns' ? 'ts' : executionMode;
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
      // Increment iframe key to destroy and recreate the sandboxed iframe
      setIsIframeReady(false);
      setIframeKey((k) => k + 1);
    }, 2000);

    try {
      iframeRef.current.contentWindow.postMessage(
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

  // Re-render debounced (500ms) on typing, or immediately when iframe ready
  useEffect(() => {
    if (!isIframeReady) return;
    if (hasTimedOutRef.current) return;
    const timer = setTimeout(() => {
      void sendToIframe();
    }, 500);

    return () => clearTimeout(timer);
  }, [code, isIframeReady, sendToIframe]);

  const handleRestart = () => {
    hasTimedOutRef.current = false;
    clearWatchdog();
    setIsIframeReady(false);
    setStatus('idle');
    setErrorMessage(null);
    setIframeKey((k) => k + 1);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const isLight = theme === 'apple-gsos';
  const isPoppedOut = Boolean(popupWindow && !popupWindow.closed);

  const handlePopOut = useCallback(() => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.focus();
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

      popup.addEventListener('beforeunload', () => {
        setPopupWindow(null);
        setIsIframeReady(false);
        setIframeKey((k) => k + 1);
      });
    } catch {
      // Ignore cross-window document configuration failures
    }

    setIsIframeReady(false);
    setIframeKey((k) => k + 1);
    setPopupWindow(popup);
  }, [card.title, isLight, popupWindow]);

  const handleDockBack = useCallback(() => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }
    setPopupWindow(null);
    setIsIframeReady(false);
    setIframeKey((k) => k + 1);
  }, [popupWindow]);

  // Clean up popup window on unmount
  useEffect(() => {
    return () => {
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
    };
  }, [popupWindow]);

  // Heartbeat to detect popup closure via OS close button
  useEffect(() => {
    if (!popupWindow) return;
    const timer = setInterval(() => {
      if (popupWindow.closed) {
        setPopupWindow(null);
        setIsIframeReady(false);
        setIframeKey((k) => k + 1);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [popupWindow]);

  const previewPane = (
    <div
      className="react-preview-window"
      data-testid={isPoppedOut ? 'react-preview-popout-window' : 'react-preview-window'}
      style={{
        borderRadius: isPoppedOut ? '0px' : '10px',
        border: isPoppedOut ? 'none' : '1px solid rgba(6, 182, 212, 0.35)',
        backgroundColor: isLight ? '#ffffff' : '#030712',
        overflow: 'hidden',
        boxShadow: isPoppedOut ? 'none' : '0 8px 30px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: isPoppedOut ? '0px' : '14px',
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
            React Preview Window {isPoppedOut ? '(Pop-out)' : ''}
          </span>

          {/* Status Badge */}
          {status === 'compiling' && (
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
          {status === 'rendering' && (
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
          {status === 'live' && (
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
            >
              <CheckCircle2 size={11} color="#10b981" /> Rendered
            </span>
          )}
          {status === 'error' && (
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
            >
              <AlertTriangle size={11} color="#f87171" /> Error
            </span>
          )}
          {status === 'timeout' && (
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
            >
              <AlertTriangle size={11} color="#fb923c" /> Timed Out
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleRestart}
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
        </div>
      </div>

      {/* Error Notice Box (if any) */}
      {errorMessage && (
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

      {/* Sandboxed Iframe Window */}
      <div
        style={{
          width: '100%',
          height: isPoppedOut ? '380px' : '240px',
          flex: isPoppedOut ? '1 1 auto' : undefined,
          backgroundColor: isLight ? '#f8fafc' : '#030712',
          position: 'relative',
        }}
      >
        <iframe
          key={iframeKey}
          ref={iframeRef}
          title="React Component Preview"
          sandbox="allow-scripts"
          srcDoc={createPreviewSrcDoc(theme)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </div>

      {/* Event Log & Console Panel */}
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
    </div>
  );

  if (isPoppedOut && popupWindow) {
    return (
      <>
        <div
          className="react-preview-window react-preview-docked"
          data-testid="react-preview-window"
          style={{
            borderRadius: '10px',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            backgroundColor: isLight ? '#ffffff' : '#030712',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="#06b6d4" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#0f172a' : '#f1f5f9' }}>
                React Preview Window (Pop-out Active)
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
          </div>
        </div>
        {createPortal(previewPane, popupWindow.document.body)}
      </>
    );
  }

  return previewPane;
};
