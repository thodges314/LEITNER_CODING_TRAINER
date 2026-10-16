import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Sliders,
  ShieldCheck,
  Info,
  CheckCircle2,
  Trash2,
  KeyRound,
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
  cerebras: {
    name: 'Cerebras Cloud',
    url: 'https://cloud.cerebras.ai/platform/',
    label: 'Get Cerebras Key',
    description: 'Blistering fast Wafer-Scale inference (~1,800 T/s) with free developer tier',
  },
  mistral: {
    name: 'Mistral Console',
    url: 'https://console.mistral.ai/api-keys',
    label: 'Get Mistral Key',
    description: 'Free developer tier for Codestral & Mistral models via Mistral Console',
  },
  anthropic: {
    name: 'Anthropic Console',
    url: 'https://console.anthropic.com/settings/keys',
    label: 'Get Anthropic Key',
    description: 'Claude 3.5 Sonnet & Haiku coding benchmark via Anthropic Console',
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

interface CuratedOpenRouterPick {
  id: string;
  name: string;
  providerBadge: string;
  verdictBadge: string;
  contextWindow: string;
  whyItsSolid: string;
}

const TOP_OPENROUTER_FREE_PICKS: CuratedOpenRouterPick[] = [
  {
    id: 'nvidia/nemotron-3-super-120b-a12b:free',
    name: 'NVIDIA Nemotron 3 Super (120B)',
    providerBadge: '120B MoE • NVIDIA',
    verdictBadge: 'Best for Algorithmic Logic & Big-O',
    contextWindow: '128k',
    whyItsSolid:
      'With 120B total parameters and an architecture built for instruction following, it performs well at parsing algorithmic logic and evaluating time/space complexity bounds.',
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google Gemma 4 31B Instruct',
    providerBadge: '31B Dense • Google',
    verdictBadge: 'Best for Clean TS/JS Syntax',
    contextWindow: '262k',
    whyItsSolid:
      'A 31B dense model with a 262k context window. It handles syntactic verification, TypeScript/JavaScript idioms, and edge-case detection reliably without hallucinating invalid syntax.',
  },
  {
    id: 'cohere/north-mini-code:free',
    name: 'Cohere North Mini Code',
    providerBadge: 'Code-Tuned • Cohere',
    verdictBadge: 'Best for Fast Grading',
    contextWindow: '256k',
    whyItsSolid:
      'Specifically tuned for code syntax, completions, and code-critique workflows with a 256k context window. It delivers tight, deterministic answers when grading solutions.',
  },
  {
    id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    name: 'NVIDIA Nemotron 3 Nano Omni (Reasoning)',
    providerBadge: '30B Reasoning • NVIDIA',
    verdictBadge: 'Best for Multi-Step Async Bugs',
    contextWindow: '128k',
    whyItsSolid:
      'Designed with reasoning-focused weights, making it effective for breaking down multi-step logic errors or asynchronous patterns.',
  },
];
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

import type { AppTheme } from '../lib/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAlgorithm?: SpacedAlgorithm;
  onAlgorithmChange?: (algo: SpacedAlgorithm) => void;
  currentTheme?: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
  onSettingsSaved?: () => void;
  onResetDeckToDefaults?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentAlgorithm,
  onAlgorithmChange,
  currentTheme = 'dark',
  onThemeChange,
  onSettingsSaved,
  onResetDeckToDefaults,
}) => {
  const isLight = currentTheme === 'apple-gsos';
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
  const [confirmAction, setConfirmAction] = useState<
    'clear' | 'replace' | 'reset-deck' | 'reset-everything' | null
  >(null);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

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
    else if (p === 'groq') defaultModel = 'openai/gpt-oss-120b';
    else if (p === 'cerebras') defaultModel = 'llama3.3-70b';
    else if (p === 'mistral') defaultModel = 'codestral-latest';
    else if (p === 'anthropic') defaultModel = 'claude-3-5-sonnet-20241022';
    else if (p === 'openai') defaultModel = 'gpt-4o-mini';
    else if (p === 'openrouter') defaultModel = 'nvidia/nemotron-3-super-120b-a12b:free';
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
        style={{
          maxWidth: '540px',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isLight ? 'rgba(68, 85, 170, 0.12)' : 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isLight ? '#4455AA' : '#38bdf8',
                border: isLight ? '1px solid rgba(68, 85, 170, 0.25)' : 'none',
                flexShrink: 0,
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <h2 id="settings-title" style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                Trainer Settings
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {toastMessage && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(52, 211, 153, 0.15)',
                  color: isLight ? '#15803D' : '#34d399',
                  border: isLight ? '1px solid #86EFAC' : '1px solid rgba(52, 211, 153, 0.3)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle2 size={12} /> {toastMessage}
              </span>
            )}
            <button
              className="btn btn-outline"
              style={{ padding: '6px', borderRadius: '50%', flexShrink: 0 }}
              onClick={onClose}
              aria-label="Close settings"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxHeight: 'calc(90vh - 68px)',
          }}
        >
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
                  backgroundColor: timedMode
                    ? (isLight ? '#4455AA' : 'var(--accent-cyan)')
                    : (isLight ? '#D1D0C7' : 'rgba(255, 255, 255, 0.15)'),
                  position: 'relative',
                  border: isLight
                    ? (timedMode ? '1.5px solid #2B3A8C' : '1.5px solid #8A887E')
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  boxShadow: isLight && !timedMode ? 'inset 0 1px 2px rgba(0,0,0,0.1)' : 'none',
                }}
                aria-label="Toggle Timed Mode"
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: timedMode ? '24px' : '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: isLight ? '1px solid #8A887E' : 'none',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
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
                        backgroundColor: timedDuration === opt.seconds
                          ? (currentTheme === 'apple-gsos' ? 'rgba(217, 119, 6, 0.16)' : 'rgba(245, 158, 11, 0.15)')
                          : 'var(--bg-elevated)',
                        borderColor: timedDuration === opt.seconds
                          ? (currentTheme === 'apple-gsos' ? '#D97706' : '#f59e0b')
                          : 'var(--border-subtle)',
                        borderWidth: currentTheme === 'apple-gsos' && timedDuration === opt.seconds ? '1.5px' : '1px',
                        color: timedDuration === opt.seconds
                          ? (currentTheme === 'apple-gsos' ? '#B45309' : '#fbbf24')
                          : 'var(--text-secondary)',
                        fontWeight: timedDuration === opt.seconds ? 700 : 400,
                        boxShadow: currentTheme === 'apple-gsos' && timedDuration === opt.seconds ? '2px 2px 0px rgba(28, 28, 28, 0.15)' : 'none',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Appearance & Theme Selection */}
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
                Appearance & Theme
              </label>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Choose between Cyberpunk Synthwave and vintage Apple GS/OS desktop
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  onThemeChange?.('dark');
                  showToast('Switched to Synthwave / Nightcore Mode');
                }}
                className="btn"
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  backgroundColor: currentTheme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-elevated)',
                  borderColor: currentTheme === 'dark' ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🌙</span> Synthwave (Nightcore)
                  </span>
                  {currentTheme === 'dark' && (
                    <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600 }}>Active</span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Neon cyberpunk nightcore palette with dark editor canvas
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onThemeChange?.('apple-gsos');
                  showToast('Switched to Apple GS/OS Light Mode');
                }}
                className="btn"
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  backgroundColor: currentTheme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.15)' : 'var(--bg-elevated)',
                  borderColor: currentTheme === 'apple-gsos' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🖥️</span> Apple GS/OS Light
                  </span>
                  {currentTheme === 'apple-gsos' && (
                    <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600 }}>Active</span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Classic 1980s platinum workstation with periwinkle and leaf green accents
                </span>
              </button>
            </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {(
                [
                  { id: 'groq', label: 'Groq', badge: '⚡ Best Free Speed' },
                  { id: 'gemini', label: 'Google Gemini', badge: '🌟 Best Free Volume (1M TPM)' },
                  { id: 'cerebras', label: 'Cerebras', badge: '⚡ ~1,800 T/s' },
                  { id: 'mistral', label: 'Mistral AI', badge: '💻 Codestral' },
                  { id: 'anthropic', label: 'Anthropic', badge: '🎯 Benchmark' },
                  { id: 'openrouter', label: 'OpenRouter', badge: '🌐 400+ Models' },
                  { id: 'openai', label: 'OpenAI' },
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
                      backgroundColor: isActive
                        ? (currentTheme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.16)' : 'rgba(56, 189, 248, 0.2)')
                        : 'var(--bg-elevated)',
                      borderColor: isActive
                        ? (currentTheme === 'apple-gsos' ? '#4455AA' : 'var(--accent-cyan)')
                        : 'var(--border-subtle)',
                      borderWidth: currentTheme === 'apple-gsos' && isActive ? '1.5px' : '1px',
                      color: isActive
                        ? (currentTheme === 'apple-gsos' ? '#1C1C1C' : '#ffffff')
                        : 'var(--text-secondary)',
                      boxShadow: currentTheme === 'apple-gsos' && isActive ? '2px 2px 0px rgba(28, 28, 28, 0.2)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: isActive ? 700 : 500 }}>{p.label}</span>
                    </div>

                    {'badge' in p && p.badge && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: isActive
                            ? (currentTheme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.14)' : 'rgba(56, 189, 248, 0.25)')
                            : (currentTheme === 'apple-gsos' ? '#DDDCD4' : 'rgba(255, 255, 255, 0.08)'),
                          color: isActive
                            ? (currentTheme === 'apple-gsos' ? '#2A3B8F' : '#38bdf8')
                            : (currentTheme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-muted)'),
                          fontWeight: isActive ? 600 : 500,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {p.badge}
                      </span>
                    )}

                    {hasKey ? (
                      <span style={{ fontSize: '10px', color: currentTheme === 'apple-gsos' ? '#15803D' : '#34d399', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', fontWeight: 600 }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: currentTheme === 'apple-gsos' ? '#15803D' : '#34d399' }} />
                        Key Saved
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', color: currentTheme === 'apple-gsos' ? '#555555' : 'var(--text-dim)', marginTop: '2px' }}>
                        No Key
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Recommendation Tip Note */}
            <div
              style={{
                marginTop: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: isLight ? '#EBF5FF' : 'rgba(56, 189, 248, 0.08)',
                border: isLight ? '1.5px solid #4455AA' : '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: isLight ? '2px 2px 0px rgba(68, 85, 170, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: isLight ? '#1C1C1C' : 'var(--text-secondary)',
                lineHeight: 1.45,
              }}
            >
              <Zap size={15} color={isLight ? '#4455AA' : '#38bdf8'} style={{ flexShrink: 0 }} />
              <span>
                <strong style={{ color: isLight ? '#2B3A8C' : 'var(--accent-cyan)' }}>Tip:</strong> For the fastest zero-cost evaluations, use <strong style={{ color: isLight ? '#1C1C1C' : undefined }}>Groq</strong> (openai/gpt-oss-120b) or <strong style={{ color: isLight ? '#1C1C1C' : undefined }}>Google Gemini</strong> (gemini-2.5-flash). Both provide free developer tiers with no credit card required.
              </span>
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
                        : provider === 'cerebras'
                        ? 'Cerebras API Key'
                        : provider === 'mistral'
                        ? 'Mistral API Key'
                        : provider === 'anthropic'
                        ? 'Anthropic API Key'
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
                    : provider === 'cerebras'
                    ? 'csk-...'
                    : provider === 'anthropic'
                    ? 'sk-ant-...'
                    : provider === 'openrouter'
                    ? 'sk-or-...'
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
                  marginTop: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: isLight ? '#EBF5FF' : 'rgba(56, 189, 248, 0.08)',
                  border: isLight ? '1.5px solid #4455AA' : '1px solid rgba(56, 189, 248, 0.3)',
                  boxShadow: isLight ? '2px 2px 0px rgba(68, 85, 170, 0.15)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '12px',
                }}
              >
                <div style={{ color: isLight ? '#1C1C1C' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={15} color={isLight ? '#4455AA' : 'var(--accent-cyan)'} style={{ flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: isLight ? '#1C1C1C' : 'var(--text-primary)' }}>Need an API key?</strong> {portal.description}.
                  </span>
                </div>
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: isLight ? '#FFFFFF' : 'var(--accent-cyan)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: isLight ? '#4455AA' : 'rgba(56, 189, 248, 0.1)',
                    border: isLight ? '1px solid #2B3A8C' : '1px solid rgba(56, 189, 248, 0.25)',
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
                  {/* Active Selected Model Fallback if not yet in discovered list */}
                  {model && !discoveredModels.some((m) => m.id === model) && (
                    <optgroup label="📌 Active Model Selection">
                      <option value={model}>
                        {model} • [SELECTED]
                      </option>
                    </optgroup>
                  )}

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
                  const curated = TOP_OPENROUTER_FREE_PICKS.find((p) => p.id === model);
                  const activeModel =
                    discoveredModels.find((m) => m.id === model) ||
                    (curated && provider === 'openrouter'
                      ? {
                          id: curated.id,
                          name: curated.name,
                          description: curated.whyItsSolid,
                          contextWindow: parseInt(curated.contextWindow) * 1024,
                          isFree: true,
                          ownedBy: curated.providerBadge,
                          recommended: true,
                        }
                      : null);
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
                      ? 'openai/gpt-oss-120b'
                      : provider === 'cerebras'
                      ? 'llama3.3-70b'
                      : provider === 'mistral'
                      ? 'codestral-latest'
                      : provider === 'anthropic'
                      ? 'claude-3-5-sonnet-20241022'
                      : provider === 'openrouter'
                      ? 'nvidia/nemotron-3-super-120b-a12b:free'
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

            {/* Curated Top Free OpenRouter Picks */}
            {provider === 'openrouter' && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: isLight ? '#EBF5FF' : 'rgba(56, 189, 248, 0.08)',
                  border: isLight ? '1.5px solid #4455AA' : '1px solid rgba(56, 189, 248, 0.3)',
                  boxShadow: isLight ? '2px 2px 0px rgba(68, 85, 170, 0.15)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Sparkles size={15} color="#38bdf8" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Top Free OpenRouter Picks for Code Evaluation
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(52, 211, 153, 0.15)',
                      color: '#34d399',
                      fontWeight: 600,
                    }}
                  >
                    4 Curated Free Models
                  </span>
                </div>

                {/* Comparative assessment / verdict summary */}
                <div
                  style={{
                    fontSize: '11.5px',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: 'var(--accent-cyan)' }}>Comparative Assessment: </strong>
                  <strong>NVIDIA Nemotron 3 Super (120B)</strong> is the single strongest pick for calculating Big-O time/space complexity and verifying deep algorithmic invariants due to its 120B parameter scale. <strong>Google Gemma 4 (31B)</strong> is the premier dense choice for clean TypeScript/JS syntax and standard library edge-cases without router hallucinations.
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {TOP_OPENROUTER_FREE_PICKS.map((pick) => {
                    const isSelected = model === pick.id;
                    return (
                      <div
                        key={pick.id}
                        onClick={() => {
                          handleModelChange(pick.id);
                          setCustomModelMode(false);
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                          border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 0 10px rgba(56, 189, 248, 0.15)' : 'none',
                        }}
                        title={`Click to select ${pick.name}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#38bdf8' : 'var(--text-primary)' }}>
                              {pick.name}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {pick.id}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                            <span
                              style={{
                                fontSize: '9.5px',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(52, 211, 153, 0.18)',
                                color: isSelected ? '#38bdf8' : '#34d399',
                                fontWeight: 700,
                              }}
                            >
                              {isSelected ? '✓ ACTIVE' : 'FREE'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '9.5px',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: 'rgba(168, 85, 247, 0.15)',
                              color: '#c084fc',
                              fontWeight: 500,
                            }}
                          >
                            {pick.verdictBadge}
                          </span>
                          <span
                            style={{
                              fontSize: '9.5px',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {pick.contextWindow} ctx
                          </span>
                        </div>

                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Why it's solid: </strong>
                          {pick.whyItsSolid}
                        </p>
                      </div>
                    );
                  })}
                </div>
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

          {/* Offline & Keyless Ready Banner (Above Danger Zone) */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: isLight ? '#EBF5FF' : 'rgba(56, 189, 248, 0.08)',
              border: isLight ? '1.5px solid #4455AA' : '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: isLight ? '2px 2px 0px rgba(68, 85, 170, 0.15)' : 'none',
              display: 'flex',
              gap: '10px',
              fontSize: '12px',
              color: isLight ? '#1C1C1C' : 'var(--text-secondary)',
            }}
          >
            <Info size={18} style={{ color: isLight ? '#4455AA' : '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontWeight: 600, color: isLight ? '#1C1C1C' : 'var(--text-primary)' }}>Offline & Keyless Ready: </span>
              If no API key is specified, the trainer automatically uses our built-in structural invariant heuristic engine. You can practice without friction right away.
            </div>
          </div>

          {/* Danger Zone: Last Item in the Panel */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-highlight, #f87171)', fontSize: '13px', fontWeight: 600 }}>
              <AlertTriangle size={15} />
              <span>Danger Zone</span>
            </div>

            {/* Action 1: Reset All Decks (Deck Progress) */}
            {onResetDeckToDefaults && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid rgba(239, 68, 68, 0.15)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Reset All Deck Progress
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Resets cards back to Tier/Box 1, clears streaks, review counts, and code drafts. Custom decks and API keys are preserved.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmAction('reset-deck');
                      setResetConfirmInput('');
                    }}
                    className="btn btn-danger"
                    style={{
                      fontSize: '12px',
                      padding: '6px 12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Trash2 size={13} />
                    Reset Deck
                  </button>
                </div>

                {/* In-App Confirmation: Reset All Decks */}
                {confirmAction === 'reset-deck' && (
                  <div
                    style={{
                      marginTop: '4px',
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1.5px solid var(--accent-highlight, #ef4444)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-highlight, #f87171)', fontSize: '13px', fontWeight: 600 }}>
                      <AlertTriangle size={16} />
                      Permanently reset learning progress across all decks?
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                      This will reset card review streaks, box tiers, completed review counters, and editor code drafts. Custom-built decks and stored API keys will NOT be deleted.
                    </p>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11.5px',
                          color: 'var(--text-secondary)',
                          marginBottom: '6px',
                        }}
                      >
                        To confirm, type <strong translate="no" className="notranslate" style={{ color: 'var(--accent-highlight, #f87171)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>RESET ALL DECKS</strong> below:
                      </label>
                      <input
                        type="text"
                        translate="no"
                        className="notranslate code-buffer"
                        value={resetConfirmInput}
                        onChange={(e) => setResetConfirmInput(e.target.value)}
                        placeholder="RESET ALL DECKS"
                        autoFocus
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '6px 12px',
                          fontSize: '12.5px',
                          fontFamily: 'monospace',
                          borderColor: resetConfirmInput.trim().toUpperCase() === 'RESET ALL DECKS'
                            ? 'var(--accent-highlight, #ef4444)'
                            : 'var(--border-medium)',
                          outline: 'none',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--bg-editor, #FAFAFA)',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                        onClick={() => {
                          setConfirmAction(null);
                          setResetConfirmInput('');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={resetConfirmInput.trim().toUpperCase() !== 'RESET ALL DECKS'}
                        style={{
                          padding: '4px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: resetConfirmInput.trim().toUpperCase() === 'RESET ALL DECKS' ? 'pointer' : 'not-allowed',
                          opacity: resetConfirmInput.trim().toUpperCase() === 'RESET ALL DECKS' ? 1 : 0.45,
                          transition: 'all 0.15s ease',
                        }}
                        onClick={() => {
                          if (resetConfirmInput.trim().toUpperCase() !== 'RESET ALL DECKS') return;
                          setConfirmAction(null);
                          setResetConfirmInput('');
                          onResetDeckToDefaults();
                          showToast('All deck progress reset to defaults');
                        }}
                      >
                        Yes, Reset All Decks
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action 2: Reset Everything (Factory Reset) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-highlight, #f87171)' }}>
                    Reset Everything (Factory Reset)
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Completely clears all browser localStorage—including API keys, custom decks, preferences, and code drafts. Restores the app as if loaded for the very first time.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmAction('reset-everything');
                    setResetConfirmInput('');
                  }}
                  className="btn btn-danger"
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Trash2 size={13} />
                  Reset Everything
                </button>
              </div>

              {/* In-App Confirmation: Reset Everything */}
              {confirmAction === 'reset-everything' && (
                <div
                  style={{
                    marginTop: '4px',
                    padding: '14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1.5px solid var(--accent-highlight, #ef4444)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-highlight, #fda4af)', fontSize: '13px', fontWeight: 600 }}>
                    <AlertTriangle size={16} />
                    Factory reset application and wipe all localStorage?
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                    This will permanently delete all saved API keys, custom decks you created, progress records, and editor drafts. The page will reload completely fresh.
                  </p>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        color: 'var(--text-secondary)',
                        marginBottom: '6px',
                      }}
                    >
                      To confirm, type <strong translate="no" className="notranslate" style={{ color: 'var(--accent-highlight, #fda4af)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>RESET EVERYTHING</strong> below:
                    </label>
                    <input
                      type="text"
                      translate="no"
                      className="notranslate code-buffer"
                      value={resetConfirmInput}
                      onChange={(e) => setResetConfirmInput(e.target.value)}
                      placeholder="RESET EVERYTHING"
                      autoFocus
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '6px 12px',
                        fontSize: '12.5px',
                        fontFamily: 'monospace',
                        borderColor: resetConfirmInput.trim().toUpperCase() === 'RESET EVERYTHING'
                          ? 'var(--accent-highlight, #e11d48)'
                          : 'var(--border-medium)',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-editor, #FAFAFA)',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '4px 12px', fontSize: '12px' }}
                      onClick={() => {
                        setConfirmAction(null);
                        setResetConfirmInput('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={resetConfirmInput.trim().toUpperCase() !== 'RESET EVERYTHING'}
                      style={{
                        padding: '4px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: resetConfirmInput.trim().toUpperCase() === 'RESET EVERYTHING' ? 'pointer' : 'not-allowed',
                        opacity: resetConfirmInput.trim().toUpperCase() === 'RESET EVERYTHING' ? 1 : 0.45,
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => {
                        if (resetConfirmInput.trim().toUpperCase() !== 'RESET EVERYTHING') return;
                        try {
                          localStorage.clear();
                          sessionStorage.clear();
                        } catch {
                          /* ignore */
                        }
                        window.location.href = window.location.origin + window.location.pathname;
                      }}
                    >
                      Yes, Wipe All Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

