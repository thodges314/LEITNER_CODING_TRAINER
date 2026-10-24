import React from 'react';
import {
  Unlock,
  Lock,
  RotateCcw,
  Play,
  Flame,
  Archive,
  ArchiveRestore,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import { DifficultyBadge } from '../DifficultyBadge';
import { getTrackMeta, isCardAttempted } from '../../lib/leitner';
import type { TopicItem } from '../../lib/leitner';
import type { CatalogSortOption } from '../../lib/deckFilters';

export interface CatalogTableProps {
  topics: TopicItem[];
  tierName: string;
  isLight: boolean;
  sortOption: CatalogSortOption;
  onHeaderSort: (
    column: 'title' | 'track' | 'difficulty' | 'box' | 'streak' | 'due' | 'status'
  ) => void;
  onSelectCardToPractice: (card: TopicItem) => void;
  onResetBox: (topicId: string) => void;
  onToggleLock: (topicId: string, currentStatus: 'active' | 'locked') => void;
  onDeactivateClick: (topic: TopicItem) => void;
  onToggleDeactivate?: (topicId: string) => void;
  onDeleteTopic?: (topicId: string) => void;
}

export const CatalogTable: React.FC<CatalogTableProps> = ({
  topics,
  tierName,
  isLight,
  sortOption,
  onHeaderSort,
  onSelectCardToPractice,
  onResetBox,
  onToggleLock,
  onDeactivateClick,
  onToggleDeactivate,
  onDeleteTopic,
}) => {
  const renderSortIndicator = (
    column: 'title' | 'track' | 'difficulty' | 'box' | 'streak' | 'due' | 'status'
  ) => {
    const isAsc =
      (column === 'title' && sortOption === 'title-asc') ||
      (column === 'track' && sortOption === 'track-asc') ||
      (column === 'difficulty' && sortOption === 'difficulty-asc') ||
      (column === 'box' && sortOption === 'box-asc') ||
      (column === 'streak' && sortOption === 'streak-asc') ||
      (column === 'due' && sortOption === 'due-asc') ||
      (column === 'status' && sortOption === 'status-asc');

    const isDesc =
      (column === 'title' && sortOption === 'title-desc') ||
      (column === 'track' && sortOption === 'track-desc') ||
      (column === 'difficulty' && sortOption === 'difficulty-desc') ||
      (column === 'box' && sortOption === 'box-desc') ||
      (column === 'streak' && sortOption === 'streak-desc') ||
      (column === 'due' && sortOption === 'due-desc') ||
      (column === 'status' && sortOption === 'status-desc');

    if (isAsc) {
      return <ArrowUp size={12} style={{ color: 'var(--accent-primary)' }} />;
    }
    if (isDesc) {
      return <ArrowDown size={12} style={{ color: 'var(--accent-primary)' }} />;
    }
    return <ArrowUpDown size={11} style={{ opacity: 0.35 }} />;
  };

  return (
    <div className="glass-panel catalog-table-wrapper" style={{ overflowX: 'auto' }}>
      <table className="catalog-table">
        <thead>
          <tr>
            <th
              onClick={() => onHeaderSort('title')}
              className="catalog-th"
              style={{ cursor: 'pointer', minWidth: '220px' }}
              title="Click to sort by card name"
            >
              <div className="catalog-th-btn">
                Card {renderSortIndicator('title')}
              </div>
            </th>
            <th
              onClick={() => onHeaderSort('track')}
              className="catalog-th"
              style={{ cursor: 'pointer', minWidth: '150px', whiteSpace: 'nowrap' }}
              title="Click to sort by topic name"
            >
              <div className="catalog-th-btn">
                Topic {renderSortIndicator('track')}
              </div>
            </th>
            <th
              onClick={() => onHeaderSort('difficulty')}
              className="catalog-th"
              style={{ cursor: 'pointer', minWidth: '130px', whiteSpace: 'nowrap' }}
              title="Click to sort by difficulty level"
            >
              <div className="catalog-th-btn">
                Difficulty {renderSortIndicator('difficulty')}
              </div>
            </th>
            <th
              onClick={() => onHeaderSort('box')}
              className="catalog-th"
              style={{
                cursor: 'pointer',
                minWidth: '100px',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
              title={`Click to sort by ${tierName} level`}
            >
              <div
                className="catalog-th-btn"
                style={{ justifyContent: 'center', width: '100%' }}
              >
                {tierName} Level {renderSortIndicator('box')}
              </div>
            </th>
            <th
              onClick={() => onHeaderSort('streak')}
              className="catalog-th"
              style={{
                cursor: 'pointer',
                minWidth: '85px',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
              title="Click to sort by streak"
            >
              <div
                className="catalog-th-btn"
                style={{ justifyContent: 'center', width: '100%' }}
              >
                Streak {renderSortIndicator('streak')}
              </div>
            </th>
            <th
              onClick={() => onHeaderSort('status')}
              className="catalog-th"
              style={{ cursor: 'pointer', minWidth: '120px', whiteSpace: 'nowrap' }}
              title="Click to sort by card status"
            >
              <div className="catalog-th-btn">
                Status {renderSortIndicator('status')}
              </div>
            </th>
            <th
              className="catalog-th"
              style={{ minWidth: '175px', whiteSpace: 'nowrap', textAlign: 'left' }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {topics.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: '36px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                No cards match your current filter criteria.
              </td>
            </tr>
          ) : (
            topics.map((topic) => {
              const trkMeta = getTrackMeta(topic.track);
              return (
                <tr
                  key={topic.id}
                  className="catalog-tr"
                  style={{
                    backgroundColor: topic.deactivated
                      ? isLight
                        ? 'rgba(0, 0, 0, 0.04)'
                        : 'rgba(0, 0, 0, 0.35)'
                      : topic.status === 'locked'
                      ? isLight
                        ? 'rgba(0, 0, 0, 0.025)'
                        : 'rgba(0,0,0,0.2)'
                      : undefined,
                    opacity: topic.deactivated ? 0.72 : 1,
                  }}
                >
                  {/* Title & Tags */}
                  <td className="catalog-td">
                    <div
                      style={{
                        fontWeight: 600,
                        color: topic.deactivated
                          ? 'var(--text-dim)'
                          : topic.status === 'active'
                          ? 'var(--text-primary)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {topic.title}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '4px',
                        flexWrap: 'wrap',
                        marginTop: '4px',
                      }}
                    >
                      {topic.tags.slice(0, 3).map((tg) => (
                        <span key={tg} className="table-tag-chip">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Track */}
                  <td className="catalog-td">
                    <span className="track-badge" data-track={topic.track}>
                      {trkMeta.label}
                    </span>
                  </td>

                  {/* Difficulty */}
                  <td className="catalog-td" style={{ whiteSpace: 'nowrap' }}>
                    <DifficultyBadge card={topic} showLabel={true} />
                  </td>

                  {/* Box */}
                  <td className="catalog-td" style={{ textAlign: 'center' }}>
                    {!topic.deactivated && topic.status === 'active' ? (
                      <span
                        className="badge"
                        style={{
                          border: `1.5px solid var(--box-${Math.min(9, topic.box)})`,
                          color: `var(--box-${Math.min(9, topic.box)})`,
                          fontWeight: 700,
                        }}
                      >
                        {tierName} {topic.box}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>—</span>
                    )}
                  </td>

                  {/* Streak */}
                  <td className="catalog-td" style={{ textAlign: 'center' }}>
                    {!topic.deactivated && topic.status === 'active' ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--accent-orange, #f97316)',
                          fontWeight: 600,
                        }}
                      >
                        <Flame size={13} /> {topic.streak}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>0</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="catalog-td">
                    {topic.deactivated ? (
                      <span
                        className="badge status-badge-deactivated"
                        title="Card pulled out of active study rotation"
                      >
                        <Archive size={11} />
                        <span>Deactivated</span>
                      </span>
                    ) : topic.status === 'locked' ? (
                      <span
                        className="badge status-badge-locked"
                        title="Locked in reserve deck"
                      >
                        <Lock size={11} />
                        <span>Locked</span>
                      </span>
                    ) : isCardAttempted(topic) ? (
                      <span
                        className="badge status-badge-attempted"
                        title="Active card in study rotation (attempted at least once)"
                      >
                        <CheckCircle2 size={11} />
                        <span>Attempted</span>
                      </span>
                    ) : (
                      <span
                        className="badge status-badge-active"
                        title="Unlocked card ready for initial practice"
                      >
                        <Unlock size={11} />
                        <span>Unlocked</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="catalog-td">
                    <div className="catalog-actions-cell">
                      {topic.deactivated ? (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          onClick={() => {
                            if (onToggleDeactivate) onToggleDeactivate(topic.id);
                            else if (onDeleteTopic) onDeleteTopic(topic.id);
                          }}
                          title="Reactivate card to study rotation"
                          aria-label={`Reactivate topic '${topic.title}'`}
                        >
                          <ArchiveRestore size={12} /> Reactivate
                        </button>
                      ) : (
                        <>
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

                          <button
                            className="btn btn-outline"
                            style={{
                              padding: '5px 8px',
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                            }}
                            onClick={() => onDeactivateClick(topic)}
                            title={`Deactivate topic '${topic.title}' (remove from study rotation)`}
                            aria-label={`Deactivate topic '${topic.title}'`}
                          >
                            <Archive size={12} />
                          </button>
                        </>
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
  );
};
