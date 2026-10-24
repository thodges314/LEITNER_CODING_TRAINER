import { useState, useEffect } from 'react';
import {
  loadDeckState,
  saveDeckState,
  commitCardReview,
  getNextCard,
  unlockSingleCard,
  lockSingleCard,
  resetCardBox,
  addCustomTopicToDeck,
  deleteTopicFromDeck,
  getDefaultDeckState,
  EMPTY_FILTER,
  isFilterActive,
  scheduleFilter,
  CARD_PACKS,
  visibleTopics,
  setEnabledPacks,
  setPracticeFilter,
  savePreset,
  deletePreset,
  getSchedulingAlgorithm,
  setSchedulingAlgorithm,
} from './lib/leitner';
import type {
  PracticeFilter,
  LeitnerDeckState,
  TopicItem,
  TrackType,
  SpacedAlgorithm,
} from './lib/leitner';
import { getStoredApiKey, getStoredProvider, getStoredModel } from './lib/ai';
import { clearDraft, clearAllDrafts } from './lib/drafts';
import { getStoredTheme, setStoredTheme, applyThemeToDocument } from './lib/theme';
import type { AppTheme } from './lib/theme';
import { PracticeArena } from './components/PracticeArena';
import { DeckDashboard } from './components/DeckDashboard';
import { AddTopicModal } from './components/AddTopicModal';
import { FEATURES } from './lib/features';
import { SettingsModal } from './components/SettingsModal';
import { FocusModal } from './components/FocusModal';
import { AboutModal } from './components/AboutModal';
import { BackupAdvisoryModal } from './components/BackupAdvisoryModal';
import { recordProblemCompletion, markBackupAdvisorySeen } from './lib/backupAdvisory';
import { DOUBLE_BACK_WINDOW_MS, useBackNavigation } from './lib/backNavigation';
import { isFirstVisit, markWelcomed } from './lib/welcome';
import { GuidedTour } from './components/GuidedTour';
import { AiRecommendationPopover } from './components/AiRecommendationPopover';
import { ActiveModelStatusPopover } from './components/ActiveModelStatusPopover';
import { MobileNoticeModal } from './components/MobileNoticeModal';
import {
  Terminal,
  Layers,
  Settings,
  Zap,
  Sparkles,
  Crosshair,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { getThemeColors } from './styles/colors';


// Evaluated once at module load, before the app creates and saves its default deck.
const FIRST_VISIT = isFirstVisit();

export function App() {
  const [deckState, setDeckState] = useState<LeitnerDeckState>(() => loadDeckState());
  const [activeView, setActiveView] = useState<'practice' | 'dashboard'>('practice');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [theme, setThemeState] = useState<AppTheme>(() => getStoredTheme());

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const handleSetTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

  const handleToggleTheme = () => {
    const next = theme === 'apple-gsos' ? 'dark' : 'apple-gsos';
    handleSetTheme(next);
  };

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(FIRST_VISIT);
  const [welcomeMode, setWelcomeMode] = useState(FIRST_VISIT);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [backHint, setBackHint] = useState(false);
  const [isAiRecommendOpen, setIsAiRecommendOpen] = useState(false);
  const [isAiStatusOpen, setIsAiStatusOpen] = useState(false);
  const [isBackupAdvisoryOpen, setIsBackupAdvisoryOpen] = useState(false);
  const [highlightExport, setHighlightExport] = useState(false);
  const [aiSettingsVersion, setAiSettingsVersion] = useState(0);
  const [reinforcingCardId, setReinforcingCardId] = useState<string | null>(null);
  const filter = deckState.practiceFilter ?? EMPTY_FILTER;
  const filterActive = isFilterActive(filter);
  const algorithm = getSchedulingAlgorithm(deckState);
  const shownTopics = visibleTopics(deckState); // cards of disabled optional packs are hidden everywhere

  // Unlocked notification toast
  const [unlockToast, setUnlockToast] = useState<string | null>(null);

  // Back = to the deck and stay; a quick second Back leaves the app.
  useBackNavigation({ view: activeView, onShowDeck: () => setActiveView('dashboard'), onHint: () => setBackHint(true) });
  useEffect(() => {
    if (!backHint) return undefined;
    const id = setTimeout(() => setBackHint(false), DOUBLE_BACK_WINDOW_MS);
    return () => clearTimeout(id);
  }, [backHint]);

  // Derive currently active card
  const currentCard: TopicItem | null = (() => {
    if (selectedCardId) {
      const found = shownTopics.find((t) => t.id === selectedCardId && t.status === 'active');
      if (found) return found;
    }
    return getNextCard(
      deckState.topics,
      deckState.totalCompletedReviews,
      deckState.lastReviewedTrack,
      undefined,
      scheduleFilter(deckState),
      algorithm
    );
  })();

  const handleCommitReview = (passed: boolean) => {
    if (!currentCard) return;
    clearDraft(currentCard.id);

    const { shouldShowAdvisory } = recordProblemCompletion();
    if (shouldShowAdvisory) {
      setIsBackupAdvisoryOpen(true);
    }

    const { nextState, newlyUnlockedCount, updatedCard } = commitCardReview(
      deckState,
      currentCard.id,
      passed,
      algorithm
    );
    setDeckState(nextState);

    if (newlyUnlockedCount > 0) {
      setUnlockToast(`🎉 Staged Milestone Achieved! ${newlyUnlockedCount} locked cards have been unlocked to your active rotation.`);
      setTimeout(() => setUnlockToast(null), 5000);
    }

    // If failed, enter immediate reinforcement drill for this card (practice-only, zero stat impact)
    if (!passed) {
      clearDraft(currentCard.id);
      setReinforcingCardId(currentCard.id);
      setSelectedCardId(currentCard.id);
      return;
    }

    // Cold-start review passed: clear any reinforcement drill state and advance
    setReinforcingCardId(null);
    const next = getNextCard(
      nextState.topics,
      nextState.totalCompletedReviews,
      updatedCard.track,
      currentCard.id,
      scheduleFilter(deckState),
      algorithm
    );
    if (next) clearDraft(next.id);
    setSelectedCardId(next?.id ?? null);
  };

  const handleFinishReinforcement = () => {
    if (!currentCard) return;
    clearDraft(currentCard.id);

    setReinforcingCardId(null);
    const next = getNextCard(
      deckState.topics,
      deckState.totalCompletedReviews,
      currentCard.track,
      currentCard.id,
      scheduleFilter(deckState),
      algorithm
    );
    if (next) clearDraft(next.id);
    setSelectedCardId(next?.id ?? null);
  };

  const handleSkipCard = () => {
    if (!currentCard) return;
    clearDraft(currentCard.id);
    setReinforcingCardId(null);
    const next = getNextCard(
      deckState.topics,
      deckState.totalCompletedReviews,
      currentCard.track,
      currentCard.id,
      scheduleFilter(deckState),
      algorithm
    );
    if (next) clearDraft(next.id);
    setSelectedCardId(next?.id ?? null);
  };

  const handlePacksChange = (packs: string[]) => {
    setDeckState(setEnabledPacks(deckState, packs));
    setSelectedCardId(null);
  };

  const packSummary = Object.entries(CARD_PACKS).map(([id, meta]) => ({
    id,
    label: meta.label,
    description: meta.description,
    count: deckState.topics.filter((t) => t.pack === id).length,
    enabled: (deckState.enabledPacks ?? []).includes(id),
  }));

  const handleAlgorithmChange = (nextAlgo: SpacedAlgorithm) => {
    const next = setSchedulingAlgorithm(deckState, nextAlgo);
    setDeckState(next);
  };

  const handleFilterChange = (next: PracticeFilter) => {
    setReinforcingCardId(null);
    setDeckState(setPracticeFilter(deckState, next));
    setSelectedCardId(null);
  };

  const handleSelectCardToPractice = (card: TopicItem) => {
    setReinforcingCardId(null);
    clearDraft(card.id);
    // If card is locked, unlock it first
    if (card.status === 'locked') {
      const updated = unlockSingleCard(deckState, card.id);
      setDeckState(updated);
    }
    setSelectedCardId(card.id);
    setActiveView('practice');
  };

  const handleToggleLock = (topicId: string, currentStatus: 'active' | 'locked') => {
    const next = currentStatus === 'active'
      ? lockSingleCard(deckState, topicId)
      : unlockSingleCard(deckState, topicId);
    setDeckState(next);
  };

  const handleResetBox = (topicId: string) => {
    const next = resetCardBox(deckState, topicId);
    setDeckState(next);
  };

  const handleDeleteTopic = (topicId: string) => {
    const next = deleteTopicFromDeck(deckState, topicId);
    setDeckState(next);
    if (selectedCardId === topicId) setSelectedCardId(null);
  };

  const handleAddTopic = (newTopic: {
    id: string;
    track: TrackType;
    title: string;
    promptSeed: string;
    tags: string[];
    targetTime?: string;
    targetSpace?: string;
    complexityExplanation?: string;
    starterCode?: string;
    referenceSolution?: string;
    testHarness?: string;
    difficulty?: number;
    concept?: string;
  }) => {
    const next = addCustomTopicToDeck(deckState, newTopic);
    setDeckState(next);
    setSelectedCardId(newTopic.id);
    setActiveView('practice');
  };

  const handleResetDeckToDefaults = () => {
    const defaultDeck = getDefaultDeckState();
    if (confirm(`Reset entire deck back to the ${defaultDeck.topics.length} original topics? All custom progress will be reset.`)) {
      clearAllDrafts();
      saveDeckState(defaultDeck);
      setDeckState(defaultDeck);
      setSelectedCardId(defaultDeck.topics[0].id);
    }
  };

  // Read AI settings with aiSettingsVersion dependency for live updates
  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();
  const model = getStoredModel();
  void aiSettingsVersion;
  const activeCount = shownTopics.filter((t) => t.status === 'active').length;

  const colors = getThemeColors(theme);

  return (
    <div className="app-shell">
      {/* Mobile Experience Notice Modal */}
      <MobileNoticeModal />

      {/* Global Header */}
      <header className="app-header">
        <div className="app-header-inner">
          {/* Brand Logo & Name */}
          <div className="app-brand">
            <div className="app-brand-logo">
              <Zap size={20} fill="white" />
            </div>
            <span className="app-brand-title">Leitner Coding Trainer</span>
          </div>

          {/* View Toggle Navigation */}
          <nav className="nav-view-toggle app-nav-tabs" data-tour="deck-nav">
            <button
              className={`nav-tab-btn ${activeView === 'practice' ? 'active' : ''}`}
              onClick={() => setActiveView('practice')}
            >
              <Terminal size={15} color={activeView === 'practice' ? (theme === 'apple-gsos' ? '#ffffff' : colors.accentCyan) : undefined} />
              Practice Arena
            </button>
            <button
              className={`nav-tab-btn ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
              title={`${activeCount} active in rotation • ${shownTopics.length - activeCount} locked in reserve`}
            >
              <Layers size={15} color={activeView === 'dashboard' ? (theme === 'apple-gsos' ? '#ffffff' : colors.accentPurple) : undefined} />
              Deck Catalog ({shownTopics.length})
            </button>
          </nav>

          {/* Quick Info & Action Buttons */}
          <div className="app-header-right">
            <button
              data-tour="focus"
              className={`btn btn-outline ${filterActive ? 'filter-active' : ''}`}
              onClick={() => setIsFocusOpen(true)}
              title="Choose which tracks and tags to practice"
            >
              <Crosshair size={15} />
              {filterActive ? 'Focus on' : 'Focus'}
            </button>

            {/* AI Engine Status Indicator */}
            <div style={{ position: 'relative' }}>
              {apiKey ? (
                <button
                  type="button"
                  className={`header-action-badge ${isAiStatusOpen ? 'active' : ''}`}
                  onClick={() => setIsAiStatusOpen((prev) => !prev)}
                  title={`AI Engine: ${provider.toUpperCase()} (${model}) • Click to view live rate limits & quota`}
                  aria-label={`AI Engine: ${provider.toUpperCase()}`}
                  aria-haspopup="dialog"
                  aria-expanded={isAiStatusOpen}
                >
                  <Sparkles size={13} color={colors.accentPrimary} />
                  <span>AI: {provider.toUpperCase()}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={`header-action-badge ${isAiRecommendOpen ? 'active' : ''}`}
                  onClick={() => setIsAiRecommendOpen((prev) => !prev)}
                  title="Operating in Keyless mode • Click to learn how adding an AI key in Settings unlocks live mentoring & deeper features"
                  aria-label="Operating in Keyless mode. Click to see AI recommendation"
                  aria-haspopup="dialog"
                  aria-expanded={isAiRecommendOpen}
                >
                  <ShieldCheck size={13} color={colors.textDim} />
                  <span>Keyless Engine</span>
                  <Sparkles size={11} color={colors.accentPrimary} style={{ opacity: 0.7 }} />
                </button>
              )}

              {/* Recommendation Popover for Keyless Mode */}
              <AiRecommendationPopover
                isOpen={isAiRecommendOpen && !apiKey}
                onClose={() => setIsAiRecommendOpen(false)}
                onOpenSettings={() => {
                  setIsAiRecommendOpen(false);
                  setIsSettingsOpen(true);
                }}
              />

              {/* Status Popover for Keyed Active Mode */}
              <ActiveModelStatusPopover
                isOpen={isAiStatusOpen && !!apiKey}
                onClose={() => setIsAiStatusOpen(false)}
                onOpenSettings={() => {
                  setIsAiStatusOpen(false);
                  setIsSettingsOpen(true);
                }}
                provider={provider}
                model={model}
                apiKey={apiKey}
              />
            </div>

            {/* Dedicated Settings Button */}
            <button
              data-tour="settings"
              className="btn btn-outline"
              onClick={() => setIsSettingsOpen(true)}
              title="Configure Spaced Repetition method, theme, and AI engine"
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>

            {/* Header Theme Switcher Toggle Button */}
            <button
              className="btn btn-outline"
              data-testid="theme-toggle-btn"
              onClick={handleToggleTheme}
              title={theme === 'apple-gsos' ? 'Switch to Synthwave / Nightcore Mode' : 'Switch to Apple IIGS / GS/OS Light Mode'}
              aria-label={theme === 'apple-gsos' ? 'Switch to Synthwave / Nightcore Mode' : 'Switch to Apple IIGS / GS/OS Light Mode'}
            >
              {theme === 'apple-gsos' ? (
                <>
                  <Moon size={14} color={colors.accentPrimary} />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun size={14} color={colors.accentAmber} />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Staged Unlock Notification Toast */}
      {unlockToast && (
        <div className="app-unlock-toast">
          <Sparkles size={18} />
          <span>{unlockToast}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="app-main">
        {activeView === 'practice' ? (
          <PracticeArena
            key={`${currentCard?.id || 'none'}-${deckState.totalCompletedReviews}-${reinforcingCardId ? 'reinforce' : 'cold'}-${aiSettingsVersion}`}
            currentCard={currentCard}
            totalCompletedReviews={deckState.totalCompletedReviews}
            activeDeckSize={activeCount}
            algorithm={algorithm}
            theme={theme}
            onCommitReview={handleCommitReview}
            onSkipCard={handleSkipCard}
            onOpenDeckView={() => setActiveView('dashboard')}
            isReinforcement={Boolean(reinforcingCardId && currentCard && reinforcingCardId === currentCard.id)}
            onFinishReinforcement={handleFinishReinforcement}
          />
        ) : (
          <DeckDashboard
            theme={theme}
            onOpenFocus={() => setIsFocusOpen(true)}
            state={deckState}
            onSelectCardToPractice={handleSelectCardToPractice}
            onToggleLock={handleToggleLock}
            onResetBox={handleResetBox}
            onDeleteTopic={handleDeleteTopic}
            onStateUpdated={(newState) => setDeckState(newState)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            highlightExport={highlightExport}
            onDismissHighlightExport={() => setHighlightExport(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          <span>© {new Date().getFullYear()} Thomas Hodges</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            className="footer-link"
          >
            About
          </button>
          <span style={{ color: 'var(--border-medium)' }}>•</span>
          <a
            href="https://www.javascriptonline.org"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Portfolio
          </a>
          <span style={{ color: 'var(--border-medium)' }}>•</span>
          <a
            href="https://www.linkedin.com/in/thomas-hodges/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            LinkedIn
          </a>
          <span style={{ color: 'var(--border-medium)' }}>•</span>
          <a
            href="https://github.com/thodges314"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </div>
      </footer>

      {/* Modals */}
      {isTourOpen && <GuidedTour onClose={() => setIsTourOpen(false)} />}

      <AboutModal
        isOpen={isAboutOpen}
        welcome={welcomeMode}
        onStartTour={() => {
          // Close About/Welcome, show the practice screen, then start once its anchors are on the page.
          setIsAboutOpen(false);
          if (welcomeMode) {
            markWelcomed();
            setWelcomeMode(false);
          }
          setActiveView('practice');
          window.setTimeout(() => setIsTourOpen(true), 150);
        }}
        onClose={() => {
          setIsAboutOpen(false);
          if (welcomeMode) {
            markWelcomed();
            setWelcomeMode(false);
          }
        }}
      />

      {backHint && (
        <div role="status" className="back-hint-toast">
          Press Back again to leave the app
        </div>
      )}


      {FEATURES.quickAdd && (
        <AddTopicModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddTopic={handleAddTopic}
        />
      )}

      <BackupAdvisoryModal
        isOpen={isBackupAdvisoryOpen}
        onAgree={() => {
          markBackupAdvisorySeen();
          setIsBackupAdvisoryOpen(false);
          setHighlightExport(true);
          setActiveView('dashboard');
        }}
        onDismiss={() => {
          markBackupAdvisorySeen();
          setIsBackupAdvisoryOpen(false);
        }}
      />

      <FocusModal
          isOpen={isFocusOpen}
          onClose={() => setIsFocusOpen(false)}
          topics={shownTopics}
          filter={filter}
          presets={deckState.filterPresets ?? {}}
          onChange={handleFilterChange}
          onSavePreset={(name, f) => setDeckState(savePreset(deckState, name, f))}
          onDeletePreset={(name) => setDeckState(deletePreset(deckState, name))}
        />
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => {
            setIsSettingsOpen(false);
            setAiSettingsVersion((v) => v + 1);
          }}
          currentAlgorithm={algorithm}
          onAlgorithmChange={handleAlgorithmChange}
          currentTheme={theme}
          onThemeChange={handleSetTheme}
          onSettingsSaved={() => setAiSettingsVersion((v) => v + 1)}
          onResetDeckToDefaults={handleResetDeckToDefaults}
          packs={packSummary}
          onPacksChange={handlePacksChange}
        />
      )}
    </div>
  );
}

export default App;
