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

    // Verify dedicated print document was rendered in the DOM
    const printDoc = document.querySelector('.ai-prep-print-document');
    expect(printDoc).not.toBeNull();
    expect(printDoc?.textContent).toContain('TECHNICAL INTERVIEW PREPARATION DOSSIER');

    // Click Dialogue Tab
    const dialogueTab = document.querySelector('[data-testid="ai-prep-tab-dialogue"]') as HTMLButtonElement;
    expect(dialogueTab).not.toBeNull();
    await act(async () => {
      dialogueTab.click();
    });
    expect(document.querySelector('[data-testid="ai-prep-dialogue-tab-body"]')).not.toBeNull();

    // Verify custom deck was automatically created upon synthesis
    expect(handleCreateDeck).toHaveBeenCalled();
    expect(handleCreateDeck.mock.calls[0][0]).toContain('Stripe');
    expect(handleCreateDeck.mock.calls[0][2].length).toBeGreaterThan(0);

    // const doneBtn = document.querySelector('[data-testid="ai-prep-done-btn"]') as HTMLButtonElement;
    // expect(doneBtn).not.toBeNull();

    // Click Done to close briefing
    // await act(async () => {
    //   doneBtn.click();
    // });

    // expect(handleClose).toHaveBeenCalled();
  });

  it('imports a JSON dossier and automatically creates the custom deck', async () => {
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

    const fileInput = document.querySelector('[data-testid="ai-prep-import-json-input"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const mockDossierJson = JSON.stringify({
      id: 'dossier_import_123',
      company: 'Airbnb',
      role: 'Frontend Architect',
      deckName: 'Airbnb Frontend Architect Prep',
      deckDescription: 'Imported test dossier.',
      selectedCards: [{ id: 'tabs-accordion-compound', priority: 'must-know', rationale: 'Compound patterns' }],
      executiveSummary: 'Focus on compound component design.',
      conversation: [{ id: 'm1', role: 'assistant', content: 'Welcome to your Airbnb briefing', timestamp: 123 }],
    });

    const file = new File([mockDossierJson], 'airbnb-dossier.json', { type: 'application/json' });

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await vi.waitFor(() => {
      expect(handleCreateDeck).toHaveBeenCalledWith(
        'Airbnb Frontend Architect Prep',
        'Imported test dossier.',
        ['tabs-accordion-compound'],
        'dossier_import_123'
      );
    });

    expect(document.querySelector('[data-testid="ai-prep-review-view"]')).not.toBeNull();
  });

  it('persists partially filled form draft in localStorage and clears it on Cancel', async () => {
    const handleClose = vi.fn();

    // 1. Mount modal with empty inputs
    await act(async () => {
      root?.render(
        <InterviewPrepModal
          isOpen={true}
          onClose={handleClose}
          onCreateCustomDeck={vi.fn()}
        />
      );
    });

    const companyInput = document.querySelector('[data-testid="ai-prep-company-input"]') as HTMLInputElement;
    const roleInput = document.querySelector('[data-testid="ai-prep-role-input"]') as HTMLInputElement;

    // 2. Type partial info
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(companyInput, 'Netflix');
      companyInput.dispatchEvent(new Event('input', { bubbles: true }));

      setter?.call(roleInput, 'Senior UI Engineer');
      roleInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // 3. Verify draft was saved in localStorage
    const savedDraft = JSON.parse(localStorage.getItem('leitner_interview_prep_draft') || '{}');
    expect(savedDraft.company).toBe('Netflix');
    expect(savedDraft.role).toBe('Senior UI Engineer');

    // 4. Simulate hitting Escape to close modal without losing work
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(handleClose).toHaveBeenCalled();
    // Draft remains persisted
    expect(localStorage.getItem('leitner_interview_prep_draft')).not.toBeNull();

    // 5. Click Cancel button to explicitly clear the draft
    const cancelBtn = document.querySelector('[data-testid="ai-prep-cancel-btn"]') as HTMLButtonElement;
    await act(async () => {
      cancelBtn.click();
    });

    // Verify draft was purged
    expect(localStorage.getItem('leitner_interview_prep_draft')).toBeNull();
  });
});
