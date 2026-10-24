import React from 'react';
import { Check } from 'lucide-react';
import { getTrackMeta } from '../../lib/leitner';
import type { TrackType } from '../../lib/leitner';

export interface TopicFilterBarProps {
  allAvailableTracks: TrackType[];
  selectedTracks: string[];
  isAllTracks: boolean;
  trackCounts: Record<string, number>;
  totalTopicsCount: number;
  showTrackHint: boolean;
  onToggleTrack: (trk: string) => void;
  onResetTracks: () => void;
  onDismissHint: () => void;
  onOpenFocus?: () => void;
}

export const TopicFilterBar: React.FC<TopicFilterBarProps> = ({
  allAvailableTracks,
  selectedTracks,
  isAllTracks,
  trackCounts,
  totalTopicsCount,
  showTrackHint,
  onToggleTrack,
  onResetTracks,
  onDismissHint,
  onOpenFocus,
}) => {
  return (
    <div className="glass-panel catalog-filter-panel">
      {showTrackHint && (
        <div
          role="status"
          data-testid="track-filter-hint"
          className="track-filter-hint"
        >
          <span style={{ flex: '1 1 320px' }}>
            <strong>This filter is for inspecting cards.</strong> It only changes what
            you see in the catalog. To choose what you actually practice, use the{' '}
            <strong>Focus</strong> button in the top bar.
          </span>
          <span style={{ display: 'flex', gap: '8px' }}>
            {onOpenFocus && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: '12.5px' }}
                onClick={() => {
                  onDismissHint();
                  onOpenFocus();
                }}
              >
                Open Focus
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '12.5px' }}
              onClick={onDismissHint}
            >
              Got it
            </button>
          </span>
        </div>
      )}
      <div className="filter-panel-header">
        <div className="filter-panel-title">
          <span>Filter Topics:</span>
          {!isAllTracks && (
            <span className="filter-count-badge">
              {selectedTracks.length} of {allAvailableTracks.length} selected
            </span>
          )}
        </div>
        {!isAllTracks && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onResetTracks}
            style={{ fontSize: '11.5px', padding: '2px 8px' }}
          >
            Reset to All Topics
          </button>
        )}
      </div>

      <div className="filter-pills-row">
        {/* 'All Topics' Pill */}
        <button
          key="all"
          type="button"
          className={`track-filter-btn ${isAllTracks ? 'active' : ''}`}
          onClick={() => onToggleTrack('all')}
        >
          {isAllTracks && <Check size={13} />}
          All Topics ({totalTopicsCount})
        </button>

        {/* Individual Tracks */}
        {allAvailableTracks.map((trk) => {
          const isSelected = !isAllTracks && selectedTracks.includes(trk);
          const meta = getTrackMeta(trk);
          const count = trackCounts[trk] || 0;

          return (
            <button
              key={trk}
              type="button"
              className={`track-filter-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onToggleTrack(trk)}
              title={
                isSelected
                  ? `Click to remove ${meta.label}`
                  : `Click to add ${meta.label} to filter`
              }
            >
              {isSelected && <Check size={12} />}
              <span>{meta.label}</span>
              <span className="track-filter-count">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
