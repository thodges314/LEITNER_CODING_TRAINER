import React from 'react';
import { Play, ArrowRight, Zap, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import type { TopicItem, Rolling24HourStats } from '../../lib/leitner';

export interface PracticeActionHeroProps {
  stats: Rolling24HourStats;
  nextCard?: TopicItem | null;
  activeCount: number;
  totalCards: number;
  onResumePractice: () => void;
}

export const PracticeActionHero: React.FC<PracticeActionHeroProps> = ({
  stats,
  nextCard,
  activeCount,
  totalCards,
  onResumePractice,
}) => {
  return (
    <div className="glass-panel practice-action-hero" data-testid="practice-action-hero">
      {/* Top Banner Row */}
      <div className="practice-hero-header">
        <div className="practice-hero-title-group">
          <div className="practice-hero-badge">
            <Sparkles size={12} className="practice-hero-sparkle" />
            <span>24-Hour Rolling Window</span>
          </div>
          <h2 className="practice-hero-title">Practice Momentum</h2>
        </div>

        <div className="practice-hero-rotation-pill" title={`${activeCount} of ${totalCards} cards active in study rotation`}>
          <Zap size={13} className="practice-hero-zap" />
          <span>{activeCount} Active Cards</span>
        </div>
      </div>

      {/* 24-Hour Rolling Metrics Grid */}
      <div className="practice-hero-metrics">
        {/* Attempted */}
        <div className="practice-hero-metric-tile">
          <div className="practice-hero-metric-label">Attempted</div>
          <div className="practice-hero-metric-val metric-cyan" data-testid="hero-stat-attempted">
            {stats.attempted}
          </div>
          <div className="practice-hero-metric-sub">in last 24h</div>
        </div>

        {/* Promoted */}
        <div className="practice-hero-metric-tile">
          <div className="practice-hero-metric-label">Promoted</div>
          <div className="practice-hero-metric-val metric-emerald" data-testid="hero-stat-promoted">
            <TrendingUp size={16} className="metric-trend-icon" />
            <span>{stats.promoted}</span>
          </div>
          <div className="practice-hero-metric-sub">tier advanced</div>
        </div>

        {/* Demoted */}
        <div className="practice-hero-metric-tile">
          <div className="practice-hero-metric-label">Demoted</div>
          <div className="practice-hero-metric-val metric-rose" data-testid="hero-stat-demoted">
            <TrendingDown size={16} className="metric-trend-icon" />
            <span>{stats.demoted}</span>
          </div>
          <div className="practice-hero-metric-sub">needs review</div>
        </div>
      </div>

      {/* Action Footer: Launch Button + Queue Hint */}
      <div className="practice-hero-footer">
        <button
          type="button"
          className="btn btn-primary practice-hero-launch-btn"
          onClick={onResumePractice}
          data-testid="resume-practice-hero-btn"
          title="Launch Practice Arena"
        >
          <Play size={18} fill="currentColor" />
          <span className="practice-hero-launch-text">Resume Practice Arena</span>
          <ArrowRight size={16} className="practice-hero-launch-arrow" />
        </button>

        <div className="practice-hero-next-hint">
          {nextCard ? (
            <>
              <span className="practice-hero-hint-label">Next up:</span>
              <span className="practice-hero-hint-card">{nextCard.title}</span>
              <span className="practice-hero-hint-track">({nextCard.track})</span>
            </>
          ) : (
            <>
              <span className="practice-hero-hint-label">Queue:</span>
              <span className="practice-hero-hint-card">Spaced repetition schedule ready</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
