import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Sliders,
  ShieldCheck,
  Info,
  CheckCircle2,
  Trash2,
  KeyRound,
  Check,
  AlertTriangle,
  Timer,
  Loader2,
  RefreshCw,
  Sparkles,
  Coins,
  Zap,
  Cpu,
  ExternalLink,
} from 'lucide-react';

interface ProviderKeyPortal {
  name: string;
  url: string;
  label: string;
  description: string;
}

const PROVIDER_KEY_PORTALS: Record<AIProvider, ProviderKeyPortal | null> = {
  gemini: {
    name: 'Google AI Studio',
    url: 'https://aistudio.google.com/app/apikey',
    label: 'Get Google Gemini Key',
    description: 'Free tier available (15 RPM on Flash) via Google AI Studio',
  },
  groq: {
    name: 'Groq Console',
    url: 'https://console.groq.com/keys',
    label: 'Get Groq Key',
    description: 'Ultra-fast inference with free tier rate limits (TPM/RPM)',
  },
  openrouter: {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/settings/keys',
    label: 'Get / Manage OpenRouter Keys',
    description: 'Access 400+ models with unified credits & free models',
  },
  openai: {
    name: 'OpenAI Platform',
    url: 'https://platform.openai.com/api-keys',
    label: 'Get OpenAI Key',
    description: 'Create and manage secret keys on OpenAI Platform',
  },
  custom: {
    name: 'Ollama Documentation',
    url: 'https://ollama.com',
    label: 'Ollama Setup',
    description: 'Run local open-source models without an API key',
  },
};
import {
  getStoredApiKey,
  setStoredApiKey,
  getStoredProvider,
  setStoredProvider,
  getStoredModel,
  setStoredModel,
  getStoredBaseUrl,
  setStoredBaseUrl,
  detectProviderFromKey,
  getAllStoredKeys,
  clearStoredApiKey,
} from '../lib/ai';
import type { AIProvider } from '../lib/ai';
import {
  fetchProviderModels,
} from '../lib/modelDiscovery';
import type { DiscoveredModel, ProviderAccountInfo } from '../lib/modelDiscovery';
import {
  getStoredAlgorithm,
  setStoredAlgorithm,
} from '../lib/leitner';
import type { SpacedAlgorithm } from '../lib/leitner';
import {
  getTimedModeEnabled,
  setTimedModeEnabled,
  getTimedModeDuration,
  setTimedModeDuration,
  DURATION_OPTIONS,
} from '../lib/timedMode';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAlgorithm?: SpacedAlgorithm;
  onAlgorithmChange?: (algo: SpacedAlgorithm) => void;
  onSettingsSaved?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentAlgorithm,
  onAlgorithmChange,
  onSettingsSaved,
}) => {
  const [algorithm, setAlgorithm] = useState<SpacedAlgorithm>(() => currentAlgorithm ?? getStoredAlgorithm());
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [keyInput, setKeyInput] = useState(() => getStoredApiKey());
  const [provider, setProvider] = useState<AIProvider>(() => getStoredProvider());
  const [model, setModel] = useState(() => getStoredModel());
  const [baseUrl, setBaseUrl] = useState(() => getStoredBaseUrl());
  const [storedKeys, setStoredKeys] = useState(() => getAllStoredKeys());
  const [timedMode, setTimedMode] = useState(() => getTimedModeEnabled());
  const [timedDuration, setTimedDuration] = useState(() => getTimedModeDuration());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'clear' | 'replace' | null>(null);

  // Model & Provider Discovery State
  const [discoveredModels, setDiscoveredModels] = useState<DiscoveredModel[]>([]);
  const [accountInfo, setAccountInfo] = useState<ProviderAccountInfo | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelDiscoveryError, setModelDiscoveryError] = useState<string | null>(null);
  const [customModelMode, setCustomModelMode] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    onSettingsSaved?.();
    setTimeout(() => setToastMessage(null), 2500);
  };

  const queryModels = useCallback(async (prov: AIProvider, keyToUse: string, customUrl?: string) => {
    setIsLoadingModels(true);
    setModelDiscoveryError(null);
    try {
      const res = await fetchProviderModels(prov, keyToUse, customUrl || baseUrl);
      if (res.error) {
        setModelDiscoveryError(res.error);
        setDiscoveredModels([]);
        setAccountInfo(null);
      } else {
        setDiscoveredModels(res.models);
        setAccountInfo(res.accountInfo || null);
        setModelDiscoveryError(null);
        // If current model is empty, select top recommended model
        if (res.models.length > 0 && !customModelMode) {
          const currentMatches = res.models.some((m) => m.id === model);
          if (!currentMatches) {
            const topModel = res.models[0].id;
            setModel(topModel);
            setStoredModel(topModel);
            onSettingsSaved?.();
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setModelDiscoveryError(msg);
    } finally {
      setIsLoadingModels(false);
    }
  }, [baseUrl, customModelMode, model, onSettingsSaved]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const currentKey = getStoredApiKey(provider);

    if (!currentKey && provider !== 'openrouter' && !(provider === 'custom' && baseUrl)) {
      queueMicrotask(() => {
        if (!active) return;
        setDiscoveredModels([]);
        setAccountInfo(null);
        setModelDiscoveryError(null);
      });
      return;
    }

    queueMicrotask(() => {
      if (!active) return;
      queryModels(provider, currentKey, baseUrl);
    });

    return () => {
      active = false;
    };
  }, [isOpen, provider, baseUrl, queryModels]);

  const handleSelectAlgorithm = (algo: SpacedAlgorithm) => {
    setAlgorithm(algo);
    setStoredAlgorithm(algo);
    onAlgorithmChange?.(algo);
    showToast('Spaced repetition method saved');
  };

  const handleToggleTimedMode = (enabled: boolean) => {
    setTimedMode(enabled);
    setTimedModeEnabled(enabled);
    onSettingsSaved?.();
    showToast(enabled ? 'Timed Mode enabled (countdown auto-submits)' : 'Timed Mode disabled');
  };

  const handleSelectDuration = (seconds: number) => {
    setTimedDuration(seconds);
    setTimedModeDuration(seconds);
    onSettingsSaved?.();
    showToast(`Timer duration set to ${Math.round(seconds / 60)} minutes`);
  };

  const handleSelectProvider = (p: AIProvider) => {
    setProvider(p);
    setStoredProvider(p);
    let defaultModel = model;
    if (p === 'gemini') defaultModel = 'gemini-2.5-flash';
    else if (p === 'groq') defaultModel = 'llama-3.3-70b-versatile';
    else if (p === 'openai') defaultModel = 'gpt-4o-mini';
    else if (p === 'openrouter') defaultModel = 'google/gemini-2.5-flash';
    setModel(defaultModel);
    setStoredModel(defaultModel);

    // Retrieve and activate this provider's key from the vault
    const provKey = getStoredApiKey(p);
    setApiKey(provKey);
    setKeyInput(provKey);
    setStoredKeys(getAllStoredKeys());
    setConfirmAction(null);
    showToast(`Provider switched to ${p.toUpperCase()}`);

    if (provKey || p === 'openrouter' || (p === 'custom' && baseUrl)) {
      queryModels(p, provKey, baseUrl);
    } else {
      setDiscoveredModels([]);
      setAccountInfo(null);
      setModelDiscoveryError(null);
    }
  };

  const handleModelChange = (val: string) => {
    setModel(val);
    setStoredModel(val);
    onSettingsSaved?.();
  };

  const handleBaseUrlChange = (val: string) => {
    setBaseUrl(val);
    setStoredBaseUrl(val);
    onSettingsSaved?.();
    if (provider === 'custom') {
      queryModels('custom', apiKey, val);
    }
  };

  const handleSaveKeyClick = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      if (apiKey) setConfirmAction('clear');
      return;
    }

    if (apiKey && apiKey !== trimmed) {
      setConfirmAction('replace');
      return;
    }

    executeSaveKey(trimmed);
  };

  const executeSaveKey = (valToSave?: string) => {
    const trimmed = (valToSave ?? keyInput).trim();
    setStoredApiKey(trimmed, provider);
    setApiKey(trimmed);
    setStoredKeys(getAllStoredKeys());
    setConfirmAction(null);

    const detected = detectProviderFromKey(trimmed);
    const activeProv = detected || provider;
    if (detected && detected !== provider) {
      handleSelectProvider(detected);
      return;
    }

    showToast(apiKey ? `${provider.toUpperCase()} key replaced` : `${provider.toUpperCase()} key saved`);
    queryModels(activeProv, trimmed, baseUrl);
  };

  const handleClearKeyClick = () => {
    setConfirmAction('clear');
  };

  const executeClearKey = () => {
    clearStoredApiKey(provider);
    setApiKey('');
    setKeyInput('');
    setStoredKeys(getAllStoredKeys());
    setConfirmAction(null);
    setDiscoveredModels([]);
    setAccountInfo(null);
    setModelDiscoveryError(null);
    showToast(`${provider.toUpperCase()} key cleared`);
  };

  const isKeyModified = keyInput.trim() !== apiKey;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div
        className="modal-content"
        style={{ maxWidth: '540px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <h2 id="settings-title" style={{ fontSize: '18px', fontWeight: 600 }}>
                Trainer Settings
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Spaced repetition method & AI evaluation engine
              </p>
            </div>
          </div>
          <button
            className="btn btn-outline"
            style={{ padding: '6px', borderRadius: '50%' }}
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Spaced Repetition Algorithm Selection */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Spaced Repetition Method
              </label>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Select your preferred scheduling engine and review interval structure
              </span>
            </div>

            {/* Algorithm Selector Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleSelectAlgorithm('graduated-interval')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: algorithm === 'graduated-interval' ? '1.5px solid #38bdf8' : '1px solid var(--border-subtle)',
                  backgroundColor: algorithm === 'graduated-interval' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                  boxShadow: algorithm === 'graduated-interval' ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: algorithm === 'graduated-interval' ? '#38bdf8' : 'var(--text-primary)' }}>
                    Graduated Interval
                  </span>
                  {algorithm === 'graduated-interval' && (
                    <span style={{ fontSize: '10px', backgroundColor: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.04em' }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  Graduated intervals (+1, +2, +5, +12, +28, +65, +150). Half-tier setback on failure with chaining priority for active retention.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAlgorithm('leitner')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: algorithm === 'leitner' ? '1.5px solid #a855f7' : '1px solid var(--border-subtle)',
                  backgroundColor: algorithm === 'leitner' ? 'rgba(168, 85, 247, 0.12)' : 'var(--bg-surface)',
                  boxShadow: algorithm === 'leitner' ? '0 0 12px rgba(168, 85, 247, 0.2)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: algorithm === 'leitner' ? '#c084fc' : 'var(--text-primary)' }}>
                    Pure Leitner Box
                  </span>
                  {algorithm === 'leitner' && (
                    <span style={{ fontSize: '10px', backgroundColor: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.04em' }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  Traditional 5-tier box queue (+1, +4, +10, +22, +45). Strict reset to Box 1 on any failed submission.
                </p>
              </button>
            </div>
          </div>

          {/* Timed Recall Mode Section */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Timer size={15} color="#f59e0b" />
                  Timed Recall Mode
                </label>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '3px 0 0 0', lineHeight: 1.45 }}>
                  Countdown starts automatically when each card loads. Automatically submits whatever you have for AI evaluation if time expires.
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => handleToggleTimedMode(!timedMode)}
                style={{
                  width: '46px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: timedMode ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  flexShrink: 0,
                }}
                aria-label="Toggle Timed Mode"
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: timedMode ? '24px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                  }}
                />
              </button>
            </div>

            {timedMode && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Countdown Duration:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.seconds}
                      onClick={() => handleSelectDuration(opt.seconds)}
                      className="btn"
                      style={{
                        padding: '6px 8px',
                        fontSize: '11px',
                        backgroundColor: timedDuration === opt.seconds ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-elevated)',
                        borderColor: timedDuration === opt.seconds ? '#f59e0b' : 'var(--border-subtle)',
                        color: timedDuration === opt.seconds ? '#fbbf24' : 'var(--text-secondary)',
                        fontWeight: timedDuration === opt.seconds ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Provider Selection */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500 }}>
                AI Provider & Multi-Key Vault
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Keys are stored per provider
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(
                [
                  { id: 'gemini', label: 'Google Gemini' },
                  { id: 'groq', label: 'Groq (Fast)' },
                  { id: 'openai', label: 'OpenAI' },
                  { id: 'openrouter', label: 'OpenRouter' },
                  { id: 'custom', label: 'Custom URL' },
                ] as const
              ).map((p) => {
                const hasKey = Boolean(storedKeys[p.id]);
                const isActive = provider === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => handleSelectProvider(p.id)}
                    className="btn"
                    style={{
                      padding: '8px 10px',
                      fontSize: '12px',
                      backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-elevated)',
                      borderColor: isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontWeight: isActive ? 600 : 400 }}>{p.label}</span>
                    {hasKey ? (
                      <span style={{ fontSize: '10px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                        Key Saved
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                        No Key
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key */}
          {(() => {
            const portal = PROVIDER_KEY_PORTALS[provider];
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <KeyRound size={14} color="var(--accent-cyan)" />
                      {provider === 'gemini'
                        ? 'Gemini API Key'
                        : provider === 'groq'
                        ? 'Groq API Key'
                        : provider === 'openrouter'
                        ? 'OpenRouter API Key'
                        : provider === 'openai'
                        ? 'OpenAI API Key'
                        : 'API Key / Bearer Token'}
                    </label>

                    {portal && (
                      <a
                        href={portal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '11px',
                          color: 'var(--accent-cyan)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          textDecoration: 'none',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(56, 189, 248, 0.08)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          transition: 'all 0.15s ease',
                        }}
                        title={`Open ${portal.name} to generate or renew your API key`}
                      >
                        <span>{apiKey ? 'Renew / Get Key' : 'Get Key'}</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {detectProviderFromKey(keyInput) && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#38bdf8',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    Detected: {detectProviderFromKey(keyInput)?.toUpperCase()}
                  </span>
                )}
                {apiKey && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#34d399',
                      backgroundColor: 'rgba(52, 211, 153, 0.12)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(52, 211, 153, 0.25)',
                    }}
                  >
                    Key Active (••••{apiKey.slice(-4)})
                  </span>
                )}
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClearKeyClick}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-rose)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Clear and remove stored API key"
                  >
                    <Trash2 size={12} /> Clear Key
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="password"
                placeholder={
                  provider === 'gemini'
                    ? 'AIzaSy...'
                    : provider === 'groq'
                    ? 'gsk_...'
                    : 'sk-...'
                }
                value={keyInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setKeyInput(val);
                  if (confirmAction) setConfirmAction(null);
                  const detected = detectProviderFromKey(val);
                  if (detected && detected !== provider) {
                    handleSelectProvider(detected);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveKeyClick();
                  }
                }}
                className="code-buffer"
                style={{
                  height: '42px',
                  padding: '10px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  flex: 1,
                }}
                autoComplete="off"
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveKeyClick}
                disabled={!keyInput.trim() || (!isKeyModified && Boolean(apiKey))}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  fontSize: '12.5px',
                  whiteSpace: 'nowrap',
                }}
                title={apiKey ? 'Replace currently stored API key' : 'Save API key'}
              >
                {apiKey ? (isKeyModified ? 'Replace Key' : 'Saved') : 'Save Key'}
              </button>
            </div>

            {/* In-App Confirmation: Clear Key */}
            {confirmAction === 'clear' && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontSize: '13px', fontWeight: 600 }}>
                  <AlertTriangle size={16} />
                  Clear stored API key?
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  This removes your key from this browser's localStorage. The trainer will automatically switch to Keyless mode.
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '4px 12px', fontSize: '12px' }}
                    onClick={() => setConfirmAction(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      padding: '4px 14px',
                      fontSize: '12px',
                      backgroundColor: '#f43f5e',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                    }}
                    onClick={executeClearKey}
                  >
                    Yes, Clear Key
                  </button>
                </div>
              </div>
            )}

            {/* In-App Confirmation: Replace Key */}
            {confirmAction === 'replace' && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>
                  <AlertTriangle size={16} />
                  Replace stored API key?
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  Your previous key will be permanently overwritten in your browser's localStorage.
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '4px 12px', fontSize: '12px' }}
                    onClick={() => setConfirmAction(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '4px 14px', fontSize: '12px', fontWeight: 600 }}
                    onClick={() => executeSaveKey()}
                  >
                    Yes, Replace Key
                  </button>
                </div>
              </div>
            )}

            {/* Direct portal link callout when no key is entered */}
            {portal && !apiKey && provider !== 'custom' && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(56, 189, 248, 0.05)',
                  border: '1px solid rgba(56, 189, 248, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '12px',
                }}
              >
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={13} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: 'var(--text-primary)' }}>Need an API key?</strong> {portal.description}.
                  </span>
                </div>
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent-cyan)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  }}
                >
                  <span>{portal.label}</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', gap: '4px' }}>
              <ShieldCheck size={14} color="#34d399" style={{ flexShrink: 0, marginTop: '1px' }} />
              Stored in plain text in this browser's localStorage and sent only to the provider you select with each evaluation request.
            </p>
          </div>
        );
      })()}

          {/* Provider Quota & Account Capabilities Banner */}
          {(accountInfo || isLoadingModels || modelDiscoveryError) && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: modelDiscoveryError ? 'rgba(244, 63, 94, 0.08)' : 'rgba(56, 189, 248, 0.06)',
                border: modelDiscoveryError ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  {isLoadingModels ? (
                    <Loader2 size={14} className="animate-spin" color="#38bdf8" />
                  ) : modelDiscoveryError ? (
                    <AlertTriangle size={14} color="#f43f5e" />
                  ) : (
                    <Cpu size={14} color="#38bdf8" />
                  )}
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: modelDiscoveryError ? '#f43f5e' : 'var(--text-primary)' }}>
                    {isLoadingModels
                      ? `Querying ${provider.toUpperCase()} for available models...`
                      : modelDiscoveryError
                      ? 'Model Discovery Notice'
                      : accountInfo?.tier || `${provider.toUpperCase()} Capabilities`}
                  </span>
                </div>

                {accountInfo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {accountInfo.totalModelsFound !== undefined && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 7px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          fontWeight: 500,
                        }}
                      >
                        {accountInfo.totalModelsFound} models
                        {accountInfo.freeModelsCount ? ` (${accountInfo.freeModelsCount} free)` : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {modelDiscoveryError && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                    {modelDiscoveryError} You can still enter your model identifier manually below.
                  </p>
                  {PROVIDER_KEY_PORTALS[provider] && (
                    <div>
                      <a
                        href={PROVIDER_KEY_PORTALS[provider]!.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--accent-cyan)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        <span>Key expired or invalid? Renew key on {PROVIDER_KEY_PORTALS[provider]!.name}</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {accountInfo && !isLoadingModels && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  {accountInfo.creditsRemaining && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Coins size={12} color="#34d399" />
                      <strong style={{ color: '#34d399' }}>{accountInfo.creditsRemaining}</strong>
                    </span>
                  )}
                  {accountInfo.tokensRemaining && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={12} color="#f59e0b" />
                      <span>{accountInfo.tokensRemaining}</span>
                    </span>
                  )}
                  {accountInfo.rateLimitSummary && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      • {accountInfo.rateLimitSummary}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Model Selection & Capabilities */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="var(--accent-purple)" />
                Model Selection
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {discoveredModels.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCustomModelMode(!customModelMode)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      padding: '2px 4px',
                    }}
                  >
                    {customModelMode ? 'Choose from list' : 'Custom model ID'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => queryModels(provider, apiKey, baseUrl)}
                  disabled={isLoadingModels || (!apiKey && provider !== 'openrouter' && provider !== 'custom')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '11.5px',
                    cursor: (isLoadingModels || (!apiKey && provider !== 'openrouter' && provider !== 'custom')) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: (isLoadingModels || (!apiKey && provider !== 'openrouter' && provider !== 'custom')) ? 0.5 : 1,
                  }}
                  title="Refresh model list from provider"
                >
                  <RefreshCw size={11} className={isLoadingModels ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {discoveredModels.length > 0 && !customModelMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="code-buffer"
                  style={{
                    height: '42px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  {/* Recommended Models */}
                  {discoveredModels.some((m) => m.recommended) && (
                    <optgroup label="🌟 Recommended for Cold-Start Practice">
                      {discoveredModels
                        .filter((m) => m.recommended)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.id}) {m.isFree ? '• [FREE]' : ''} {m.contextWindow ? `• ${Math.round(m.contextWindow / 1000)}k ctx` : ''}
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {/* Free Models not in recommended */}
                  {discoveredModels.some((m) => m.isFree && !m.recommended) && (
                    <optgroup label="🆓 Free Tier Models">
                      {discoveredModels
                        .filter((m) => m.isFree && !m.recommended)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.id}) • [FREE] {m.contextWindow ? `• ${Math.round(m.contextWindow / 1000)}k ctx` : ''}
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {/* All Other Models */}
                  {discoveredModels.some((m) => !m.recommended && !m.isFree) && (
                    <optgroup label="📚 All Available Models">
                      {discoveredModels
                        .filter((m) => !m.recommended && !m.isFree)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.id}) {m.contextWindow ? `• ${Math.round(m.contextWindow / 1000)}k ctx` : ''}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>

                {/* Selected Model Capability Preview Badge */}
                {(() => {
                  const activeModel = discoveredModels.find((m) => m.id === model);
                  if (!activeModel) return null;
                  return (
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>
                            {activeModel.name}
                          </span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            by {activeModel.ownedBy}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {activeModel.recommended && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                                color: '#c084fc',
                                fontWeight: 600,
                              }}
                            >
                              Recommended
                            </span>
                          )}
                          {activeModel.isFree ? (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(52, 211, 153, 0.2)',
                                color: '#34d399',
                                fontWeight: 700,
                              }}
                            >
                              FREE
                            </span>
                          ) : (
                            activeModel.pricing && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                Paid
                              </span>
                            )
                          )}
                          {activeModel.contextWindow && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                color: '#38bdf8',
                              }}
                            >
                              {Math.round(activeModel.contextWindow / 1000)}k context
                            </span>
                          )}
                        </div>
                      </div>
                      {activeModel.description && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                          {activeModel.description.length > 160 ? `${activeModel.description.slice(0, 160)}...` : activeModel.description}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder={
                    provider === 'gemini'
                      ? 'gemini-2.5-flash'
                      : provider === 'groq'
                      ? 'llama-3.3-70b-versatile'
                      : provider === 'openrouter'
                      ? 'google/gemini-2.5-flash'
                      : 'gpt-4o-mini'
                  }
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="code-buffer"
                  style={{ height: '40px', padding: '10px 12px', fontSize: '13px' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  {discoveredModels.length > 0
                    ? 'Custom mode enabled. Type any model identifier supported by your endpoint.'
                    : apiKey
                    ? 'Click "Refresh" above to discover models from this provider, or type manually.'
                    : 'Save an API key above to automatically query and populate available models.'}
                </span>
              </div>
            )}
          </div>

          {/* Custom base URL if needed */}
          {(provider === 'custom' || provider === 'openrouter') && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                Base URL
              </label>
              <input
                type="text"
                placeholder="https://api.openai.com/v1"
                value={baseUrl}
                onChange={(e) => handleBaseUrlChange(e.target.value)}
                className="code-buffer"
                style={{ height: '40px', padding: '10px 12px', fontSize: '13px' }}
              />
            </div>
          )}

          {/* Offline fallback banner */}
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <Info size={18} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Offline & Keyless Ready: </span>
              If no API key is specified, the trainer automatically uses our built-in structural invariant heuristic engine. You can practice without friction right away.
            </div>
          </div>

          {/* Footer Controls & Auto-save confirmation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#34d399' }}>
              <CheckCircle2 size={15} />
              <span>{toastMessage ?? 'All settings auto-saved to browser localStorage'}</span>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
              style={{ padding: '8px 24px', fontSize: '13px' }}
            >
              <Check size={14} /> Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

