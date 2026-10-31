import React, { useEffect, useRef } from 'react';
import { X, Brain, BookOpen, Layers, Zap, ExternalLink } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** First-run variant: a "how a session works" intro and a "Take a 1-minute tour" button (the default) next to "Start practicing". */
  welcome?: boolean;
  /** Starts the guided tour (offered on the welcome screen, and as a replay from About). */
  onStartTour?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, welcome = false, onStartTour }) => {
  const tourButtonRef = useRef<HTMLButtonElement | null>(null);

  // First-time visitors: the tour is the default action, so Enter starts it. The code editor behind the dialog grabs
  // focus when it mounts, so while the welcome dialog is open, focus that lands outside it is pulled back.
  useEffect(() => {
    if (!isOpen || !welcome) return;
    const button = tourButtonRef.current;
    button?.focus();
    const dialog = button?.closest('[role="dialog"]');
    const pullBack = (e: FocusEvent) => {
      if (dialog && e.target instanceof Node && !dialog.contains(e.target)) button?.focus();
    };
    document.addEventListener('focusin', pullBack);
    return () => document.removeEventListener('focusin', pullBack);
  }, [isOpen, welcome]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'apple-gsos';

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div
        className="modal-content"
        style={{
          maxWidth: '680px',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon">
              <Brain size={20} />
            </div>
            <div>
              <h2 id="about-title" className="modal-title">
                {welcome ? 'Welcome to Leitner Coding Trainer' : 'About Leitner Coding Trainer'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close about modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="modal-body" style={{ gap: '20px', color: 'var(--text-secondary)' }}>

          {welcome && (
            <div
              style={{
                padding: '18px 20px',
                borderRadius: '12px',
                backgroundColor: isLight ? '#F0F9FF' : 'rgba(56, 189, 248, 0.07)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>How a session works</h3>
              <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>You get one card at a time. Work the problem out in the editor with no autocomplete and no hints.</li>
                <li>Submit your code runs against the card&apos;s tests in your browser. The tests are the objective check, and a run that fails them is never a pass. You always have the final say: you can override the result if you disagree or if an edge case wasn&apos;t caught.</li>
                <li>Add an AI provider key in Settings and an AI reviewer will also read your solution after you submit. It checks your approach (did you use what the card asked for?), explains what to improve and takes follow-up questions. It can mark a run that passed the tests as needing revision, but it can be wrong, so the override is always there.</li>
                <li>Missed it? Instead of just reading the reference solution, you get an immediate chance to reproduce a correct answer yourself. Real retention comes from actively generating the code, not looking at it. The retry never affects your score.</li>
                <li>Cards come back on a graduated schedule, and harder cards unlock as you pass easier ones.</li>
                <li>Preparing for something specific? Use Focus to include or exclude topics. Everything stays in this browser.</li>
              </ol>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                {/* The tour is the default for a first-time visitor: first, highlighted and focused (Enter starts it). */}
                {onStartTour && (
                  <button ref={tourButtonRef} type="button" className="btn btn-primary" onClick={onStartTour}>
                    Take a 1-minute tour
                  </button>
                )}
                <button type="button" className={onStartTour ? 'btn btn-outline' : 'btn btn-primary'} onClick={onClose}>
                  Start practicing
                </button>
              </div>
            </div>
          )}

          {!welcome && onStartTour && (
            <div>
              <button type="button" className="btn btn-outline" onClick={onStartTour}>
                Replay the quick tour
              </button>
            </div>
          )}

          {/* Why I Built This */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '12px',
              backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-primary)' }}>
              <Zap size={18} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>The Origin: Reclaiming Muscle Memory in the AI Era</h3>
            </div>
            <p style={{ margin: 0 }}>
              I wrote this project because I noticed something unsettling: as I leaned more heavily into AI coding assistants and generative prompts for day-to-day software work, I started losing the tactile muscle memory of fundamental algorithms, core data structures and foundational patterns.
            </p>
            <p style={{ marginTop: '10px', marginBottom: 0 }}>
              AI is an extraordinary multiplier, but it can create an illusion of fluency. Stripped of autocomplete, Copilot tabs and ghost text, sitting in front of a blank editor and synthesising performant code from scratch remains the bedrock of true engineering intuition.
            </p>
          </div>

          {/* Graduated Intervals & Flashcards */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '12px',
              backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-primary)' }}>
              <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Graduated Interval Spacing</h3>
            </div>
            <p style={{ margin: 0 }}>
              The core recall engine is based on the <strong>Graduated Interval flashcard models</strong> I used in college to memorize dense material for demanding classes.
            </p>
            <p style={{ marginTop: '10px', marginBottom: 0 }}>
              Unlike static quiz decks or random shuffles, graduated intervals dynamically expand the spacing between reviews as you prove mastery (+1, +3, +7, +14, +35 reviews). Each successful cold-start retrieval pushes the pattern deeper into long-term reflexive memory, right before the forgetting curve takes hold.
            </p>
          </div>

          {/* The Leitner Connection */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '12px',
              backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-primary)' }}>
              <BookOpen size={18} style={{ color: '#a855f7' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Why Named "Leitner"?</h3>
            </div>
            <p style={{ margin: 0 }}>
              I named this trainer after <strong>Sebastian Leitner</strong>, the German psychologist who pioneered the iconic Leitner Box spaced repetition methodology in the 1970s.
            </p>
            <p style={{ marginTop: '10px', marginBottom: 0 }}>
              While the trainer defaults to an expanding Graduated Interval algorithm, Leitner's classic 5-Box milestone model is included as an optional study mode in Settings, allowing you to switch algorithms anytime while preserving your streak and trial history.
            </p>
          </div>

          {/* Key Principles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', margin: 0 }}>
              Core Design Principles
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Zero Auto-Complete & Zero Ghost Text:</strong> You write actual code against real browser evaluation and Vitest-style test suites.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Low-Stakes Immediate Reinforcement:</strong> If you miss a challenge, you get an immediate drill on the spot to repair the neural pathway before continuing, without losing your long-term box standing.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Interactive AI Critique & Dialogue:</strong> If you provide an API key to your provider of choice (Gemini, Groq, Cerebras, Mistral, Anthropic, OpenAI, OpenRouter, or local Ollama), you can have AI critique your solution, uncover edge cases or nuances that automatic unit tests may have missed, and engage in a dialogue with the model to ask follow-up questions about its critique.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>100% Local & Private:</strong> All your progress, code drafts and deck states are kept in your browser's local storage. Your API keys never leave your machine, and you can export or import backups anytime.
              </li>
            </ul>
          </div>

          {/* Creator & Links */}
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Built with deliberate care by <strong>Thomas Hodges</strong>.
            </span>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <a
                href="https://www.javascriptonline.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Portfolio <ExternalLink size={12} />
              </a>
              <a
                href="https://github.com/thodges314"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                GitHub <ExternalLink size={12} />
              </a>
              <a
                href="https://www.linkedin.com/in/thomas-hodges/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                LinkedIn <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
