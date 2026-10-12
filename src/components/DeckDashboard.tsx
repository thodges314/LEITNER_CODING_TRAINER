import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import {
  TRACK_METADATA,
  BOX_INTERVALS,
  exportDeckBackup,
  importDeckBackup,
} from '../lib/leitner';
import type { TopicItem, TrackType, LeitnerDeckState } from '../lib/leitner';
import {
  Unlock,
  Lock,
  RotateCcw,
  Play,
  Download,
  Upload,
  Plus,
  Search,
  Flame,
  Trash2,
} from 'lucide-react';

interface DeckDashboardProps {
  state: LeitnerDeckState;
  onSelectCardToPractice: (card: TopicItem) => void;
  onToggleLock: (topicId: string, currentStatus: 'active' | 'locked') => void;
  onResetBox: (topicId: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onStateUpdated: (newState: LeitnerDeckState) => void;
  onOpenAddModal: () => void;
}

export const DeckDashboard: React.FC<DeckDashboardProps> = ({
  state,
  onSelectCardToPractice,
  onToggleLock,
  onResetBox,
  onDeleteTopic,
  onStateUpdated,
  onOpenAddModal,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackType | 'all'>('all');
  const [selectedBox, setSelectedBox] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { topics, totalCompletedReviews, unlockedStageCount = 0 } = state;

  // Compute Statistics
  const activeCount = topics.filter((t) => t.status === 'active').length;
  const lockedCount = topics.filter((t) => t.status === 'locked').length;
  const masteredCount = topics.filter((t) => t.status === 'active' && t.box === 5).length;
  const box3PlusCount = topics.filter((t) => t.status === 'active' && t.box >= 3).length;

  const boxCounts = [1, 2, 3, 4, 5].map(
    (b) => topics.filter((t) => t.status === 'active' && t.box === b).length
  );

  // Staged unlock calculation: next unlock milestone
  const nextUnlockTarget = (unlockedStageCount + 1) * 4;
  const cardsNeededForNextUnlock = Math.max(0, nextUnlockTarget - box3PlusCount);

  // Filtered topics
  const filteredTopics = topics.filter((t) => {
    if (selectedTrack !== 'all' && t.track !== selectedTrack) return false;
    if (selectedBox !== 'all' && t.box !== selectedBox) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchId = t.id.toLowerCase().includes(q);
      if (!matchTitle && !matchTags && !matchId) return false;
    }
    return true;
  });

  const handleExport = () => {
    exportDeckBackup(state);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const newState = importDeckBackup(text);
        onStateUpdated(newState);
        alert('Deck progress imported successfully!');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(`Failed to import deck backup: ${msg}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Catalog & Deck Performance
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Trial-spaced Leitner retrieval queue with staged progression unlocking
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} /> Quick Add Topic
          </button>
          <button className="btn btn-secondary" onClick={handleExport} title="Download timestamped JSON backup">
            <Download size={15} /> Export Progress
          </button>
          <button className="btn btn-secondary" onClick={handleImportClick} title="Import saved JSON backup">
            <Upload size={15} /> Import Progress
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {/* Total Reviews */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Completed Reviews</div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: 'var(--accent-cyan)' }}>
            #{totalCompletedReviews}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Global trial progression
          </div>
        </div>

        {/* Active vs Locked */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Deck Distribution</div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>
            {activeCount} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ {topics.length}</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {lockedCount} cards locked in reserve
          </div>
        </div>

        {/* Mastered */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Mastered (Box 5)</div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: '#34d399' }}>
            {masteredCount}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            +45 review interval reached
          </div>
        </div>

        {/* Staged Unlock Progress */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Staged Unlock Progress</div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: '#fbbf24' }}>
            {box3PlusCount} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ {nextUnlockTarget} in B3+</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {lockedCount > 0
              ? `${cardsNeededForNextUnlock} more Box 3+ cards unlocks 4 new topics`
              : 'All topics unlocked!'}
          </div>
        </div>
      </div>

      {/* Leitner Box Breakdown Strip */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Active Spacing Tiers:
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map((b, idx) => (
            <div
              key={b}
              onClick={() => setSelectedBox(selectedBox === b ? 'all' : b)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: selectedBox === b ? 'var(--bg-elevated)' : 'rgba(255, 255, 255, 0.03)',
                border: selectedBox === b ? `1px solid var(--box-${b})` : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: `var(--box-${b})`,
                }}
              />
              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>
                Box {b} (+{BOX_INTERVALS[b]})
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-primary)',
                }}
              >
                {boxCounts[idx]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Track Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['all', 'async-js', 'data-structures', 'react', 'algorithms'] as const).map((trk) => {
            const isActive = selectedTrack === trk;
            const label = trk === 'all' ? 'All Tracks' : TRACK_METADATA[trk].label;
            return (
              <button
                key={trk}
                className="btn"
                onClick={() => setSelectedTrack(trk)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12.5px',
                  backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                  borderColor: isActive ? 'var(--border-medium)' : 'var(--border-subtle)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search & Status Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search topics or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="code-buffer"
              style={{
                height: '34px',
                paddingLeft: '32px',
                paddingRight: '10px',
                fontSize: '12.5px',
              }}
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'locked')}
            className="code-buffer"
            style={{
              height: '34px',
              padding: '4px 10px',
              fontSize: '12.5px',
              backgroundColor: 'var(--bg-elevated)',
              width: 'auto',
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="locked">Locked Only</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div
        className="glass-panel"
        style={{
          overflowX: 'auto',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Topic</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Track</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Box Level</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Streak</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Next Eligible Trial</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTopics.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No topics match your current filter criteria.
                </td>
              </tr>
            ) : (
              filteredTopics.map((topic) => {
                const trkMeta = TRACK_METADATA[topic.track];
                const isEligible = topic.status === 'active' && topic.nextEligibleTrial <= totalCompletedReviews;

                return (
                  <tr
                    key={topic.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.1s',
                      backgroundColor: topic.status === 'locked' ? 'rgba(0,0,0,0.2)' : 'transparent',
                    }}
                  >
                    {/* Title & Tags */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, color: topic.status === 'active' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {topic.title}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {topic.tags.slice(0, 3).map((tg) => (
                          <span
                            key={tg}
                            style={{
                              fontSize: '10.5px',
                              color: 'var(--text-dim)',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              padding: '1px 6px',
                              borderRadius: '3px',
                            }}
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Track */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: trkMeta.bg,
                          color: trkMeta.color,
                          border: `1px solid ${trkMeta.border}`,
                          fontSize: '11px',
                        }}
                      >
                        {trkMeta.label}
                      </span>
                    </td>

                    {/* Box */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      {topic.status === 'active' ? (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: `rgba(255, 255, 255, 0.05)`,
                            border: `1px solid var(--box-${topic.box})`,
                            color: `var(--box-${topic.box})`,
                            fontWeight: 600,
                          }}
                        >
                          Box {topic.box}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    {/* Streak */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      {topic.status === 'active' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f97316', fontWeight: 500 }}>
                          <Flame size={13} /> {topic.streak}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>0</span>
                      )}
                    </td>

                    {/* Next Eligible Trial */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      {topic.status === 'active' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '12px',
                              fontWeight: isEligible ? 600 : 400,
                              color: isEligible ? '#34d399' : 'var(--text-secondary)',
                            }}
                          >
                            Trial #{topic.nextEligibleTrial}
                          </span>
                          {isEligible && (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: 'rgba(52, 211, 153, 0.15)',
                                color: '#34d399',
                                fontSize: '10px',
                                padding: '1px 5px',
                              }}
                            >
                              Ready
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Locked</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      {topic.status === 'active' ? (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            fontSize: '11px',
                          }}
                        >
                          <Unlock size={11} /> Active
                        </span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'rgba(148, 163, 184, 0.08)',
                            color: 'var(--text-muted)',
                            fontSize: '11px',
                          }}
                        >
                          <Lock size={11} /> Locked
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {topic.status === 'active' ? (
                          <>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              onClick={() => onSelectCardToPractice(topic)}
                              title="Start blank-buffer practice on this topic immediately"
                            >
                              <Play size={12} /> Practice
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '5px 8px', fontSize: '12px' }}
                              onClick={() => onResetBox(topic.id)}
                              title="Reset to Box 1"
                            >
                              <RotateCcw size={12} />
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '5px 8px', fontSize: '12px' }}
                              onClick={() => onToggleLock(topic.id, topic.status)}
                              title="Lock card"
                            >
                              <Lock size={12} />
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => onToggleLock(topic.id, topic.status)}
                            title="Unlock card to active rotation"
                          >
                            <Unlock size={12} /> Unlock
                          </button>
                        )}

                        {topic.id.startsWith('custom-') && (
                          <button
                            className="btn btn-danger"
                            style={{ padding: '5px 8px', fontSize: '12px' }}
                            onClick={() => onDeleteTopic(topic.id)}
                            title="Delete custom topic"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
