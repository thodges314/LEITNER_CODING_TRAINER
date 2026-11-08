import { useState, useEffect } from 'react';
import { getTimedModeEnabled, getTimedModeDuration } from '../lib/timedMode';

export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function useTimedPractice(
  hasEvalResult: boolean,
  isEvaluating: boolean,
  onTimeExpiredSubmit: () => void
) {
  const timedMode = getTimedModeEnabled();
  const configuredDuration = getTimedModeDuration();
  const [timeRemaining, setTimeRemaining] = useState(configuredDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(timedMode);
  const [timeExpiredToast, setTimeExpiredToast] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (!hasEvalResult && !isEvaluating) {
              setTimeExpiredToast('⏰ Time expired! Your buffer is being automatically submitted for evaluation...');
              setTimeout(() => {
                onTimeExpiredSubmit();
              }, 120);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining, timedMode, hasEvalResult, isEvaluating, onTimeExpiredSubmit]);

  return {
    timedMode,
    configuredDuration,
    timeRemaining,
    setTimeRemaining,
    isTimerRunning,
    setIsTimerRunning,
    timeExpiredToast,
    setTimeExpiredToast,
    formatTimer,
  };
}
