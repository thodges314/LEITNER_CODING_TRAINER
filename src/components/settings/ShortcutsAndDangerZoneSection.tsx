import React from 'react';
import { Info, Trash2, AlertTriangle } from 'lucide-react';
import { SHORTCUTS, SHORTCUT_ORDER, currentPlatform, shortcutKeys } from '../../lib/shortcuts';
import type { AppTheme } from '../../lib/theme';
import type { SettingsConfirmAction } from './AiProviderVaultSection';

export interface ShortcutsAndDangerZoneSectionProps {
  currentTheme: AppTheme;
  confirmAction: SettingsConfirmAction;
  setConfirmAction: (action: SettingsConfirmAction) => void;
  resetConfirmInput: string;
  setResetConfirmInput: (val: string) => void;
  onResetDeckToDefaults?: () => void;
  showToast: (msg: string) => void;
}

export const ShortcutsAndDangerZoneSection: React.FC<ShortcutsAndDangerZoneSectionProps> = ({
  currentTheme,
  confirmAction,
  setConfirmAction,
  resetConfirmInput,
  setResetConfirmInput,
  onResetDeckToDefaults,
  showToast,
}) => {
  const isLight = currentTheme === 'apple-gsos';

  return (
    <>
      {/* Keyboard shortcuts: a collapsible reference for power users */}
      <details
        data-testid="shortcuts-section"
        style={{
          padding: '10px 14px',
          borderRadius: '8px',
          border: isLight ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
          fontSize: '13px',
        }}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>Keyboard shortcuts</summary>
        <ul data-testid="shortcuts-list" style={{ listStyle: 'none', margin: '12px 0 4px', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SHORTCUT_ORDER.map((id) => {
            const platform = currentPlatform();
            const def = SHORTCUTS[id];
            const renderKeys = (keys: string[]) => (
              <span style={{ display: 'inline-flex', gap: '4px' }}>
                {keys.map((k) => (
                  <kbd key={k} className="kbd">{k}</kbd>
                ))}
              </span>
            );
            return (
              <li key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span>{def.label}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {renderKeys(shortcutKeys(id, platform))}
                  {def.alt && (
                    <>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>or</span>
                      {renderKeys(def.alt[platform])}
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          Showing {currentPlatform() === 'mac' ? 'Mac' : 'Windows/Linux'} keys. Hover or focus a button in the practice view to see its shortcut.
        </p>
      </details>

      {/* Offline & Keyless Ready Banner (Above Danger Zone) */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '8px',
          backgroundColor: isLight ? 'var(--status-active-bg)' : 'rgba(56, 189, 248, 0.08)',
          border: isLight ? '1.5px solid var(--accent-primary)' : '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: isLight ? '2px 2px 0px rgba(68, 85, 170, 0.15)' : 'none',
          display: 'flex',
          gap: '10px',
          fontSize: '12px',
          color: isLight ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        <Info size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Offline & Keyless Ready: </span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-highlight)', fontSize: '13px', fontWeight: 600 }}>
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
                  Resets cards back to Tier/Box 1, and clears streaks, review counts and code drafts. Custom decks and API keys are preserved.
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
                  border: '1.5px solid var(--accent-highlight)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-highlight)', fontSize: '13px', fontWeight: 600 }}>
                  <AlertTriangle size={16} />
                  Permanently reset learning progress across all decks?
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                  This will reset card review streaks, box tiers, completed review counters and editor code drafts. Custom-built decks and stored API keys will NOT be deleted.
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
                    To confirm, type <strong translate="no" className="notranslate" style={{ color: 'var(--accent-highlight)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>RESET ALL DECKS</strong> below:
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
                        ? 'var(--accent-highlight)'
                        : 'var(--border-medium)',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-editor)',
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
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-highlight)' }}>
                Reset Everything (Factory Reset)
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Completely clears all browser localStorage—including API keys, custom decks, preferences and code drafts. Restores the app as if loaded for the very first time.
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
                border: '1.5px solid var(--accent-highlight)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-highlight)', fontSize: '13px', fontWeight: 600 }}>
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
                  To confirm, type <strong translate="no" className="notranslate" style={{ color: 'var(--accent-highlight)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>RESET EVERYTHING</strong> below:
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
                      ? 'var(--accent-highlight)'
                      : 'var(--border-medium)',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-editor)',
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
    </>
  );
};

