import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, KeyRound, Loader2 } from 'lucide-react';
import type { TopicItem } from '../../lib/leitner';
import { askCritiqueFollowUp, getStoredApiKey, type EvaluationResult } from '../../lib/ai';
import type { AppTheme } from '../../lib/theme';
import { MarkdownContent } from '../MarkdownContent';
import { StreamedMarkdown } from '../StreamedMarkdown';

export interface CritiqueFollowUpSectionProps {
  theme?: AppTheme;
  topic: TopicItem;
  submittedCode: string;
  result: EvaluationResult;
  onOpenSettings?: (section?: 'ai') => void;
}

export const CritiqueFollowUpSection: React.FC<CritiqueFollowUpSectionProps> = ({
  theme,
  topic,
  submittedCode,
  result,
  onOpenSettings,
}) => {
  const isLight = theme === 'apple-gsos';
  const hasApiKey = Boolean(getStoredApiKey());

  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpMessages, setFollowUpMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isFollowUpOpen) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isFollowUpOpen]);

  useEffect(() => {
    if (followUpMessages.length > 0) {
      scrollToBottom();
    }
  }, [followUpMessages, isSendingFollowUp]);

  const handleSendFollowUp = async () => {
    const question = followUpInput.trim();
    if (!question || isSendingFollowUp) return;

    setFollowUpInput('');
    const updated = [...followUpMessages, { role: 'user' as const, content: question }];
    setFollowUpMessages(updated);
    setIsSendingFollowUp(true);

    try {
      const reply = await askCritiqueFollowUp(
        topic,
        submittedCode,
        result.critique,
        question,
        followUpMessages
      );
      setFollowUpMessages([...updated, { role: 'assistant' as const, content: reply }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFollowUpMessages([
        ...updated,
        { role: 'assistant' as const, content: `Error: ${msg}` },
      ]);
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  return (
    <div
      onClick={() => {
        if (!isFollowUpOpen) setIsFollowUpOpen(true);
      }}
      style={{
        padding: '16px',
        borderRadius: '10px',
        backgroundColor: 'var(--bg-card)',
        border: isFollowUpOpen ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid var(--border-subtle)',
        cursor: !isFollowUpOpen ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease',
      }}
    >
      <style>{`
        @keyframes followupCursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
          <Sparkles size={16} />
          <h4 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Evaluator Analysis & Critique
          </h4>
        </div>
        {!isFollowUpOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--accent-cyan)',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>click to ask follow-up</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>&gt;</span>
            </span>
            {!hasApiKey && onOpenSettings && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings('ai');
                }}
                title="Connect an AI key in Settings to chat with evaluator"
                style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: 'var(--accent-amber)',
                  color: '#000',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <KeyRound size={11} />
                <span>Connect Key</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!isFollowUpOpen ? (
        <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
          <MarkdownContent text={result.critique} />
          {result.rawOutput !== undefined && (
            <pre
              data-testid="raw-evaluator-output"
              style={{
                marginTop: '10px',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '240px',
                overflowY: 'auto',
                backgroundColor: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {result.rawOutput}
            </pre>
          )}
        </div>
      ) : (
        <div onClick={(e) => e.stopPropagation()}>
          {!hasApiKey && (
            <div
              style={{
                marginBottom: '10px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${isLight ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.25)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                fontSize: '12px',
              }}
            >
              <span style={{ color: 'var(--accent-warning)' }}>
                <strong>Offline Mode:</strong> Connect an AI key to ask follow-up questions on this critique.
              </span>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => onOpenSettings('ai')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: 'var(--accent-amber)',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <KeyRound size={12} />
                  Add Key
                </button>
              )}
            </div>
          )}

          {/* Unified Scrolling Dialog Transcript */}
          <div
            ref={transcriptRef}
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              paddingRight: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
              <MarkdownContent text={result.critique} />
            </div>

            {followUpMessages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {msg.role === 'user' ? (
                  <div
                    style={{
                      color: 'var(--accent-cyan)',
                      fontWeight: 600,
                      fontSize: '13.5px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      marginTop: '4px',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      &gt;
                    </span>
                    <span>{msg.content}</span>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-primary)', fontSize: '13.5px', lineHeight: 1.55 }}>
                    <StreamedMarkdown
                      text={msg.content}
                      isNew={idx === followUpMessages.length - 1}
                      intervalMs={22}
                      cursorClassName="followup-cursor"
                      cursorAnimation="followupCursorBlink 0.75s infinite"
                      onScrollToBottom={scrollToBottom}
                    />
                    {msg.content.includes('requires an AI provider API key') && onOpenSettings && (
                      <div style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => onOpenSettings('ai')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            backgroundColor: 'var(--accent-amber)',
                            color: '#000',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <KeyRound size={12} />
                          <span>Connect AI Key in Settings</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isSendingFollowUp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '12.5px' }}>
                <Loader2 size={13} className="animate-spin" />
                <span>Consulting evaluator...</span>
              </div>
            )}
          </div>

          {/* Hairline Retro Prompt Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSendFollowUp();
            }}
            style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono, monospace)' }}>
              &gt;
            </span>
            <input
              ref={inputRef}
              type="text"
              className="followup-chat-input"
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSendFollowUp();
                }
              }}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                borderRadius: 0,
                padding: 0,
                color: 'var(--text-primary)',
                fontSize: '13px',
                caretColor: 'var(--accent-cyan)',
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSendFollowUp();
              }}
              disabled={!followUpInput.trim() || isSendingFollowUp}
              style={{
                background: 'none',
                border: 'none',
                color: followUpInput.trim() && !isSendingFollowUp ? 'var(--accent-cyan)' : 'var(--text-dim)',
                cursor: followUpInput.trim() && !isSendingFollowUp ? 'pointer' : 'default',
                padding: '2px 8px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isSendingFollowUp ? <Loader2 size={12} className="animate-spin" /> : <span>Send ↵</span>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
