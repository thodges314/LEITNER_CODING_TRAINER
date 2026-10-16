import { useState } from 'react';
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
import { getStoredApiKey, getStoredProvider } from './lib/ai';
import { clearDraft, clearAllDrafts } from './lib/drafts';
import { PracticeArena } from './components/PracticeArena';
import { DeckDashboard } from './components/DeckDashboard';
import { AddTopicModal } from './components/AddTopicModal';
import { SettingsModal } from './components/SettingsModal';
import { FocusModal } from './components/FocusModal';
import {
  Terminal,
  Layers,
  Settings,
  Plus,
  Zap,
  Sparkles,
  Crosshair,
  ShieldCheck,
} from 'lucide-react';

export function App() {
  const [deckState, setDeckState] = useState<LeitnerDeckState>(() => loadDeckState());
  const [activeView, setActiveView] = useState<'practice' | 'dashboard'>('practice');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [aiSettingsVersion, setAiSettingsVersion] = useState(0);
  const [reinforcingCardId, setReinforcingCardId] = useState<string | null>(null);
  const filter = deckState.practiceFilter ?? EMPTY_FILTER;
  const filterActive = isFilterActive(filter);
  const algorithm = getSchedulingAlgorithm(deckState);

  // Unlocked notification toast
  const [unlockToast, setUnlockToast] = useState<string | null>(null);

  // Derive currently active card
  const currentCard: TopicItem | null = (() => {
    if (selectedCardId) {
      const found = deckState.topics.find((t) => t.id === selectedCardId && t.status === 'active');
      if (found) return found;
    }
    return getNextCard(
      deckState.topics,
      deckState.totalCompletedReviews,
      deckState.lastReviewedTrack,
      undefined,
      filter,
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
      filter,
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
      filter,
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
      filter,
      algorithm
    );
    if (next) clearDraft(next.id);
    setSelectedCardId(next?.id ?? null);
  };

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
  void aiSettingsVersion;
  const activeCount = deckState.topics.filter((t) => t.status === 'active').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Global Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(15, 20, 31, 0.85)',
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
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(56, 189, 248, 0.35)',
              }}
            >
              <Zap size={22} fill="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  Leitner Coding Trainer
                </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: algorithm === 'graduated-interval' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                    color: algorithm === 'graduated-interval' ? '#38bdf8' : '#c084fc',
                    fontSize: '10.5px',
                    border: `1px solid ${algorithm === 'graduated-interval' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(168, 85, 247, 0.35)'}`,
                  }}
                >
                  {algorithm === 'graduated-interval' ? 'Graduated Recall' : 'Leitner Boxes'}
                </span>
              </div>
            </div>
          </div>

          {/* View Toggle Navigation */}
          <nav
            style={{
              display: 'flex',
              padding: '4px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-editor)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              className="btn"
              onClick={() => setActiveView('practice')}
              style={{
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: activeView === 'practice' ? 'var(--bg-elevated)' : 'transparent',
                borderColor: activeView === 'practice' ? 'var(--border-medium)' : 'transparent',
                color: activeView === 'practice' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: activeView === 'practice' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Terminal size={15} color={activeView === 'practice' ? '#38bdf8' : undefined} />
              Practice Arena
            </button>
            <button
              className="btn"
              onClick={() => setActiveView('dashboard')}
              style={{
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: activeView === 'dashboard' ? 'var(--bg-elevated)' : 'transparent',
                borderColor: activeView === 'dashboard' ? 'var(--border-medium)' : 'transparent',
                color: activeView === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: activeView === 'dashboard' ? 'var(--shadow-sm)' : 'none',
              }}
              title={`${activeCount} active in rotation • ${deckState.topics.length - activeCount} locked in reserve`}
            >
              <Layers size={15} color={activeView === 'dashboard' ? '#c084fc' : undefined} />
              Deck Catalog ({deckState.topics.length})
            </button>
          </nav>

          {/* Quick Info & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '7px 12px', fontSize: '12.5px' }}
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={15} /> Add Topic
            </button>

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
            {apiKey ? (
              <div
                className="badge"
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '6px 11px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '7px',
                }}
                title={`AI Evaluator active: ${provider.toUpperCase()}`}
              >
                <Sparkles size={13} color="#38bdf8" />
                <span>AI: {provider.toUpperCase()}</span>
              </div>
            ) : (
              <div
                className="badge"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 11px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '7px',
                }}
                title="Operating in Keyless mode (deterministic harness & structural invariant analysis)"
              >
                <ShieldCheck size={13} color="var(--text-dim)" />
                <span>Keyless Engine</span>
              </div>
            )}

            {/* Dedicated Settings Button */}
            <button
              className="btn btn-outline"
              style={{ padding: '7px 12px', fontSize: '12.5px', gap: '6px' }}
              onClick={() => setIsSettingsOpen(true)}
              title="Configure Spaced Repetition method and AI engine"
            >
              <Settings size={15} />
              <span>Settings</span>
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
            activeDeckSize={deckState.topics.filter((t) => t.status === 'active').length}
            algorithm={algorithm}
            onCommitReview={handleCommitReview}
            onSkipCard={handleSkipCard}
            onOpenDeckView={() => setActiveView('dashboard')}
            isReinforcement={Boolean(reinforcingCardId && currentCard && reinforcingCardId === currentCard.id)}
            onFinishReinforcement={handleFinishReinforcement}
          />
        ) : (
          <DeckDashboard
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
          <span style={{ color: 'var(--border-medium)' }}>•</span>
          <span style={{ color: 'var(--text-dim)' }}>Deliberate Cold-Start Practice</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px' }}>
          <a
            href="https://www.linkedin.com/in/thodges314"
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
      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTopic={handleAddTopic}
      />

      <FocusModal
          isOpen={isFocusOpen}
          onClose={() => setIsFocusOpen(false)}
          topics={deckState.topics}
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
          onSettingsSaved={() => setAiSettingsVersion((v) => v + 1)}
          onResetDeckToDefaults={handleResetDeckToDefaults}
        />
      )}
    </div>
  );
}

export default App;
