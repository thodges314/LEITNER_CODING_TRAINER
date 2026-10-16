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

type Mode = 'include' | 'exclude' | 'off';

/** Click cycles: neutral -> include -> exclude -> neutral. */
const nextMode = (m: Mode): Mode => (m === 'off' ? 'include' : m === 'include' ? 'exclude' : 'off');

function modeOf(value: string, include: string[], exclude: string[]): Mode {
  return include.includes(value) ? 'include' : exclude.includes(value) ? 'exclude' : 'off';
}

function applyMode(value: string, mode: Mode, include: string[], exclude: string[]): [string[], string[]] {
  const inc = include.filter((v) => v !== value);
  const exc = exclude.filter((v) => v !== value);
  if (mode === 'include') inc.push(value);
  if (mode === 'exclude') exc.push(value);
  return [inc, exc];
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
  const selectedTags = [...filter.includeTags, ...filter.excludeTags];
  const query = tagQuery.trim().toLowerCase();
  const visibleTags = Array.from(tagCounts.keys())
    .filter((tag) => selectedTags.includes(tag) || (query !== '' && tag.toLowerCase().includes(query)))
    .sort()
    .slice(0, 60);

  const chip = (label: string, mode: Mode, onClick: () => void, color = '#38bdf8', count?: number) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-pressed={mode !== 'off'}
      title={mode === 'include' ? 'Included — click to exclude' : mode === 'exclude' ? 'Excluded — click to clear' : 'Click to include'}
      style={{
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        cursor: 'pointer',
        border: `1px solid ${mode === 'exclude' ? '#f87171' : mode === 'include' ? color : 'var(--border-medium)'}`,
        background: mode === 'exclude' ? 'rgba(248,113,113,0.15)' : mode === 'include' ? `${color}26` : 'transparent',
        color: mode === 'exclude' ? '#f87171' : mode === 'include' ? color : 'var(--text-secondary)',
        textDecoration: mode === 'exclude' ? 'line-through' : 'none',
      }}
    >
      {mode === 'include' ? '✓ ' : mode === 'exclude' ? '✕ ' : ''}
      {label}
      {count !== undefined ? ` (${count})` : ''}
    </button>
  );

  const set = (patch: Partial<PracticeFilter>) => onChange({ ...filter, ...patch });

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="focus-title">
      <div className="modal-content" style={{ maxWidth: '720px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crosshair size={20} color="#38bdf8" />
            <div>
              <h2 id="focus-title" style={{ fontSize: '18px', fontWeight: 600 }}>
                Practice Focus
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Click a chip to include it, again to exclude it, again to clear. Excluded cards keep their progress.
              </p>
            </div>
          </div>
          <button className="btn btn-outline" style={{ padding: '6px', borderRadius: '50%' }} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

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
                backgroundColor: 'var(--bg-elevated)',
                color: '#f1f5f9',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="" style={{ backgroundColor: '#141b29', color: '#f1f5f9' }}>Any Level</option>
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d} style={{ backgroundColor: '#141b29', color: '#f1f5f9' }}>
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
                backgroundColor: 'var(--bg-elevated)',
                color: '#f1f5f9',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="" style={{ backgroundColor: '#141b29', color: '#f1f5f9' }}>Any Level</option>
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d} style={{ backgroundColor: '#141b29', color: '#f1f5f9' }}>
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
            const mode = modeOf(track, filter.includeTracks, filter.excludeTracks);
            return chip(
              meta.label,
              mode,
              () => {
                const [inc, exc] = applyMode(track, nextMode(mode), filter.includeTracks, filter.excludeTracks);
                set({ includeTracks: inc, excludeTracks: exc });
              },
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
            backgroundColor: 'var(--bg-elevated)',
            color: '#f1f5f9',
            border: '1px solid var(--border-medium)',
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
            const mode = modeOf(tag, filter.includeTags, filter.excludeTags);
            return chip(
              tag,
              mode,
              () => {
                const [inc, exc] = applyMode(tag, nextMode(mode), filter.includeTags, filter.excludeTags);
                set({ includeTags: inc, excludeTags: exc });
              },
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
              backgroundColor: 'var(--bg-elevated)',
              color: '#f1f5f9',
              border: '1px solid var(--border-medium)',
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

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-outline" onClick={() => onChange(EMPTY_FILTER)} disabled={!isFilterActive(filter)}>
            Clear focus
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
