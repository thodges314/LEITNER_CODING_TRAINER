import { DeckStatsWidget } from './DeckStatsWidget';
import { useState, useRef, useMemo, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { AppTheme } from '../lib/theme';
import {
  getTrackMeta,
  visibleTopics,
  getSchedulingAlgorithm,
  exportDeckBackup,
  importDeckBackup,
  difficultyOf,
  isCardAttempted,
} from '../lib/leitner';
import type { TopicItem, LeitnerDeckState, TrackType } from '../lib/leitner';
import { FEATURES } from '../lib/features';
import { isHintSeen, markHintSeen, TRACK_FILTER_HINT_KEY } from '../lib/hints';
import {
  Download,
  Upload,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import {
  loadDeckCatalogPreferences,
  saveDeckCatalogPreferences,
  clearDeckCatalogPreferences,
} from '../lib/deckFilters';
import type { CatalogSortOption, CatalogStatusFilter } from '../lib/deckFilters';
import {
  TierFilterBar,
  TopicFilterBar,
  CatalogControls,
  CatalogTable,
  DeactivateModal,
} from './dashboard';

export type { CatalogSortOption, CatalogStatusFilter };

interface DeckDashboardProps {
  state: LeitnerDeckState;
  theme?: AppTheme;
  onSelectCardToPractice: (card: TopicItem) => void;
  onToggleLock: (topicId: string, currentStatus: 'active' | 'locked') => void;
  onResetBox: (topicId: string) => void;
  onDeleteTopic?: (topicId: string) => void;
  onToggleDeactivate?: (topicId: string) => void;
  onStateUpdated: (newState: LeitnerDeckState) => void;
  onOpenAddModal: () => void;
  /** Opens the Focus dialog (used by the one-time hint under the track filter). */
  onOpenFocus?: () => void;
  highlightExport?: boolean;
  onDismissHighlightExport?: () => void;
}

export const DeckDashboard: React.FC<DeckDashboardProps> = ({
  state,
  theme,
  onSelectCardToPractice,
  onToggleLock,
  onResetBox,
  onDeleteTopic,
  onToggleDeactivate,
  onStateUpdated,
  onOpenAddModal,
  onOpenFocus,
  highlightExport = false,
  onDismissHighlightExport,
}) => {
  const isLight = theme === 'apple-gsos';
  const allAvailableTracks = useMemo(
    () =>
      Array.from(new Set(visibleTopics(state).map((t) => t.track))).sort((a, b) =>
        getTrackMeta(a).label.localeCompare(getTrackMeta(b).label)
      ),
    [state]
  );

  const initialPrefs = useMemo(() => {
    const prefs = loadDeckCatalogPreferences();
    if (!prefs.selectedTracks.includes('all')) {
      const valid = prefs.selectedTracks.filter((t) => allAvailableTracks.includes(t as TrackType));
      prefs.selectedTracks = valid.length > 0 ? valid : ['all'];
    }
    return prefs;
  }, [allAvailableTracks]);

  const [selectedTracks, setSelectedTracks] = useState<string[]>(() => initialPrefs.selectedTracks);
  const [selectedBox, setSelectedBox] = useState<number | number[] | 'all'>(() => initialPrefs.selectedBox);
  const [selectedStatus, setSelectedStatus] = useState<CatalogStatusFilter>(() => initialPrefs.selectedStatus);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | 'all'>(() => initialPrefs.selectedDifficulty);
  const [sortOption, setSortOption] = useState<CatalogSortOption>(() => initialPrefs.sortOption);
  const [searchQuery, setSearchQuery] = useState(() => initialPrefs.searchQuery);
  const [topicToDeactivate, setTopicToDeactivate] = useState<TopicItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveDeckCatalogPreferences({
      selectedTracks,
      selectedBox,
      selectedStatus,
      selectedDifficulty,
      sortOption,
      searchQuery,
    });
  }, [selectedTracks, selectedBox, selectedStatus, selectedDifficulty, sortOption, searchQuery]);

  const algorithm = getSchedulingAlgorithm(state);
  const tierName = algorithm === 'graduated-interval' ? 'Tier' : 'Box';

  const { totalCompletedReviews, unlockedStageCount = 0 } = state;
  const topics = visibleTopics(state); // cards of disabled optional packs are hidden

  const isAllTracks =
    selectedTracks.includes('all') ||
    selectedTracks.length === 0 ||
    selectedTracks.length === allAvailableTracks.length;

  const trackCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of topics) {
      counts[t.track] = (counts[t.track] || 0) + 1;
    }
    return counts;
  }, [topics]);

  const [showTrackHint, setShowTrackHint] = useState(false);

  const handleToggleTrack = (trk: string) => {
    if (!isHintSeen(TRACK_FILTER_HINT_KEY)) {
      markHintSeen(TRACK_FILTER_HINT_KEY); // once ever, whether or not it is dismissed
      setShowTrackHint(true);
    }
    if (trk === 'all') {
      setSelectedTracks(['all']);
      return;
    }
    if (isAllTracks) {
      setSelectedTracks([trk]);
      return;
    }
    if (selectedTracks.includes(trk)) {
      const next = selectedTracks.filter((t) => t !== trk);
      if (next.length === 0 || next.length === allAvailableTracks.length) {
        setSelectedTracks(['all']);
      } else {
        setSelectedTracks(next);
      }
    } else {
      const next = [...selectedTracks, trk];
      if (next.length >= allAvailableTracks.length) {
        setSelectedTracks(['all']);
      } else {
        setSelectedTracks(next);
      }
    }
  };

  const handleExclusiveTrackSelect = (trk: string) => {
    if (selectedTracks.length === 1 && selectedTracks[0] === trk) {
      setSelectedTracks(['all']);
    } else {
      setSelectedTracks([trk]);
    }
  };

  const handleExclusiveMultiTrackSelect = (tracks: string[]) => {
    const isAlreadyExact =
      !isAllTracks &&
      selectedTracks.length === tracks.length &&
      tracks.every((t) => selectedTracks.includes(t));

    if (isAlreadyExact) {
      setSelectedTracks(['all']);
    } else {
      setSelectedTracks(tracks);
    }
  };

  const handleExclusiveBoxSelect = (box: number | number[] | 'all') => {
    if (box === 'all') {
      setSelectedBox('all');
      return;
    }
    const current = selectedBox === 'all' ? [] : (Array.isArray(selectedBox) ? selectedBox : [selectedBox]);
    if (Array.isArray(box)) {
      const isAlreadyExact =
        current.length === box.length &&
        box.every((b) => current.includes(b));

      if (isAlreadyExact) {
        setSelectedBox('all');
      } else {
        setSelectedBox(box);
      }
      return;
    }
    if (current.length === 1 && current[0] === box) {
      setSelectedBox('all');
    } else {
      setSelectedBox([box]);
    }
  };

  const handleResetFilters = () => {
    setSelectedTracks(['all']);
    setSelectedBox('all');
    setSelectedStatus('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
    setSortOption('track-asc');
    clearDeckCatalogPreferences();
  };

  const hasActiveFilters =
    !isAllTracks ||
    selectedBox !== 'all' ||
    selectedStatus !== 'all' ||
    selectedDifficulty !== 'all' ||
    searchQuery.trim() !== '' ||
    sortOption !== 'track-asc';

  // Compute Statistics
  const activeCount = topics.filter((t) => t.status === 'active').length;
  const lockedCount = topics.filter((t) => t.status === 'locked').length;
  const masteredCount = topics.filter((t) => t.status === 'active' && (algorithm === 'graduated-interval' ? t.box >= 5 : t.box === 5)).length;
  const box3PlusCount = topics.filter((t) => t.status === 'active' && t.box >= 3).length;

  const maxActiveBox = topics.reduce((max, t) => (t.status === 'active' ? Math.max(max, t.box) : max), 5);
  const displayedBoxes = algorithm === 'graduated-interval'
    ? Array.from({ length: Math.max(9, maxActiveBox) }, (_, i) => i + 1)
    : [1, 2, 3, 4, 5];
  const boxCounts = displayedBoxes.map(
    (b) => topics.filter((t) => t.status === 'active' && t.box === b).length
  );

  const handleToggleBox = (b: number) => {
    if (selectedBox === 'all') {
      setSelectedBox([b]);
      return;
    }
    const current = Array.isArray(selectedBox) ? selectedBox : [selectedBox];
    if (current.includes(b)) {
      const next = current.filter((x) => x !== b);
      if (next.length === 0 || next.length >= displayedBoxes.length) {
        setSelectedBox('all');
      } else {
        setSelectedBox(next);
      }
    } else {
      const next = [...current, b];
      if (next.length >= displayedBoxes.length) {
        setSelectedBox('all');
      } else {
        setSelectedBox(next);
      }
    }
  };

  // Staged unlock calculation: next unlock milestone
  const nextUnlockTarget = (unlockedStageCount + 1) * 4;
  const cardsNeededForNextUnlock = Math.max(0, nextUnlockTarget - box3PlusCount);

  const compareTopics = (a: TopicItem, b: TopicItem): number => {
    switch (sortOption) {
      case 'track-asc': {
        const trkCmp = getTrackMeta(a.track).label.localeCompare(getTrackMeta(b.track).label);
        if (trkCmp !== 0) return trkCmp;
        const diffA = difficultyOf(a);
        const diffB = difficultyOf(b);
        if (diffA !== diffB) return diffA - diffB;
        return a.title.localeCompare(b.title);
      }
      case 'track-desc': {
        const trkCmp = getTrackMeta(b.track).label.localeCompare(getTrackMeta(a.track).label);
        if (trkCmp !== 0) return trkCmp;
        const diffA = difficultyOf(a);
        const diffB = difficultyOf(b);
        if (diffA !== diffB) return diffA - diffB;
        return a.title.localeCompare(b.title);
      }
      case 'difficulty-asc': {
        const diffA = difficultyOf(a);
        const diffB = difficultyOf(b);
        if (diffA !== diffB) return diffA - diffB;
        const trkCmp = getTrackMeta(a.track).label.localeCompare(getTrackMeta(b.track).label);
        if (trkCmp !== 0) return trkCmp;
        return a.title.localeCompare(b.title);
      }
      case 'difficulty-desc': {
        const diffA = difficultyOf(a);
        const diffB = difficultyOf(b);
        if (diffB !== diffA) return diffB - diffA;
        const trkCmp = getTrackMeta(a.track).label.localeCompare(getTrackMeta(b.track).label);
        if (trkCmp !== 0) return trkCmp;
        return a.title.localeCompare(b.title);
      }
      case 'streak-desc': {
        const streakA = a.status === 'active' ? (a.streak ?? 0) : -1;
        const streakB = b.status === 'active' ? (b.streak ?? 0) : -1;
        if (streakB !== streakA) return streakB - streakA;
        return a.title.localeCompare(b.title);
      }
      case 'streak-asc': {
        const streakA = a.status === 'active' ? (a.streak ?? 0) : -1;
        const streakB = b.status === 'active' ? (b.streak ?? 0) : -1;
        if (streakA !== streakB) return streakA - streakB;
        return a.title.localeCompare(b.title);
      }
      case 'box-desc': {
        if (b.box !== a.box) return b.box - a.box;
        return a.title.localeCompare(b.title);
      }
      case 'box-asc': {
        if (a.box !== b.box) return a.box - b.box;
        return a.title.localeCompare(b.title);
      }
      case 'title-asc': {
        return a.title.localeCompare(b.title);
      }
      case 'title-desc': {
        return b.title.localeCompare(a.title);
      }
      case 'due-asc': {
        const isDueA = a.status === 'active' && a.nextEligibleTrial <= totalCompletedReviews;
        const isDueB = b.status === 'active' && b.nextEligibleTrial <= totalCompletedReviews;
        if (isDueA && !isDueB) return -1;
        if (!isDueA && isDueB) return 1;
        if (a.status === 'active' && b.status === 'active') {
          if (a.nextEligibleTrial !== b.nextEligibleTrial) return a.nextEligibleTrial - b.nextEligibleTrial;
        }
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
        return a.title.localeCompare(b.title);
      }
      case 'due-desc': {
        const isDueA = a.status === 'active' && a.nextEligibleTrial <= totalCompletedReviews;
        const isDueB = b.status === 'active' && b.nextEligibleTrial <= totalCompletedReviews;
        if (isDueA && !isDueB) return 1;
        if (!isDueA && isDueB) return -1;
        if (a.status === 'active' && b.status === 'active') {
          if (b.nextEligibleTrial !== a.nextEligibleTrial) return b.nextEligibleTrial - a.nextEligibleTrial;
        }
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
        return a.title.localeCompare(b.title);
      }
      case 'status-asc': {
        const getRankAsc = (item: TopicItem) => {
          if (item.deactivated) return 4;
          if (item.status === 'locked') return 1;
          if (isCardAttempted(item)) return 3;
          return 2; // unlocked
        };
        const rankA = getRankAsc(a);
        const rankB = getRankAsc(b);
        if (rankA !== rankB) return rankA - rankB;
        return a.title.localeCompare(b.title);
      }
      case 'status-desc': {
        const getRankDesc = (item: TopicItem) => {
          if (item.deactivated) return 0;
          if (item.status === 'locked') return 1;
          if (isCardAttempted(item)) return 3; // attempted
          return 2; // unlocked
        };
        const rankA = getRankDesc(a);
        const rankB = getRankDesc(b);
        if (rankA !== rankB) return rankB - rankA;
        return a.title.localeCompare(b.title);
      }
      default:
        return 0;
    }
  };

  const handleHeaderSort = (column: 'title' | 'track' | 'difficulty' | 'box' | 'streak' | 'due' | 'status') => {
    if (column === 'title') {
      setSortOption((prev) => (prev === 'title-asc' ? 'title-desc' : 'title-asc'));
    } else if (column === 'track') {
      setSortOption((prev) => (prev === 'track-asc' ? 'track-desc' : 'track-asc'));
    } else if (column === 'difficulty') {
      setSortOption((prev) => (prev === 'difficulty-asc' ? 'difficulty-desc' : 'difficulty-asc'));
    } else if (column === 'box') {
      setSortOption((prev) => (prev === 'box-desc' ? 'box-asc' : 'box-desc'));
    } else if (column === 'streak') {
      setSortOption((prev) => (prev === 'streak-desc' ? 'streak-asc' : 'streak-desc'));
    } else if (column === 'due') {
      setSortOption((prev) => (prev === 'due-asc' ? 'due-desc' : 'due-asc'));
    } else if (column === 'status') {
      setSortOption((prev) => (prev === 'status-asc' ? 'status-desc' : 'status-asc'));
    }
  };

  // Filtered and sorted topics
  const filteredTopics = topics
    .filter((t) => {
      if (!isAllTracks && !selectedTracks.includes(t.track)) return false;
      if (selectedBox !== 'all') {
        const activeBoxes = Array.isArray(selectedBox) ? selectedBox : [selectedBox];
        if (!activeBoxes.includes(t.box)) return false;
      }
      const isAttempted = isCardAttempted(t);
      const isUnattempted = !t.deactivated && t.status === 'active' && !isAttempted;

      if (selectedStatus === 'attempted' && !isAttempted) return false;
      if (selectedStatus === 'unattempted' && !isUnattempted) return false;
      if ((selectedStatus === 'unlocked' || selectedStatus === 'active') && (t.status !== 'active' || t.deactivated)) return false;
      if (selectedStatus === 'locked' && (t.status !== 'locked' || t.deactivated)) return false;
      if (selectedStatus === 'deactivated' && !t.deactivated) return false;
      if (selectedStatus === 'due' && (t.status !== 'active' || t.deactivated || t.nextEligibleTrial > totalCompletedReviews)) return false;
      if (selectedStatus === 'scheduled' && (t.status !== 'active' || t.deactivated || t.nextEligibleTrial <= totalCompletedReviews)) return false;
      if (selectedStatus === 'mastered') {
        const isMastered = t.status === 'active' && !t.deactivated && (algorithm === 'graduated-interval' ? t.box >= 5 : t.box === 5);
        if (!isMastered) return false;
      }
      if (selectedDifficulty !== 'all' && difficultyOf(t) !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchId = t.id.toLowerCase().includes(q);
        const matchTrackLabel = getTrackMeta(t.track).label.toLowerCase().includes(q);
        if (!matchTitle && !matchTags && !matchId && !matchTrackLabel) return false;
      }
      return true;
    })
    .sort(compareTopics);

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
    <div className="dashboard-container">
      {/* Top Banner Actions */}
      <div className="dashboard-banner">
        <div>
          <h1 className="dashboard-title">
            Catalog & Deck Performance
          </h1>
        </div>

        <div className="dashboard-actions">
          {FEATURES.quickAdd && (
            <button className="btn btn-primary" onClick={onOpenAddModal}>
              <Plus size={16} /> Quick Add Topic
            </button>
          )}
          <div style={{ position: 'relative' }}>
            <button
              className={`btn btn-secondary ${highlightExport ? 'btn-export-highlight' : ''}`}
              onClick={() => {
                handleExport();
                onDismissHighlightExport?.();
              }}
              title="Download timestamped JSON backup"
              data-testid="export-progress-btn"
            >
              <Download size={15} /> Export Progress
            </button>

            {highlightExport && (
              <div
                className="export-callout-bubble"
                data-testid="export-callout-bubble"
                role="status"
              >
                <div className="export-callout-inner">
                  <Sparkles size={16} className="export-sparkle-icon" />
                  <div className="export-callout-content">
                    <div className="export-callout-title">
                      Download Backup Here
                    </div>
                    <div className="export-callout-desc">
                      Click <strong>Export Progress</strong> to save your current deck as a <code>.json</code> file you can restore anytime.
                    </div>
                  </div>
                  <button
                    onClick={onDismissHighlightExport}
                    aria-label="Dismiss export alert"
                    className="export-callout-dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

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

      {/* Top Section: 2x2 KPI Cards + Circular Stats Widget */}
      <div className="dashboard-top-section">
        {/* Left: 2x2 KPI Grid */}
        <div className="dashboard-kpi-grid">
          {/* Total Reviews */}
          <div className="glass-panel dashboard-kpi-card">
            <div className="dashboard-kpi-label">Completed Reviews</div>
            <div className="dashboard-kpi-val kpi-cyan">
              #{totalCompletedReviews}
            </div>
            <div className="dashboard-kpi-sub">
              Global trial progression
            </div>
          </div>

          {/* Active vs Locked */}
          <div className="glass-panel dashboard-kpi-card">
            <div className="dashboard-kpi-label">Deck Distribution</div>
            <div className="dashboard-kpi-val">
              {activeCount} <span className="dashboard-kpi-val-denom">/ {topics.length}</span>
            </div>
            <div className="dashboard-kpi-sub">
              {lockedCount} cards locked in reserve
            </div>
          </div>

          {/* Mastered */}
          <div className="glass-panel dashboard-kpi-card">
            <div className="dashboard-kpi-label">
              {algorithm === 'graduated-interval' ? 'Mastered / Long-term (Tier 5+)' : 'Mastered (Box 5)'}
            </div>
            <div className="dashboard-kpi-val kpi-emerald">
              {masteredCount}
            </div>
            <div className="dashboard-kpi-sub">
              {algorithm === 'graduated-interval' ? '+35 to +800+ review intervals' : '+45 review interval reached'}
            </div>
          </div>

          {/* Staged Unlock Progress */}
          <div className="glass-panel dashboard-kpi-card">
            <div className="dashboard-kpi-label">Staged Unlock Progress</div>
            <div className="dashboard-kpi-val kpi-amber">
              {box3PlusCount} <span className="dashboard-kpi-val-denom">/ {nextUnlockTarget} in B3+</span>
            </div>
            <div className="dashboard-kpi-sub">
              {lockedCount > 0
                ? `${cardsNeededForNextUnlock} more Box 3+ cards unlocks 4 new topics`
                : 'All topics unlocked!'}
            </div>
          </div>
        </div>

        {/* Right: Rounded Stats & Visual Chart Widget */}
        <DeckStatsWidget
          state={state}
          topics={topics}
          theme={theme}
          selectedTracks={selectedTracks}
          selectedBox={selectedBox}
          displayedBoxes={displayedBoxes}
          onSelectExclusiveTrack={handleExclusiveTrackSelect}
          onSelectExclusiveTracks={handleExclusiveMultiTrackSelect}
          onSelectExclusiveBox={handleExclusiveBoxSelect}
          onSelectTrack={handleExclusiveTrackSelect}
          onSelectCardToPractice={onSelectCardToPractice}
        />
      </div>

      {/* Leitner Box Breakdown Strip */}
      <TierFilterBar
        tierName={tierName}
        selectedBox={selectedBox}
        displayedBoxes={displayedBoxes}
        boxCounts={boxCounts}
        algorithm={algorithm}
        onToggleBox={handleToggleBox}
        onResetBoxes={() => setSelectedBox('all')}
      />

      {/* Track Filters (Multi-Select with 'All Topics') */}
      <TopicFilterBar
        allAvailableTracks={allAvailableTracks}
        selectedTracks={selectedTracks}
        isAllTracks={isAllTracks}
        trackCounts={trackCounts}
        totalTopicsCount={topics.length}
        showTrackHint={showTrackHint}
        onToggleTrack={handleToggleTrack}
        onResetTracks={() => setSelectedTracks(['all'])}
        onDismissHint={() => setShowTrackHint(false)}
        onOpenFocus={onOpenFocus}
      />

      {/* Search, Filter & Sort Controls Bar */}
      <CatalogControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        sortOption={sortOption}
        onSortChange={setSortOption}
        tierName={tierName}
        filteredCount={filteredTopics.length}
        totalCount={topics.length}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Catalog Table */}
      <CatalogTable
        topics={filteredTopics}
        tierName={tierName}
        isLight={isLight}
        sortOption={sortOption}
        onHeaderSort={handleHeaderSort}
        onSelectCardToPractice={onSelectCardToPractice}
        onResetBox={onResetBox}
        onToggleLock={onToggleLock}
        onDeactivateClick={setTopicToDeactivate}
        onToggleDeactivate={onToggleDeactivate}
        onDeleteTopic={onDeleteTopic}
      />

      {/* Lightweight Deactivate Confirmation Modal */}
      <DeactivateModal
        topic={topicToDeactivate}
        onClose={() => setTopicToDeactivate(null)}
        onConfirm={(topicId) => {
          if (onToggleDeactivate) onToggleDeactivate(topicId);
          else if (onDeleteTopic) onDeleteTopic(topicId);
          setTopicToDeactivate(null);
        }}
      />
    </div>
  );
};
