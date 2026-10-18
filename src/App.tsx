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
import { DOUBLE_BACK_WINDOW_MS, useBackNavigation } from './lib/backNavigation';
import { isFirstVisit, markWelcomed } from './lib/welcome';
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
  const [backHint, setBackHint] = useState(false);
  const [isAiRecommendOpen, setIsAiRecommendOpen] = useState(false);
  const [isAiStatusOpen, setIsAiStatusOpen] = useState(false);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Mobile Experience Notice Modal */}
      <MobileNoticeModal />

      {/* Global Header */}
      <header
        className="app-header"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-navigation)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Brand Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: theme === 'apple-gsos' ? '#4455AA' : 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                border: theme === 'apple-gsos' ? '1px solid #1C1C1C' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: theme === 'apple-gsos' ? '1px 1px 0px #1C1C1C' : '0 2px 10px rgba(56, 189, 248, 0.35)',
              }}
            >
              <Zap size={22} fill="white" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Leitner Coding Trainer
              </span>
            </div>
          </div>

          {/* View Toggle Navigation */}
          <nav
            className="nav-view-toggle"
            style={{
              display: 'flex',
              padding: '4px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-editor)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              className={`btn ${activeView === 'practice' ? 'nav-btn-active' : 'nav-btn-inactive'}`}
              onClick={() => setActiveView('practice')}
              style={{
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: activeView === 'practice' ? (theme === 'apple-gsos' ? 'var(--accent-primary)' : 'var(--bg-elevated)') : 'transparent',
                borderColor: activeView === 'practice' ? (theme === 'apple-gsos' ? 'var(--border-ui)' : 'var(--border-medium)') : 'transparent',
                color: activeView === 'practice' ? (theme === 'apple-gsos' ? '#ffffff' : 'var(--text-primary)') : 'var(--text-secondary)',
                boxShadow: activeView === 'practice' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Terminal size={15} color={activeView === 'practice' ? (theme === 'apple-gsos' ? '#ffffff' : '#38bdf8') : undefined} />
              Practice Arena
            </button>
            <button
              className={`btn ${activeView === 'dashboard' ? 'nav-btn-active' : 'nav-btn-inactive'}`}
              onClick={() => setActiveView('dashboard')}
              style={{
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: activeView === 'dashboard' ? (theme === 'apple-gsos' ? 'var(--accent-primary)' : 'var(--bg-elevated)') : 'transparent',
                borderColor: activeView === 'dashboard' ? (theme === 'apple-gsos' ? 'var(--border-ui)' : 'var(--border-medium)') : 'transparent',
                color: activeView === 'dashboard' ? (theme === 'apple-gsos' ? '#ffffff' : 'var(--text-primary)') : 'var(--text-secondary)',
                boxShadow: activeView === 'dashboard' ? 'var(--shadow-sm)' : 'none',
              }}
              title={`${activeCount} active in rotation • ${shownTopics.length - activeCount} locked in reserve`}
            >
              <Layers size={15} color={activeView === 'dashboard' ? (theme === 'apple-gsos' ? '#ffffff' : '#c084fc') : undefined} />
              Deck Catalog ({shownTopics.length})
            </button>
          </nav>

          {/* Quick Info & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-outline"
              style={{
                padding: '7px 12px',
                fontSize: '12.5px',
                gap: '6px',
                borderColor: filterActive ? '#38bdf8' : undefined,
                color: filterActive ? '#38bdf8' : undefined,
              }}
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
                  className="badge"
                  style={{
                    backgroundColor: isAiStatusOpen
                      ? (theme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.18)' : 'rgba(56, 189, 248, 0.22)')
                      : (theme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.1)' : 'rgba(56, 189, 248, 0.12)'),
                    color: theme === 'apple-gsos' ? '#4455AA' : '#38bdf8',
                    border: isAiStatusOpen
                      ? (theme === 'apple-gsos' ? '1px solid #4455AA' : '1px solid rgba(56, 189, 248, 0.55)')
                      : (theme === 'apple-gsos' ? '1px solid rgba(68, 85, 170, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'),
                    padding: '6px 11px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setIsAiStatusOpen((prev) => !prev)}
                  title={`AI Engine: ${provider.toUpperCase()} (${model}) • Click to view live rate limits & quota`}
                  aria-label={`AI Engine: ${provider.toUpperCase()}`}
                  aria-haspopup="dialog"
                  aria-expanded={isAiStatusOpen}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.2)' : 'rgba(56, 189, 248, 0.2)';
                    e.currentTarget.style.borderColor = theme === 'apple-gsos' ? '#4455AA' : 'rgba(56, 189, 248, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isAiStatusOpen) {
                      e.currentTarget.style.backgroundColor = theme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.1)' : 'rgba(56, 189, 248, 0.12)';
                      e.currentTarget.style.borderColor = theme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.3)' : 'rgba(56, 189, 248, 0.3)';
                    }
                  }}
                >
                  <Sparkles size={13} color={theme === 'apple-gsos' ? '#4455AA' : '#38bdf8'} />
                  <span>AI: {provider.toUpperCase()}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="badge"
                  style={{
                    backgroundColor: isAiRecommendOpen
                      ? (theme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.15)' : 'rgba(56, 189, 248, 0.12)')
                      : (theme === 'apple-gsos' ? '#EBEAE3' : 'rgba(255, 255, 255, 0.04)'),
                    color: isAiRecommendOpen
                      ? (theme === 'apple-gsos' ? '#4455AA' : 'var(--accent-primary)')
                      : 'var(--text-muted)',
                    border: isAiRecommendOpen
                      ? (theme === 'apple-gsos' ? '1px solid #4455AA' : '1px solid rgba(56, 189, 248, 0.4)')
                      : '1px solid var(--border-subtle)',
                    padding: '6px 11px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.18s ease',
                  }}
                  onClick={() => setIsAiRecommendOpen((prev) => !prev)}
                  title="Operating in Keyless mode • Click to learn how adding an AI key in Settings unlocks live mentoring & deeper features"
                  aria-label="Operating in Keyless mode. Click to see AI recommendation"
                  aria-haspopup="dialog"
                  aria-expanded={isAiRecommendOpen}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'apple-gsos' ? '#E0DFD7' : 'rgba(56, 189, 248, 0.1)';
                    e.currentTarget.style.borderColor = theme === 'apple-gsos' ? 'var(--accent-primary)' : 'rgba(56, 189, 248, 0.4)';
                    e.currentTarget.style.color = theme === 'apple-gsos' ? 'var(--accent-primary)' : 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isAiRecommendOpen) {
                      e.currentTarget.style.backgroundColor = theme === 'apple-gsos' ? '#EBEAE3' : 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  <ShieldCheck size={13} color="var(--text-dim)" />
                  <span>Keyless Engine</span>
                  <Sparkles size={11} color="var(--accent-primary)" style={{ opacity: 0.7 }} />
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
              className="btn btn-outline"
              style={{ padding: '7px 12px', fontSize: '12.5px', gap: '6px' }}
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
              style={{
                padding: '7px 12px',
                fontSize: '12px',
                gap: '6px',
                fontWeight: 600,
                borderColor: theme === 'apple-gsos' ? 'var(--accent-primary)' : undefined,
              }}
              onClick={handleToggleTheme}
              title={theme === 'apple-gsos' ? 'Switch to Synthwave / Nightcore Mode' : 'Switch to Apple IIGS / GS/OS Light Mode'}
              aria-label={theme === 'apple-gsos' ? 'Switch to Synthwave / Nightcore Mode' : 'Switch to Apple IIGS / GS/OS Light Mode'}
            >
              {theme === 'apple-gsos' ? (
                <>
                  <Moon size={14} color="#4455AA" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun size={14} color="#fbbf24" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Staged Unlock Notification Toast */}
      {unlockToast && (
        <div
          style={{
            backgroundColor: 'rgba(234, 179, 8, 0.15)',
            borderBottom: '1px solid rgba(234, 179, 8, 0.4)',
            color: '#fbbf24',
            padding: '10px 24px',
            textAlign: 'center',
            fontSize: '13.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Sparkles size={18} />
          <span>{unlockToast}</span>
        </div>
      )}

      {/* Main Container */}
      <main style={{ flex: 1, padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
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
            state={deckState}
            onSelectCardToPractice={handleSelectCardToPractice}
            onToggleLock={handleToggleLock}
            onResetBox={handleResetBox}
            onDeleteTopic={handleDeleteTopic}
            onStateUpdated={(newState) => setDeckState(newState)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '14px 24px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <span>© {new Date().getFullYear()} Thomas Hodges</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px' }}>
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '12px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            About
          </button>
          <span style={{ color: 'var(--border-medium)' }}>•</span>
          <a
            href="https://www.javascriptonline.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Portfolio
          </a>
          <span style={{ color: 'var(--border-medium)' }}>•</span>
          <a
            href="https://www.linkedin.com/in/thomas-hodges/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            LinkedIn
          </a>
          <span style={{ color: 'var(--border-medium)' }}>•</span>
          <a
            href="https://github.com/thodges314"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            GitHub
          </a>
        </div>
      </footer>

      {/* Modals */}
      <AboutModal
        isOpen={isAboutOpen}
        welcome={welcomeMode}
        onClose={() => {
          setIsAboutOpen(false);
          if (welcomeMode) {
            markWelcomed();
            setWelcomeMode(false);
          }
        }}
      />

      {backHint && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 18px',
            borderRadius: '999px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 2000,
          }}
        >
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
