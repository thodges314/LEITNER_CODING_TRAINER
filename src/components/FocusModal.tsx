import { useMemo, useState } from 'react';
import { X, Crosshair, Save, Trash2 } from 'lucide-react';
import { DIFFICULTY_LABELS, EMPTY_FILTER, cardMatchesFilter, getTrackMeta, isFilterActive } from '../lib/leitner';
import type { PracticeFilter, TopicItem } from '../lib/leitner';

interface FocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: TopicItem[];
  filter: PracticeFilter;
  presets: Record<string, PracticeFilter>;
  onChange: (filter: PracticeFilter) => void;
  onSavePreset: (name: string, filter: PracticeFilter) => void;
  onDeletePreset: (name: string) => void;
}

export const FocusModal: React.FC<FocusModalProps> = ({
  isOpen,
  onClose,
  topics,
  filter,
  presets,
  onChange,
  onSavePreset,
  onDeletePreset,
}) => {
  const [tagQuery, setTagQuery] = useState('');
  const [presetName, setPresetName] = useState('');

  const tracks = useMemo(() => Array.from(new Set(topics.map((t) => t.track))), [topics]);
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of topics) for (const tag of t.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    return counts;
  }, [topics]);

  if (!isOpen) return null;

  const active = topics.filter((t) => t.status === 'active');
  const matching = active.filter((t) => cardMatchesFilter(t, filter)).length;
  const selectedTags = filter.includeTags;
  const query = tagQuery.trim().toLowerCase();
  const visibleTags = Array.from(tagCounts.keys())
    .filter((tag) => selectedTags.includes(tag) || (query !== '' && tag.toLowerCase().includes(query)))
    .sort()
    .slice(0, 60);

  const set = (patch: Partial<PracticeFilter>) => onChange({ ...filter, ...patch });

  const toggleTrack = (track: string) => {
    const isIncluded = filter.includeTracks.includes(track);
    const inc = isIncluded
      ? filter.includeTracks.filter((t) => t !== track)
      : [...filter.includeTracks, track];
    set({ includeTracks: inc, excludeTracks: [] });
  };

  const toggleTag = (tag: string) => {
    const isIncluded = filter.includeTags.includes(tag);
    const inc = isIncluded
      ? filter.includeTags.filter((t) => t !== tag)
      : [...filter.includeTags, tag];
    set({ includeTags: inc, excludeTags: [] });
  };

  const chip = (label: string, isSelected: boolean, onClick: () => void, color = '#38bdf8', count?: number) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      title={isSelected ? 'Included — click to remove from focus' : 'Click to include in focus'}
      style={{
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        cursor: 'pointer',
        border: `1px solid ${isSelected ? color : 'var(--border-medium)'}`,
        background: isSelected ? `${color}26` : 'transparent',
        color: isSelected ? color : 'var(--text-primary)',
        fontWeight: isSelected ? 600 : 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.15s ease',
      }}
    >
      {isSelected && <span>✓</span>}
      <span>{label}</span>
      {count !== undefined ? <span style={{ opacity: isSelected ? 0.9 : 0.65 }}>({count})</span> : null}
    </button>
  );

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="focus-title">
      <div
        className="modal-content"
        style={{
          maxWidth: '720px',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon">
              <Crosshair size={20} />
            </div>
            <div>
              <h2 id="focus-title" className="modal-title">
                Practice Focus
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Select tracks, tags, or difficulty levels to focus your practice session.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>


        {/* Scrollable Body */}
        <div style={{ padding: '20px 24px 24px 24px', overflowY: 'auto', maxHeight: 'calc(90vh - 75px)' }}>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: matching === 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(52, 211, 153, 0.12)',
            border: `1px solid ${matching === 0 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(52, 211, 153, 0.35)'}`,
            marginBottom: '16px',
            fontSize: '12.5px',
            color: matching === 0 ? '#f87171' : '#34d399',
            fontWeight: 500,
          }}
        >
          <span>●</span>
          <span>
            {matching} of {active.length} active cards match{isFilterActive(filter) ? '' : ' (no filter)'}
          </span>
        </div>

        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          Difficulty Range
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>From:</span>
            <select
              aria-label="Minimum difficulty"
              value={filter.minDifficulty ?? ''}
              onChange={(e) => set({ minDifficulty: e.target.value ? Number(e.target.value) : undefined })}
              style={{
                backgroundColor: 'var(--bg-editor)',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">Any Level</option>
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>
                  {d} · {DIFFICULTY_LABELS[d]}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>To:</span>
            <select
              aria-label="Maximum difficulty"
              value={filter.maxDifficulty ?? ''}
              onChange={(e) => set({ maxDifficulty: e.target.value ? Number(e.target.value) : undefined })}
              style={{
                backgroundColor: 'var(--bg-editor)',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">Any Level</option>
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>
                  {d} · {DIFFICULTY_LABELS[d]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          Tracks
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
          {tracks.map((track) => {
            const meta = getTrackMeta(track);
            const isIncluded = filter.includeTracks.includes(track);
            return chip(
              meta.label,
              isIncluded,
              () => toggleTrack(track),
              meta.color,
              topics.filter((t) => t.track === track).length
            );
          })}
        </div>

        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          Tags
        </h3>
        <input
          type="search"
          value={tagQuery}
          onChange={(e) => setTagQuery(e.target.value)}
          placeholder="Search tags (e.g. graph, a11y, promise, closures)…"
          aria-label="Search tags"
          style={{
            width: '100%',
            height: '38px',
            padding: '8px 12px',
            fontSize: '13px',
            backgroundColor: 'var(--bg-editor)',
            color: 'var(--text-primary)',
            border: '1.5px solid var(--border-medium)',
            borderRadius: '8px',
            outline: 'none',
            marginBottom: '10px',
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px', minHeight: '28px' }}>
          {visibleTags.length === 0 && (
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Type to find tags; chosen tags stay listed here.</span>
          )}
          {visibleTags.map((tag) => {
            const isIncluded = filter.includeTags.includes(tag);
            return chip(
              tag,
              isIncluded,
              () => toggleTag(tag),
              '#c084fc',
              tagCounts.get(tag)
            );
          })}
        </div>

        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          Presets
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          {Object.keys(presets).length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>No saved presets yet.</span>}
          {Object.entries(presets).map(([name, preset]) => (
            <span key={name} style={{ display: 'inline-flex', gap: '2px' }}>
              <button type="button" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => onChange(preset)}>
                {name}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 6px' }}
                onClick={() => onDeletePreset(name)}
                aria-label={`Delete preset ${name}`}
              >
                <Trash2 size={12} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Save current focus as… (e.g. React screen, Async drill)"
            aria-label="Preset name"
            style={{
              flex: 1,
              height: '38px',
              padding: '8px 12px',
              fontSize: '13px',
              backgroundColor: 'var(--bg-editor)',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: '8px',
              outline: 'none',
            }}
          />
          <button
            type="button"
            className="btn btn-outline"
            disabled={!presetName.trim() || !isFilterActive(filter)}
            onClick={() => {
              onSavePreset(presetName, filter);
              setPresetName('');
            }}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Save size={14} /> Save
          </button>
        </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onChange(EMPTY_FILTER)}
              disabled={!isFilterActive(filter)}
            >
              Clear focus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
