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
} from './lib/leitner';
import type {
  LeitnerDeckState,
  TopicItem,
  TrackType,
} from './lib/leitner';
import { getStoredApiKey, getStoredProvider } from './lib/ai';
import { PracticeArena } from './components/PracticeArena';
import { DeckDashboard } from './components/DeckDashboard';
import { AddTopicModal } from './components/AddTopicModal';
import { SettingsModal } from './components/SettingsModal';
import {
  Terminal,
  Layers,
  Settings,
  Plus,
  Zap,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export function App() {
  const [deckState, setDeckState] = useState<LeitnerDeckState>(() => loadDeckState());
  const [activeView, setActiveView] = useState<'practice' | 'dashboard'>('practice');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      deckState.lastReviewedTrack
    );
  })();

  const handleCommitReview = (passed: boolean) => {
    if (!currentCard) return;

    const { nextState, newlyUnlockedCount, updatedCard } = commitCardReview(
      deckState,
      currentCard.id,
      passed
    );
    setDeckState(nextState);

    if (newlyUnlockedCount > 0) {
      setUnlockToast(`🎉 Staged Milestone Achieved! ${newlyUnlockedCount} locked cards have been unlocked to your active rotation.`);
      setTimeout(() => setUnlockToast(null), 5000);
    }

    // Pick next card with interleaved tracks
    const next = getNextCard(
      nextState.topics,
      nextState.totalCompletedReviews,
      updatedCard.track,
      currentCard.id
    );
    setSelectedCardId(next?.id ?? null);
  };

  const handleSkipCard = () => {
    if (!currentCard) return;
    const next = getNextCard(
      deckState.topics,
      deckState.totalCompletedReviews,
      currentCard.track,
      currentCard.id
    );
    setSelectedCardId(next?.id ?? null);
  };

  const handleSelectCardToPractice = (card: TopicItem) => {
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
  }) => {
    const next = addCustomTopicToDeck(deckState, newTopic);
    setDeckState(next);
    setSelectedCardId(newTopic.id);
    setActiveView('practice');
  };

  const handleResetDeckToDefaults = () => {
    const defaultDeck = getDefaultDeckState();
    if (confirm(`Reset entire deck back to the ${defaultDeck.topics.length} original topics? All custom progress will be reset.`)) {
      saveDeckState(defaultDeck);
      setDeckState(defaultDeck);
      setSelectedCardId(defaultDeck.topics[0].id);
    }
  };

  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();
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
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    fontSize: '10.5px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  Cold-Start
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                No Autocomplete • Trial Spacing • Invariant Retrieval
              </p>
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
              style={{ padding: '7px 12px', fontSize: '12.5px', gap: '6px' }}
              onClick={() => setIsSettingsOpen(true)}
              title="Configure API key and AI evaluation engine"
            >
              <Settings size={15} />
              <span style={{ fontSize: '12px' }}>
                {apiKey ? `${provider.toUpperCase()}` : 'Keyless Engine'}
              </span>
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
            key={currentCard?.id || 'none'}
            currentCard={currentCard}
            totalCompletedReviews={deckState.totalCompletedReviews}
            onCommitReview={handleCommitReview}
            onSkipCard={handleSkipCard}
            onOpenDeckView={() => setActiveView('dashboard')}
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
        <div>
          Leitner Spaced Retrieval: Box 1 (+1) • Box 2 (+4) • Box 3 (+10) • Box 4 (+22) • Box 5 (+45)
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={handleResetDeckToDefaults}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RotateCcw size={12} /> Reset to Defaults
          </button>
          <span>Offline-Capable SPA</span>
        </div>
      </footer>

      {/* Modals */}
      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTopic={handleAddTopic}
      />

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
