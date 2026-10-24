import { DifficultyBadge } from './DifficultyBadge';
import { DeckStatsWidget } from './DeckStatsWidget';
import { useState, useRef, useMemo, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { AppTheme } from '../lib/theme';
import {
  getTrackMeta,
  visibleTopics,
  intervalForBox,
  getSchedulingAlgorithm,
  exportDeckBackup,
  importDeckBackup,
  difficultyOf,
  DIFFICULTY_LABELS,
  isCardAttempted,
} from '../lib/leitner';
import type { TopicItem, LeitnerDeckState, TrackType } from '../lib/leitner';
import { FEATURES } from '../lib/features';
import { isHintSeen, markHintSeen, TRACK_FILTER_HINT_KEY } from '../lib/hints';
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
  Archive,
  ArchiveRestore,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import {
  loadDeckCatalogPreferences,
  saveDeckCatalogPreferences,
  clearDeckCatalogPreferences,
} from '../lib/deckFilters';
import type { CatalogSortOption, CatalogStatusFilter } from '../lib/deckFilters';
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

  const renderSortIndicator = (column: 'title' | 'track' | 'difficulty' | 'box' | 'streak' | 'due' | 'status') => {
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: isLight ? '#b45309' : '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1, fontSize: '12px', lineHeight: '1.45' }}>
                    <div style={{ fontWeight: 700, marginBottom: '2px', color: 'var(--text-primary)' }}>
                      Download Backup Here
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Click <strong>Export Progress</strong> to save your current deck as a <code>.json</code> file you can restore anytime.
                    </div>
                  </div>
                  <button
                    onClick={onDismissHighlightExport}
                    aria-label="Dismiss export alert"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '2px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
          alignItems: 'stretch',
        }}
      >
        {/* Left: 2x2 KPI Grid */}
        <div className="dashboard-kpi-grid">
          {/* Total Reviews */}
          <div className="glass-panel dashboard-kpi-card">
            <div className="dashboard-kpi-label">Completed Reviews</div>
            <div className="dashboard-kpi-val" style={{ color: 'var(--accent-cyan)' }}>
              #{totalCompletedReviews}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Global trial progression
            </div>
          </div>

          {/* Active vs Locked */}
          <div className="glass-panel dashboard-kpi-card">
            <div className="dashboard-kpi-label">Deck Distribution</div>
            <div className="dashboard-kpi-val">
              {activeCount} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ {topics.length}</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {lockedCount} cards locked in reserve
            </div>
          </div>

          {/* Mastered */}
          <div className="glass-panel dashboard-kpi-card">
            <div className="dashboard-kpi-label">
              {algorithm === 'graduated-interval' ? 'Mastered / Long-term (Tier 5+)' : 'Mastered (Box 5)'}
            </div>
            <div className="dashboard-kpi-val" style={{ color: 'var(--accent-emerald)' }}>
              {masteredCount}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {algorithm === 'graduated-interval' ? '+35 to +800+ review intervals' : '+45 review interval reached'}
            </div>
          </div>

          {/* Staged Unlock Progress */}
          <div className="glass-panel dashboard-kpi-card">
            <div className="dashboard-kpi-label">Staged Unlock Progress</div>
            <div className="dashboard-kpi-val" style={{ color: 'var(--accent-amber)' }}>
              {box3PlusCount} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ {nextUnlockTarget} in B3+</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
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
      <div className="glass-panel catalog-filter-panel">
        <div className="filter-panel-header">
          <div className="filter-panel-title">
            <span>Active Spacing {tierName}s:</span>
            {selectedBox !== 'all' && (
              <span className="filter-count-badge">
                {(Array.isArray(selectedBox) ? selectedBox.length : 1)} of {displayedBoxes.length} selected
              </span>
            )}
          </div>
          {selectedBox !== 'all' && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setSelectedBox('all')}
              style={{ fontSize: '11.5px', padding: '2px 8px' }}
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
                onClick={() => handleToggleBox(b)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleBox(b);
                  }
                }}
                className={`tier-pill ${isBoxSelected ? 'active' : ''}`}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: `var(--box-${Math.min(9, b)})`,
                  }}
                />
                <span>
                  {tierName} {b} (+{intervalForBox(b, algorithm)})
                </span>
                <span className="tier-pill-count">
                  {boxCounts[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Track Filters (Multi-Select with 'All Tracks') */}
      <div className="glass-panel catalog-filter-panel">
        {showTrackHint && (
          <div
            role="status"
            data-testid="track-filter-hint"
            className="track-filter-hint"
          >
            <span style={{ flex: '1 1 320px' }}>
              <strong>This filter is for inspecting cards.</strong> It only changes what you see in the catalog. To choose what you
              actually practice, use the <strong>Focus</strong> button in the top bar.
            </span>
            <span style={{ display: 'flex', gap: '8px' }}>
              {onOpenFocus && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: '12.5px' }}
                  onClick={() => {
                    setShowTrackHint(false);
                    onOpenFocus();
                  }}
                >
                  Open Focus
                </button>
              )}
              <button type="button" className="btn btn-outline" style={{ fontSize: '12.5px' }} onClick={() => setShowTrackHint(false)}>
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
              onClick={() => setSelectedTracks(['all'])}
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
            onClick={() => handleToggleTrack('all')}
          >
            {isAllTracks && <Check size={13} />}
            All Topics ({topics.length})
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
                onClick={() => handleToggleTrack(trk)}
                title={isSelected ? `Click to remove ${meta.label}` : `Click to add ${meta.label} to filter`}
              >
                {isSelected && <Check size={12} />}
                <span>{meta.label}</span>
                <span className="track-filter-count">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Filter & Sort Controls Bar */}
      <div className="catalog-controls-bar">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Input */}
          <div className="catalog-search-box">
            <Search size={14} className="catalog-search-icon" />
            <input
              type="text"
              placeholder="Search cards, tags, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="catalog-search-input"
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as CatalogStatusFilter)}
              className="catalog-select"
              aria-label="Filter by Status"
            >
              <option value="all">Status: All</option>
              <option value="attempted">Status: Attempted Only</option>
              <option value="unattempted">Status: Unattempted (New) Only</option>
              <option value="unlocked">Status: Unlocked Only</option>
              {selectedStatus === 'active' && <option value="active">Status: Unlocked / Active</option>}
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
              onChange={(e) => setSelectedDifficulty(e.target.value === 'all' ? 'all' : Number(e.target.value))}
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
              onChange={(e) => setSortOption(e.target.value as CatalogSortOption)}
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
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredTopics.length}</strong> of {topics.length} cards
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleResetFilters}
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

      {/* Catalog Table */}
      <div className="glass-panel catalog-table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="catalog-table">
          <thead>
            <tr>
              <th
                onClick={() => handleHeaderSort('title')}
                className="catalog-th"
                style={{ cursor: 'pointer', minWidth: '220px' }}
                title="Click to sort by card name"
              >
                <div className="catalog-th-btn">
                  Card {renderSortIndicator('title')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('track')}
                className="catalog-th"
                style={{ cursor: 'pointer', minWidth: '150px', whiteSpace: 'nowrap' }}
                title="Click to sort by topic name"
              >
                <div className="catalog-th-btn">
                  Topic {renderSortIndicator('track')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('difficulty')}
                className="catalog-th"
                style={{ cursor: 'pointer', minWidth: '130px', whiteSpace: 'nowrap' }}
                title="Click to sort by difficulty level"
              >
                <div className="catalog-th-btn">
                  Difficulty {renderSortIndicator('difficulty')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('box')}
                className="catalog-th"
                style={{ cursor: 'pointer', minWidth: '100px', whiteSpace: 'nowrap', textAlign: 'center' }}
                title={`Click to sort by ${tierName} level`}
              >
                <div className="catalog-th-btn" style={{ justifyContent: 'center', width: '100%' }}>
                  {tierName} Level {renderSortIndicator('box')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('streak')}
                className="catalog-th"
                style={{ cursor: 'pointer', minWidth: '85px', whiteSpace: 'nowrap', textAlign: 'center' }}
                title="Click to sort by streak"
              >
                <div className="catalog-th-btn" style={{ justifyContent: 'center', width: '100%' }}>
                  Streak {renderSortIndicator('streak')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('status')}
                className="catalog-th"
                style={{ cursor: 'pointer', minWidth: '120px', whiteSpace: 'nowrap' }}
                title="Click to sort by card status"
              >
                <div className="catalog-th-btn">
                  Status {renderSortIndicator('status')}
                </div>
              </th>
              <th className="catalog-th" style={{ minWidth: '175px', whiteSpace: 'nowrap', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTopics.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No cards match your current filter criteria.
                </td>
              </tr>
            ) : (
              filteredTopics.map((topic) => {
                const trkMeta = getTrackMeta(topic.track);
                return (
                  <tr
                    key={topic.id}
                    className="catalog-tr"
                    style={{
                      backgroundColor: topic.deactivated
                        ? (isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.35)')
                        : topic.status === 'locked'
                        ? (isLight ? 'rgba(0, 0, 0, 0.025)' : 'rgba(0,0,0,0.2)')
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
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
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
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-orange, #f97316)', fontWeight: 600 }}>
                          <Flame size={13} /> {topic.streak}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>0</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="catalog-td">
                      {topic.deactivated ? (
                        <span className="badge status-badge-deactivated" title="Card pulled out of active study rotation">
                          <Archive size={11} />
                          <span>Deactivated</span>
                        </span>
                      ) : topic.status === 'locked' ? (
                        <span className="badge status-badge-locked" title="Locked in reserve deck">
                          <Lock size={11} />
                          <span>Locked</span>
                        </span>
                      ) : isCardAttempted(topic) ? (
                        <span className="badge status-badge-attempted" title="Active card in study rotation (attempted at least once)">
                          <CheckCircle2 size={11} />
                          <span>Attempted</span>
                        </span>
                      ) : (
                        <span className="badge status-badge-active" title="Unlocked card ready for initial practice">
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
                              style={{ padding: '5px 8px', fontSize: '12px', color: 'var(--text-muted)' }}
                              onClick={() => setTopicToDeactivate(topic)}
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

      {/* Lightweight Deactivate Confirmation Modal */}
      {topicToDeactivate && (
        <div
          className="modal-overlay"
          onClick={() => setTopicToDeactivate(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-confirm-title"
        >
          <div
            className="modal-content"
            style={{ maxWidth: '440px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--accent-orange, #f97316)' }}>
              <Archive size={22} />
              <h3 id="deactivate-confirm-title" style={{ fontSize: '17px', fontWeight: 600 }}>
                Deactivate Card
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '22px' }}>
              Deactivate card '{topicToDeactivate.title}'? It will be pulled out of your active spaced repetition study cycle. You can reactivate it at any time from this catalog table.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setTopicToDeactivate(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (onToggleDeactivate) onToggleDeactivate(topicToDeactivate.id);
                  else if (onDeleteTopic) onDeleteTopic(topicToDeactivate.id);
                  setTopicToDeactivate(null);
                }}
              >
                Deactivate Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
