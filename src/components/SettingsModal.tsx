import React, { useState } from 'react';
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
} from 'lucide-react';
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

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    onSettingsSaved?.();
    setTimeout(() => setToastMessage(null), 2500);
  };

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
    if (detected && detected !== provider) {
      handleSelectProvider(detected);
      return;
    }

    showToast(apiKey ? `${provider.toUpperCase()} key replaced` : `${provider.toUpperCase()} key saved`);
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
    showToast(`${provider.toUpperCase()} key cleared`);
  };

  const isKeyModified = keyInput.trim() !== apiKey;

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
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={14} color="var(--accent-cyan)" />
                {provider === 'gemini'
                  ? 'Gemini API Key'
                  : provider === 'groq'
                  ? 'Groq API Key'
                  : provider === 'openai'
                  ? 'OpenAI API Key'
                  : 'API Key / Bearer Token'}
              </label>

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

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', gap: '4px' }}>
              <ShieldCheck size={14} color="#34d399" style={{ flexShrink: 0, marginTop: '1px' }} />
              Stored in plain text in this browser's localStorage and sent only to the provider you select with each evaluation request.
            </p>
          </div>

          {/* Model name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Model Identifier
            </label>
            <input
              type="text"
              placeholder={provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'}
              value={model}
              onChange={(e) => handleModelChange(e.target.value)}
              className="code-buffer"
              style={{ height: '40px', padding: '10px 12px', fontSize: '13px' }}
            />
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

