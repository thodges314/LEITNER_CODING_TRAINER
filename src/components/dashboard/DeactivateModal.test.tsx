// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { DeactivateModal } from './DeactivateModal';
import type { TopicItem } from '../../lib/leitner';

// @ts-expect-error IS_REACT_ACT_ENVIRONMENT is a React global flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockTopic: TopicItem = {
  id: 'card-to-deactivate',
  title: 'Sample Target Problem',
  track: 'algorithms',
  box: 1,
  status: 'active',
  streak: 0,
  promptSeed: '',
  tags: [],
  nextEligibleTrial: 0,
};

describe('DeactivateModal', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOMClient.Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOMClient.createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = null;
    root = null;
  });

  it('renders nothing when topic is null', async () => {
    await act(async () => {
      root?.render(
        <DeactivateModal
          topic={null}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      );
    });

    expect(container?.innerHTML).toBe('');
  });

  it('renders modal content and triggers onClose and onConfirm', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    await act(async () => {
      root?.render(
        <DeactivateModal
          topic={mockTopic}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
    });

    expect(container?.textContent).toContain('Deactivate Card');
    expect(container?.textContent).toContain("Deactivate card 'Sample Target Problem'?");

    // Click cancel button
    const cancelBtn = container?.querySelector('button.btn-outline') as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();
    await act(async () => {
      cancelBtn.click();
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    // Click confirm button
    const confirmBtn = container?.querySelector('button.btn-primary') as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    await act(async () => {
      confirmBtn.click();
    });
    expect(onConfirm).toHaveBeenCalledWith('card-to-deactivate');
  });
});
