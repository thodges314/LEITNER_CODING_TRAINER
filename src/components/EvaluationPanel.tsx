import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
} from 'lucide-react';
import type { TopicItem, SpacedAlgorithm } from '../lib/leitner';
import type { EvaluationResult } from '../lib/ai';
import type { AppTheme } from '../lib/theme';
import { VerdictHeaderSection } from './evaluation/VerdictHeaderSection';
import { CritiqueFollowUpSection } from './evaluation/CritiqueFollowUpSection';
import { SolutionRevealSection } from './evaluation/SolutionRevealSection';
import { SpacingTransitionFooter } from './evaluation/SpacingTransitionFooter';

interface EvaluationPanelProps {
  theme?: AppTheme;
  topic: TopicItem;
  submittedCode: string;
  result: EvaluationResult;
  totalCompletedReviews: number;
  activeDeckSize?: number;
  algorithm?: SpacedAlgorithm;
  onCommit: (passed: boolean) => void;
  onOverrideVerdict?: (passed: boolean) => void;
  onRetry: () => void;
  showSolution?: boolean;
  onToggleShowSolution?: () => void;
  isReinforcement?: boolean;
  onFinishReinforcement?: () => void;
  executionMode?: 'js' | 'ts';
  onOpenSettings?: (section?: 'ai') => void;
}

export const EvaluationPanel: React.FC<EvaluationPanelProps> = ({
  theme,
  topic,
  submittedCode = '',
  result,
  totalCompletedReviews,
  activeDeckSize,
  algorithm = 'leitner',
  onCommit,
  onOverrideVerdict,
  onRetry,
  showSolution,
  onToggleShowSolution,
  isReinforcement,
  onFinishReinforcement,
  executionMode = 'js',
  onOpenSettings,
}) => {
  // Human override state, initialized to AI verdict
  const [effectiveVerdict, setEffectiveVerdict] = useState<boolean>(result.passed);
  const [overrideNotice, setOverrideNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!overrideNotice) return undefined;
    const timer = setTimeout(() => setOverrideNotice(null), 2500);
    return () => clearTimeout(timer);
  }, [overrideNotice]);

  // Canonical solution reveal state
  const [internalShowSolution, setInternalShowSolution] = useState(false);
  const isSolutionVisible = showSolution !== undefined ? showSolution : internalShowSolution;
  const toggleSolution = onToggleShowSolution ?? (() => setInternalShowSolution((prev) => !prev));

  return (
    <div className="eval-panel-container">
      {/* Top Banner / Verdict */}
      <VerdictHeaderSection
        theme={theme}
        topic={topic}
        result={result}
        effectiveVerdict={effectiveVerdict}
        setEffectiveVerdict={setEffectiveVerdict}
        onOverrideVerdict={onOverrideVerdict}
        overrideNotice={overrideNotice}
        setOverrideNotice={setOverrideNotice}
        isReinforcement={isReinforcement}
      />

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-emerald)' }}>
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
                  <Check size={14} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '3px' }} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-danger)' }}>
            <ShieldAlert size={18} />
            <h4 style={{ fontSize: '13.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Invariants Missed / Edge Cases ({result.invariantsMissed.length})
            </h4>
          </div>
          {result.invariantsMissed.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--accent-emerald)' }}>All primary invariants satisfied!</p>
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
                  <X size={14} color="var(--accent-danger)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* AI Critique & Interactive Follow-Up */}
      <CritiqueFollowUpSection
        theme={theme}
        topic={topic}
        submittedCode={submittedCode}
        result={result}
        onOpenSettings={onOpenSettings}
      />

      {/* Reveal Canonical / Recommended Solution */}
      <SolutionRevealSection
        topic={topic}
        executionMode={executionMode}
        effectiveVerdict={effectiveVerdict}
        isSolutionVisible={isSolutionVisible}
        onToggleSolution={toggleSolution}
      />

      {/* Leitner State Transition Preview & Commit Action */}
      <SpacingTransitionFooter
        topic={topic}
        effectiveVerdict={effectiveVerdict}
        totalCompletedReviews={totalCompletedReviews}
        activeDeckSize={activeDeckSize}
        algorithm={algorithm}
        isReinforcement={isReinforcement}
        onRetry={onRetry}
        onCommit={onCommit}
        onFinishReinforcement={onFinishReinforcement}
      />
    </div>
  );
};
