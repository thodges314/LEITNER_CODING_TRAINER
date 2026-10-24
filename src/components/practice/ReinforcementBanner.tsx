import React from 'react';

export interface ReinforcementBannerProps {
  isReinforcement?: boolean;
  timeExpiredToast?: string | null;
  onFinishReinforcement?: () => void;
  onDismissTimeToast: () => void;
}

export const ReinforcementBanner: React.FC<ReinforcementBannerProps> = ({
  isReinforcement,
  timeExpiredToast,
  onFinishReinforcement,
  onDismissTimeToast,
}) => {
  return (
    <>
      {/* Reinforcement Drill Banner */}
      {isReinforcement && (
        <div className="arena-reinforcement-banner" data-testid="reinforcement-banner">
          <div className="arena-reinforcement-info">
            <span className="arena-reinforcement-dot" />
            <span className="arena-reinforcement-title">
              Immediate Reinforcement Drill
            </span>
            <span className="arena-reinforcement-sub">
              Solidify pattern memory before moving on. This drill has zero effect on tier, box, or streak stats.
            </span>
          </div>
          {onFinishReinforcement && (
            <button
              type="button"
              className="btn btn-outline arena-reinforcement-skip-btn"
              onClick={onFinishReinforcement}
            >
              Skip Drill →
            </button>
          )}
        </div>
      )}

      {/* Time Expired Toast */}
      {timeExpiredToast && (
        <div className="arena-time-expired-toast" data-testid="time-expired-toast">
          <div className="arena-time-expired-text">
            <span>{timeExpiredToast}</span>
          </div>
          <button
            type="button"
            className="btn btn-outline arena-time-expired-dismiss-btn"
            onClick={onDismissTimeToast}
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
};
