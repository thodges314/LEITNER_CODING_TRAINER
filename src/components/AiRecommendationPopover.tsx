import React, { useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Settings,
  X,
  MessageSquare,
  Brain,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface AiRecommendationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const AiRecommendationPopover: React.FC<AiRecommendationPopoverProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      {/* Click-outside backdrop */}
      <div
        className="ai-recommendation-backdrop"
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
        className="ai-recommendation-popover"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-recommendation-title"
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
                id="ai-recommendation-title"
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
                Supercharge with AI
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Enhanced evaluation & mentoring
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close recommendation dialog"
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
            gap: '14px',
          }}
        >
          {/* Current Engine Badge */}
          <div
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <ShieldCheck
              size={16}
              color="var(--accent-emerald)"
              style={{ flexShrink: 0, marginTop: '2px' }}
            />
            <div style={{ fontSize: '12px', lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Currently in Keyless Mode
              </span>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)' }}>
                Your solutions are evaluated offline via deterministic unit tests and AST syntax patterns.
              </p>
            </div>
          </div>

          {/* Features Unlocked by AI Key */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px',
              }}
            >
              What Adding an AI Key Unlocks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {/* Feature 1 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                <Brain
                  size={15}
                  color="var(--accent-primary)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    Deep Semantic Critique
                  </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {' '}— In-depth explanation of algorithmic edge cases, asymptotic complexity bounds, and subtle invariants.
                  </span>
                </div>
              </div>

              {/* Feature 2 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                <MessageSquare
                  size={15}
                  color="var(--accent-purple)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    Interactive AI Mentor Chat
                  </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {' '}— Ask follow-up questions directly on your critique to explore alternative solutions or clarify why a test failed.
                  </span>
                </div>
              </div>

              {/* Feature 3 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                <Zap
                  size={15}
                  color="var(--accent-amber)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    AI Problem Generator
                  </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {' '}— Draft complete flashcard topics with starter code, reference solutions, and test harnesses from rough notes.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Free Providers Callout */}
          <div
            style={{
              padding: '11px 13px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <CheckCircle2 size={13} />
              <span>Free & zero-cost models in Settings:</span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '11.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              Our top recommendation is <strong style={{ color: 'var(--text-primary)' }}>Groq</strong> with <code style={{ fontSize: '11px', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--accent-cyan)' }}>openai/gpt-oss-120b</code> for blistering-fast free evaluations, followed by <strong style={{ color: 'var(--text-primary)' }}>Google Gemini 2.5 Flash</strong> (free tier via Google AI Studio). You can also run locally via <strong>Ollama</strong> (100% free & offline), or connect <strong>Claude</strong> / <strong>OpenAI</strong>.
            </p>
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
            Continue Keyless
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
            <span>Open Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};
