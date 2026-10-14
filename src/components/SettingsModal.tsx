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
} from '../lib/ai';
import type { AIProvider } from '../lib/ai';
import {
  getStoredAlgorithm,
  setStoredAlgorithm,
} from '../lib/leitner';
import type { SpacedAlgorithm } from '../lib/leitner';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      if (apiKey) handleClearKey();
      return;
    }

    if (apiKey && apiKey !== trimmed) {
      const confirmed = window.confirm(
        'Are you sure you want to replace your existing API key?\n\nThe previous key will be permanently overwritten in your browser localStorage.'
      );
      if (!confirmed) return;
    }

    setStoredApiKey(trimmed);
    setApiKey(trimmed);
    showToast(apiKey ? 'API key replaced' : 'API key saved');
  };

  const handleClearKey = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear your stored API key?\n\nThis will remove it from your browser localStorage and switch evaluation to Keyless mode.'
    );
    if (!confirmed) return;

    setStoredApiKey('');
    setApiKey('');
    setKeyInput('');
    showToast('API key cleared');
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

          {/* Provider Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              AI Provider
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(
                [
                  { id: 'gemini', label: 'Google Gemini' },
                  { id: 'groq', label: 'Groq (Fast)' },
                  { id: 'openai', label: 'OpenAI' },
                  { id: 'openrouter', label: 'OpenRouter' },
                  { id: 'custom', label: 'Custom URL' },
                ] as const
              ).map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleSelectProvider(p.id)}
                  className="btn"
                  style={{
                    padding: '8px 10px',
                    fontSize: '12.5px',
                    backgroundColor: provider === p.id ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-elevated)',
                    borderColor: provider === p.id ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                    color: provider === p.id ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={14} color="var(--accent-cyan)" />
                {provider === 'gemini' ? 'Gemini API Key' : 'API Key / Bearer Token'}
              </label>

              {apiKey && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <button
                    type="button"
                    onClick={handleClearKey}
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
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="password"
                placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveKey();
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
                onClick={handleSaveKey}
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

