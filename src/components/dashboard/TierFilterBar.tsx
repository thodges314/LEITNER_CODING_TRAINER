import React from 'react';
import { intervalForBox } from '../../lib/leitner';
import type { SpacedAlgorithm } from '../../lib/leitner';

export interface TierFilterBarProps {
  tierName: string;
  selectedBox: number | number[] | 'all';
  displayedBoxes: number[];
  boxCounts: number[];
  algorithm: SpacedAlgorithm;
  onToggleBox: (b: number) => void;
  onResetBoxes: () => void;
}

export const TierFilterBar: React.FC<TierFilterBarProps> = ({
  tierName,
  selectedBox,
  displayedBoxes,
  boxCounts,
  algorithm,
  onToggleBox,
  onResetBoxes,
}) => {
  const isSelected = selectedBox !== 'all';
  const selectedCount = isSelected
    ? Array.isArray(selectedBox)
      ? selectedBox.length
      : 1
    : 0;

  return (
    <div className="glass-panel catalog-filter-panel">
      <div className="filter-panel-header">
        <div className="filter-panel-title">
          <span>Active Spacing {tierName}s:</span>
          {isSelected && (
            <span className="filter-count-badge">
              {selectedCount} of {displayedBoxes.length} selected
            </span>
          )}
        </div>
        {isSelected && (
          <button
            type="button"
            className="btn btn-outline tier-filter-reset-btn"
            onClick={onResetBoxes}
          >
            Reset to All {tierName}s
          </button>
        )}
      </div>
      <div className="filter-pills-row">
        {displayedBoxes.map((b, idx) => {
          const isBoxSelected =
            selectedBox !== 'all' &&
            (Array.isArray(selectedBox) ? selectedBox.includes(b) : selectedBox === b);

          return (
            <div
              key={b}
              role="button"
              tabIndex={0}
              aria-pressed={isBoxSelected}
              data-testid={`tier-pill-${b}`}
              onClick={() => onToggleBox(b)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleBox(b);
                }
              }}
              className={`tier-pill ${isBoxSelected ? 'active' : ''}`}
            >
              <div
                className="tier-pill-indicator"
                style={{ backgroundColor: `var(--box-${Math.min(9, b)})` }}
              />
              <span>
                {tierName} {b} (+{intervalForBox(b, algorithm)})
              </span>
              <span className="tier-pill-count">{boxCounts[idx]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
