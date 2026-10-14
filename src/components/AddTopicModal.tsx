import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Check,
  Layers,
  Wand2,
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
    } catch (err) {
      console.error('Draft error:', err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleManualCreateInstead = () => {
    setDrafted({
      id: `custom-${Date.now().toString(36)}`,
      track: 'algorithms',
      title: userNote ? userNote.slice(0, 40) : 'Custom Coding Challenge',
      promptSeed: 'Describe the cold-start problem, function signature, and invariants here.',
      tags: ['custom'],
    });
    setId(`custom-${Date.now().toString(36)}`);
    setTitle(userNote ? userNote.slice(0, 40) : 'Custom Coding Challenge');
    setTrack('algorithms');
    setPromptSeed('Describe the cold-start problem, function signature, and invariants here.');
    setTagsInput('custom, interview');
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
    });

    // Reset and close
    setUserNote('');
    setDrafted(null);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
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
                style={{ fontSize: '13px', height: '120px' }}
              />
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
