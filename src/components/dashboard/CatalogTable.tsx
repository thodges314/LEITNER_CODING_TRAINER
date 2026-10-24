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
      return <ArrowUp size={12} className="kpi-cyan" />;
    }
    if (isDesc) {
      return <ArrowDown size={12} className="kpi-cyan" />;
    }
    return <ArrowUpDown size={11} className="catalog-text-dim" />;
  };

  return (
    <div className="glass-panel catalog-table-wrapper">
      <table className="catalog-table">
        <thead>
          <tr>
            <th
              onClick={() => onHeaderSort('title')}
              className="catalog-th col-card-title"
              title="Click to sort by card name"
            >
              <div className="catalog-th-btn">
                Card {renderSortIndicator('title')}
              </div>
            </th>
            <th
              onClick={() => onHeaderSort('track')}
              className="catalog-th col-topic"
              title="Click to sort by topic name"
            >
              <div className="catalog-th-btn">
                Topic {renderSortIndicator('track')}
              </div>
            </th>
            <th
              onClick={() => onHeaderSort('difficulty')}
              className="catalog-th col-difficulty"
              title="Click to sort by difficulty level"
            >
              <div className="catalog-th-btn">
                Difficulty {renderSortIndicator('difficulty')}
              </div>
            </th>
            <th
              onClick={() => onHeaderSort('box')}
              className="catalog-th col-tier"
              title={`Click to sort by ${tierName} level`}
            >
              <div className="catalog-th-btn catalog-th-btn-center">
                {tierName} Level {renderSortIndicator('box')}
              </div>
            </th>
            <th
              onClick={() => onHeaderSort('streak')}
              className="catalog-th col-streak"
              title="Click to sort by streak"
            >
              <div className="catalog-th-btn catalog-th-btn-center">
                Streak {renderSortIndicator('streak')}
              </div>
            </th>
            <th
              onClick={() => onHeaderSort('status')}
              className="catalog-th col-status"
              title="Click to sort by card status"
            >
              <div className="catalog-th-btn">
                Status {renderSortIndicator('status')}
              </div>
            </th>
            <th className="catalog-th col-actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {topics.length === 0 ? (
            <tr>
              <td colSpan={7} className="catalog-empty-cell">
                No cards match your current filter criteria.
              </td>
            </tr>
          ) : (
            topics.map((topic) => {
              const trkMeta = getTrackMeta(topic.track);
              const trStateClass = topic.deactivated
                ? 'catalog-tr-deactivated'
                : topic.status === 'locked'
                ? 'catalog-tr-locked'
                : '';
              const titleStateClass = topic.deactivated
                ? 'catalog-card-title-deactivated'
                : topic.status === 'locked'
                ? 'catalog-card-title-locked'
                : 'catalog-card-title';

              return (
                <tr
                  key={topic.id}
                  className={`catalog-tr ${trStateClass}`}
                >
                  {/* Title & Tags */}
                  <td className="catalog-td">
                    <div className={titleStateClass}>
                      {topic.title}
                    </div>
                    <div className="catalog-tags-row">
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
                  <td className="catalog-td col-difficulty">
                    <DifficultyBadge card={topic} showLabel={true} />
                  </td>

                  {/* Box */}
                  <td className="catalog-td catalog-tier-cell">
                    {!topic.deactivated && topic.status === 'active' ? (
                      <span
                        className="badge catalog-tier-badge"
                        style={{
                          border: `1.5px solid var(--box-${Math.min(9, topic.box)})`,
                          color: `var(--box-${Math.min(9, topic.box)})`,
                        }}
                      >
                        {tierName} {topic.box}
                      </span>
                    ) : (
                      <span className="catalog-text-dim">—</span>
                    )}
                  </td>

                  {/* Streak */}
                  <td className="catalog-td catalog-streak-cell">
                    {!topic.deactivated && topic.status === 'active' ? (
                      <span className="catalog-streak-badge">
                        <Flame size={13} /> {topic.streak}
                      </span>
                    ) : (
                      <span className="catalog-text-dim">0</span>
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
                          className="btn btn-secondary catalog-action-btn-sm"
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
                                className="btn btn-primary catalog-action-btn-sm"
                                onClick={() => onSelectCardToPractice(topic)}
                                title="Start blank-buffer practice on this topic immediately"
                              >
                                <Play size={12} /> Practice
                              </button>
                              <button
                                className="btn btn-outline catalog-action-icon-btn"
                                onClick={() => onResetBox(topic.id)}
                                title="Reset to Box 1"
                              >
                                <RotateCcw size={12} />
                              </button>
                              <button
                                className="btn btn-outline catalog-action-icon-btn"
                                onClick={() => onToggleLock(topic.id, topic.status)}
                                title="Lock card"
                              >
                                <Lock size={12} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-secondary catalog-action-btn-sm"
                              onClick={() => onToggleLock(topic.id, topic.status)}
                              title="Unlock card to active rotation"
                            >
                              <Unlock size={12} /> Unlock
                            </button>
                          )}

                          <button
                            className="btn btn-outline catalog-deactivate-btn"
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
