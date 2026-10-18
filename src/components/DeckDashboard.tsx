import { DifficultyBadge } from './DifficultyBadge';
import { DeckStatsWidget } from './DeckStatsWidget';
import { useState, useRef, useMemo } from 'react';
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
} from '../lib/leitner';
import type { TopicItem, LeitnerDeckState } from '../lib/leitner';
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
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Sparkles,
  X,
} from 'lucide-react';

export type CatalogSortOption =
  | 'track-asc'
  | 'track-desc'
  | 'difficulty-asc'
  | 'difficulty-desc'
  | 'streak-desc'
  | 'streak-asc'
  | 'box-desc'
  | 'box-asc'
  | 'title-asc'
  | 'title-desc'
  | 'due-asc'
  | 'due-desc'
  | 'status-asc'
  | 'status-desc';

export type CatalogStatusFilter = 'all' | 'active' | 'locked' | 'due' | 'scheduled' | 'mastered';

const LIGHT_TRACK_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  'async-js': {
    color: '#0369A1',
    bg: '#E0F2FE',
    border: '#7DD3FC',
  },
  'react': {
    color: '#0E7490',
    bg: '#CFFAFE',
    border: '#67E8F9',
  },
  'algorithms': {
    color: '#B45309',
    bg: '#FEF3C7',
    border: '#FCD34D',
  },
  'typescript-patterns': {
    color: '#1E40AF',
    bg: '#DBEAFE',
    border: '#93C5FD',
  },
  'js-language': {
    color: '#C2410C',
    bg: '#FFEDD5',
    border: '#FDBA74',
  },
  'dom-browser': {
    color: '#4D7C0F',
    bg: '#ECFCCB',
    border: '#BEF264',
  },
  'react-components': {
    color: '#0284C7',
    bg: '#E0F2FE',
    border: '#7DD3FC',
  },
  'testing-tooling': {
    color: '#BE123C',
    bg: '#FFE4E6',
    border: '#FDA4AF',
  },
  'js-utilities': {
    color: '#047857',
    bg: '#D1FAE5',
    border: '#6EE7B7',
  },
};

interface DeckDashboardProps {
  state: LeitnerDeckState;
  theme?: AppTheme;
  onSelectCardToPractice: (card: TopicItem) => void;
  onToggleLock: (topicId: string, currentStatus: 'active' | 'locked') => void;
  onResetBox: (topicId: string) => void;
  onDeleteTopic: (topicId: string) => void;
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
  const [selectedTracks, setSelectedTracks] = useState<string[]>(['all']);
  const [selectedBox, setSelectedBox] = useState<number | number[] | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<CatalogStatusFilter>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | 'all'>('all');
  const [sortOption, setSortOption] = useState<CatalogSortOption>('track-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [topicToDelete, setTopicToDelete] = useState<TopicItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (Array.isArray(box)) {
      if (
        Array.isArray(selectedBox) &&
        selectedBox.length === box.length &&
        box.every((b) => selectedBox.includes(b))
      ) {
        setSelectedBox('all');
      } else {
        setSelectedBox(box);
      }
      return;
    }
    if (selectedBox === box) {
      setSelectedBox('all');
    } else {
      setSelectedBox(box);
    }
  };

  const handleResetFilters = () => {
    setSelectedTracks(['all']);
    setSelectedBox('all');
    setSelectedStatus('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
    setSortOption('track-asc');
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
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
        return a.title.localeCompare(b.title);
      }
      case 'status-desc': {
        if (a.status !== b.status) return a.status === 'locked' ? -1 : 1;
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
      return <ArrowUp size={12} style={{ color: isLight ? '#2B3A8C' : 'var(--accent-cyan)' }} />;
    }
    if (isDesc) {
      return <ArrowDown size={12} style={{ color: isLight ? '#2B3A8C' : 'var(--accent-cyan)' }} />;
    }
    return <ArrowUpDown size={11} style={{ opacity: 0.35 }} />;
  };

  // Filtered and sorted topics
  const filteredTopics = topics
    .filter((t) => {
      if (!isAllTracks && !selectedTracks.includes(t.track)) return false;
      if (selectedBox !== 'all') {
        if (Array.isArray(selectedBox)) {
          if (!selectedBox.includes(t.box)) return false;
        } else if (algorithm === 'graduated-interval' && selectedBox === 5) {
          if (t.box < 5) return false;
        } else {
          if (t.box !== selectedBox) return false;
        }
      }
      if (selectedStatus === 'active' && t.status !== 'active') return false;
      if (selectedStatus === 'locked' && t.status !== 'locked') return false;
      if (selectedStatus === 'due' && (t.status !== 'active' || t.nextEligibleTrial > totalCompletedReviews)) return false;
      if (selectedStatus === 'scheduled' && (t.status !== 'active' || t.nextEligibleTrial <= totalCompletedReviews)) return false;
      if (selectedStatus === 'mastered') {
        const isMastered = t.status === 'active' && (algorithm === 'graduated-interval' ? t.box >= 5 : t.box === 5);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Catalog & Deck Performance
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          {/* Total Reviews */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Completed Reviews</div>
            <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: 'var(--accent-cyan)' }}>
              #{totalCompletedReviews}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Global trial progression
            </div>
          </div>

          {/* Active vs Locked */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Deck Distribution</div>
            <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>
              {activeCount} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ {topics.length}</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {lockedCount} cards locked in reserve
            </div>
          </div>

          {/* Mastered */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              {algorithm === 'graduated-interval' ? 'Mastered / Long-term (Tier 5+)' : 'Mastered (Box 5)'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: '#34d399' }}>
              {masteredCount}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {algorithm === 'graduated-interval' ? '+35 to +800+ review intervals' : '+45 review interval reached'}
            </div>
          </div>

          {/* Staged Unlock Progress */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

        {/* Right: Rounded Stats & Visual Chart Widget */}
        <DeckStatsWidget
          state={state}
          topics={topics}
          theme={theme}
          selectedTracks={selectedTracks}
          selectedBox={selectedBox}
          onSelectExclusiveTrack={handleExclusiveTrackSelect}
          onSelectExclusiveTracks={handleExclusiveMultiTrackSelect}
          onSelectExclusiveBox={handleExclusiveBoxSelect}
          onSelectTrack={handleExclusiveTrackSelect}
          onSelectCardToPractice={onSelectCardToPractice}
        />
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
          {displayedBoxes.map((b, idx) => {
            const isBoxSelected =
              selectedBox !== 'all' &&
              (Array.isArray(selectedBox) ? selectedBox.includes(b) : selectedBox === b);

            return (
              <div
                key={b}
                onClick={() => setSelectedBox(isBoxSelected ? 'all' : b)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: isBoxSelected ? 'var(--bg-elevated)' : 'rgba(255, 255, 255, 0.03)',
                  border: isBoxSelected ? `1px solid var(--box-${Math.min(9, b)})` : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: `var(--box-${Math.min(9, b)})`,
                  }}
                />
                <span style={{ fontSize: '12.5px', fontWeight: 600 }}>
                  {tierName} {b} (+{intervalForBox(b, algorithm)})
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
            );
          })}
        </div>
      </div>
        {/* Track Filters (Multi-Select with 'All Tracks') */}
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '100%',
          }}
        >
          {showTrackHint && (
            <div
              role="status"
              data-testid="track-filter-hint"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'var(--text-primary)',
                backgroundColor: 'rgba(56, 189, 248, 0.10)',
                border: '1px solid rgba(56, 189, 248, 0.45)',
              }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Filter Tracks:
              </span>
              {!isAllTracks && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: isLight ? 'rgba(68, 85, 170, 0.12)' : 'rgba(56, 189, 248, 0.15)',
                    color: isLight ? '#4455AA' : 'var(--accent-cyan)',
                    border: isLight ? '1px solid #C4C3BA' : '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
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
                Reset to All Tracks
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {/* 'All Tracks' Pill */}
            <button
              key="all"
              type="button"
              className="btn"
              onClick={() => handleToggleTrack('all')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: isAllTracks ? (isLight ? '#4455AA' : 'var(--bg-elevated)') : (isLight ? '#FFFFFF' : 'transparent'),
                borderColor: isAllTracks ? (isLight ? '#2B3A8C' : 'var(--accent-cyan)') : (isLight ? '#C4C3BA' : 'var(--border-subtle)'),
                color: isAllTracks ? (isLight ? '#FFFFFF' : 'var(--text-primary)') : (isLight ? '#333333' : 'var(--text-muted)'),
                fontWeight: isAllTracks ? 700 : 500,
                boxShadow: isAllTracks && !isLight ? '0 0 10px rgba(56, 189, 248, 0.15)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isAllTracks && <Check size={13} />}
              All Tracks ({topics.length})
            </button>

            {/* Individual Tracks */}
            {allAvailableTracks.map((trk) => {
              const isSelected = !isAllTracks && selectedTracks.includes(trk);
              const meta = getTrackMeta(trk);
              const count = trackCounts[trk] || 0;
              const lightTrk = LIGHT_TRACK_STYLES[trk] || { color: '#334155', bg: '#F1F5F9', border: '#CBD5E1' };

              return (
                <button
                  key={trk}
                  type="button"
                  className="btn"
                  onClick={() => handleToggleTrack(trk)}
                  title={isSelected ? `Click to remove ${meta.label}` : `Click to add ${meta.label} to filter`}
                  style={{
                    padding: '6px 11px',
                    fontSize: '12px',
                    backgroundColor: isSelected
                      ? (isLight ? lightTrk.bg : 'rgba(56, 189, 248, 0.15)')
                      : (isLight ? '#FFFFFF' : 'transparent'),
                    borderColor: isSelected
                      ? (isLight ? lightTrk.border : 'var(--accent-cyan)')
                      : (isLight ? '#C4C3BA' : 'var(--border-subtle)'),
                    color: isSelected
                      ? (isLight ? lightTrk.color : 'var(--text-primary)')
                      : (isLight ? '#475569' : 'var(--text-secondary)'),
                    fontWeight: isSelected ? 700 : 500,
                    boxShadow: isSelected && !isLight ? '0 0 8px rgba(56, 189, 248, 0.2)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isSelected && <Check size={12} />}
                  <span>{meta.label}</span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      opacity: isSelected ? 0.9 : 0.6,
                      padding: '1px 5px',
                      borderRadius: '8px',
                      backgroundColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search, Filter & Sort Controls Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 220px', maxWidth: '340px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isLight ? '#555555' : 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search topics, tags, or tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="code-buffer"
                style={{
                  height: '34px',
                  paddingLeft: '32px',
                  paddingRight: '10px',
                  fontSize: '12.5px',
                  width: '100%',
                  backgroundColor: isLight ? '#FFFFFF' : 'var(--bg-editor)',
                  color: isLight ? '#1C1C1C' : '#e2e8f0',
                  border: isLight ? '1.5px solid #8A887E' : '1px solid var(--border-medium)',
                }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CatalogStatusFilter)}
                className="code-buffer"
                style={{
                  height: '34px',
                  padding: '4px 10px',
                  fontSize: '12.5px',
                  backgroundColor: isLight ? '#FFFFFF' : 'var(--bg-elevated)',
                  color: isLight ? '#1C1C1C' : 'var(--text-primary)',
                  border: isLight ? '1.5px solid #8A887E' : '1px solid var(--border-medium)',
                  width: 'auto',
                }}
                aria-label="Filter by Status"
              >
                <option value="all">Status: All</option>
                <option value="active">Status: Active Only</option>
                <option value="locked">Status: Locked (Reserve) Only</option>
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
                className="code-buffer"
                style={{
                  height: '34px',
                  padding: '4px 10px',
                  fontSize: '12.5px',
                  backgroundColor: isLight ? '#FFFFFF' : 'var(--bg-elevated)',
                  color: isLight ? '#1C1C1C' : 'var(--text-primary)',
                  border: isLight ? '1.5px solid #8A887E' : '1px solid var(--border-medium)',
                  width: 'auto',
                }}
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
                className="code-buffer"
                style={{
                  height: '34px',
                  padding: '4px 10px',
                  fontSize: '12.5px',
                  backgroundColor: isLight ? '#FFFFFF' : 'var(--bg-elevated)',
                  color: isLight ? '#1C1C1C' : 'var(--text-primary)',
                  border: isLight ? '1.5px solid #8A887E' : '1px solid var(--border-medium)',
                  width: 'auto',
                }}
                aria-label="Sort Topics"
              >
                <option value="track-asc">Sort: Track (A-Z) → Difficulty (Default)</option>
                <option value="track-desc">Sort: Track (Z-A)</option>
                <option value="streak-desc">Sort: Streak (Highest First 🔥)</option>
                <option value="streak-asc">Sort: Streak (Lowest First)</option>
                <option value="difficulty-asc">Sort: Difficulty (Easiest First)</option>
                <option value="difficulty-desc">Sort: Difficulty (Hardest First)</option>
                <option value="box-desc">Sort: {tierName} (Highest First)</option>
                <option value="box-asc">Sort: {tierName} (Lowest First)</option>
                <option value="title-asc">Sort: Topic Name (A-Z)</option>
                <option value="title-desc">Sort: Topic Name (Z-A)</option>
                <option value="due-asc">Sort: Next Trial (Ready now first)</option>
              </select>
            </div>
          </div>

          {/* Results Count & Reset Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredTopics.length}</strong> of {topics.length} topics
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
              <th
                onClick={() => handleHeaderSort('title')}
                style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by topic name"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Topic {renderSortIndicator('title')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('track')}
                style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by track name"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Track {renderSortIndicator('track')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('difficulty')}
                style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by difficulty level"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Difficulty {renderSortIndicator('difficulty')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('box')}
                style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
                title={`Click to sort by ${tierName} level`}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {tierName} Level {renderSortIndicator('box')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('streak')}
                style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by streak"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Streak {renderSortIndicator('streak')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('due')}
                style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by next eligible trial"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Next Eligible Trial {renderSortIndicator('due')}
                </div>
              </th>
              <th
                onClick={() => handleHeaderSort('status')}
                style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by card status"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Status {renderSortIndicator('status')}
                </div>
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTopics.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No topics match your current filter criteria.
                </td>
              </tr>
            ) : (
              filteredTopics.map((topic) => {
                const trkMeta = getTrackMeta(topic.track);
                const isEligible = topic.status === 'active' && topic.nextEligibleTrial <= totalCompletedReviews;

                const lightTrk = LIGHT_TRACK_STYLES[topic.track] || {
                  color: '#334155',
                  bg: '#F1F5F9',
                  border: '#CBD5E1',
                };
                const trkBg = isLight ? lightTrk.bg : trkMeta.bg;
                const trkColor = isLight ? lightTrk.color : trkMeta.color;
                const trkBorder = isLight ? lightTrk.border : trkMeta.border;

                return (
                  <tr
                    key={topic.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.1s',
                      backgroundColor: topic.status === 'locked' ? (isLight ? 'rgba(0, 0, 0, 0.025)' : 'rgba(0,0,0,0.2)') : 'transparent',
                    }}
                  >
                    {/* Title & Tags */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, color: topic.status === 'active' ? 'var(--text-primary)' : (isLight ? '#475569' : 'var(--text-muted)') }}>
                        {topic.title}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {topic.tags.slice(0, 3).map((tg) => (
                          <span
                            key={tg}
                            style={{
                              fontSize: '10.5px',
                              color: isLight ? '#334155' : 'var(--text-dim)',
                              backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                              border: isLight ? '1px solid #CBD5E1' : 'none',
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
                          backgroundColor: trkBg,
                          color: trkColor,
                          border: `1px solid ${trkBorder}`,
                          fontSize: '11px',
                          fontWeight: isLight ? 600 : 500,
                        }}
                      >
                        {trkMeta.label}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <DifficultyBadge card={topic} showLabel={true} />
                    </td>

                    {/* Box */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      {topic.status === 'active' ? (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: isLight ? 'rgba(0, 0, 0, 0.03)' : `rgba(255, 255, 255, 0.05)`,
                            border: `1.5px solid var(--box-${Math.min(9, topic.box)})`,
                            color: `var(--box-${Math.min(9, topic.box)})`,
                            fontWeight: 700,
                          }}
                        >
                          {tierName} {topic.box}
                        </span>
                      ) : (
                        <span style={{ color: isLight ? '#64748B' : 'var(--text-dim)', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    {/* Streak */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      {topic.status === 'active' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f97316', fontWeight: 600 }}>
                          <Flame size={13} /> {topic.streak}
                        </span>
                      ) : (
                        <span style={{ color: isLight ? '#64748B' : 'var(--text-dim)' }}>0</span>
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
                              fontWeight: isEligible ? 700 : 500,
                              color: isEligible ? (isLight ? '#15803D' : '#34d399') : (isLight ? '#334155' : 'var(--text-secondary)'),
                            }}
                          >
                            Trial #{topic.nextEligibleTrial}
                          </span>
                          {isEligible && (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: isLight ? '#DCFCE7' : 'rgba(52, 211, 153, 0.15)',
                                color: isLight ? '#15803D' : '#34d399',
                                border: isLight ? '1px solid #86EFAC' : 'none',
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '1px 5px',
                              }}
                            >
                              Ready
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: isLight ? '#64748B' : 'var(--text-dim)', fontSize: '12px', fontWeight: 500 }}>Locked</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      {topic.status === 'active' ? (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: isLight ? '#E0F2FE' : 'rgba(56, 189, 248, 0.1)',
                            color: isLight ? '#0284C7' : '#38bdf8',
                            border: isLight ? '1px solid #7DD3FC' : 'none',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          <Unlock size={11} /> Active
                        </span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: isLight ? '#F1F5F9' : 'rgba(148, 163, 184, 0.08)',
                            color: isLight ? '#334155' : 'var(--text-muted)',
                            border: isLight ? '1px solid #94A3B8' : 'none',
                            fontSize: '11px',
                            fontWeight: 600,
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

                        <button
                          className="btn btn-danger"
                          style={{ padding: '5px 8px', fontSize: '12px' }}
                          onClick={() => setTopicToDelete(topic)}
                          title={`Delete topic '${topic.title}'`}
                          aria-label={`Delete topic '${topic.title}'`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Lightweight Delete Confirmation Modal */}
      {topicToDelete && (
        <div
          className="modal-overlay"
          onClick={() => setTopicToDelete(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div
            className="modal-content"
            style={{ maxWidth: '440px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--accent-rose)' }}>
              <Trash2 size={22} />
              <h3 id="delete-confirm-title" style={{ fontSize: '17px', fontWeight: 600 }}>
                Delete Topic
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '22px' }}>
              Delete topic '{topicToDelete.title}'? This cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setTopicToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.85)', color: '#ffffff' }}
                onClick={() => {
                  onDeleteTopic(topicToDelete.id);
                  setTopicToDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
