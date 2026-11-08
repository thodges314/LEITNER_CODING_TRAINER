import React from 'react';
import { Play, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import type { TopicItem, Rolling24HourStats } from '../../lib/leitner';

export interface PracticeActionHeroProps {
  stats: Rolling24HourStats;
  nextCard?: TopicItem | null;
  activeCount?: number;
  totalCards?: number;
  onResumePractice: () => void;
}

export const PracticeActionHero: React.FC<PracticeActionHeroProps> = ({
  stats,
  nextCard,
  onResumePractice,
}) => {
  return (
    <div className="glass-panel practice-action-hero" data-testid="practice-action-hero">
      {/* Top Banner Row */}
      <div className="practice-hero-header">
        <div className="practice-hero-badge">
          <Clock size={14} className="practice-hero-clock" />
          <span>24-Hour Rolling Window</span>
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
        </div>

        {/* Promoted */}
        <div className="practice-hero-metric-tile">
          <div className="practice-hero-metric-label">Promoted</div>
          <div className="practice-hero-metric-val metric-emerald" data-testid="hero-stat-promoted">
            <TrendingUp size={22} className="metric-trend-icon" />
            <span>{stats.promoted}</span>
          </div>
        </div>

        {/* Demoted */}
        <div className="practice-hero-metric-tile">
          <div className="practice-hero-metric-label">Demoted</div>
          <div className="practice-hero-metric-val metric-rose" data-testid="hero-stat-demoted">
            <TrendingDown size={22} className="metric-trend-icon" />
            <span>{stats.demoted}</span>
          </div>
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
          <Play size={20} fill="currentColor" />
          <span className="practice-hero-launch-text">Resume Practice Arena</span>
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
