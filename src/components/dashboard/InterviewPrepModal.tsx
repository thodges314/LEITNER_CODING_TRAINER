import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Layers,
  CheckCircle,
  ExternalLink,
  Printer,
  Calendar,
  Building2,
  Briefcase,
  AlertTriangle,
  Loader2,
  BookOpen,
  Sliders,
  CheckSquare,
  Square,
  ArrowLeft,
} from 'lucide-react';
import catalogIndexData from '../../data/catalogIndex.json';
import {
  generateInterviewPrepDossier,
  saveInterviewDossier,
  type CatalogIndexEntry,
  type InterviewPrepDossier,
  type CardPriority,
} from '../../lib/interviewPrep';
import { getStoredProvider, getStoredModel } from '../../lib/ai';

const catalogIndex = catalogIndexData as CatalogIndexEntry[];

const WEAKNESS_OPTIONS = [
  'Complex React Architecture (Compound components, Context, custom hooks)',
  'Accessibility & DOM Contracts (ARIA roles, roving tabindex, focus management)',
  'Asynchronous & Event Plumbing (Promises from scratch, polling backoff, event emitters)',
  'Data Processing & Polyfills (LRU caches, deep clone, query parsers)',
  'Classic Algorithms & Data Structures (Binary search, trees, intervals, graphs)',
];

export interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCustomDeck: (deckName: string, description?: string, cardIds?: string[]) => void;
  onDeckCreatedAndSelected?: (deckId: string) => void;
  currentBox1CardIds?: string[];
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <InterviewPrepModalDialog
      key={`ai-prep-dialog-${props.currentBox1CardIds?.length ?? 0}`}
      {...props}
    />
  );
};

const InterviewPrepModalDialog: React.FC<InterviewPrepModalProps> = ({
  onClose,
  onCreateCustomDeck,
  onDeckCreatedAndSelected,
  currentBox1CardIds = [],
}) => {
  const [step, setStep] = useState<'input' | 'loading' | 'review'>('input');

  // Input form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetCardCount, setTargetCardCount] = useState(16);
  const [rawNotes, setRawNotes] = useState('');
  const [selectedWeaknesses, setSelectedWeaknesses] = useState<string[]>([]);
  const [syncBox1Cards, setSyncBox1Cards] = useState(currentBox1CardIds.length > 0);

  // Loading animation state
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Review state
  const [dossier, setDossier] = useState<InterviewPrepDossier | null>(null);
  const [editableDeckName, setEditableDeckName] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'cards' | 'guide' | 'tools'>('cards');
  const [checkedCardIds, setCheckedCardIds] = useState<Set<string>>(new Set());

  const companyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    companyInputRef.current?.focus();
  }, []);

  const provider = getStoredProvider();
  const model = getStoredModel();

  const toggleWeakness = (weakness: string) => {
    setSelectedWeaknesses((prev) =>
      prev.includes(weakness) ? prev.filter((w) => w !== weakness) : [...prev, weakness]
    );
  };

  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setLoadingMessageIndex(0);

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % 4);
    }, 1200);

    try {
      const generated = await generateInterviewPrepDossier(
        {
          company: company.trim(),
          role: role.trim(),
          targetDate: targetDate.trim() || undefined,
          rawNotes,
          candidateWeaknesses: selectedWeaknesses,
          weakCardIds: syncBox1Cards ? currentBox1CardIds : [],
          targetCardCount,
        },
        catalogIndex
      );

      clearInterval(interval);
      setDossier(generated);
      setEditableDeckName(generated.deckName);
      setEditableDescription(generated.deckDescription);
      setCheckedCardIds(new Set(generated.selectedCards.map((c) => c.id)));
      setStep('review');
    } catch {
      clearInterval(interval);
      setStep('input');
    }
  };

  const toggleCardCheck = (cardId: string) => {
    setCheckedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleSelectAllCards = () => {
    if (!dossier) return;
    if (checkedCardIds.size === dossier.selectedCards.length) {
      setCheckedCardIds(new Set());
    } else {
      setCheckedCardIds(new Set(dossier.selectedCards.map((c) => c.id)));
    }
  };

  const handleConfirmCreateCustomDeck = () => {
    if (!dossier) return;
    const finalCardIds = dossier.selectedCards
      .filter((c) => checkedCardIds.has(c.id))
      .map((c) => c.id);

    if (finalCardIds.length === 0) return;

    const trimmedName = editableDeckName.trim() || dossier.deckName;
    const finalDescription = editableDescription.trim() || dossier.deckDescription;

    // Generate unique slug id
    const deckSlug = `${(company || 'interview').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;

    // Save dossier linked to this custom deck
    saveInterviewDossier(deckSlug, {
      ...dossier,
      deckName: trimmedName,
      deckDescription: finalDescription,
      selectedCards: dossier.selectedCards.filter((c) => checkedCardIds.has(c.id)),
    });

    onCreateCustomDeck(trimmedName, finalDescription, finalCardIds);
    if (onDeckCreatedAndSelected) {
      onDeckCreatedAndSelected(deckSlug);
    }
    onClose();
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const getPriorityBadgeClass = (priority: CardPriority) => {
    switch (priority) {
      case 'must-know':
        return 'priority-badge must-know';
      case 'recommended':
        return 'priority-badge recommended';
      case 'optional':
        return 'priority-badge optional';
    }
  };

  const loadingMessages = [
    `Analyzing interview archetypes for ${company || 'your target company'}...`,
    'Screening 277 curated cards across 10 engineering domains...',
    'Calibrating against your candidate weakness profile...',
    'Synthesizing tailored executive study dossier & checklist...',
  ];

  return (
    <div
      className="modal-overlay ai-prep-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-prep-modal-title"
      data-testid="interview-prep-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'loading') onClose();
      }}
    >
      <div className="modal-content glass-panel ai-prep-modal-container">
        {/* Header */}
        <div className="ai-prep-modal-header">
          <div className="ai-prep-header-icon-wrap">
            <Sparkles size={20} className="ai-prep-header-icon" />
          </div>
          <div className="ai-prep-header-titles">
            <h2 id="ai-prep-modal-title" className="ai-prep-modal-title">
              AI Interview Prep Copilot
            </h2>
            <p className="ai-prep-modal-subtitle">
              Synthesize a targeted flashcard curriculum & study guide from your target role, recruiter notes, and personal weak spots.
            </p>
          </div>
          {step !== 'loading' && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
              data-testid="ai-prep-close-btn"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* STEP 1: INPUT FORM */}
        {step === 'input' && (
          <form onSubmit={handleStartGeneration} className="ai-prep-form">
            <div className="ai-prep-fields-grid">
              <div className="ai-prep-field">
                <label htmlFor="ai-prep-company" className="ai-prep-label">
                  <Building2 size={13} className="label-icon" />
                  <span>Target Company</span>
                </label>
                <input
                  id="ai-prep-company"
                  ref={companyInputRef}
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Stripe, Airbnb, Datadog, Meta"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  data-testid="ai-prep-company-input"
                />
              </div>

              <div className="ai-prep-field">
                <label htmlFor="ai-prep-role" className="ai-prep-label">
                  <Briefcase size={13} className="label-icon" />
                  <span>Role & Target Level</span>
                </label>
                <input
                  id="ai-prep-role"
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  data-testid="ai-prep-role-input"
                />
              </div>

              <div className="ai-prep-field">
                <label htmlFor="ai-prep-date" className="ai-prep-label">
                  <Calendar size={13} className="label-icon" />
                  <span>Target Date / Timeline (Optional)</span>
                </label>
                <input
                  id="ai-prep-date"
                  type="text"
                  className="modal-input"
                  placeholder="e.g. In 5 days, or 2026-11-05"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  data-testid="ai-prep-date-input"
                />
              </div>

              <div className="ai-prep-field">
                <label htmlFor="ai-prep-count" className="ai-prep-label">
                  <Sliders size={13} className="label-icon" />
                  <span>Target Deck Size: {targetCardCount} Cards</span>
                </label>
                <input
                  id="ai-prep-count"
                  type="range"
                  min="10"
                  max="24"
                  step="2"
                  className="ai-prep-slider"
                  value={targetCardCount}
                  onChange={(e) => setTargetCardCount(Number(e.target.value))}
                  data-testid="ai-prep-count-slider"
                />
              </div>
            </div>

            {/* Raw Intelligence Dump Box */}
            <div className="ai-prep-field">
              <label htmlFor="ai-prep-raw-notes" className="ai-prep-label">
                <BookOpen size={13} className="label-icon" />
                <span>Raw Intelligence Dump (Job Description, Recruiter Emails, Round Notes)</span>
              </label>
              <textarea
                id="ai-prep-raw-notes"
                className="ai-prep-textarea"
                rows={4}
                placeholder="Paste the job description, recruiter bullet points, onsite round descriptions, Glassdoor questions, or tech stack requirements here. The AI copilot will extract the tactical signals automatically."
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                data-testid="ai-prep-raw-notes-input"
              />
            </div>

            {/* Candidate Weaknesses Checklist */}
            <div className="ai-prep-field">
              <label className="ai-prep-label">
                <AlertTriangle size={13} className="label-icon" />
                <span>Candidate Calibration (Select areas where you feel rusty under pressure)</span>
              </label>
              <div className="ai-prep-weaknesses-list">
                {WEAKNESS_OPTIONS.map((opt) => {
                  const isChecked = selectedWeaknesses.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`ai-prep-weakness-chip ${isChecked ? 'selected' : ''}`}
                      onClick={() => toggleWeakness(opt)}
                      data-testid={`ai-weakness-chip-${opt.slice(0, 10)}`}
                    >
                      {isChecked ? (
                        <CheckSquare size={14} className="chip-check" />
                      ) : (
                        <Square size={14} className="chip-check" />
                      )}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Box 1 Sync Toggle */}
            {currentBox1CardIds.length > 0 && (
              <label className="ai-prep-sync-box1-row">
                <input
                  type="checkbox"
                  checked={syncBox1Cards}
                  onChange={(e) => setSyncBox1Cards(e.target.checked)}
                  className="catalog-checkbox"
                  data-testid="ai-prep-sync-box1-checkbox"
                />
                <span className="sync-box1-label">
                  Include my recent setbacks from Leitner practice ({currentBox1CardIds.length} cards currently in Box 1)
                </span>
              </label>
            )}

            {/* Model & Provider Badge */}
            <div className="ai-prep-provider-bar">
              <div className="ai-prep-provider-badge">
                <span className="provider-dot" />
                <span>
                  Active Model: <strong>{model || provider}</strong> ({provider})
                </span>
              </div>
              <span className="ai-prep-provider-note">
                Groq offers a 100% free tier. Claude 3.5 Sonnet / GPT-4o recommended for high-stakes on-sites.
              </span>
            </div>

            {/* Actions */}
            <div className="modal-actions ai-prep-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                data-testid="ai-prep-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary ai-prep-generate-btn"
                data-testid="ai-prep-generate-btn"
              >
                <Sparkles size={15} />
                <span>Synthesize Prep Curriculum</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: LOADING */}
        {step === 'loading' && (
          <div className="ai-prep-loading-view" data-testid="ai-prep-loading-view">
            <div className="ai-prep-spinner-wrap">
              <Loader2 size={36} className="ai-prep-spinner animate-spin" />
            </div>
            <h3 className="ai-prep-loading-title">Analyzing & Assembling Curriculum</h3>
            <p className="ai-prep-loading-subtext">{loadingMessages[loadingMessageIndex]}</p>
          </div>
        )}

        {/* STEP 3: REVIEW & DECK ASSEMBLY */}
        {step === 'review' && dossier && (
          <div className="ai-prep-review-view" data-testid="ai-prep-review-view">
            {/* Dossier Header Info */}
            <div className="ai-prep-review-header">
              <div className="ai-prep-deck-name-row">
                <div className="ai-prep-field" style={{ flex: 2 }}>
                  <label htmlFor="ai-review-deck-name" className="ai-prep-label">
                    <span>Generated Deck Name</span>
                  </label>
                  <input
                    id="ai-review-deck-name"
                    type="text"
                    className="modal-input"
                    value={editableDeckName}
                    onChange={(e) => setEditableDeckName(e.target.value)}
                    data-testid="ai-prep-review-deck-name"
                  />
                </div>
                <div className="ai-prep-field" style={{ flex: 3 }}>
                  <label htmlFor="ai-review-deck-desc" className="ai-prep-label">
                    <span>Deck Description</span>
                  </label>
                  <input
                    id="ai-review-deck-desc"
                    type="text"
                    className="modal-input"
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                    data-testid="ai-prep-review-deck-desc"
                  />
                </div>
              </div>

              {/* Executive Summary Callout */}
              <div className="ai-prep-executive-callout">
                <div className="executive-callout-header">
                  <Sparkles size={14} className="executive-icon" />
                  <span className="executive-title">Strategic Interview Executive Summary</span>
                </div>
                <p className="executive-text">{dossier.executiveSummary}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="ai-prep-tabs-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'cards'}
                className={`ai-prep-tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
                onClick={() => setActiveTab('cards')}
                data-testid="ai-prep-tab-cards"
              >
                <Layers size={14} />
                <span>Selected Cards ({checkedCardIds.size}/{dossier.selectedCards.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'guide'}
                className={`ai-prep-tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
                onClick={() => setActiveTab('guide')}
                data-testid="ai-prep-tab-guide"
              >
                <BookOpen size={14} />
                <span>External Topics ({dossier.externalTopics.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'tools'}
                className={`ai-prep-tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
                onClick={() => setActiveTab('tools')}
                data-testid="ai-prep-tab-tools"
              >
                <CheckCircle size={14} />
                <span>Interactive Drills & Checklist</span>
              </button>
            </div>

            {/* TAB CONTENT: CARDS */}
            {activeTab === 'cards' && (
              <div className="ai-prep-cards-tab-body">
                <div className="ai-prep-cards-actions-bar">
                  <button
                    type="button"
                    className="ai-prep-select-all-btn"
                    onClick={handleSelectAllCards}
                  >
                    {checkedCardIds.size === dossier.selectedCards.length ? (
                      <>
                        <CheckSquare size={13} />
                        <span>Deselect All</span>
                      </>
                    ) : (
                      <>
                        <Square size={13} />
                        <span>Select All</span>
                      </>
                    )}
                  </button>
                  <span className="cards-tab-counter">
                    {checkedCardIds.size} cards ready for custom deck
                  </span>
                </div>

                <div className="ai-prep-cards-scroll-list">
                  {dossier.selectedCards.map((sel) => {
                    const card = catalogIndex.find((c) => c.id === sel.id);
                    const isChecked = checkedCardIds.has(sel.id);

                    return (
                      <div
                        key={sel.id}
                        className={`ai-prep-card-item ${isChecked ? 'checked' : 'unchecked'}`}
                        onClick={() => toggleCardCheck(sel.id)}
                        data-testid={`ai-card-item-${sel.id}`}
                      >
                        <div className="card-item-checkbox">
                          {isChecked ? (
                            <CheckSquare size={16} className="text-primary" />
                          ) : (
                            <Square size={16} className="text-muted" />
                          )}
                        </div>

                        <div className="card-item-content">
                          <div className="card-item-top-row">
                            <span className="card-item-title">{card?.title || sel.id}</span>
                            <span className={getPriorityBadgeClass(sel.priority)}>
                              {sel.priority.toUpperCase()}
                            </span>
                            {card && (
                              <span className="card-item-diff-badge">D{card.difficulty}</span>
                            )}
                            {card && (
                              <span className="card-item-track-badge">{card.track}</span>
                            )}
                          </div>
                          <p className="card-item-rationale">{sel.rationale}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: EXTERNAL TOPICS */}
            {activeTab === 'guide' && (
              <div className="ai-prep-guide-tab-body">
                <p className="guide-intro">
                  The following topics are critical for {dossier.company}&apos;s rounds but fall outside standard flashcard coding drills. Review these strategic focus areas:
                </p>
                <div className="guide-topics-grid">
                  {dossier.externalTopics.map((topic, i) => (
                    <div key={i} className="guide-topic-card">
                      <div className="guide-topic-header">
                        <span className="guide-topic-name">{topic.topic}</span>
                        <span className={`guide-priority-pill ${topic.priority}`}>
                          {topic.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <p className="guide-topic-desc">{topic.description}</p>
                      {topic.recommendedResources.length > 0 && (
                        <div className="guide-resources-list">
                          <span className="resources-label">Recommended Crash Courses:</span>
                          {topic.recommendedResources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="guide-resource-link"
                            >
                              <span>{res.title}</span>
                              <ExternalLink size={11} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: INTERACTIVE TOOLS & CHECKLIST */}
            {activeTab === 'tools' && (
              <div className="ai-prep-tools-tab-body">
                <div className="tools-section">
                  <h4 className="section-title">Curated Interactive Practice Playgrounds</h4>
                  <div className="interactive-tools-grid">
                    {dossier.interactiveTools.map((tool, i) => (
                      <a
                        key={i}
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="interactive-tool-card"
                      >
                        <div className="tool-card-header">
                          <span className="tool-name">{tool.name}</span>
                          <ExternalLink size={12} className="tool-icon" />
                        </div>
                        <p className="tool-focus">{tool.focus}</p>
                        <span className="tool-url-label">{tool.url}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="checklist-section">
                  <h4 className="section-title">24-Hour Countdown & Interview Day Protocol</h4>
                  <div className="countdown-checklist-list">
                    {dossier.countdownChecklist.map((item, i) => (
                      <div key={i} className="checklist-item-row">
                        <CheckCircle size={15} className="checklist-check-icon" />
                        <span className="checklist-item-text">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Review Footer Actions */}
            <div className="ai-prep-review-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep('input')}
                data-testid="ai-prep-back-btn"
              >
                <ArrowLeft size={14} />
                <span>Adjust Inputs</span>
              </button>

              <div className="review-footer-right">
                <button
                  type="button"
                  className="btn btn-secondary ai-prep-print-btn"
                  onClick={handlePrintDossier}
                  title="Print or save PDF study dossier"
                  data-testid="ai-prep-print-dossier-btn"
                >
                  <Printer size={14} />
                  <span>Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={checkedCardIds.size === 0}
                  onClick={handleConfirmCreateCustomDeck}
                  data-testid="ai-prep-create-deck-btn"
                >
                  <Layers size={14} />
                  <span>Create Custom Deck ({checkedCardIds.size} Cards)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
