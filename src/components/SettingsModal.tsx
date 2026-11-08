import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
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
} from '../lib/timedMode';
import {
  getTsHoverEnabled,
  setTsHoverEnabled,
} from '../lib/editorSettings';
import type { AppTheme } from '../lib/theme';
import { PracticeAndAppearanceSection } from './settings/PracticeAndAppearanceSection';
import {
  AiProviderVaultSection,
  type SettingsConfirmAction,
} from './settings/AiProviderVaultSection';
import { ShortcutsAndDangerZoneSection } from './settings/ShortcutsAndDangerZoneSection';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: 'ai' | null;
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
  initialSection,
  currentAlgorithm,
  onAlgorithmChange,
  currentTheme = 'dark',
  onThemeChange,
  onSettingsSaved,
  onResetDeckToDefaults,
}) => {
  const isLight = currentTheme === 'apple-gsos';
  const modalContentRef = useRef<HTMLDivElement>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const [algorithm, setAlgorithm] = useState<SpacedAlgorithm>(() => currentAlgorithm ?? getStoredAlgorithm());
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [keyInput, setKeyInput] = useState(() => getStoredApiKey());
  const [provider, setProvider] = useState<AIProvider>(() => getStoredProvider());
  const [model, setModel] = useState(() => getStoredModel());
  const [baseUrl, setBaseUrl] = useState(() => getStoredBaseUrl());
  const [storedKeys, setStoredKeys] = useState(() => getAllStoredKeys());
  const [timedMode, setTimedMode] = useState(() => getTimedModeEnabled());
  const [timedDuration, setTimedDuration] = useState(() => getTimedModeDuration());
  const [tsHover, setTsHover] = useState(() => getTsHoverEnabled());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<SettingsConfirmAction>(null);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

  // Model & Provider Discovery State
  const [discoveredModels, setDiscoveredModels] = useState<DiscoveredModel[]>([]);
  const [accountInfo, setAccountInfo] = useState<ProviderAccountInfo | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelDiscoveryError, setModelDiscoveryError] = useState<string | null>(null);
  const [customModelMode, setCustomModelMode] = useState(false);

  // Smooth scroll to AI section when opened from AI connect buttons
  useEffect(() => {
    if (isOpen && initialSection === 'ai') {
      const timer = setTimeout(() => {
        if (aiSectionRef.current) {
          try {
            aiSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch {
            const top = aiSectionRef.current.offsetTop - 65;
            modalContentRef.current?.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialSection]);

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

  const handleToggleTsHover = (enabled: boolean) => {
    setTsHover(enabled);
    setTsHoverEnabled(enabled);
    onSettingsSaved?.();
    showToast(enabled ? 'TypeScript hover tooltips enabled' : 'TypeScript hover tooltips disabled');
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div
        ref={modalContentRef}
        className="modal-content"
        style={{
          maxWidth: '540px',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon">
              <Sliders size={20} />
            </div>
            <div>
              <h2 id="settings-title" className="modal-title">
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
                  color: 'var(--accent-success)',
                  border: isLight ? '1px solid var(--status-attempted-border)' : '1px solid rgba(52, 211, 153, 0.3)',
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
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close settings"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="modal-body" style={{ gap: '18px' }}>
          <PracticeAndAppearanceSection
            algorithm={algorithm}
            onSelectAlgorithm={handleSelectAlgorithm}
            timedMode={timedMode}
            onToggleTimedMode={handleToggleTimedMode}
            timedDuration={timedDuration}
            onSelectDuration={handleSelectDuration}
            tsHover={tsHover}
            onToggleTsHover={handleToggleTsHover}
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
            showToast={showToast}
          />

          <AiProviderVaultSection
            aiSectionRef={aiSectionRef}
            currentTheme={currentTheme}
            provider={provider}
            storedKeys={storedKeys}
            onSelectProvider={handleSelectProvider}
            apiKey={apiKey}
            keyInput={keyInput}
            setKeyInput={setKeyInput}
            confirmAction={confirmAction}
            setConfirmAction={setConfirmAction}
            onSaveKeyClick={handleSaveKeyClick}
            onExecuteSaveKey={executeSaveKey}
            onClearKeyClick={handleClearKeyClick}
            onExecuteClearKey={executeClearKey}
            isKeyModified={isKeyModified}
            accountInfo={accountInfo}
            isLoadingModels={isLoadingModels}
            modelDiscoveryError={modelDiscoveryError}
            discoveredModels={discoveredModels}
            customModelMode={customModelMode}
            setCustomModelMode={setCustomModelMode}
            model={model}
            onModelChange={handleModelChange}
            baseUrl={baseUrl}
            onBaseUrlChange={handleBaseUrlChange}
            onQueryModels={queryModels}
          />

          <ShortcutsAndDangerZoneSection
            currentTheme={currentTheme}
            confirmAction={confirmAction}
            setConfirmAction={setConfirmAction}
            resetConfirmInput={resetConfirmInput}
            setResetConfirmInput={setResetConfirmInput}
            onResetDeckToDefaults={onResetDeckToDefaults}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
  );
};
