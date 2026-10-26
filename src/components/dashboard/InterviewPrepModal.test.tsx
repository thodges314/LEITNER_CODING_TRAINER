// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { InterviewPrepModal } from './InterviewPrepModal';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('InterviewPrepModal Component', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOMClient.Root | null = null;

  beforeEach(() => {
    localStorage.clear();
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

  it('renders nothing when isOpen is false', async () => {
    await act(async () => {
      root?.render(
        <InterviewPrepModal
          isOpen={false}
          onClose={vi.fn()}
          onCreateCustomDeck={vi.fn()}
        />
      );
    });
    expect(document.querySelector('[data-testid="interview-prep-modal"]')).toBeNull();
  });

  it('renders input form with company, role, and raw notes inputs', async () => {
    await act(async () => {
      root?.render(
        <InterviewPrepModal
          isOpen={true}
          onClose={vi.fn()}
          onCreateCustomDeck={vi.fn()}
          currentBox1CardIds={['tabs-accordion-compound']}
        />
      );
    });

    const modal = document.querySelector('[data-testid="interview-prep-modal"]');
    expect(modal).not.toBeNull();

    const companyInput = document.querySelector('[data-testid="ai-prep-company-input"]') as HTMLInputElement;
    const roleInput = document.querySelector('[data-testid="ai-prep-role-input"]') as HTMLInputElement;
    const rawNotesInput = document.querySelector('[data-testid="ai-prep-raw-notes-input"]') as HTMLTextAreaElement;
    const syncCheckbox = document.querySelector('[data-testid="ai-prep-sync-box1-checkbox"]') as HTMLInputElement;

    expect(companyInput).not.toBeNull();
    expect(roleInput).not.toBeNull();
    expect(rawNotesInput).not.toBeNull();
    expect(syncCheckbox).not.toBeNull();
    expect(syncCheckbox.checked).toBe(true);
  });

  it('triggers synthesis and displays review view with cards and action buttons', async () => {
    const handleCreateDeck = vi.fn();
    const handleClose = vi.fn();

    await act(async () => {
      root?.render(
        <InterviewPrepModal
          isOpen={true}
          onClose={handleClose}
          onCreateCustomDeck={handleCreateDeck}
        />
      );
    });

    const companyInput = document.querySelector('[data-testid="ai-prep-company-input"]') as HTMLInputElement;
    const roleInput = document.querySelector('[data-testid="ai-prep-role-input"]') as HTMLInputElement;

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(companyInput, 'Stripe');
      companyInput.dispatchEvent(new Event('input', { bubbles: true }));

      setter?.call(roleInput, 'Staff Frontend Engineer');
      roleInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const form = document.querySelector('form.ai-prep-form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    // Wait for the heuristic generation and review screen transition
    await vi.waitFor(
      () => {
        expect(document.querySelector('[data-testid="ai-prep-review-view"]')).not.toBeNull();
      },
      { timeout: 3000 }
    );

    // Verify deck name populated
    const deckNameInput = document.querySelector('[data-testid="ai-prep-review-deck-name"]') as HTMLInputElement;
    expect(deckNameInput.value).toContain('Stripe');

    // Verify cards tab
    const createDeckBtn = document.querySelector('[data-testid="ai-prep-create-deck-btn"]') as HTMLButtonElement;
    expect(createDeckBtn).not.toBeNull();

    // Click Create Custom Deck
    await act(async () => {
      createDeckBtn.click();
    });

    expect(handleCreateDeck).toHaveBeenCalled();
    expect(handleCreateDeck.mock.calls[0][0]).toContain('Stripe');
    expect(handleCreateDeck.mock.calls[0][2].length).toBeGreaterThan(0);
    expect(handleClose).toHaveBeenCalled();
  });
});
