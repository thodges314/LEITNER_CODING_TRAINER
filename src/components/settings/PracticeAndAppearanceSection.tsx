import React from 'react';
import { Timer, Code2 } from 'lucide-react';
import type { SpacedAlgorithm } from '../../lib/leitner';
import { DURATION_OPTIONS } from '../../lib/timedMode';
import type { AppTheme } from '../../lib/theme';

export interface PracticeAndAppearanceSectionProps {
  algorithm: SpacedAlgorithm;
  onSelectAlgorithm: (algo: SpacedAlgorithm) => void;
  timedMode: boolean;
  onToggleTimedMode: (enabled: boolean) => void;
  timedDuration: number;
  onSelectDuration: (seconds: number) => void;
  tsHover: boolean;
  onToggleTsHover: (enabled: boolean) => void;
  currentTheme: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
  showToast: (msg: string) => void;
}

export const PracticeAndAppearanceSection: React.FC<PracticeAndAppearanceSectionProps> = ({
  algorithm,
  onSelectAlgorithm,
  timedMode,
  onToggleTimedMode,
  timedDuration,
  onSelectDuration,
  tsHover,
  onToggleTsHover,
  currentTheme,
  onThemeChange,
  showToast,
}) => {
  const isLight = currentTheme === 'apple-gsos';

  return (
    <>
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
            onClick={() => onSelectAlgorithm('graduated-interval')}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: algorithm === 'graduated-interval' ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
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
              <span style={{ fontSize: '13px', fontWeight: 600, color: algorithm === 'graduated-interval' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                Graduated Interval
              </span>
              {algorithm === 'graduated-interval' && (
                <span style={{ fontSize: '10px', backgroundColor: 'rgba(56, 189, 248, 0.25)', color: 'var(--accent-cyan)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.04em' }}>
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
            onClick={() => onSelectAlgorithm('leitner')}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: algorithm === 'leitner' ? '1.5px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
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
              <span style={{ fontSize: '13px', fontWeight: 600, color: algorithm === 'leitner' ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                Pure Leitner Box
              </span>
              {algorithm === 'leitner' && (
                <span style={{ fontSize: '10px', backgroundColor: 'rgba(168, 85, 247, 0.25)', color: 'var(--accent-purple)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.04em' }}>
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
              <Timer size={15} color="var(--accent-amber)" />
              Timed Recall Mode
            </label>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '3px 0 0 0', lineHeight: 1.45 }}>
              Countdown starts automatically when each card loads. Automatically submits whatever you have for AI evaluation if time expires.
            </p>
          </div>

          {/* Toggle switch */}
          <button
            type="button"
            onClick={() => onToggleTimedMode(!timedMode)}
            style={{
              width: '46px',
              height: '24px',
              borderRadius: '12px',
              backgroundColor: timedMode
                ? (isLight ? 'var(--accent-primary)' : 'var(--accent-cyan)')
                : (isLight ? 'var(--border-medium)' : 'rgba(255, 255, 255, 0.15)'),
              position: 'relative',
              border: isLight
                ? (timedMode ? '1.5px solid var(--accent-primary)' : '1.5px solid var(--border-medium)')
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
                backgroundColor: 'var(--bg-card)',
                border: isLight ? '1px solid var(--border-medium)' : 'none',
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
                  onClick={() => onSelectDuration(opt.seconds)}
                  className="btn"
                  style={{
                    padding: '6px 8px',
                    fontSize: '11px',
                    backgroundColor: timedDuration === opt.seconds
                      ? (currentTheme === 'apple-gsos' ? 'rgba(217, 119, 6, 0.16)' : 'rgba(245, 158, 11, 0.15)')
                      : 'var(--bg-elevated)',
                    borderColor: timedDuration === opt.seconds
                      ? 'var(--accent-amber)'
                      : 'var(--border-subtle)',
                    borderWidth: currentTheme === 'apple-gsos' && timedDuration === opt.seconds ? '1.5px' : '1px',
                    color: timedDuration === opt.seconds
                      ? 'var(--accent-warning)'
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

      {/* TypeScript Hover Tooltips Checkbox */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        <label
          htmlFor="ts-hover-tooltips-checkbox"
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            cursor: 'pointer',
            padding: '12px 14px',
            borderRadius: '8px',
            border: isLight ? '1.5px solid var(--border-medium)' : '1px solid var(--border-subtle)',
            backgroundColor: isLight ? 'var(--bg-card)' : 'var(--bg-surface)',
            boxShadow: isLight ? '2px 2px 0px rgba(28, 28, 28, 0.15)' : 'none',
          }}
        >
          <input
            type="checkbox"
            id="ts-hover-tooltips-checkbox"
            checked={tsHover}
            onChange={(e) => onToggleTsHover(e.target.checked)}
            style={{
              marginTop: '2px',
              width: '16px',
              height: '16px',
              cursor: 'pointer',
              accentColor: isLight ? 'var(--accent-primary)' : 'var(--accent-cyan)',
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-primary)',
              }}
            >
              <Code2 size={15} color={isLight ? 'var(--accent-primary)' : 'var(--accent-cyan)'} />
              TypeScript Hover Tooltips (QuickInfo)
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              When practicing in TypeScript mode, hovering over functions, parameters, or ambient data structures (such as <code>ListNode</code> and <code>TreeNode</code>) displays rich type signatures and JSDoc annotations. Uncheck this box to disable hover tooltips in the editor.
            </span>
          </div>
        </label>
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
    </>
  );
};
