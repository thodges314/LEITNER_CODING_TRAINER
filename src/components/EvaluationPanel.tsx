import { useState, useRef, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { intervalForBox } from '../lib/leitner';
import type { TopicItem, SpacedAlgorithm } from '../lib/leitner';
import { askCritiqueFollowUp, type EvaluationResult } from '../lib/ai';

const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  // Match `inline code`, **bold**, *italic*, _italic_
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            padding: '1.5px 5px',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      parts.push(
        <em key={match.index} style={{ fontStyle: 'italic', opacity: 0.95 }}>
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts;
};

const MarkdownContent: React.FC<{ text: string }> = ({ text }) => {
  // Support code blocks ```lang ... ``` as well as markdown paragraphs
  const blocks = text.split(/(```[\s\S]*?```)/g);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {blocks.map((block, bIdx) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const code = block.slice(3, -3).replace(/^[a-zA-Z0-9_-]+\n/, '');
          return (
            <pre
              key={bIdx}
              style={{
                margin: '4px 0',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12.5px',
                overflowX: 'auto',
                color: '#e2e8f0',
                lineHeight: 1.5,
              }}
            >
              <code>{code}</code>
            </pre>
          );
        }

        const paragraphs = block.split('\n\n');
        return (
          <div key={bIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {paragraphs.map((p, pIdx) => {
              if (!p.trim()) return null;
              return (
                <div key={pIdx} style={{ lineHeight: 1.55 }}>
                  {renderInlineMarkdown(p)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const StreamedMarkdownReply: React.FC<{
  text: string;
  isNew?: boolean;
  onScrollToBottom?: () => void;
}> = ({ text, isNew = false, onScrollToBottom }) => {
  const paragraphs = useMemo(() => {
    const raw = text.split('\n\n').filter((p) => p.trim());
    return raw.length > 0 ? raw : [text];
  }, [text]);

  const [visibleCount, setVisibleCount] = useState(() => (isNew && paragraphs.length > 1 ? 1 : paragraphs.length));
  const [isDone, setIsDone] = useState(!isNew || paragraphs.length <= 1);

  useEffect(() => {
    if (!isNew || paragraphs.length <= 1) return;

    let count = 1;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      onScrollToBottom?.();
      if (count >= paragraphs.length) {
        setIsDone(true);
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [isNew, paragraphs, onScrollToBottom]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {paragraphs.slice(0, visibleCount).map((p, i) => (
        <div key={i} style={{ lineHeight: 1.55 }}>
          <MarkdownContent text={p} />
        </div>
      ))}
      {!isDone && (
        <span
          className="followup-cursor"
          style={{
            display: 'inline-block',
            width: '6px',
            height: '14px',
            backgroundColor: '#38bdf8',
            verticalAlign: 'text-bottom',
            animation: 'joshuaBlink 0.75s infinite',
          }}
        />
      )}
    </div>
  );
};

interface EvaluationPanelProps {
  topic: TopicItem;
  submittedCode: string;
  result: EvaluationResult;
  totalCompletedReviews: number;
  activeDeckSize?: number;
  algorithm?: SpacedAlgorithm;
  onCommit: (passed: boolean) => void;
  onRetry: () => void;
  showSolution?: boolean;
  onToggleShowSolution?: () => void;
  isReinforcement?: boolean;
  onFinishReinforcement?: () => void;
}

export const EvaluationPanel: React.FC<EvaluationPanelProps> = ({
  topic,
  submittedCode = '',
  result,
  totalCompletedReviews,
  activeDeckSize,
  algorithm = 'leitner',
  onCommit,
  onRetry,
  showSolution,
  onToggleShowSolution,
  isReinforcement,
  onFinishReinforcement,
}) => {
  // Human override state, initialized to AI verdict
  const [effectiveVerdict, setEffectiveVerdict] = useState<boolean>(result.passed);
  const isOverridden = effectiveVerdict !== result.passed;

  // Canonical solution reveal state
  const [internalShowSolution, setInternalShowSolution] = useState(false);
  const isSolutionVisible = showSolution !== undefined ? showSolution : internalShowSolution;
  const toggleSolution = onToggleShowSolution ?? (() => setInternalShowSolution((prev) => !prev));
  const [copied, setCopied] = useState(false);
  const [showComplexityExplanation, setShowComplexityExplanation] = useState(false);

  // Interactive critique follow-up state (scoped strictly to this challenge)
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpMessages, setFollowUpMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isFollowUpOpen) {
      inputRef.current?.focus();
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

  const canonicalCode = topic.referenceSolution || topic.solution || topic.starterCode || '';

  const handleCopySolution = async () => {
    if (!canonicalCode) return;
    try {
      await navigator.clipboard.writeText(canonicalCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  // Project state transition preview
  const previewBox = effectiveVerdict
    ? (algorithm === 'graduated-interval' ? topic.box + 1 : Math.min(5, topic.box + 1))
    : (algorithm === 'graduated-interval' ? Math.max(1, Math.floor(topic.box / 2)) : 1);
  const previewStreak = effectiveVerdict ? topic.streak + 1 : 0;
  const previewInterval = effectiveVerdict ? intervalForBox(previewBox, algorithm, activeDeckSize) : 0;
  const previewNextTrial = totalCompletedReviews + 1 + previewInterval;
  const tierName = algorithm === 'graduated-interval' ? 'Tier' : 'Box';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      {/* Top Banner / Verdict */}
      <div
        style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: effectiveVerdict ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${effectiveVerdict ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {effectiveVerdict ? (
              <CheckCircle2 size={32} color="#34d399" />
            ) : (
              <XCircle size={32} color="#f87171" />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: effectiveVerdict ? '#34d399' : '#f87171',
                  }}
                >
                  {isReinforcement
                    ? (effectiveVerdict ? 'PATTERN REPLICATED!' : 'NEEDS REVISION (DRILL)')
                    : (effectiveVerdict ? 'PASSED' : 'NEEDS REVISION')}
                </span>
                {isReinforcement && (
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      color: '#c084fc',
                      fontSize: '11px',
                    }}
                  >
                    Reinforcement Drill
                  </span>
                )}
                {isOverridden && (
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#fbbf24',
                      fontSize: '11px',
                    }}
                  >
                    Human Override Active
                  </span>
                )}
                {result.evaluationSource === 'heuristic-mock' && (
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'rgba(148, 163, 184, 0.1)',
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                    }}
                  >
                    {result.harness?.ran ? 'Offline (harness-graded)' : 'Offline (unverified)'}
                  </span>
                )}
                {result.harness?.ran && (
                  <span
                    className="badge"
                    style={{
                      backgroundColor: result.harness.passed ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: result.harness.passed ? '#34d399' : '#f87171',
                      fontSize: '11px',
                    }}
                  >
                    Tests: {result.harness.summary}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Topic: <strong style={{ color: 'var(--text-primary)' }}>{topic.title}</strong>
              </p>
            </div>
          </div>

          {/* Complexity Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                className="badge"
                onClick={() => topic.complexityExplanation && setShowComplexityExplanation((prev) => !prev)}
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  border: showComplexityExplanation
                    ? '1px solid rgba(56, 189, 248, 0.5)'
                    : '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8',
                  padding: '6px 10px',
                  cursor: topic.complexityExplanation ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
                title={`Observed Time Complexity: ${result.timeComplexity || 'O(n)'}${
                  topic.targetTime ? `\nTarget Time Goal: ${topic.targetTime}` : ''
                }${topic.complexityExplanation ? `\n\nClick to view explanation: ${topic.complexityExplanation}` : ''}`}
                role={topic.complexityExplanation ? 'button' : undefined}
                tabIndex={topic.complexityExplanation ? 0 : undefined}
                onKeyDown={(e) => {
                  if (topic.complexityExplanation && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setShowComplexityExplanation((prev) => !prev);
                  }
                }}
              >
                <Clock size={13} />
                <span>
                  Time: <strong>{result.timeComplexity || 'O(n)'}</strong>
                  {topic.targetTime && (
                    <span style={{ fontSize: '11px', opacity: 0.85, marginLeft: '6px' }}>
                      (Goal: {topic.targetTime})
                    </span>
                  )}
                </span>
                {topic.complexityExplanation && (
                  <HelpCircle size={11} style={{ opacity: 0.7, marginLeft: '2px' }} />
                )}
              </div>

              <div
                className="badge"
                onClick={() => topic.complexityExplanation && setShowComplexityExplanation((prev) => !prev)}
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  border: showComplexityExplanation
                    ? '1px solid rgba(168, 85, 247, 0.5)'
                    : '1px solid rgba(168, 85, 247, 0.25)',
                  color: '#c084fc',
                  padding: '6px 10px',
                  cursor: topic.complexityExplanation ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
                title={`Observed Space Complexity: ${result.spaceComplexity || 'O(1)'}${
                  topic.targetSpace ? `\nTarget Space Goal: ${topic.targetSpace}` : ''
                }${topic.complexityExplanation ? `\n\nClick to view explanation: ${topic.complexityExplanation}` : ''}`}
                role={topic.complexityExplanation ? 'button' : undefined}
                tabIndex={topic.complexityExplanation ? 0 : undefined}
                onKeyDown={(e) => {
                  if (topic.complexityExplanation && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setShowComplexityExplanation((prev) => !prev);
                  }
                }}
              >
                <Database size={13} />
                <span>
                  Space: <strong>{result.spaceComplexity || 'O(1)'}</strong>
                  {topic.targetSpace && (
                    <span style={{ fontSize: '11px', opacity: 0.85, marginLeft: '6px' }}>
                      (Goal: {topic.targetSpace})
                    </span>
                  )}
                </span>
                {topic.complexityExplanation && (
                  <HelpCircle size={11} style={{ opacity: 0.7, marginLeft: '2px' }} />
                )}
              </div>
            </div>

            {/* Expandable Explanation Box */}
            {showComplexityExplanation && topic.complexityExplanation && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.45',
                  maxWidth: '500px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  <Sparkles size={12} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Why this complexity target:
                  </span>
                </div>
                {topic.complexityExplanation}
              </div>
            )}
          </div>
        </div>

        {/* Human Override Toggle Controls */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              AI Verdict:
            </span>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: result.passed ? '#34d399' : '#f87171',
              }}
            >
              {result.passed ? 'Pass' : 'Fail'}
            </span>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={effectiveVerdict !== result.passed}
              onChange={(e) => {
                setEffectiveVerdict(e.target.checked ? !result.passed : result.passed);
              }}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--accent-amber)',
                cursor: 'pointer',
              }}
            />
            <span style={{ color: 'var(--text-primary)' }}>
              {result.passed
                ? 'Override AI verdict (Mark as Failed)'
                : 'Override AI verdict (Mark as Passed)'}
            </span>
          </label>
        </div>
      </div>

      {/* Invariants Met & Invariants Missed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
        {/* Met */}
        <div
          style={{
            padding: '16px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#34d399' }}>
            <ShieldCheck size={18} />
            <h4 style={{ fontSize: '13.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Invariants Met ({result.invariantsMet.length})
            </h4>
          </div>
          {result.invariantsMet.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>None explicitly identified.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.invariantsMet.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    lineHeight: 1.45,
                  }}
                >
                  <Check size={14} color="#34d399" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Missed */}
        <div
          style={{
            padding: '16px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#f87171' }}>
            <ShieldAlert size={18} />
            <h4 style={{ fontSize: '13.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Invariants Missed / Edge Cases ({result.invariantsMissed.length})
            </h4>
          </div>
          {result.invariantsMissed.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#34d399' }}>All primary invariants satisfied!</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.invariantsMissed.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    lineHeight: 1.45,
                  }}
                >
                  <X size={14} color="#f87171" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* AI Critique & Interactive Follow-Up */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
            <Sparkles size={16} />
            <h4 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Evaluator Analysis & Critique
            </h4>
          </div>
          {!isFollowUpOpen && (
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
          )}
        </div>

        {!isFollowUpOpen ? (
          <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
            <MarkdownContent text={result.critique} />
          </div>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            {/* Unified Scrolling Dialog Transcript */}
            <div
              style={{
                maxHeight: '260px',
                overflowY: 'auto',
                paddingRight: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Initial Critique - Identical Styling Before & After */}
              <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                <MarkdownContent text={result.critique} />
              </div>

              {/* Chat Thread */}
              {followUpMessages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {msg.role === 'user' ? (
                    <div
                      style={{
                        color: '#38bdf8',
                        fontWeight: 600,
                        fontSize: '13.5px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        marginTop: '4px',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#38bdf8' }}>
                        &gt;
                      </span>
                      <span>{msg.content}</span>
                    </div>
                  ) : (
                    <div style={{ paddingLeft: '16px', color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.55 }}>
                      <StreamedMarkdownReply
                        text={msg.content}
                        isNew={idx === followUpMessages.length - 1}
                        onScrollToBottom={scrollToBottom}
                      />
                    </div>
                  )}
                </div>
              ))}

              {isSendingFollowUp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '12.5px', paddingLeft: '16px' }}>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Consulting evaluator...</span>
                </div>
              )}

              <div ref={threadEndRef} />
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
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono, monospace)' }}>
                &gt;
              </span>
              <input
                ref={inputRef}
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSendFollowUp();
                  }
                }}
                placeholder="Ask a follow-up question... (Enter to send)"
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  caretColor: '#38bdf8',
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
                  color: followUpInput.trim() && !isSendingFollowUp ? '#38bdf8' : 'var(--text-dim)',
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

      {/* Reveal Canonical / Recommended Solution (available on both passed and failed attempts) */}
      {canonicalCode && (
        <div
          style={{
            borderRadius: '10px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderBottom: isSolutionVisible ? '1px solid var(--border-subtle)' : 'none',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={toggleSolution}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-primary)',
                fontSize: '13.5px',
                fontWeight: 600,
                padding: 0,
              }}
            >
              {isSolutionVisible ? <EyeOff size={16} color="#38bdf8" /> : <Eye size={16} color="#38bdf8" />}
              <span>
                {isSolutionVisible
                  ? 'Hide Recommended Solution'
                  : effectiveVerdict
                  ? '👁 Compare with Recommended Solution'
                  : '👁 Reveal Canonical Solution'}
              </span>
            </button>

            {isSolutionVisible && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCopySolution}
                style={{
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  height: 'auto',
                }}
                title="Copy reference code to clipboard"
              >
                {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy Solution'}</span>
              </button>
            )}
          </div>

          {isSolutionVisible && (
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-editor)',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: '#e2e8f0',
                  overflowX: 'auto',
                  whiteSpace: 'pre',
                  fontVariantLigatures: 'normal',
                  fontFeatureSettings: '"calt" 1, "liga" 1',
                }}
              >
                <code>{canonicalCode}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Leitner State Transition Preview & Commit Action */}
      {isReinforcement ? (
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '12px',
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#c084fc', display: 'block', fontWeight: 600 }}>
                Reinforcement Practice (No Stat Impact)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Card scheduled at <strong>{tierName} {topic.box}</strong> • Due trial <strong>#{topic.nextEligibleTrial}</strong>
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  (This drill reinforces the solution pattern before moving on)
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onRetry}
              style={{ fontSize: '13px' }}
            >
              <RotateCcw size={15} /> {effectiveVerdict ? 'Practice Again' : 'Edit & Try Again'}
            </button>
            <button
              type="button"
              className={effectiveVerdict ? 'btn btn-success' : 'btn btn-outline'}
              onClick={onFinishReinforcement || (() => onCommit(effectiveVerdict))}
              style={{
                fontSize: '13.5px',
                padding: '10px 20px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {effectiveVerdict ? (
                <>
                  <Check size={16} /> Continue to Next Card
                </>
              ) : (
                <>
                  <ArrowRight size={16} /> Skip Drill & Continue
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                Deck Spacing Transition
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {tierName} {topic.box}
                </span>
                <ArrowRight size={14} color="var(--text-muted)" />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '15px',
                    color: effectiveVerdict ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  }}
                >
                  {tierName} {previewBox} {algorithm === 'leitner' && previewBox === 5 ? '(Mastered)' : ''}
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  {effectiveVerdict
                    ? `(+${previewInterval} reviews spacing • Due Trial #${previewNextTrial})`
                    : algorithm === 'graduated-interval'
                    ? `(half-tier setback to Tier ${previewBox} • Immediate Drill Next)`
                    : `(reset to Box 1 • Immediate Drill Next)`}
                </span>
              </div>
            </div>

            <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-subtle)' }} />

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                Streak
              </span>
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                {topic.streak} → {previewStreak}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onRetry}
              style={{ fontSize: '13px' }}
            >
              <RotateCcw size={15} /> Edit & Retest
            </button>
            <button
              type="button"
              className={effectiveVerdict ? 'btn btn-success' : 'btn btn-primary'}
              onClick={() => onCommit(effectiveVerdict)}
              style={{ fontSize: '13.5px', padding: '10px 20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {effectiveVerdict ? (
                <>
                  <Check size={16} /> Commit Result & Continue
                </>
              ) : (
                <>
                  <RotateCcw size={16} /> Commit & Practice Pattern
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
