import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  X,
  Sliders,
  ShieldCheck,
  Info,
  CheckCircle2,
  Trash2,
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
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentAlgorithm,
  onAlgorithmChange,
}) => {
  const [algorithm, setAlgorithm] = useState<SpacedAlgorithm>(() => currentAlgorithm ?? getStoredAlgorithm());
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [provider, setProvider] = useState<AIProvider>(() => getStoredProvider());
  const [model, setModel] = useState(() => getStoredModel());
  const [baseUrl, setBaseUrl] = useState(() => getStoredBaseUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setStoredAlgorithm(algorithm);
    onAlgorithmChange?.(algorithm);
    setStoredApiKey(apiKey);
    setStoredProvider(provider);
    setStoredModel(model);
    setStoredBaseUrl(baseUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleClearKey = () => {
    setApiKey('');
    setStoredApiKey('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1200);
  };

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

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Spaced Repetition Algorithm Switch */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Graduated Interval Recall & Chaining
                </label>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Graduated intervals (+1, +3, +7, +16, +35) with focused 4-card active chaining
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={algorithm === 'graduated-interval'}
                aria-label="Toggle Graduated Interval Recall & Chaining"
                onClick={() => setAlgorithm((prev) => (prev === 'graduated-interval' ? 'leitner' : 'graduated-interval'))}
                style={{
                  position: 'relative',
                  width: '46px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: algorithm === 'graduated-interval' ? 'var(--accent-cyan)' : 'var(--bg-editor)',
                  boxShadow: algorithm === 'graduated-interval' ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                  flexShrink: 0,
                  padding: '2px',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    transform: algorithm === 'graduated-interval' ? 'translateX(22px)' : 'translateX(0)',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </button>
            </div>

            {/* Algorithm Selector Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                onClick={() => setAlgorithm('graduated-interval')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: algorithm === 'graduated-interval' ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                  backgroundColor: algorithm === 'graduated-interval' ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: algorithm === 'graduated-interval' ? '#38bdf8' : 'var(--text-primary)' }}>
                    Graduated Interval
                  </span>
                  {algorithm === 'graduated-interval' && (
                    <span style={{ fontSize: '10px', backgroundColor: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Tests due cards immediately before introducing new topics. Expanding graduated intervals (+1, +3, +7, +16, +35).
                </p>
              </div>

              <div
                onClick={() => setAlgorithm('leitner')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: algorithm === 'leitner' ? '1px solid #a855f7' : '1px solid var(--border-subtle)',
                  backgroundColor: algorithm === 'leitner' ? 'rgba(168, 85, 247, 0.1)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: algorithm === 'leitner' ? '#c084fc' : 'var(--text-primary)' }}>
                    Pure Leitner Box
                  </span>
                  {algorithm === 'leitner' && (
                    <span style={{ fontSize: '10px', backgroundColor: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Traditional 5-tier box queue (+1, +4, +10, +22, +45). Drains entire lower boxes before higher tiers.
                </p>
              </div>
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
                  onClick={() => {
                    setProvider(p.id);
                    if (p.id === 'gemini') setModel('gemini-2.5-flash');
                    else if (p.id === 'groq') setModel('llama-3.3-70b-versatile');
                    else if (p.id === 'openai') setModel('gpt-4o-mini');
                    else if (p.id === 'openrouter') setModel('google/gemini-2.5-flash');
                  }}
                  className="btn"
                  style={{
                    padding: '8px 10px',
                    fontSize: '12.5px',
                    backgroundColor: provider === p.id ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-elevated)',
                    borderColor: provider === p.id ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                    color: provider === p.id ? '#ffffff' : 'var(--text-secondary)',
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
              <label style={{ fontSize: '13px', fontWeight: 500 }}>
                {provider === 'gemini' ? 'Gemini API Key' : 'API Key / Bearer Token'}
              </label>
              {apiKey && (
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
                >
                  <Trash2 size={12} /> Clear Key
                </button>
              )}
            </div>
            <input
              type="password"
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="code-buffer"
              style={{
                height: '42px',
                padding: '10px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}
              autoComplete="off"
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px', display: 'flex', gap: '4px' }}>
              <ShieldCheck size={14} color="#34d399" />
              Stored in plain text in this browser's localStorage and sent only to the provider you select, with each request. Use a restricted or low-limit key, and don't use this on a shared machine.
            </p>
          </div>

          {/* Model name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Model Identifier
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="code-buffer"
                style={{ height: '40px', padding: '10px 12px', fontSize: '13px' }}
              />
            </div>
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
                onChange={(e) => setBaseUrl(e.target.value)}
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

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {savedSuccess ? (
                <>
                  <CheckCircle2 size={16} /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
