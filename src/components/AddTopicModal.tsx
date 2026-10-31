import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Check,
  Layers,
  Wand2,
  Clock,
  Code,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { TRACK_TYPES, getTrackMeta } from '../lib/leitner';
import type { TrackType } from '../lib/leitner';
import { draftTopicWithAI } from '../lib/ai';
import type { DraftedTopic } from '../lib/ai';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTopic: (card: {
    id: string;
    track: TrackType;
    title: string;
    promptSeed: string;
    tags: string[];
    targetTime?: string;
    targetSpace?: string;
    complexityExplanation?: string;
    starterCode?: string;
    referenceSolution?: string;
    testHarness?: string;
  }) => void;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({
  isOpen,
  onClose,
  onAddTopic,
}) => {
  const [userNote, setUserNote] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [drafted, setDrafted] = useState<DraftedTopic | null>(null);

  // Form states for manual tweaking
  const [title, setTitle] = useState('');
  const [id, setId] = useState('');
  const [track, setTrack] = useState<TrackType>('algorithms');
  const [promptSeed, setPromptSeed] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Complexity & Solution states
  const [targetTime, setTargetTime] = useState('O(n)');
  const [targetSpace, setTargetSpace] = useState('O(1)');
  const [complexityExplanation, setComplexityExplanation] = useState('');
  const [referenceSolution, setReferenceSolution] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [testHarness, setTestHarness] = useState('');
  const [showCodeDetails, setShowCodeDetails] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDraft = async () => {
    if (!userNote.trim()) return;
    setIsDrafting(true);
    try {
      const res = await draftTopicWithAI(userNote);
      setDrafted(res);
      setTitle(res.title);
      setId(res.id);
      setTrack(res.track);
      setPromptSeed(res.promptSeed);
      setTagsInput(res.tags.join(', '));
      setTargetTime(res.targetTime || 'O(n)');
      setTargetSpace(res.targetSpace || 'O(1)');
      setComplexityExplanation(res.complexityExplanation || '');
      setReferenceSolution(res.referenceSolution || '');
      setStarterCode(res.starterCode || '');
      setTestHarness(res.testHarness || '');
    } catch (err) {
      console.error('Draft error:', err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleManualCreateInstead = () => {
    const slug = `custom-${Date.now().toString(36)}`;
    const cardTitle = userNote ? userNote.slice(0, 40) : 'Custom Coding Challenge';
    setDrafted({
      id: slug,
      track: 'algorithms',
      title: cardTitle,
      promptSeed: 'Describe the cold-start problem, function signature, and invariants here.',
      tags: ['custom'],
      targetTime: 'O(n)',
      targetSpace: 'O(1)',
      complexityExplanation: 'Linear time scan with constant extra space.',
      referenceSolution: `export function solution() {\n  return true;\n}`,
      starterCode: `export function solution() {\n  // Code here\n}`,
      testHarness: `{\n  $test.check('Basic run check', typeof solution === 'function');\n}`,
    });
    setId(slug);
    setTitle(cardTitle);
    setTrack('algorithms');
    setPromptSeed('Describe the cold-start problem, function signature, and invariants here.');
    setTagsInput('custom, interview');
    setTargetTime('O(n)');
    setTargetSpace('O(1)');
    setComplexityExplanation('Linear time scan with constant extra space.');
    setReferenceSolution(`export function solution() {\n  return true;\n}`);
    setStarterCode(`export function solution() {\n  // Code here\n}`);
    setTestHarness(`{\n  $test.check('Basic run check', typeof solution === 'function');\n}`);
  };

  const handleSaveToDeck = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptSeed.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onAddTopic({
      id: id.trim() || `custom-${Date.now().toString(36)}`,
      track,
      title: title.trim(),
      promptSeed: promptSeed.trim(),
      tags: parsedTags.length > 0 ? parsedTags : [track],
      targetTime: targetTime.trim() || 'O(n)',
      targetSpace: targetSpace.trim() || 'O(1)',
      complexityExplanation: complexityExplanation.trim() || undefined,
      referenceSolution: referenceSolution.trim() || undefined,
      starterCode: starterCode.trim() || undefined,
      testHarness: testHarness.trim() || undefined,
    });

    // Reset and close
    setUserNote('');
    setDrafted(null);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-topic-title"
    >
      <div
        className="modal-content"
        style={{ maxWidth: '640px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 id="add-topic-title" style={{ fontSize: '18px', fontWeight: 600 }}>
                Quick Add Topic with AI
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Informally describe a pattern or question to generate a cold-start drill card
              </p>
            </div>
          </div>
          <button
            className="btn btn-outline"
            style={{ padding: '6px', borderRadius: '50%' }}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Freeform input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
            Informal Description
          </label>
          <textarea
            className="code-buffer"
            rows={3}
            placeholder="e.g., 'Add something about React 18 useTransition and pending state', or 'Handling fetch cancellation with abort controller and race conditions'"
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              height: '84px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <button
              type="button"
              onClick={handleManualCreateInstead}
              className="btn btn-outline"
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              Skip AI & Fill Manually
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDraft}
              disabled={isDrafting || !userNote.trim()}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)',
              }}
            >
              {isDrafting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Drafting Card...
                </>
              ) : (
                <>
                  <Wand2 size={16} /> Draft Card with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Editable Preview & Confirm */}
        {drafted && (
          <form
            onSubmit={handleSaveToDeck}
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-medium)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)' }}>
              <Layers size={16} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Card Preview & Refinement</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="code-buffer"
                  style={{ height: '38px', padding: '8px 10px', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Track
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value as TrackType)}
                  className="code-buffer"
                  style={{
                    height: '38px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                >
                  {TRACK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {getTrackMeta(t).label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Slug ID
                </label>
                <input
                  type="text"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="code-buffer"
                  style={{ height: '36px', padding: '6px 10px', fontSize: '12px', color: 'var(--text-muted)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="code-buffer"
                  style={{ height: '36px', padding: '6px 10px', fontSize: '12.5px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Prompt Seed (Cold-Start Retrieval Instructions)
              </label>
              <textarea
                required
                rows={5}
                value={promptSeed}
                onChange={(e) => setPromptSeed(e.target.value)}
                className="code-buffer"
                style={{ fontSize: '13px', height: '110px' }}
              />
            </div>

            {/* Target Complexity Goals */}
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                <Clock size={13} />
                <span>Target Complexity Goals</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Target Time Complexity
                  </label>
                  <input
                    type="text"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    placeholder="e.g. O(n) or O(1)"
                    className="code-buffer"
                    style={{ height: '34px', padding: '6px 8px', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Target Space Complexity
                  </label>
                  <input
                    type="text"
                    value={targetSpace}
                    onChange={(e) => setTargetSpace(e.target.value)}
                    placeholder="e.g. O(1) or O(n)"
                    className="code-buffer"
                    style={{ height: '34px', padding: '6px 8px', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  Complexity Explanation
                </label>
                <input
                  type="text"
                  value={complexityExplanation}
                  onChange={(e) => setComplexityExplanation(e.target.value)}
                  placeholder="e.g. Linear scan with hash map lookup"
                  className="code-buffer"
                  style={{ height: '34px', padding: '6px 8px', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* Reference Solution & Test Harness Collapsible */}
            <div
              style={{
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setShowCodeDetails(!showCodeDetails)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={13} color="#a855f7" />
                  <span>Reference Solution & Test Harness</span>
                  {(referenceSolution || testHarness) && (
                    <span style={{ fontSize: '10px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '1px 6px', borderRadius: '4px' }}>
                      Populated
                    </span>
                  )}
                </div>
                {showCodeDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {showCodeDetails && (
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--bg-surface)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Canonical Reference Solution
                    </label>
                    <textarea
                      rows={4}
                      value={referenceSolution}
                      onChange={(e) => setReferenceSolution(e.target.value)}
                      placeholder="// Canonical optimal implementation"
                      className="code-buffer"
                      style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Starter Skeleton (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={starterCode}
                      onChange={(e) => setStarterCode(e.target.value)}
                      placeholder="// Starting function signature or stub"
                      className="code-buffer"
                      style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Test Harness Assertions ($test.check) (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={testHarness}
                      onChange={(e) => setTestHarness(e.target.value)}
                      placeholder="{\n  $test.check('Correct output', solve(input) === expected);\n}"
                      className="code-buffer"
                      style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '6px',
                paddingTop: '8px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Will be added as: <span style={{ color: 'var(--box-1)', fontWeight: 600 }}>Box 1 (Active)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setDrafted(null)}
                >
                  Discard Draft
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                >
                  <Check size={16} /> Save to Deck
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
