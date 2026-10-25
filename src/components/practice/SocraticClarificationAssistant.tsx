import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  X,
  Sparkles,
  Send,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { MarkdownContent } from '../MarkdownContent';
import {
  askSocraticClarification,
  getStoredApiKey,
  type CritiqueFollowUpMessage,
} from '../../lib/ai';
import type { TopicItem } from '../../lib/leitner';

interface SocraticClarificationAssistantProps {
  topic: TopicItem;
  currentCode: string;
  theme?: 'dark' | 'apple-gsos';
  onOpenSettings?: (section?: 'ai') => void;
}

const StreamedAssistantReply: React.FC<{
  text: string;
  isNew: boolean;
  onScrollToBottom: () => void;
  onComplete?: () => void;
}> = ({ text, isNew, onScrollToBottom, onComplete }) => {
  const tokens = useMemo(() => {
    return text.match(/(\s+|\S+)/g) || [text];
  }, [text]);

  const [tokenCount, setTokenCount] = useState(() => (isNew ? 0 : tokens.length));
  const [isDone, setIsDone] = useState(!isNew);

  const onCompleteRef = useRef(onComplete);
  const onScrollToBottomRef = useRef(onScrollToBottom);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onScrollToBottomRef.current = onScrollToBottom;
  });

  useEffect(() => {
    if (!isNew) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= tokens.length) {
        setTokenCount(tokens.length);
        setIsDone(true);
        clearInterval(interval);
        onCompleteRef.current?.();
      } else {
        setTokenCount(current);
      }
      onScrollToBottomRef.current?.();
    }, 20);

    return () => clearInterval(interval);
  }, [isNew, tokens]);

  const currentText = useMemo(() => {
    if (isDone || !isNew) return text;
    return tokens.slice(0, tokenCount).join('');
  }, [isDone, isNew, text, tokens, tokenCount]);

  return (
    <div style={{ lineHeight: 1.55 }}>
      <MarkdownContent text={currentText} />
      {!isDone && (
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '14px',
            backgroundColor: '#38bdf8',
            verticalAlign: 'text-bottom',
            marginLeft: '4px',
            animation: 'socraticCursorBlink 0.75s infinite',
          }}
        />
      )}
    </div>
  );
};

export const SocraticClarificationAssistant: React.FC<SocraticClarificationAssistantProps> = ({
  topic,
  currentCode,
  theme = 'dark',
  onOpenSettings,
}) => {
  const [prevTopicId, setPrevTopicId] = useState(topic.id);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CritiqueFollowUpMessage[]>([]);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset assistant session if user switches topic without remounting
  if (prevTopicId !== topic.id) {
    setPrevTopicId(topic.id);
    setMessages([]);
    setAnimatingIndex(null);
    setIsOpen(false);
  }

  const hasApiKey = Boolean(getStoredApiKey());
  const isLight = theme === 'apple-gsos';

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => {
      if (prev) {
        setAnimatingIndex(null);
        return false;
      }
      return true;
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setAnimatingIndex(null);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isLoading) return;

    setInputVal('');
    const newHistory: CritiqueFollowUpMessage[] = [...messages, { role: 'user', content: query }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const reply = await askSocraticClarification(topic, currentCode, query, messages);
      const newAssistantIdx = newHistory.length;
      setAnimatingIndex(newAssistantIdx);
      setMessages([...newHistory, { role: 'assistant', content: reply }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const newAssistantIdx = newHistory.length;
      setAnimatingIndex(newAssistantIdx);
      setMessages([...newHistory, { role: 'assistant', content: `[Clarification error: ${msg}]` }]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  const CHIPS = [
    {
      label: '❓ Clarify Prompt',
      query: 'Could you clarify the problem requirements and what the function is expected to do in simple terms?',
    },
    {
      label: '🧠 Concept Refresher',
      query: 'Could you give me a conceptual reminder of how the underlying algorithm or pattern works in plain English (no code)?',
    },
    {
      label: '⚠️ Edge Cases',
      query: 'What tricky edge cases, boundary inputs, or subtle invariants should I watch out for in this problem?',
    },
    {
      label: '🔍 Why is current approach broken?',
      query: 'Looking at my current code in the editor, what flaws, logic bugs, or unhandled conditions should I investigate?',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes socraticCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes socraticPanelFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translate(4px, -4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translate(0, 0);
          }
        }
        .socratic-chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-family: var(--font-mono, monospace);
          background: ${isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.07)'};
          border: 1px solid ${isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'};
          color: ${isLight ? '#1f2937' : '#e2e8f0'};
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          text-align: left;
        }
        .socratic-chip-btn:hover {
          background: ${isLight ? 'rgba(56, 189, 248, 0.12)' : 'rgba(56, 189, 248, 0.18)'};
          border-color: rgba(56, 189, 248, 0.4);
          color: #38bdf8;
        }
      `}</style>

      {/* Floating Translucent Question Mark in Top Right Corner */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Ask AI Tutor for Clarification or Hints"
        title="Ask AI Tutor for Clarification or Hints (Socratic Mode)"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: isOpen
            ? '1px solid #38bdf8'
            : isLight
            ? '1px solid rgba(0, 0, 0, 0.15)'
            : '1px solid rgba(255, 255, 255, 0.18)',
          backgroundColor: isOpen
            ? 'rgba(56, 189, 248, 0.2)'
            : isLight
            ? 'rgba(255, 255, 255, 0.6)'
            : 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(4px)',
          color: isOpen ? '#38bdf8' : isLight ? '#4b5563' : 'rgba(255, 255, 255, 0.7)',
          cursor: 'pointer',
          zIndex: 15,
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.18)';
          e.currentTarget.style.color = '#38bdf8';
          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = isLight
              ? 'rgba(255, 255, 255, 0.6)'
              : 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = isLight ? '#4b5563' : 'rgba(255, 255, 255, 0.7)';
            e.currentTarget.style.borderColor = isLight
              ? 'rgba(0, 0, 0, 0.15)'
              : 'rgba(255, 255, 255, 0.18)';
          }
        }}
      >
        <HelpCircle size={16} strokeWidth={2.2} />
      </button>

      {/* Expanded Socratic Clarification Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: 'calc(100% - 16px)',
            maxWidth: '540px',
            maxHeight: '520px',
            backgroundColor: isLight ? '#ffffff' : '#0f172a',
            border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(56, 189, 248, 0.35)'}`,
            borderRadius: '10px',
            boxShadow: isLight
              ? '0 12px 30px rgba(0, 0, 0, 0.12)'
              : '0 16px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.12)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            animation: 'socraticPanelFadeIn 0.2s ease-out forwards',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 14px',
              borderBottom: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.95)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Sparkles size={14} />
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Socratic AI Tutor
                </span>
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  No code spoilers
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close tutor panel"
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                borderRadius: '4px',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              <X size={16} />
            </button>
          </div>

          {/* No-Key Advisory Notice (when offline) */}
          {!hasApiKey && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
                borderBottom: `1px solid ${isLight ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.25)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                fontSize: '12px',
              }}
            >
              <div style={{ color: isLight ? '#92400e' : '#fbbf24', lineHeight: 1.4 }}>
                <strong>Offline Mode:</strong> Connect an AI key (like free Groq) for real-time interactive answers.
              </div>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => onOpenSettings('ai')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#f59e0b',
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

          {/* Chat Messages Container */}
          <div
            ref={chatScrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minHeight: '120px',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-dim)',
                    lineHeight: 1.5,
                  }}
                >
                  Need a conceptual nudge or clarification without spoiling the solution? Select a topic chip or ask anything below:
                </div>

                {/* Quick Action Prompt Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="socratic-chip-btn"
                      onClick={() => handleSendMessage(chip.query)}
                      disabled={isLoading}
                    >
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {msg.role === 'user' ? (
                    <div
                      style={{
                        color: '#38bdf8',
                        fontWeight: 600,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        marginTop: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 700,
                          color: '#38bdf8',
                        }}
                      >
                        &gt;
                      </span>
                      <span>{msg.content}</span>
                    </div>
                  ) : (
                    <div
                      style={{
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        lineHeight: 1.55,
                        backgroundColor: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        borderLeft: '2px solid #38bdf8',
                      }}
                    >
                      <StreamedAssistantReply
                        text={msg.content}
                        isNew={idx === animatingIndex}
                        onScrollToBottom={scrollToBottom}
                        onComplete={() => setAnimatingIndex(null)}
                      />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#38bdf8',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                <Loader2 size={13} className="animate-spin" />
                <span>Thinking Socratically...</span>
              </div>
            )}
          </div>

          {/* Follow-up Chips when already in conversation */}
          {messages.length > 0 && !isLoading && (
            <div
              style={{
                padding: '6px 14px',
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                borderTop: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'}`,
                backgroundColor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.15)',
              }}
            >
              {CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="socratic-chip-btn"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={() => handleSendMessage(chip.query)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Hairline Retro Prompt Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSendMessage();
            }}
            style={{
              padding: '10px 14px',
              borderTop: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.95)',
            }}
          >
            <span
              style={{
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '14px',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              &gt;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              placeholder={hasApiKey ? 'Ask a question or clarify a concept...' : 'Ask question (offline guidance)...'}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSendMessage();
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
                caretColor: '#38bdf8',
              }}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputVal.trim() || isLoading}
              aria-label="Send question"
              style={{
                background: 'none',
                border: 'none',
                color: inputVal.trim() && !isLoading ? '#38bdf8' : 'var(--text-dim)',
                cursor: inputVal.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
