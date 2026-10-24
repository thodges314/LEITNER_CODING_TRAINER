import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { DIFFICULTY_LABELS } from '../../lib/leitner';
import type { CatalogSortOption, CatalogStatusFilter } from '../../lib/deckFilters';

export interface CatalogControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: CatalogStatusFilter;
  onStatusChange: (status: CatalogStatusFilter) => void;
  selectedDifficulty: number | 'all';
  onDifficultyChange: (diff: number | 'all') => void;
  sortOption: CatalogSortOption;
  onSortChange: (sort: CatalogSortOption) => void;
  tierName: string;
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const CatalogControls: React.FC<CatalogControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedDifficulty,
  onDifficultyChange,
  sortOption,
  onSortChange,
  tierName,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onResetFilters,
}) => {
  return (
    <div className="catalog-controls-bar">
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
          flex: 1,
        }}
      >
        {/* Search Input */}
        <div className="catalog-search-box">
          <Search size={14} className="catalog-search-icon" />
          <input
            type="text"
            placeholder="Search cards, tags, or topics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="catalog-search-input"
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as CatalogStatusFilter)}
            className="catalog-select"
            aria-label="Filter by Status"
          >
            <option value="all">Status: All</option>
            <option value="attempted">Status: Attempted Only</option>
            <option value="unattempted">Status: Unattempted (New) Only</option>
            <option value="unlocked">Status: Unlocked Only</option>
            {selectedStatus === 'active' && (
              <option value="active">Status: Unlocked / Active</option>
            )}
            <option value="locked">Status: Locked (Reserve) Only</option>
            <option value="deactivated">Status: Deactivated Only</option>
            <option value="due">Status: Due for Practice (Ready Now)</option>
            <option value="scheduled">Status: In Interval Spacing</option>
            <option value="mastered">Status: Mastered (Tier 5+)</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={selectedDifficulty === 'all' ? 'all' : String(selectedDifficulty)}
            onChange={(e) =>
              onDifficultyChange(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
            className="catalog-select"
            aria-label="Filter by Difficulty"
          >
            <option value="all">Difficulty: All</option>
            <option value="1">Level 1: {DIFFICULTY_LABELS[1]}</option>
            <option value="2">Level 2: {DIFFICULTY_LABELS[2]}</option>
            <option value="3">Level 3: {DIFFICULTY_LABELS[3]}</option>
            <option value="4">Level 4: {DIFFICULTY_LABELS[4]}</option>
            <option value="5">Level 5: {DIFFICULTY_LABELS[5]}</option>
          </select>
        </div>

        {/* Sort Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as CatalogSortOption)}
            className="catalog-select"
            aria-label="Sort Cards"
          >
            <option value="track-asc">Sort: Topic (A-Z) → Difficulty (Default)</option>
            <option value="track-desc">Sort: Topic (Z-A)</option>
            <option value="streak-desc">Sort: Streak (Highest First 🔥)</option>
            <option value="streak-asc">Sort: Streak (Lowest First)</option>
            <option value="difficulty-asc">Sort: Difficulty (Easiest First)</option>
            <option value="difficulty-desc">Sort: Difficulty (Hardest First)</option>
            <option value="box-desc">Sort: {tierName} (Highest First)</option>
            <option value="box-asc">Sort: {tierName} (Lowest First)</option>
            <option value="title-asc">Sort: Card Title (A-Z)</option>
            <option value="title-desc">Sort: Card Title (Z-A)</option>
            <option value="status-desc">Sort: Status (Attempted → Locked)</option>
            <option value="status-asc">Sort: Status (Locked → Attempted)</option>
            <option value="due-asc">Sort: Due for Practice First</option>
          </select>
        </div>
      </div>

      {/* Results Count & Reset Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Showing{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{filteredCount}</strong> of{' '}
          {totalCount} cards
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onResetFilters}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
            title="Reset all search queries, track selections, filters, and sort to default"
          >
            <RotateCcw size={12} /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
