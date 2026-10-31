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
  MessageSquare,
  Send,
  Clock,
  Trash2,
  Zap,
  Plus,
  Download,
  Upload,
  Pencil,
} from 'lucide-react';
import { MarkdownContent } from '../MarkdownContent';
import catalogIndexData from '../../data/catalogIndex.json';
import {
  generateInterviewPrepDossier,
  saveInterviewDossier,
  getAllSavedDossiers,
  deleteInterviewDossier,
  clearAllInterviewDossiers,
  continueInterviewDialogue,
  type CatalogIndexEntry,
  type InterviewPrepDossier,
  type CardPriority,
  type DossierMessage,
} from '../../lib/interviewPrep';
import {
  getStoredProvider,
  getStoredModel,
  getAllStoredKeys,
  setStoredProvider,
  setStoredModel,
  type AIProvider,
} from '../../lib/ai';
import { printInterviewDossier, downloadDossierHtml } from '../../lib/printDossier';

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
  onCreateCustomDeck: (deckName: string, description?: string, cardIds?: string[], dossierId?: string) => void;
  onDeleteDossier?: (dossierId: string) => void;
  currentBox1CardIds?: string[];
  initialDossierId?: string;
  initialStep?: 'input' | 'review';
  onOpenSettings?: (section?: 'ai') => void;
  onEditCustomDeck?: (deckId: string) => void;
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <InterviewPrepModalDialog
      key={`ai-prep-dialog-${props.initialDossierId || 'latest'}-${props.currentBox1CardIds?.length ?? 0}`}
      {...props}
    />
  );
};

const ModelRecommendationBanner: React.FC<{
  storedKeys: Record<AIProvider, string>;
  activeProvider: AIProvider;
  activeModel: string;
  onSwitchModel: (provider: AIProvider, model: string) => void;
  onOpenSettings?: (section?: 'ai') => void;
}> = ({ storedKeys, activeProvider, activeModel, onSwitchModel, onOpenSettings }) => {
  const [dismissed, setDismissed] = useState(false);
  const [switchedNotice, setSwitchedNotice] = useState<string | null>(null);

  if (dismissed) return null;

  // Check which keys are stored
  const hasOpenRouter = Boolean(storedKeys.openrouter);
  const hasAnthropic = Boolean(storedKeys.anthropic);
  const hasOpenAI = Boolean(storedKeys.openai);
  const hasGemini = Boolean(storedKeys.gemini);
  const hasGroq = Boolean(storedKeys.groq);

  const isTier1Active =
    (activeProvider === 'openrouter' && (activeModel.includes('claude-3.5') || activeModel.includes('claude-3-5') || activeModel.includes('gpt-4o'))) ||
    (activeProvider === 'anthropic' && (activeModel.includes('claude-3-5') || activeModel.includes('claude-3.5'))) ||
    (activeProvider === 'openai' && activeModel.includes('gpt-4o'));

  if (isTier1Active) return null;

  if (switchedNotice) {
    return (
      <div className="ai-prep-model-banner switched" role="status">
        <Sparkles size={14} className="banner-icon" />
        <span>{switchedNotice}</span>
      </div>
    );
  }

  // Tier 1 Top Choice: Claude 3.5 Sonnet via OpenRouter
  if (hasOpenRouter && (activeProvider !== 'openrouter' || !activeModel.includes('claude-3.5'))) {
    return (
      <div className="ai-prep-model-banner" role="note">
        <div className="banner-text">
          <Sparkles size={14} className="banner-icon" />
          <span>
            <strong>Tier 1 Recommended:</strong> You have an <strong>OpenRouter</strong> key. Claude 3.5 Sonnet is the gold standard for recognizing architectural patterns and synthesizing executive study guides.
          </span>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="btn-switch-model"
            onClick={() => {
              onSwitchModel('openrouter', 'anthropic/claude-3.5-sonnet');
              setSwitchedNotice('Switched active engine to Claude 3.5 Sonnet (OpenRouter) for Interview Prep!');
              setTimeout(() => setSwitchedNotice(null), 3000);
            }}
          >
            Switch to Claude 3.5 Sonnet
          </button>
          <button
            type="button"
            className="btn-dismiss-banner"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss recommendation"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  // Tier 1 Top Choice: Claude 3.5 Sonnet via Anthropic
  if (hasAnthropic && activeProvider !== 'anthropic') {
    return (
      <div className="ai-prep-model-banner" role="note">
        <div className="banner-text">
          <Sparkles size={14} className="banner-icon" />
          <span>
            <strong>Tier 1 Recommended:</strong> You have an <strong>Anthropic</strong> key. Claude 3.5 Sonnet is the gold standard for interview intelligence and architectural nuance.
          </span>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="btn-switch-model"
            onClick={() => {
              onSwitchModel('anthropic', 'claude-3-5-sonnet-20241022');
              setSwitchedNotice('Switched active engine to Claude 3.5 Sonnet for Interview Prep!');
              setTimeout(() => setSwitchedNotice(null), 3000);
            }}
          >
            Switch to Claude 3.5 Sonnet
          </button>
          <button
            type="button"
            className="btn-dismiss-banner"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss recommendation"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  // Tier 1 Premium Alternative: GPT-4o via OpenAI
  if (hasOpenAI && activeProvider !== 'openai') {
    return (
      <div className="ai-prep-model-banner" role="note">
        <div className="banner-text">
          <Sparkles size={14} className="banner-icon" />
          <span>
            <strong>Tier 1 Alternative:</strong> You have an <strong>OpenAI</strong> key. GPT-4o offers high accuracy on company interview pattern recognition and rubric calibration.
          </span>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="btn-switch-model"
            onClick={() => {
              onSwitchModel('openai', 'gpt-4o');
              setSwitchedNotice('Switched active engine to GPT-4o for Interview Prep!');
              setTimeout(() => setSwitchedNotice(null), 3000);
            }}
          >
            Switch to GPT-4o
          </button>
          <button
            type="button"
            className="btn-dismiss-banner"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss recommendation"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  // Tier 2 Deep Strategic: Gemini 2.5 Pro via Google AI
  if (hasGemini && (activeProvider !== 'gemini' || !activeModel.includes('gemini-2.5-pro'))) {
    return (
      <div className="ai-prep-model-banner" role="note">
        <div className="banner-text">
          <Sparkles size={14} className="banner-icon" />
          <span>
            <strong>Tier 2 Deep Strategic:</strong> You have a <strong>Google Gemini</strong> key. Gemini 2.5 Pro features an enormous context window and deep FAANG rubric reasoning.
          </span>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="btn-switch-model"
            onClick={() => {
              onSwitchModel('gemini', 'gemini-2.5-pro');
              setSwitchedNotice('Switched active engine to Gemini 2.5 Pro for Interview Prep!');
              setTimeout(() => setSwitchedNotice(null), 3000);
            }}
          >
            Switch to Gemini 2.5 Pro
          </button>
          <button
            type="button"
            className="btn-dismiss-banner"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss recommendation"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  // Tier 3 Fast / Free: Groq Llama 3.3 70B (only if no Tier 1 or Tier 2 key is available)
  if (hasGroq && activeProvider !== 'groq') {
    return (
      <div className="ai-prep-model-banner" role="note">
        <div className="banner-text">
          <Sparkles size={14} className="banner-icon" />
          <span>
            <strong>Tier 3 Fast / Free:</strong> You have a saved key for <strong>Groq</strong>. Llama 3.3 70B delivers rapid, zero-cost curriculum setup for everyday practice drills.
          </span>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="btn-switch-model"
            onClick={() => {
              onSwitchModel('groq', 'llama-3.3-70b-versatile');
              setSwitchedNotice('Switched active engine to Groq Llama 3.3 70B for Interview Prep!');
              setTimeout(() => setSwitchedNotice(null), 3000);
            }}
          >
            Switch to Groq Llama 3.3
          </button>
          <button
            type="button"
            className="btn-dismiss-banner"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss recommendation"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  // If running completely keyless:
  if (!hasAnthropic && !hasOpenAI && !hasGroq && !hasGemini) {
    return (
      <div className="ai-prep-model-banner keyless-hint" role="note">
        <div className="banner-text">
          <Zap size={14} className="banner-icon" />
          <span>
            <strong>Keyless Heuristic Engine:</strong> Generating curriculum via deterministic algorithms. Adding a free Groq or Gemini key unlocks live AI JD synthesis.
          </span>
        </div>
        {onOpenSettings && (
          <div className="banner-actions">
            <button
              type="button"
              className="btn-switch-model"
              onClick={() => onOpenSettings('ai')}
            >
              Configure AI Key
            </button>
            <button
              type="button"
              className="btn-dismiss-banner"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss recommendation"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

function ensureDossierChatOpener(d: InterviewPrepDossier | null): InterviewPrepDossier | null {
  if (!d) return null;
  const initialPromptNote = `Ask questions about this company's interview loop, request curriculum adjustments (e.g. "trim deck to 12 cards", "add more state machine problems"), or ask for an analysis of your current Leitner box progress as you practice. Type any request below.`;
  const desiredOpener = `${d.executiveSummary}\n\n${initialPromptNote}`;

  if (!d.conversation || d.conversation.length === 0) {
    return {
      ...d,
      conversation: [
        {
          id: `msg_init_${d.generatedAt || Date.now()}`,
          role: 'assistant',
          content: desiredOpener,
          timestamp: d.generatedAt || Date.now(),
        },
      ],
    };
  }

  if (d.conversation[0].content.startsWith("I've synthesized your interview preparation dossier")) {
    const updated = [...d.conversation];
    updated[0] = {
      ...updated[0],
      content: desiredOpener,
    };
    return { ...d, conversation: updated };
  }

  return d;
}

const InterviewPrepModalDialog: React.FC<InterviewPrepModalProps> = ({
  onClose,
  onCreateCustomDeck,
  onDeleteDossier,
  currentBox1CardIds = [],
  initialDossierId,
  initialStep,
  onOpenSettings,
  onEditCustomDeck,
}) => {
  // Saved briefings history
  const [savedDossiers, setSavedDossiers] = useState<InterviewPrepDossier[]>(() => getAllSavedDossiers());
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);

  // Initialize initial dossier and step
  const rawInitialDossier = initialDossierId
    ? savedDossiers.find((d) => d.id === initialDossierId) || null
    : initialStep === 'input'
      ? null
      : savedDossiers.length > 0
        ? savedDossiers[0]
        : null;

  const initialDossier = ensureDossierChatOpener(rawInitialDossier);

  const [step, setStep] = useState<'input' | 'loading' | 'review'>(() => {
    if (initialStep) return initialStep;
    if (initialDossier) return 'review';
    return 'input';
  });

  const [dossier, setDossier] = useState<InterviewPrepDossier | null>(initialDossier);

  // Input form state
  const [company, setCompany] = useState(() => initialDossier?.company || '');
  const [role, setRole] = useState(() => initialDossier?.role || '');
  const [targetDate, setTargetDate] = useState(() => initialDossier?.targetDate || '');
  const [deckSizeMode, setDeckSizeMode] = useState<'auto' | 'custom'>('auto');
  const [targetCardCount, setTargetCardCount] = useState(16);
  const [rawNotes, setRawNotes] = useState('');
  const [selectedWeaknesses, setSelectedWeaknesses] = useState<string[]>([]);
  const [syncBox1Cards, setSyncBox1Cards] = useState(currentBox1CardIds.length > 0);

  // Loading animation state
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [pipelineProgressMessage, setPipelineProgressMessage] = useState<string | null>(null);

  // Review state
  const [editableDeckName, setEditableDeckName] = useState(() => initialDossier?.deckName || '');
  const [editableDescription, setEditableDescription] = useState(() => initialDossier?.deckDescription || '');
  const [activeTab, setActiveTab] = useState<'cards' | 'guide' | 'tools' | 'dialogue'>('dialogue');
  const [checkedCardIds, setCheckedCardIds] = useState<Set<string>>(
    () => new Set(initialDossier?.selectedCards.map((c) => c.id) || [])
  );

  // Dialogue state
  const [dialogueInput, setDialogueInput] = useState('');
  const [isDialogueLoading, setIsDialogueLoading] = useState(false);
  const [dialogueUpdateNotification, setDialogueUpdateNotification] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // AI Model Vault state
  const [storedKeys] = useState(() => getAllStoredKeys());
  const [activeProvider, setActiveProvider] = useState<AIProvider>(() => getStoredProvider());
  const [activeModel, setActiveModel] = useState<string>(() => getStoredModel());

  const companyInputRef = useRef<HTMLInputElement>(null);
  const deckNameInputRef = useRef<HTMLInputElement>(null);
  const deckDescInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'input') {
      companyInputRef.current?.focus();
    }
  }, [step]);

  const toggleWeakness = (weakness: string) => {
    setSelectedWeaknesses((prev) =>
      prev.includes(weakness) ? prev.filter((w) => w !== weakness) : [...prev, weakness]
    );
  };

  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setLoadingMessageIndex(0);
    setPipelineProgressMessage(null);

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
          targetCardCount: deckSizeMode === 'custom' ? targetCardCount : undefined,
        },
        catalogIndex,
        {
          onProgress: (_step, message) => {
            setPipelineProgressMessage(message);
          },
        }
      );

      clearInterval(interval);
      const readyDossier = ensureDossierChatOpener(generated)!;
      setDossier(readyDossier);
      setEditableDeckName(readyDossier.deckName);
      setEditableDescription(readyDossier.deckDescription);
      setCheckedCardIds(new Set(readyDossier.selectedCards.map((c) => c.id)));
      saveInterviewDossier(readyDossier.id || 'current_dossier', readyDossier);
      setSavedDossiers(getAllSavedDossiers());

      // Automatically create and select custom deck immediately upon generation
      onCreateCustomDeck(
        readyDossier.deckName,
        readyDossier.deckDescription,
        readyDossier.selectedCards.map((c) => c.id),
        readyDossier.id
      );

      setStep('review');
    } catch {
      clearInterval(interval);
      setStep('input');
    }
  };

  const handleLoadSavedDossier = (saved: InterviewPrepDossier) => {
    const readySaved = ensureDossierChatOpener(saved)!;
    setDossier(readySaved);
    setCompany(readySaved.company);
    setRole(readySaved.role);
    setTargetDate(readySaved.targetDate || '');
    setEditableDeckName(readySaved.deckName);
    setEditableDescription(readySaved.deckDescription);
    setCheckedCardIds(new Set(readySaved.selectedCards.map((c) => c.id)));
    setShowSavedDropdown(false);

    // Sync active custom deck when switching saved dossiers
    onCreateCustomDeck(
      readySaved.deckName,
      readySaved.deckDescription,
      readySaved.selectedCards.map((c) => c.id),
      readySaved.id
    );

    setStep('review');
  };

  const handleDeleteCurrentDossier = () => {
    if (!dossier) return;
    deleteInterviewDossier(dossier);
    if (dossier.id) onDeleteDossier?.(dossier.id);
    const updated = getAllSavedDossiers();
    setSavedDossiers(updated);
    setDossier(null);
    setCompany('');
    setRole('');
    setTargetDate('');
    setRawNotes('');
    setSelectedWeaknesses([]);
    setEditableDeckName('');
    setEditableDescription('');
    setCheckedCardIds(new Set());
    setStep('input');
  };

  const handleDeleteSavedDossier = (e: React.MouseEvent, target: InterviewPrepDossier) => {
    e.stopPropagation();
    deleteInterviewDossier(target);
    if (target.id) onDeleteDossier?.(target.id);
    const updated = getAllSavedDossiers();
    setSavedDossiers(updated);
    if (!dossier || dossier.id === target.id || (dossier.company === target.company && dossier.role === target.role)) {
      if (updated.length > 0) {
        handleLoadSavedDossier(updated[0]);
      } else {
        setDossier(null);
        setCompany('');
        setRole('');
        setTargetDate('');
        setRawNotes('');
        setSelectedWeaknesses([]);
        setEditableDeckName('');
        setEditableDescription('');
        setCheckedCardIds(new Set());
        setStep('input');
      }
    }
  };

  const handleClearAllDossiers = () => {
    if (!window.confirm('Delete all saved interview dossiers? This will reset all briefings.')) return;
    clearAllInterviewDossiers();
    setSavedDossiers([]);
    setDossier(null);
    setCompany('');
    setRole('');
    setTargetDate('');
    setRawNotes('');
    setSelectedWeaknesses([]);
    setEditableDeckName('');
    setEditableDescription('');
    setCheckedCardIds(new Set());
    setShowSavedDropdown(false);
    setStep('input');
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

  // const handleConfirmCreateCustomDeck = () => {
  //   if (!dossier) return;
  //   const finalCardIds = dossier.selectedCards
  //     .filter((c) => checkedCardIds.has(c.id))
  //     .map((c) => c.id);

  //   if (finalCardIds.length === 0) return;

  //   const trimmedName = editableDeckName.trim() || dossier.deckName;
  //   const finalDescription = editableDescription.trim() || dossier.deckDescription;

  //   const dossierIdToSave =
  //     dossier.id ||
  //     `dossier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  //   const updatedDossier: InterviewPrepDossier = {
  //     ...dossier,
  //     id: dossierIdToSave,
  //     deckName: trimmedName,
  //     deckDescription: finalDescription,
  //     selectedCards: dossier.selectedCards.filter((c) => checkedCardIds.has(c.id)),
  //   };

  //   saveInterviewDossier(dossierIdToSave, updatedDossier);

  //   onCreateCustomDeck(trimmedName, finalDescription, finalCardIds, dossierIdToSave);
  //   onClose();
  // };

  const handlePrintDossier = () => {
    if (!dossier) return;
    printInterviewDossier(dossier, catalogIndex);
  };

  const handleDownloadHtml = () => {
    if (!dossier) return;
    downloadDossierHtml(dossier, catalogIndex);
  };

  const handleDownloadJson = () => {
    if (!dossier) return;
    const jsonString = JSON.stringify(dossier, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `${(company || dossier.company || 'interview').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-dossier.json`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result;
        if (typeof raw !== 'string') return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.selectedCards)) {
          alert('Invalid dossier backup: JSON file must contain a "selectedCards" array.');
          return;
        }

        const dossierId =
          parsed.id || `dossier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

        const importedDossier: InterviewPrepDossier = {
          ...parsed,
          id: dossierId,
          company: parsed.company || 'Company',
          role: parsed.role || 'Software Engineer',
          deckName: parsed.deckName || `${parsed.company || 'Interview'} Prep Deck`,
          deckDescription: parsed.deckDescription || 'Imported AI interview preparation curriculum.',
          generatedAt: parsed.generatedAt || Date.now(),
          selectedCards: parsed.selectedCards,
          externalTopics: Array.isArray(parsed.externalTopics) ? parsed.externalTopics : [],
          countdownChecklist: Array.isArray(parsed.countdownChecklist) ? parsed.countdownChecklist : [],
          interactiveTools: Array.isArray(parsed.interactiveTools) ? parsed.interactiveTools : [],
          executiveSummary: parsed.executiveSummary || '',
          conversation: Array.isArray(parsed.conversation) ? parsed.conversation : [],
        };

        const ready = ensureDossierChatOpener(importedDossier)!;
        saveInterviewDossier(ready.id || dossierId, ready);
        setDossier(ready);
        setCompany(ready.company);
        setRole(ready.role);
        setTargetDate(ready.targetDate || '');
        setEditableDeckName(ready.deckName);
        setEditableDescription(ready.deckDescription);
        setCheckedCardIds(new Set(ready.selectedCards.map((c) => c.id)));
        setSavedDossiers(getAllSavedDossiers());

        // Automatically create and select custom deck for the imported briefing
        onCreateCustomDeck(
          ready.deckName,
          ready.deckDescription,
          ready.selectedCards.map((c) => c.id),
          ready.id
        );

        setStep('review');
        setActiveTab('dialogue');
      } catch (err) {
        console.error('Failed to parse imported dossier JSON:', err);
        alert('Could not import dossier JSON. Please ensure the file is valid JSON.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSendDialogueMessage = async (textToSend?: string) => {
    const text = (textToSend || dialogueInput).trim();
    if (!text || !dossier || isDialogueLoading) return;

    const userMsg: DossierMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedConversation = [...(dossier.conversation || []), userMsg];
    const updatedDossier = { ...dossier, conversation: updatedConversation };
    setDossier(updatedDossier);
    setDialogueInput('');
    setIsDialogueLoading(true);

    // Calculate candidate Leitner practice progress if available
    let progressContext = undefined;
    try {
      const storedDeckState = localStorage.getItem('leitner_deck_state');
      if (storedDeckState) {
        const parsed = JSON.parse(storedDeckState);
        const cardBoxes: Record<string, number> = parsed.cardBoxes || {};
        let box1 = 0;
        let box2 = 0;
        let box3Plus = 0;
        const recentBox1Titles: string[] = [];
        for (const card of dossier.selectedCards) {
          const b = cardBoxes[card.id] || 0;
          if (b === 1) {
            box1++;
            const entry = catalogIndex.find((e) => e.id === card.id);
            recentBox1Titles.push(entry?.title || card.id);
          } else if (b === 2) {
            box2++;
          } else if (b >= 3) {
            box3Plus++;
          }
        }
        progressContext = {
          box1Count: box1,
          box2Count: box2,
          box3PlusCount: box3Plus,
          masteredCount: 0,
          recentBox1Titles: recentBox1Titles.slice(0, 4),
        };
      }
    } catch {
      /* ignore */
    }

    try {
      const response = await continueInterviewDialogue(
        updatedDossier,
        text,
        catalogIndex,
        progressContext
      );

      const assistantMsg: DossierMessage = {
        id: `msg_ast_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        updatedCards: response.updatedCards,
      };

      const finalDossier: InterviewPrepDossier = {
        ...updatedDossier,
        conversation: [...updatedConversation, assistantMsg],
      };

      if (response.updatedCards && response.updatedCards.length > 0) {
        finalDossier.selectedCards = response.updatedCards;
        setCheckedCardIds(new Set(response.updatedCards.map((c) => c.id)));
        setDialogueUpdateNotification(
          `Curriculum updated! Now contains ${response.updatedCards.length} tailored cards.`
        );
        setTimeout(() => setDialogueUpdateNotification(null), 4000);
        // Automatically sync the custom deck with the coach's new card selection
        onCreateCustomDeck(
          finalDossier.deckName,
          finalDossier.deckDescription,
          response.updatedCards.map((c) => c.id),
          finalDossier.id
        );
      }

      setDossier(finalDossier);
      saveInterviewDossier(finalDossier.id || 'current_dossier', finalDossier);
    } catch (err) {
      console.error('Dialogue error:', err);
    } finally {
      setIsDialogueLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
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
    'Screening 312 curated cards across 13 engineering domains...',
    'Calibrating against your candidate weakness profile...',
    'Synthesizing tailored executive study dossier & checklist...',
  ];

  return (
    <>
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
            <div className="ai-prep-header-left">
              <div className="ai-prep-header-icon-wrap">
                <Sparkles size={20} className="ai-prep-header-icon" />
              </div>
              <div className="ai-prep-header-titles">
                <h2 id="ai-prep-modal-title" className="ai-prep-modal-title">
                  AI Interview Prep Coach
                </h2>
                <p className="ai-prep-modal-subtitle">
                  Synthesize a targeted flashcard curriculum & study guide from your target role, recruiter notes, and personal weak spots.
                </p>
              </div>
            </div>

            <div className="ai-prep-header-right">
              <div className="ai-prep-header-controls">
                {/* New Prep button to start fresh from review */}
                {step === 'review' && (
                  <button
                    type="button"
                    className="ai-prep-history-btn ai-prep-new-plan-btn"
                    onClick={() => {
                      setDossier(null);
                      setCompany('');
                      setRole('');
                      setTargetDate('');
                      setRawNotes('');
                      setSelectedWeaknesses([]);
                      setEditableDeckName('');
                      setEditableDescription('');
                      setCheckedCardIds(new Set());
                      setStep('input');
                    }}
                    title="Create a new interview preparation dossier for another company or role"
                    data-testid="ai-prep-new-plan-btn"
                  >
                    <Plus size={13} />
                    <span>+ New Prep</span>
                  </button>
                )}

                {/* Delete Dossier button in review header */}
                {step === 'review' && dossier && (
                  <button
                    type="button"
                    className="ai-prep-history-btn ai-prep-delete-plan-btn"
                    onClick={handleDeleteCurrentDossier}
                    title="Delete this interview briefing and start fresh"
                    data-testid="ai-prep-delete-plan-btn"
                  >
                    <Trash2 size={13} />
                    <span>Delete Dossier</span>
                  </button>
                )}

                {/* Edit in Deck Builder button in review header */}
                {step === 'review' && dossier && onEditCustomDeck && (
                  <button
                    type="button"
                    className="ai-prep-history-btn"
                    onClick={() => {
                      onClose();
                      onEditCustomDeck(dossier.id || 'current_dossier');
                    }}
                    title="Open manual deck builder to customize cards in this deck"
                    data-testid="ai-prep-edit-in-builder-btn"
                  >
                    <Pencil size={13} />
                    <span>Edit in Deck Builder</span>
                  </button>
                )}

                {/* Import Briefing JSON button in header */}
                {step !== 'loading' && (
                  <button
                    type="button"
                    className="ai-prep-history-btn"
                    onClick={handleTriggerImport}
                    title="Import a saved interview dossier (.json)"
                    data-testid="ai-prep-import-json-header-btn"
                  >
                    <Upload size={13} />
                    <span>Import Briefing</span>
                  </button>
                )}

                {/* Saved Briefings dropdown */}
                {savedDossiers.length > 0 && (
                  <div className="ai-prep-saved-dossiers-wrap">
                    <button
                      type="button"
                      className="ai-prep-history-btn"
                      onClick={() => setShowSavedDropdown(!showSavedDropdown)}
                      title="View saved interview prep dossiers"
                    >
                      <Clock size={13} />
                      <span>Saved Briefings ({savedDossiers.length})</span>
                    </button>

                    {showSavedDropdown && (
                      <div className="ai-prep-saved-menu">
                        <div className="saved-menu-header">Saved Interview Briefings</div>
                        <div className="saved-menu-list">
                          {savedDossiers.map((d) => (
                            <div
                              key={d.id || `${d.company}_${d.generatedAt}`}
                              className="saved-menu-item"
                              onClick={() => handleLoadSavedDossier(d)}
                            >
                              <div className="saved-item-info">
                                <span className="saved-item-name">{d.deckName}</span>
                                <span className="saved-item-meta">
                                  {d.selectedCards.length} cards • {new Date(d.generatedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="saved-item-del-btn"
                                title="Delete briefing"
                                onClick={(e) => handleDeleteSavedDossier(e, d)}
                                data-testid={`ai-prep-delete-saved-${d.id}`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="saved-menu-footer">
                          <button
                            type="button"
                            className="saved-menu-clear-all-btn"
                            onClick={handleClearAllDossiers}
                            title="Delete all saved interview briefings"
                            data-testid="ai-prep-clear-all-dossiers-btn"
                          >
                            <Trash2 size={11} />
                            <span>Clear All Saved Briefings</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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

              {/* Stacked Deck Name & Description in Header on Right, underneath buttons */}
              {step === 'review' && dossier && (
                <div className="ai-prep-header-deck-meta" data-testid="ai-prep-header-deck-meta">
                  <div className="header-deck-name-row">
                    <input
                      ref={deckNameInputRef}
                      type="text"
                      className="header-deck-name-input"
                      value={editableDeckName}
                      onChange={(e) => setEditableDeckName(e.target.value)}
                      placeholder="Custom Deck Name"
                      title="Click to edit deck name"
                      data-testid="ai-prep-review-deck-name"
                    />
                    <button
                      type="button"
                      className="header-deck-pencil-btn"
                      onClick={() => deckNameInputRef.current?.focus()}
                      title="Click to edit deck name"
                      aria-label="Edit deck name"
                    >
                      <Pencil size={11} className="header-deck-pencil-icon" />
                    </button>
                  </div>
                  <div className="header-deck-desc-row">
                    <input
                      ref={deckDescInputRef}
                      type="text"
                      className="header-deck-desc-input"
                      value={editableDescription}
                      onChange={(e) => setEditableDescription(e.target.value)}
                      placeholder="Deck Description"
                      title="Click to edit deck description"
                      data-testid="ai-prep-review-deck-desc"
                    />
                    <button
                      type="button"
                      className="header-deck-pencil-btn"
                      onClick={() => deckDescInputRef.current?.focus()}
                      title="Click to edit deck description"
                      aria-label="Edit deck description"
                    >
                      <Pencil size={10} className="header-deck-pencil-icon" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Model Recommendation Banner */}
          <ModelRecommendationBanner
            storedKeys={storedKeys}
            activeProvider={activeProvider}
            activeModel={activeModel}
            onSwitchModel={(p, m) => {
              setStoredProvider(p);
              setStoredModel(m);
              setActiveProvider(p);
              setActiveModel(m);
            }}
            onOpenSettings={onOpenSettings}
          />

          {/* STEP 1: INPUT FORM */}
          {step === 'input' && (
            <form onSubmit={handleStartGeneration} className="ai-prep-form">
              <div className="ai-prep-form-rows">
                {/* Row 1: Target Company (Full width) */}
                <div className="ai-prep-form-row">
                  <label htmlFor="ai-prep-company" className="ai-prep-label">
                    <Building2 size={14} className="label-icon" />
                    <span>Target Company</span>
                  </label>
                  <input
                    id="ai-prep-company"
                    ref={companyInputRef}
                    type="text"
                    className="modal-input ai-prep-input-lg"
                    placeholder="e.g. Stripe, Airbnb, Datadog, Meta, Apple, Google, DoorDash, Figma"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    data-testid="ai-prep-company-input"
                  />
                </div>

                {/* Row 2: Role & Target Level (Full width) */}
                <div className="ai-prep-form-row">
                  <label htmlFor="ai-prep-role" className="ai-prep-label">
                    <Briefcase size={14} className="label-icon" />
                    <span>Role & Target Level</span>
                  </label>
                  <input
                    id="ai-prep-role"
                    type="text"
                    className="modal-input ai-prep-input-lg"
                    placeholder="e.g. Senior Frontend Engineer, Staff UI Engineer, Full-Stack L5"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    data-testid="ai-prep-role-input"
                  />
                </div>

                {/* Row 3: Target Timeline & Deck Sizing (Full width row with clean split) */}
                <div className="ai-prep-split-row">
                  <div className="ai-prep-split-col">
                    <label htmlFor="ai-prep-date" className="ai-prep-label">
                      <Calendar size={14} className="label-icon" />
                      <span>Target Date / Timeline (Optional)</span>
                    </label>
                    <input
                      id="ai-prep-date"
                      type="text"
                      className="modal-input ai-prep-input-lg"
                      placeholder="e.g. In 5 days, next Tuesday, or 2026-11-05"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      data-testid="ai-prep-date-input"
                    />
                  </div>

                  <div className="ai-prep-split-col">
                    <div className="ai-prep-deck-size-header">
                      <label className="ai-prep-label">
                        <Sliders size={14} className="label-icon" />
                        <span>Curriculum Sizing</span>
                      </label>
                      <div className="ai-prep-size-mode-toggle">
                        <button
                          type="button"
                          className={`size-mode-btn ${deckSizeMode === 'auto' ? 'active' : ''}`}
                          onClick={() => setDeckSizeMode('auto')}
                        >
                          <Zap size={12} />
                          <span>Auto (AI Decides)</span>
                        </button>
                        <button
                          type="button"
                          className={`size-mode-btn ${deckSizeMode === 'custom' ? 'active' : ''}`}
                          onClick={() => setDeckSizeMode('custom')}
                        >
                          <Sliders size={12} />
                          <span>Custom Count</span>
                        </button>
                      </div>
                    </div>

                    {deckSizeMode === 'auto' ? (
                      <div className="ai-prep-auto-size-note">
                        <span>AI adapts deck size: 8 cards for sprints, 16–20 for standard timelines, 35–45 for Big Tech (Google, Amazon, Meta, Stripe) or multi-month runway.</span>
                      </div>
                    ) : (
                      <div className="ai-prep-slider-container">
                        <div className="slider-label-row">
                          <span className="slider-label-text">Target Deck Size:</span>
                          <span className="slider-val-badge">{targetCardCount} Cards</span>
                        </div>
                        <input
                          id="ai-prep-count"
                          type="range"
                          min="6"
                          max="70"
                          step="1"
                          className="ai-prep-slider"
                          value={targetCardCount}
                          onChange={(e) => setTargetCardCount(Number(e.target.value))}
                          data-testid="ai-prep-count-slider"
                        />
                        <div className="ai-prep-presets-row">
                          <button
                            type="button"
                            className={`size-preset-pill ${targetCardCount === 8 ? 'active' : ''}`}
                            onClick={() => setTargetCardCount(8)}
                          >
                            ⚡ 8 Sprint (1–3d)
                          </button>
                          <button
                            type="button"
                            className={`size-preset-pill ${targetCardCount === 16 ? 'active' : ''}`}
                            onClick={() => setTargetCardCount(16)}
                          >
                            🎯 16 Focused
                          </button>
                          <button
                            type="button"
                            className={`size-preset-pill ${targetCardCount === 28 ? 'active' : ''}`}
                            onClick={() => setTargetCardCount(28)}
                          >
                            📘 28 Full
                          </button>
                          <button
                            type="button"
                            className={`size-preset-pill ${targetCardCount === 45 ? 'active' : ''}`}
                            onClick={() => setTargetCardCount(45)}
                          >
                            🏛️ 45 Big Tech
                          </button>
                          <button
                            type="button"
                            className={`size-preset-pill ${targetCardCount === 60 ? 'active' : ''}`}
                            onClick={() => setTargetCardCount(60)}
                          >
                            🚀 60 Marathon
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 4: Raw Intelligence Dump (Full width, larger) */}
                <div className="ai-prep-form-row">
                  <label htmlFor="ai-prep-raw-notes" className="ai-prep-label">
                    <BookOpen size={14} className="label-icon" />
                    <span>Raw Intelligence Dump & Special Guidance</span>
                  </label>
                  <p className="ai-prep-field-hint">
                    Paste the job description, recruiter emails, onsite round details, Glassdoor questions, or special requests (e.g. <em>&ldquo;keep deck under 12 cards&rdquo;</em>, <em>&ldquo;focus heavily on React architecture and accessibility&rdquo;</em>).
                  </p>
                  <textarea
                    id="ai-prep-raw-notes"
                    className="ai-prep-textarea ai-prep-textarea-lg"
                    rows={5}
                    placeholder="Paste job description, recruiter notes, interview format, tech stack details, or specific sizing requests here..."
                    value={rawNotes}
                    onChange={(e) => setRawNotes(e.target.value)}
                    data-testid="ai-prep-raw-notes-input"
                  />
                </div>

                {/* Row 5: Candidate Weaknesses Calibration (Full width) */}
                <div className="ai-prep-form-row">
                  <label className="ai-prep-label">
                    <AlertTriangle size={14} className="label-icon" />
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
                      Active Model: <strong>{activeModel || activeProvider}</strong> ({activeProvider})
                    </span>
                  </div>
                  <span className="ai-prep-provider-note">
                    Groq offers a 100% free tier. Claude 3.5 Sonnet / GPT-4o recommended for high-stakes on-sites.
                  </span>
                </div>
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
              <p className="ai-prep-loading-subtext">{pipelineProgressMessage || loadingMessages[loadingMessageIndex]}</p>
            </div>
          )}

          {/* STEP 3: REVIEW & DECK ASSEMBLY */}
          {step === 'review' && dossier && (
            <div className="ai-prep-review-view" data-testid="ai-prep-review-view">
              {/* Notification Banner when Dialogue modifies curriculum */}
              {dialogueUpdateNotification && (
                <div className="ai-prep-update-banner">
                  <Sparkles size={14} />
                  <span>{dialogueUpdateNotification}</span>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="ai-prep-tabs-bar" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'dialogue'}
                  className={`ai-prep-tab-btn ${activeTab === 'dialogue' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dialogue')}
                  data-testid="ai-prep-tab-dialogue"
                >
                  <MessageSquare size={14} />
                  <span>AI Strategy & Coach {dossier.conversation && dossier.conversation.length > 1 ? `(${dossier.conversation.length})` : ''}</span>
                </button>
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
                  <span>External Topics & Gaps ({dossier.externalTopics.length})</span>
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
                    {onEditCustomDeck && (
                      <button
                        type="button"
                        className="btn btn-secondary ai-prep-edit-cards-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '5px 10px', marginLeft: 'auto' }}
                        onClick={() => {
                          onClose();
                          onEditCustomDeck(dossier.id || 'current_dossier');
                        }}
                        title="Open full manual accordion builder"
                        data-testid="ai-prep-open-accordion-builder-btn"
                      >
                        <Pencil size={12} />
                        <span>Open in Deck Builder</span>
                      </button>
                    )}
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
                      {dossier.interactiveTools?.map((tool, i) => (
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
                </div>
              )}

              {/* TAB CONTENT: STRATEGY OVERVIEW & COACH DIALOGUE */}
              {activeTab === 'dialogue' && (
                <div className="ai-prep-dialogue-tab-body" data-testid="ai-prep-dialogue-tab-body">
                  <div className="dialogue-messages-scroll">
                    {dossier.conversation?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`dialogue-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
                      >
                        <div className="bubble-header">
                          <span className="bubble-sender">
                            {msg.role === 'user' ? 'You' : 'AI Interview Coach'}
                          </span>
                          <span className="bubble-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="bubble-content">
                          <MarkdownContent text={msg.content} />
                        </div>
                        {msg.updatedCards && (
                          <div className="bubble-card-update-pill">
                            <Sparkles size={11} />
                            <span>Curriculum updated to {msg.updatedCards.length} cards</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {isDialogueLoading && (
                      <div className="dialogue-bubble assistant loading">
                        <div className="dialogue-typing-indicator">
                          <Loader2 size={14} className="animate-spin" />
                          <span>AI Coach is analyzing and adjusting...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendDialogueMessage();
                    }}
                    className="dialogue-input-bar"
                  >
                    <input
                      type="text"
                      className="dialogue-text-input"
                      placeholder="Ask the coach to modify cards, explain drill choices, or report your progress..."
                      value={dialogueInput}
                      onChange={(e) => setDialogueInput(e.target.value)}
                      disabled={isDialogueLoading}
                    />
                    <button
                      type="submit"
                      className="dialogue-send-btn"
                      disabled={isDialogueLoading || !dialogueInput.trim()}
                      title="Send message to AI Coach"
                    >
                      {isDialogueLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                    </button>
                  </form>
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
                    title="Print clean multi-page document or save as PDF"
                    data-testid="ai-prep-print-dossier-btn"
                  >
                    <Printer size={14} />
                    <span>Print / Save PDF</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary ai-prep-delete-dossier-btn"
                    onClick={handleDeleteCurrentDossier}
                    title="Delete this interview briefing and start fresh"
                    data-testid="ai-prep-delete-dossier-footer-btn"
                  >
                    <Trash2 size={14} />
                    <span>Delete Dossier</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary ai-prep-download-html-btn"
                    onClick={handleDownloadHtml}
                    title="Download standalone HTML dossier for offline reading or manual archiving"
                    data-testid="ai-prep-download-html-btn"
                  >
                    <Download size={14} />
                    <span>Download HTML</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary ai-prep-download-json-btn"
                    onClick={handleDownloadJson}
                    title="Download / Export raw JSON backup of this dossier"
                    data-testid="ai-prep-download-json-btn"
                  >
                    <Download size={14} />
                    <span>Export Dossier</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary ai-prep-import-json-btn"
                    onClick={handleTriggerImport}
                    title="Import an interview dossier JSON file"
                    data-testid="ai-prep-import-json-footer-btn"
                  >
                    <Upload size={14} />
                    <span>Import Dossier</span>
                  </button>

                  {/* <button
                    type="button"
                    className="btn btn-primary ai-prep-done-btn"
                    onClick={onClose}
                    title="Close interview preparation briefing"
                    data-testid="ai-prep-done-btn"
                  >
                    <CheckCircle size={14} />
                    <span>Done</span>
                  </button> */}
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImportJsonFile}
            data-testid="ai-prep-import-json-input"
          />
        </div>
      </div>

      {/* DEDICATED CLEAN PRINT DOCUMENT (Visible ONLY @media print) */}
      {dossier && (
        <div className="ai-prep-print-document" aria-hidden="true">
          <div className="print-header">
            <div className="print-brand">
              <span className="print-brand-badge">LEITNER CODING TRAINER</span>
              <span className="print-doc-type">TECHNICAL INTERVIEW PREPARATION DOSSIER</span>
            </div>
            <h1 className="print-title">{dossier.company} — {dossier.role}</h1>
            <div className="print-meta-grid">
              <div><strong>Target Company:</strong> {dossier.company}</div>
              <div><strong>Role & Level:</strong> {dossier.role}</div>
              <div><strong>Target Timeline:</strong> {dossier.targetDate || 'Upcoming in 1-2 weeks'}</div>
              <div><strong>Prepared Date:</strong> {new Date(dossier.generatedAt).toLocaleDateString()}</div>
              <div><strong>Curriculum Depth:</strong> {dossier.selectedCards.length} Flashcard Drills</div>
            </div>
          </div>

          <div className="print-section">
            <h2 className="print-section-heading">Strategic Interview Executive Summary</h2>
            <div className="print-summary-box">
              <p>{dossier.executiveSummary}</p>
            </div>
          </div>

          <div className="print-section">
            <h2 className="print-section-heading">Curated Flashcard Coding Curriculum ({dossier.selectedCards.length} Cards)</h2>
            <table className="print-cards-table">
              <thead>
                <tr>
                  <th style={{ width: '13%' }}>Priority</th>
                  <th style={{ width: '27%' }}>Problem Drill</th>
                  <th style={{ width: '13%' }}>Domain</th>
                  <th style={{ width: '7%' }}>Diff</th>
                  <th style={{ width: '40%' }}>Tactical Interview Rationale</th>
                </tr>
              </thead>
              <tbody>
                {dossier.selectedCards.map((sel) => {
                  const card = catalogIndex.find((c) => c.id === sel.id);
                  return (
                    <tr key={sel.id}>
                      <td>
                        <span className={`print-priority-tag ${sel.priority}`}>
                          {sel.priority.toUpperCase()}
                        </span>
                      </td>
                      <td><strong>{card?.title || sel.id}</strong></td>
                      <td>{card?.track || 'General'}</td>
                      <td>D{card?.difficulty || 2}</td>
                      <td>{sel.rationale}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="print-section">
            <h2 className="print-section-heading">External Interview Topics & Study Guide</h2>
            <div className="print-topics-list">
              {dossier.externalTopics.map((top, idx) => (
                <div key={idx} className="print-topic-card">
                  <div className="print-topic-title-row">
                    <span className="print-topic-name">{top.topic}</span>
                    <span className="print-topic-priority">[{top.priority.toUpperCase()} PRIORITY]</span>
                  </div>
                  <p className="print-topic-desc">{top.description}</p>
                  {top.recommendedResources.length > 0 && (
                    <div className="print-topic-resources">
                      <strong>Crash Courses & References: </strong>
                      {top.recommendedResources.map((r) => r.title + (r.url ? ` (${r.url})` : '')).join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* <div className="print-section">
            <h2 className="print-section-heading">24-Hour Countdown & Interview Day Protocol</h2>
            <div className="print-checklist">
              {dossier.countdownChecklist?.map((item, idx) => (
                <div key={idx} className="print-checklist-item">
                  <span className="print-checkbox">&#9744;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div> */}

          <div className="print-section">
            <h2 className="print-section-heading">Curated Practice Playgrounds</h2>
            <div className="print-tools-list">
              {dossier.interactiveTools?.map((t, idx) => (
                <div key={idx} className="print-tool-item">
                  <strong>{t.name}</strong> &mdash; {t.focus} ({t.url})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
