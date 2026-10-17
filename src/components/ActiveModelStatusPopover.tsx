import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Sparkles,
  Settings,
  X,
  Cpu,
  Zap,
  Coins,
  Timer,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { AIProvider } from '../lib/ai';
import { getStoredBaseUrl } from '../lib/ai';
import { fetchProviderModels } from '../lib/modelDiscovery';
import type { ProviderAccountInfo } from '../lib/modelDiscovery';

interface ActiveModelStatusPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  provider: AIProvider;
  model: string;
  apiKey: string;
}

const PROVIDER_NAMES: Record<AIProvider, string> = {
  groq: 'Groq',
  gemini: 'Google Gemini',
  cerebras: 'Cerebras Cloud',
  mistral: 'Mistral AI',
  anthropic: 'Anthropic',
  openrouter: 'OpenRouter',
  openai: 'OpenAI',
  custom: 'Custom / Ollama',
};

export const ActiveModelStatusPopover: React.FC<ActiveModelStatusPopoverProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  provider,
  model,
  apiKey,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [accountInfo, setAccountInfo] = useState<ProviderAccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!apiKey && provider !== 'openrouter' && provider !== 'custom') return;
    setIsLoading(true);
    setError(null);
    try {
      const baseUrl = getStoredBaseUrl();
      const res = await fetchProviderModels(provider, apiKey, baseUrl);
      if (res.error) {
        setError(res.error);
        setAccountInfo(null);
      } else {
        setAccountInfo(res.accountInfo || null);
        setError(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, provider]);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen, fetchStatus]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = PROVIDER_NAMES[provider] || provider.toUpperCase();

  return (
    <>
      {/* Click-outside backdrop */}
      <div
        className="ai-status-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 110,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden="true"
      />

      {/* Anchored Popover Container */}
      <div
        ref={popoverRef}
        className="ai-status-popover"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-status-title"
        style={{
          position: 'absolute',
          top: 'calc(100% + 11px)',
          right: 0,
          width: '390px',
          maxWidth: 'calc(100vw - 24px)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg), 0 0 24px -4px rgba(56, 189, 248, 0.2)',
          zIndex: 111,
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.18s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Arrow Caret */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-6px',
            right: '26px',
            width: '12px',
            height: '12px',
            backgroundColor: 'var(--bg-elevated)',
            borderLeft: '1px solid var(--border-medium)',
            borderTop: '1px solid var(--border-medium)',
            transform: 'rotate(45deg)',
            zIndex: 2,
          }}
        />

        {/* Header Bar */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-elevated)',
            borderTopLeftRadius: '11px',
            borderTopRightRadius: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <Sparkles size={15} />
            </div>
            <div>
              <h3
                id="ai-status-title"
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Active AI Engine
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Live provider & rate limit status
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close status dialog"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Active Model & Provider Card */}
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={14} color="var(--accent-cyan)" />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {displayName}
                </span>
              </div>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(52, 211, 153, 0.12)',
                  color: 'var(--accent-emerald)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-emerald)',
                  }}
                />
                Active
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Model:</span>
              <code
                style={{
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-cyan)',
                  wordBreak: 'break-all',
                }}
              >
                {model || 'default'}
              </code>
            </div>
          </div>

          {/* Rate Limits & Quotas Section */}
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Quotas & Rate Limits
              </span>
              <button
                type="button"
                onClick={fetchStatus}
                disabled={isLoading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: isLoading ? 'default' : 'pointer',
                  fontSize: '11px',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  transition: 'opacity 0.15s ease',
                  opacity: isLoading ? 0.6 : 1,
                }}
                title="Refresh rate limits and quota"
              >
                <RefreshCw size={11} className={isLoading ? 'animate-spin' : undefined} />
                <span>{isLoading ? 'Checking...' : 'Refresh'}</span>
              </button>
            </div>

            {isLoading && !accountInfo ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 0',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                }}
              >
                <Loader2 size={14} className="animate-spin" color="var(--accent-primary)" />
                <span>Querying provider quotas...</span>
              </div>
            ) : error ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#f43f5e' }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '11.5px', lineHeight: 1.45 }}>{error}</span>
              </div>
            ) : accountInfo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Tier */}
                {accountInfo.tier && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Account Tier:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{accountInfo.tier}</strong>
                  </div>
                )}

                {/* Tokens Remaining */}
                {accountInfo.tokensRemaining && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                    <Zap size={13} color="var(--accent-amber)" />
                    <span style={{ color: 'var(--text-muted)' }}>Tokens:</span>
                    <strong style={{ color: 'var(--accent-amber)' }}>
                      {accountInfo.tokensRemaining}
                    </strong>
                  </div>
                )}

                {/* Credits / Budget */}
                {accountInfo.creditsRemaining && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                    <Coins size={13} color="var(--accent-emerald)" />
                    <span style={{ color: 'var(--text-muted)' }}>Balance / Quota:</span>
                    <strong style={{ color: 'var(--accent-emerald)' }}>
                      {accountInfo.creditsRemaining}
                    </strong>
                  </div>
                )}

                {/* Rate Limit Summary */}
                {accountInfo.rateLimitSummary && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11.5px' }}>
                    <Timer size={13} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Rate Limit:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {accountInfo.rateLimitSummary}
                    </span>
                  </div>
                )}

                {/* Models accessible count */}
                {accountInfo.totalModelsFound !== undefined && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingTop: '2px' }}>
                    ✓ {accountInfo.totalModelsFound} models verified on this key
                    {accountInfo.freeModelsCount ? ` (${accountInfo.freeModelsCount} zero-cost)` : ''}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Connected and ready. Rate limit headers update on each evaluation request.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            borderBottomLeftRadius: '11px',
            borderBottomRightRadius: '11px',
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              gap: '6px',
              fontWeight: 600,
            }}
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
          >
            <Settings size={13} />
            <span>Configure in Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};
