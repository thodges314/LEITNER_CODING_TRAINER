import React, { useState, useEffect, useMemo } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { getCardInputLanguage } from '../../lib/leitner';
import type { TopicItem, CardInputLanguage } from '../../lib/leitner';
import { formatCode } from '../../lib/formatter';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { html } from '@codemirror/lang-html';
import { graphql } from 'cm6-graphql';
import { EditorView } from '@codemirror/view';
import { stripPredefinedPromptTypes } from '../../utils/cardPromptTypes';

export interface SolutionRevealSectionProps {
  topic: TopicItem;
  executionMode: 'js' | 'ts';
  effectiveVerdict: boolean;
  isSolutionVisible: boolean;
  onToggleSolution: () => void;
}

export const SolutionRevealSection: React.FC<SolutionRevealSectionProps> = ({
  topic,
  executionMode,
  effectiveVerdict,
  isSolutionVisible,
  onToggleSolution,
}) => {
  const [copied, setCopied] = useState(false);

  const inputLang = getCardInputLanguage(topic);
  const isTsMode =
    inputLang === 'typescript' ||
    (executionMode === 'ts' && Boolean(topic.referenceSolutionTs));
  const rawCanonicalCode = isTsMode
    ? stripPredefinedPromptTypes(topic.referenceSolutionTs as string, topic.promptSeed, topic.track)
    : topic.referenceSolution || topic.solution || topic.starterCode || '';

  const solutionLanguageLabel = useMemo(() => {
    if (inputLang === 'html') return 'HTML';
    if (inputLang === 'sql') return 'SQL';
    if (inputLang === 'graphql') return 'GraphQL';
    if (isTsMode) return 'TypeScript';
    return 'JavaScript';
  }, [inputLang, isTsMode]);

  const [formattedCanonicalState, setFormattedCanonicalState] = useState<{
    raw: string;
    formatted: string;
  }>({
    raw: rawCanonicalCode,
    formatted: rawCanonicalCode,
  });

  useEffect(() => {
    let cancelled = false;
    if (!rawCanonicalCode.trim()) {
      return;
    }

    const langToFormat: CardInputLanguage =
      inputLang === 'html' || inputLang === 'sql' || inputLang === 'graphql'
        ? inputLang
        : solutionLanguageLabel === 'TypeScript'
          ? 'typescript'
          : 'javascript';

    formatCode(rawCanonicalCode, langToFormat)
      .then((res) => {
        if (!cancelled && res.success && res.code) {
          setFormattedCanonicalState({
            raw: rawCanonicalCode,
            formatted: res.code.trimEnd(),
          });
        }
      })
      .catch((err) => {
        console.warn('Formatting canonical solution failed:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [rawCanonicalCode, inputLang, solutionLanguageLabel]);

  const canonicalCode =
    !rawCanonicalCode.trim()
      ? ''
      : formattedCanonicalState.raw === rawCanonicalCode
        ? formattedCanonicalState.formatted
        : rawCanonicalCode;

  const solutionBadgeStyle = useMemo(() => {
    switch (solutionLanguageLabel) {
      case 'HTML':
        return {
          backgroundColor: 'rgba(249, 115, 22, 0.12)',
          color: 'var(--accent-orange)',
          border: '1px solid rgba(249, 115, 22, 0.25)',
        };
      case 'SQL':
        return {
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          color: 'var(--accent-cyan)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        };
      case 'GraphQL':
        return {
          backgroundColor: 'rgba(236, 72, 153, 0.12)',
          color: 'var(--accent-rose)',
          border: '1px solid rgba(236, 72, 153, 0.25)',
        };
      case 'TypeScript':
        return {
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          color: 'var(--accent-cyan)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        };
      case 'JavaScript':
      default:
        return {
          backgroundColor: 'rgba(234, 179, 8, 0.12)',
          color: 'var(--accent-amber)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
        };
    }
  }, [solutionLanguageLabel]);

  const solutionExtensions = useMemo(() => {
    const langExt =
      inputLang === 'html'
        ? html()
        : inputLang === 'sql'
          ? sql()
          : inputLang === 'graphql'
            ? graphql()
            : javascript({ jsx: true, typescript: solutionLanguageLabel === 'TypeScript' });
    return [
      langExt,
      EditorView.lineWrapping,
      EditorView.theme({
        '&': {
          fontFamily: 'var(--font-mono) !important',
          backgroundColor: 'var(--bg-editor) !important',
        },
        '.cm-scroller': {
          fontFamily: 'var(--font-mono) !important',
          lineHeight: '1.6',
          maxHeight: '480px',
          overflow: 'auto',
        },
        '.cm-content, .cm-line, .cm-line *': {
          fontFamily: 'var(--font-mono) !important',
          fontSize: '13px',
        },
        '.cm-gutters': {
          backgroundColor: 'rgba(12, 16, 24, 0.7) !important',
          color: 'var(--text-muted) !important',
          borderRight: '1px solid var(--border-subtle) !important',
          userSelect: 'none',
        },
        '.cm-activeLine, .cm-activeLineGutter': {
          backgroundColor: 'transparent !important',
        },
      }),
    ];
  }, [inputLang, solutionLanguageLabel]);

  const solutionCmBasicSetup = useMemo(
    () => ({
      lineNumbers: true,
      highlightActiveLineGutter: false,
      highlightSpecialChars: true,
      history: false,
      foldGutter: false,
      drawSelection: true,
      dropCursor: false,
      allowMultipleSelections: false,
      indentOnInput: false,
      bracketMatching: false,
      closeBrackets: false,
      autocompletion: false,
      rectangularSelection: false,
      crosshairCursor: false,
      highlightActiveLine: false,
      highlightSelectionMatches: false,
      tabSize: 2,
    }),
    []
  );

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

  if (!canonicalCode) return null;

  return (
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
          backgroundColor: 'var(--bg-surface)',
          borderBottom: isSolutionVisible ? '1px solid var(--border-subtle)' : 'none',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <button
          type="button"
          onClick={onToggleSolution}
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
          {isSolutionVisible ? <EyeOff size={16} color="var(--accent-cyan)" /> : <Eye size={16} color="var(--accent-cyan)" />}
          <span>
            {isSolutionVisible
              ? 'Hide Recommended Solution'
              : effectiveVerdict
              ? '👁 Compare with Recommended Solution'
              : '👁 Reveal Canonical Solution'}
          </span>
        </button>

        {isSolutionVisible && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              data-testid="solution-language-badge"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                ...solutionBadgeStyle,
                letterSpacing: '0.02em',
              }}
            >
              {solutionLanguageLabel}
            </span>
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
              {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Solution'}</span>
            </button>
          </div>
        )}
      </div>

      {isSolutionVisible && (
        <div
          className="solution-codemirror-wrapper"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-editor)',
          }}
        >
          <CodeMirror
            value={canonicalCode}
            theme="dark"
            editable={false}
            readOnly={true}
            basicSetup={solutionCmBasicSetup}
            extensions={solutionExtensions}
          />
        </div>
      )}
    </div>
  );
};
