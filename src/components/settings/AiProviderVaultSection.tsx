import React from 'react';
import {
  ShieldAlert,
  Info,
  Trash2,
  KeyRound,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Sparkles,
  Coins,
  Zap,
  Cpu,
  ExternalLink,
} from 'lucide-react';
import { detectProviderFromKey } from '../../lib/ai';
import type { AIProvider } from '../../lib/ai';
import type { DiscoveredModel, ProviderAccountInfo } from '../../lib/modelDiscovery';
import type { AppTheme } from '../../lib/theme';
import {
  PROVIDER_KEY_PORTALS,
  TOP_OPENROUTER_FREE_PICKS,
  PROVIDER_OPTIONS,
} from './settingsConstants';

export type SettingsConfirmAction = 'clear' | 'replace' | 'reset-deck' | 'reset-everything' | null;

export interface AiProviderVaultSectionProps {
  aiSectionRef: React.RefObject<HTMLDivElement | null>;
  currentTheme: AppTheme;
  provider: AIProvider;
  storedKeys: Record<AIProvider, string>;
  onSelectProvider: (p: AIProvider) => void;
  apiKey: string;
  keyInput: string;
  setKeyInput: (val: string) => void;
  confirmAction: SettingsConfirmAction;
  setConfirmAction: (action: SettingsConfirmAction) => void;
  onSaveKeyClick: () => void;
  onExecuteSaveKey: (valToSave?: string) => void;
  onClearKeyClick: () => void;
  onExecuteClearKey: () => void;
  isKeyModified: boolean;
  accountInfo: ProviderAccountInfo | null;
  isLoadingModels: boolean;
  modelDiscoveryError: string | null;
  discoveredModels: DiscoveredModel[];
  customModelMode: boolean;
  setCustomModelMode: (custom: boolean) => void;
  model: string;
  onModelChange: (val: string) => void;
  baseUrl: string;
  onBaseUrlChange: (val: string) => void;
  onQueryModels: (prov: AIProvider, keyToUse: string, customUrl?: string) => void;
}

export const AiProviderVaultSection: React.FC<AiProviderVaultSectionProps> = ({
  aiSectionRef,
  currentTheme,
  provider,
  storedKeys,
  onSelectProvider,
  apiKey,
  keyInput,
  setKeyInput,
  confirmAction,
  setConfirmAction,
  onSaveKeyClick,
  onExecuteSaveKey,
  onClearKeyClick,
  onExecuteClearKey,
  isKeyModified,
  accountInfo,
  isLoadingModels,
  modelDiscoveryError,
  discoveredModels,
  customModelMode,
  setCustomModelMode,
  model,
  onModelChange,
  baseUrl,
  onBaseUrlChange,
  onQueryModels,
}) => {
  const isLight = currentTheme === 'apple-gsos';
  const portal = PROVIDER_KEY_PORTALS[provider];

  return (
    <>
      {/* Provider Selection */}
      <div
        ref={aiSectionRef}
        id="settings-ai-section"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '16px',
          scrollMarginTop: '65px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500 }}>
            AI Provider & Multi-Key Vault
          </label>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Keys are stored per provider
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          {PROVIDER_OPTIONS.map((p) => {
            const hasKey = Boolean(storedKeys[p.id]);
            const isActive = provider === p.id;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => onSelectProvider(p.id)}
                className="btn"
                style={{
                  padding: '8px 10px',
                  fontSize: '12px',
                  backgroundColor: isActive
                    ? (currentTheme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.16)' : 'rgba(56, 189, 248, 0.2)')
                    : 'var(--bg-elevated)',
                  borderColor: isActive
                    ? (currentTheme === 'apple-gsos' ? 'var(--accent-primary)' : 'var(--accent-cyan)')
                    : 'var(--border-subtle)',
                  borderWidth: currentTheme === 'apple-gsos' && isActive ? '1.5px' : '1px',
                  color: isActive
                    ? (currentTheme === 'apple-gsos' ? 'var(--text-primary)' : 'var(--bg-card)')
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

                {p.badge && (
                  <span
                    style={{
                      fontSize: '9.5px',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      backgroundColor: isActive
                        ? (currentTheme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.14)' : 'rgba(56, 189, 248, 0.25)')
                        : (currentTheme === 'apple-gsos' ? 'var(--bg-main)' : 'rgba(255, 255, 255, 0.08)'),
                      color: isActive
                        ? 'var(--accent-cyan)'
                        : (currentTheme === 'apple-gsos' ? 'var(--text-primary)' : 'var(--text-muted)'),
                      fontWeight: isActive ? 600 : 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.badge}
                  </span>
                )}

                {hasKey ? (
                  <span style={{ fontSize: '10px', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', fontWeight: 600 }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent-success)' }} />
                    Key Saved
                  </span>
                ) : (
                  <span style={{ fontSize: '10px', color: currentTheme === 'apple-gsos' ? 'var(--text-secondary)' : 'var(--text-dim)', marginTop: '2px' }}>
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
            backgroundColor: isLight ? 'var(--status-active-bg)' : 'rgba(56, 189, 248, 0.08)',
            border: isLight ? '1.5px solid var(--accent-primary)' : '1px solid rgba(56, 189, 248, 0.3)',
            boxShadow: isLight ? '2px 2px 0px rgba(68, 85, 170, 0.15)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: isLight ? 'var(--text-primary)' : 'var(--text-secondary)',
            lineHeight: 1.45,
          }}
        >
          <Zap size={15} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <span>
            <strong style={{ color: isLight ? 'var(--accent-primary)' : 'var(--accent-cyan)' }}>Tip:</strong> For the fastest zero-cost evaluations, use <strong style={{ color: isLight ? 'var(--text-primary)' : undefined }}>Groq</strong> (llama-3.3-70b-versatile) or <strong style={{ color: isLight ? 'var(--text-primary)' : undefined }}>Google Gemini</strong> (gemini-2.5-flash). Both provide free developer tiers with no credit card required.
          </span>
        </div>
      </div>

      {/* API Key */}
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
                  color: 'var(--accent-cyan)',
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
                  color: 'var(--accent-emerald)',
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
                onClick={onClearKeyClick}
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
                onSelectProvider(detected);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSaveKeyClick();
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
            onClick={onSaveKeyClick}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontSize: '13px', fontWeight: 600 }}>
              <AlertTriangle size={16} />
              Clear stored API key?
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              This removes your key from this browser&apos;s localStorage. The trainer will automatically switch to Keyless mode.
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
                  backgroundColor: 'var(--accent-rose)',
                  color: 'var(--bg-card)',
                  border: 'none',
                  fontWeight: 600,
                }}
                onClick={onExecuteClearKey}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)', fontSize: '13px', fontWeight: 600 }}>
              <AlertTriangle size={16} />
              Replace stored API key?
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Your previous key will be permanently overwritten in your browser&apos;s localStorage.
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
                onClick={() => onExecuteSaveKey()}
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
              backgroundColor: isLight ? 'var(--status-active-bg)' : 'rgba(56, 189, 248, 0.08)',
              border: isLight ? '1.5px solid var(--accent-primary)' : '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: isLight ? '2px 2px 0px rgba(68, 85, 170, 0.15)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              fontSize: '12px',
            }}
          >
            <div style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={15} color={isLight ? 'var(--accent-primary)' : 'var(--accent-cyan)'} style={{ flexShrink: 0 }} />
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>Need an API key?</strong> {portal.description}.
              </span>
            </div>
            <a
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: isLight ? 'var(--bg-card)' : 'var(--accent-cyan)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: isLight ? 'var(--accent-primary)' : 'rgba(56, 189, 248, 0.1)',
                border: isLight ? '1px solid var(--accent-primary)' : '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <span>{portal.label}</span>
              <ExternalLink size={11} />
            </a>
          </div>
        )}

        <p
          data-testid="api-key-warning"
          style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', gap: '6px', lineHeight: 1.5 }}
        >
          <ShieldAlert size={14} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong style={{ color: 'var(--text-secondary)' }}>Your key is stored in plain text</strong> in this browser&apos;s localStorage, so
            anyone who can use this browser profile, or any script running on this page, can read it. It is sent only to the provider you
            select, and it is not included in backup exports. On a shared computer, use a key with a low spending limit and ensure that you delete
            it, or use Reset Everything (below), before leaving.
          </span>
        </p>
      </div>

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
                <Loader2 size={14} className="animate-spin" color="var(--accent-cyan)" />
              ) : modelDiscoveryError ? (
                <AlertTriangle size={14} color="var(--accent-rose)" />
              ) : (
                <Cpu size={14} color="var(--accent-cyan)" />
              )}
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: modelDiscoveryError ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
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
                      color: 'var(--accent-cyan)',
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
              {portal && (
                <div>
                  <a
                    href={portal.url}
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
                    <span>Key expired or invalid? Renew key on {portal.name}</span>
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
                  <Coins size={12} color="var(--accent-emerald)" />
                  <strong style={{ color: 'var(--accent-emerald)' }}>{accountInfo.creditsRemaining}</strong>
                </span>
              )}
              {accountInfo.tokensRemaining && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={12} color="var(--accent-amber)" />
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
              onClick={() => onQueryModels(provider, apiKey, baseUrl)}
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
              onChange={(e) => onModelChange(e.target.value)}
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
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
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
                            color: 'var(--accent-purple)',
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
                            color: 'var(--accent-emerald)',
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
                            color: 'var(--accent-cyan)',
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
              onChange={(e) => onModelChange(e.target.value)}
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
              backgroundColor: isLight ? 'var(--status-active-bg)' : 'rgba(56, 189, 248, 0.08)',
              border: isLight ? '1.5px solid var(--accent-primary)' : '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: isLight ? '2px 2px 0px rgba(68, 85, 170, 0.15)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Sparkles size={15} color="var(--accent-cyan)" />
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
                  color: 'var(--accent-emerald)',
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
                      onModelChange(pick.id);
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
                        <div style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
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
                            color: isSelected ? 'var(--accent-cyan)' : 'var(--accent-emerald)',
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
                          color: 'var(--accent-purple)',
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
                      <strong style={{ color: 'var(--text-primary)' }}>Why it&apos;s solid: </strong>
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
            onChange={(e) => onBaseUrlChange(e.target.value)}
            className="code-buffer"
            style={{ height: '40px', padding: '10px 12px', fontSize: '13px' }}
          />
        </div>
      )}
    </>
  );
};

