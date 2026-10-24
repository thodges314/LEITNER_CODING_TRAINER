// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import ReactDOM from 'react-dom/client';
import { ReinforcementBanner } from './ReinforcementBanner';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('ReinforcementBanner', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOM.Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
    container = null;
    root = null;
  });

  it('renders nothing when not reinforcement and no time toast', async () => {
    await act(async () => {
      root?.render(
        <ReinforcementBanner
          isReinforcement={false}
          timeExpiredToast={null}
          onDismissTimeToast={vi.fn()}
        />
      );
    });

    expect(container?.querySelector('[data-testid="reinforcement-banner"]')).toBeNull();
    expect(container?.querySelector('[data-testid="time-expired-toast"]')).toBeNull();
  });

  it('renders reinforcement drill banner and handles skip click', async () => {
    const handleFinish = vi.fn();

    await act(async () => {
      root?.render(
        <ReinforcementBanner
          isReinforcement={true}
          timeExpiredToast={null}
          onFinishReinforcement={handleFinish}
          onDismissTimeToast={vi.fn()}
        />
      );
    });

    const banner = container?.querySelector('[data-testid="reinforcement-banner"]');
    expect(banner).toBeDefined();
    expect(banner?.textContent).toContain('Immediate Reinforcement Drill');

    const skipBtn = banner?.querySelector('button');
    expect(skipBtn).toBeDefined();
    await act(async () => {
      skipBtn?.click();
    });
    expect(handleFinish).toHaveBeenCalledTimes(1);
  });

  it('renders time expired toast and triggers dismiss', async () => {
    const handleDismiss = vi.fn();

    await act(async () => {
      root?.render(
        <ReinforcementBanner
          isReinforcement={false}
          timeExpiredToast="Time expired on countdown timer"
          onDismissTimeToast={handleDismiss}
        />
      );
    });

    const toast = container?.querySelector('[data-testid="time-expired-toast"]');
    expect(toast).toBeDefined();
    expect(toast?.textContent).toContain('Time expired on countdown timer');

    const dismissBtn = toast?.querySelector('button');
    await act(async () => {
      dismissBtn?.click();
    });
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
