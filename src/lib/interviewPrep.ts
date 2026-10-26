import {
  getStoredApiKey,
  getStoredProvider,
  getStoredModel,
  getStoredBaseUrl,
} from './ai';

export interface CatalogIndexEntry {
  id: string;
  title: string;
  track: string;
  concept: string;
  difficulty: number;
  tags: string[];
  summary: string;
}

export type CardPriority = 'must-know' | 'recommended' | 'optional';

export interface InterviewPrepCardSelection {
  id: string;
  priority: CardPriority;
  rationale: string;
}

export interface ExternalStudyTopic {
  topic: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  recommendedResources: Array<{
    title: string;
    url?: string;
  }>;
}

export interface InteractiveToolRecommendation {
  name: string;
  url: string;
  focus: string;
}

export interface DossierMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  updatedCards?: InterviewPrepCardSelection[];
}

export interface InterviewPrepDossier {
  id?: string;
  company: string;
  role: string;
  targetDate?: string;
  deckName: string;
  deckDescription: string;
  executiveSummary: string;
  selectedCards: InterviewPrepCardSelection[];
  externalTopics: ExternalStudyTopic[];
  interactiveTools: InteractiveToolRecommendation[];
  countdownChecklist: string[];
  generatedAt: number;
  conversation?: DossierMessage[];
}

export interface InterviewPrepRequest {
  company: string;
  role: string;
  targetDate?: string;
  rawNotes: string;
  candidateWeaknesses?: string[];
  weakCardIds?: string[];
  dailyCapacity?: number;
  targetCardCount?: number;
}

export const INTERVIEW_DOSSIERS_STORAGE_KEY = 'leitner_interview_dossiers';

/**
 * Compiles catalog index items into a token-efficient prompt string
 */
export function formatCatalogForPrompt(entries: CatalogIndexEntry[]): string {
  return entries
    .map(
      (e) =>
        `- [${e.id}] ${e.title} (${e.track} | D${e.difficulty}) [${e.tags.join(',')}]: ${e.summary}`
    )
    .join('\n');
}

/**
 * Compiles a ultra-compact catalog for dialogue conversations to avoid rate-limiting
 */
export function formatCompactCatalogForDialogue(entries: CatalogIndexEntry[]): string {
  return entries
    .map((e) => `- [${e.id}] ${e.title} (${e.track})`)
    .join('\n');
}

/**
 * Constructs the system and user prompts for synthesizing an interview prep plan
 */
export function buildInterviewPrepPrompt(
  request: InterviewPrepRequest,
  catalog: CatalogIndexEntry[]
): { system: string; user: string } {
  const system = `You are an elite technical interview preparation coach specializing in frontend and full-stack software engineering interviews at top technology companies (Stripe, Airbnb, Datadog, Meta, Google, Amazon, Netflix, Apple, Uber, DoorDash, Figma, Ramp, etc.).
Your mission is to analyze the candidate's target company, role, recruiter communications, job description, and personal weakness areas, and synthesize a laser-focused coding flashcard curriculum combined with an executive study dossier.

CRITICAL RULES:
1. ONLY select card IDs that exist in the provided Card Catalog Index. DO NOT invent or hallucinate any card IDs.
2. Select an appropriate number of cards tailored to the target role, company interview archetype, and candidate weaknesses:
   - When the candidate has an immediate interview (sprint, 1–3 days), select a concentrated set of 6–10 high-impact cards.
   - When preparing for thorough multi-round Big Tech interviews (Google, Amazon, Meta, Apple, Stripe) weeks or months out, select an extensive curriculum of 25–55+ cards.
   - If targetCardCount is specified, honor it closely (allowable range: 6 to 70 cards).
3. For each selected card, provide:
   - "id": exact matching card ID from the index
   - "priority": "must-know" | "recommended" | "optional"
   - "rationale": concise 1-sentence reason why this card is essential for this company's interview rounds.
4. Executive Summary: Write a detailed, multi-paragraph strategic interview briefing (3 to 5 substantial paragraphs):
   - Paragraph 1: Target Company Engineering Archetype & Culture: Analyze what this specific company values (e.g. Amazon's Operational Excellence & Leadership Principles, Google's algorithmic rigor & scale, Meta's rapid UI execution & DOM/tree fluency, Stripe's extreme reliability & API precision). Synthesize any specific intelligence from the job description, recruiter notes, and company interview culture.
   - Paragraph 2: Candidate Risk Calibration: Map the candidate's self-reported weaknesses and current Leitner setbacks against the company's evaluation rubric.
   - Paragraph 3: Topics Not Covered by Flashcards (Gaps Analysis): Explicitly call out critical interview topics not tested in 30-minute flashcard coding exercises—such as Frontend System Design, Microfrontend architecture, WebSockets/SSE real-time streams, Core Web Vitals profiling, Asset bundling/Vite/Webpack, CI/CD, and Behavioral/Leadership rounds.
   - Paragraph 4: Recommended External Deep-Dive Resources: Recommend specific external resources (books like Designing Data-Intensive Applications, Alex Xu's System Design, GreatFrontEnd, web.dev, MDN specifications) to bridge these exact gaps.
5. Extract 3–5 key external topics (System Design, GraphQL, Web Performance, Micro-frontends, CI/CD, SQL, etc.) that are outside flashcard coding scope, with targeted study guidance and specific high-quality resource links.
6. Recommend 3–5 interactive learning tools (Flexbox Froggy, CSSBattle, SQLBolt, Web.dev Learn Accessibility, etc.).
7. Provide a 3–5 item 24-hour countdown checklist.
8. Return ONLY valid JSON adhering strictly to the schema below. No conversational chatter outside the JSON.`;

  const catalogText = formatCatalogForPrompt(catalog);

  const weaknessText =
    request.candidateWeaknesses && request.candidateWeaknesses.length > 0
      ? `Candidate Self-Reported Weaknesses:\n${request.candidateWeaknesses.map((w) => `- ${w}`).join('\n')}`
      : 'Candidate Self-Reported Weaknesses: (None specified)';

  const weakCardsText =
    request.weakCardIds && request.weakCardIds.length > 0
      ? `Candidate Recent Setbacks / Box 1 Cards in Trainer:\n${request.weakCardIds.map((id) => `- ${id}`).join('\n')}`
      : 'Candidate Trainer Setbacks: (None recorded)';

  const cardCountText = request.targetCardCount
    ? `Target Card Count: ${request.targetCardCount} cards`
    : 'Target Card Count: Auto (Select an optimal curriculum depth between 6 and 50 cards based on the candidate\'s timeline, role seniority, company tier, and intelligence dump. For immediate sprints select 6-10 cards; for Big Tech or multi-month runway select 25-50 cards).';

  const user = `Target Company: ${request.company || 'Tech Company'}
Role & Level: ${request.role || 'Senior Software Engineer'}
Target Date / Timeline: ${request.targetDate || 'Upcoming in 1-2 weeks'}
${cardCountText}

${weaknessText}

${weakCardsText}

Raw Intelligence Dump (Job Description, Recruiter Emails, Round Notes, Glassdoor Questions):
"""
${request.rawNotes.trim() || 'General frontend and full-stack technical interview preparation.'}
"""

Available Card Catalog Index (Choose strictly from these card IDs):
${catalogText}

Respond with a JSON object in this exact schema:
{
  "deckName": "${request.company ? `${request.company} — ` : ''}${request.role || 'Interview Prep'} Core",
  "deckDescription": "Targeted curriculum for ${request.company || 'tech'} interview rounds",
  "executiveSummary": "Comprehensive multi-paragraph strategic interview briefing covering: 1) Company engineering archetype & interview culture, 2) Candidate risk calibration, 3) Topics not covered by flashcards (system design, real-time streams, build tooling), and 4) Recommended external study resources.",
  "selectedCards": [
    {
      "id": "card-id-from-index",
      "priority": "must-know",
      "rationale": "Why this card matters for this company"
    }
  ],
  "externalTopics": [
    {
      "topic": "Topic Name (e.g. Frontend System Design, Real-time WebSockets)",
      "priority": "high",
      "description": "What to study and focus on for rounds outside coding drills",
      "recommendedResources": [
        { "title": "Resource Name", "url": "https://..." }
      ]
    }
  ],
  "interactiveTools": [
    {
      "name": "Tool Name",
      "url": "https://...",
      "focus": "Brief focus description"
    }
  ],
  "countdownChecklist": [
    "Checklist item 1",
    "Checklist item 2"
  ]
}`;

  return { system, user };
}

/**
 * Validates and extracts an InterviewPrepDossier from an AI response
 */
export function parseInterviewPrepResponse(
  rawText: string,
  catalog: CatalogIndexEntry[],
  fallback: { company: string; role: string; targetDate?: string }
): InterviewPrepDossier {
  const validIds = new Set(catalog.map((c) => c.id));
  let parsed: Record<string, unknown> | null = null;

  try {
    let text = rawText.trim();
    // Strip markdown code fences if wrapped
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      text = jsonMatch[1].trim();
    }
    parsed = JSON.parse(text);
  } catch {
    // parsed remains null on invalid JSON
  }

  const company = fallback.company || 'Target Company';
  const role = fallback.role || 'Software Engineer';
  const targetDate = fallback.targetDate;

  if (!parsed || typeof parsed !== 'object') {
    // Generate fallback heuristic dossier
    return generateHeuristicDossier(
      { company, role, targetDate, rawNotes: '' },
      catalog
    );
  }

  const deckName =
    typeof parsed.deckName === 'string' && parsed.deckName.trim()
      ? parsed.deckName.trim()
      : `${company} — ${role} Core`;

  const deckDescription =
    typeof parsed.deckDescription === 'string' && parsed.deckDescription.trim()
      ? parsed.deckDescription.trim()
      : `Tailored interview preparation curriculum for ${company}`;

  const executiveSummary =
    typeof parsed.executiveSummary === 'string' && parsed.executiveSummary.trim()
      ? parsed.executiveSummary.trim()
      : `${company}'s technical interview rounds focus on solid engineering fundamentals, clean architecture, and practical problem solving.`;

  // Parse and filter selected cards
  const rawCards = Array.isArray(parsed.selectedCards) ? parsed.selectedCards : [];
  const selectedCards: InterviewPrepCardSelection[] = [];
  const seenIds = new Set<string>();

  for (const item of rawCards) {
    if (typeof item === 'string' && validIds.has(item) && !seenIds.has(item)) {
      seenIds.add(item);
      selectedCards.push({
        id: item,
        priority: 'recommended',
        rationale: `Selected for ${company} technical interview round.`,
      });
    } else if (
      item &&
      typeof item === 'object' &&
      typeof (item as { id?: unknown }).id === 'string'
    ) {
      const cardObj = item as { id: string; priority?: unknown; rationale?: unknown };
      if (validIds.has(cardObj.id) && !seenIds.has(cardObj.id)) {
        seenIds.add(cardObj.id);
        const priority: CardPriority =
          cardObj.priority === 'must-know' || cardObj.priority === 'optional'
            ? cardObj.priority
            : 'recommended';
        const rationale =
          typeof cardObj.rationale === 'string' && cardObj.rationale.trim()
            ? cardObj.rationale.trim()
            : `Key challenge for ${company} technical assessment.`;
        selectedCards.push({ id: cardObj.id, priority, rationale });
      }
    }
  }

  // If no valid cards were parsed, fall back to heuristic selection
  if (selectedCards.length === 0) {
    const fallbackDossier = generateHeuristicDossier(
      { company, role, targetDate, rawNotes: '' },
      catalog
    );
    selectedCards.push(...fallbackDossier.selectedCards);
  }

  // Parse external topics
  const externalTopics: ExternalStudyTopic[] = [];
  if (Array.isArray(parsed.externalTopics)) {
    for (const top of parsed.externalTopics) {
      if (top && typeof top === 'object' && typeof (top as { topic?: unknown }).topic === 'string') {
        const topObj = top as {
          topic: string;
          priority?: unknown;
          description?: unknown;
          recommendedResources?: unknown;
        };
        const resources: Array<{ title: string; url?: string }> = [];
        if (Array.isArray(topObj.recommendedResources)) {
          for (const res of topObj.recommendedResources) {
            if (res && typeof res === 'object' && typeof (res as { title?: unknown }).title === 'string') {
              resources.push({
                title: String((res as { title: string }).title),
                url: typeof (res as { url?: unknown }).url === 'string' ? String((res as { url: string }).url) : undefined,
              });
            }
          }
        }
        externalTopics.push({
          topic: topObj.topic,
          priority: topObj.priority === 'high' || topObj.priority === 'low' ? topObj.priority : 'medium',
          description: typeof topObj.description === 'string' ? topObj.description : '',
          recommendedResources: resources,
        });
      }
    }
  }

  // Parse interactive tools
  const interactiveTools: InteractiveToolRecommendation[] = [];
  if (Array.isArray(parsed.interactiveTools)) {
    for (const tool of parsed.interactiveTools) {
      if (
        tool &&
        typeof tool === 'object' &&
        typeof (tool as { name?: unknown }).name === 'string' &&
        typeof (tool as { url?: unknown }).url === 'string'
      ) {
        interactiveTools.push({
          name: String((tool as { name: string }).name),
          url: String((tool as { url: string }).url),
          focus: typeof (tool as { focus?: unknown }).focus === 'string' ? String((tool as { focus: string }).focus) : '',
        });
      }
    }
  }

  // Parse checklist
  const countdownChecklist: string[] = [];
  if (Array.isArray(parsed.countdownChecklist)) {
    for (const item of parsed.countdownChecklist) {
      if (typeof item === 'string' && item.trim()) {
        countdownChecklist.push(item.trim());
      }
    }
  }

  const dossierId = `dossier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const initialPromptNote = `Ask questions about this company's interview loop, request curriculum adjustments (e.g. "trim deck to 12 cards", "add more state machine problems"), or ask for an analysis of your current Leitner box progress as you practice. Type any request below.`;
  const initialMessage: DossierMessage = {
    id: `msg_${Date.now().toString(36)}_0`,
    role: 'assistant',
    content: `${executiveSummary}\n\n${initialPromptNote}`,
    timestamp: Date.now(),
  };

  return {
    id: dossierId,
    company,
    role,
    targetDate,
    deckName,
    deckDescription,
    executiveSummary,
    selectedCards,
    externalTopics: externalTopics.length > 0 ? externalTopics : getDefaultExternalTopics(),
    interactiveTools: interactiveTools.length > 0 ? interactiveTools : getDefaultInteractiveTools(),
    countdownChecklist: countdownChecklist.length > 0 ? countdownChecklist : getDefaultChecklist(),
    generatedAt: Date.now(),
    conversation: [initialMessage],
  };
}

/**
 * Deterministic heuristic generator when running offline or testing
 */
export function generateHeuristicDossier(
  request: InterviewPrepRequest,
  catalog: CatalogIndexEntry[]
): InterviewPrepDossier {
  const company = request.company?.trim() || 'Tech Company';
  const role = request.role?.trim() || 'Software Engineer';
  const companyLower = company.toLowerCase();
  const notesLower = (request.rawNotes || '').toLowerCase();
  const isFrontend = /frontend|ui|react|web|client/i.test(role);

  // Score catalog cards based on role, company archetypes, and text signals
  const scored = catalog.map((card) => {
    let score = 0;
    const cardText = `${card.id} ${card.title} ${card.tags.join(' ')} ${card.summary}`.toLowerCase();

    // Archetype boosts
    if (companyLower.includes('stripe')) {
      if (/lru|a11y|compound|tab|event-emitter|fetch|form|retry/i.test(cardText)) score += 5;
    } else if (companyLower.includes('airbnb')) {
      if (/calendar|star|carousel|combobox|modal|date|rating/i.test(cardText)) score += 5;
    } else if (companyLower.includes('datadog')) {
      if (/raf|throttle|debounce|observer|progress|spy|metric/i.test(cardText)) score += 5;
    } else if (companyLower.includes('meta') || companyLower.includes('facebook')) {
      if (/dom|tree|virtual|hook|memo|search|traversal/i.test(cardText)) score += 5;
    }

    // Role boosts
    if (isFrontend) {
      if (card.track === 'react-components' || card.track === 'react') score += 4;
      if (card.track === 'dom-browser' || card.track === 'async-js') score += 3;
      if (card.track === 'advanced-algorithms') score -= 2;
    } else {
      if (card.track === 'algorithms' || card.track === 'js-utilities') score += 3;
    }

    // Match keywords from raw notes
    for (const word of ['promise', 'tree', 'hook', 'state', 'debounce', 'sort', 'graph', 'form', 'cache']) {
      if (notesLower.includes(word) && cardText.includes(word)) score += 3;
    }

    // Weakness boost
    if (request.weakCardIds?.includes(card.id)) score += 4;

    return { card, score };
  });

  scored.sort((a, b) => b.score - a.score || a.card.difficulty - b.card.difficulty);

  let targetCount = request.targetCardCount;
  if (!targetCount) {
    if (
      /sprint|urgent|tomorrow|3-day|3 day|48 hour|immediate|quick/i.test(notesLower) ||
      /sprint|urgent/i.test(request.targetDate || '')
    ) {
      targetCount = 8;
    } else if (
      /google|amazon|meta|facebook|apple|stripe|netflix/i.test(companyLower) ||
      /comprehensive|deep|thorough|month|marathon/i.test(notesLower)
    ) {
      targetCount = 36;
    } else {
      targetCount = 18;
    }
  }
  // Clamp between 1 and min(catalog.length, 75)
  targetCount = Math.max(1, Math.min(catalog.length, Math.min(75, targetCount)));

  const picked = scored.slice(0, targetCount);

  const mustKnowCutoff = Math.max(2, Math.floor(picked.length * 0.28));
  const recommendedCutoff = Math.max(mustKnowCutoff + 2, Math.floor(picked.length * 0.72));

  const selectedCards: InterviewPrepCardSelection[] = picked.map((item, idx) => ({
    id: item.card.id,
    priority: idx < mustKnowCutoff ? 'must-know' : idx < recommendedCutoff ? 'recommended' : 'optional',
    rationale: `Highly relevant for ${company} ${role} technical screening.`,
  }));

  // Company Archetype intelligence paragraph
  let archetypeParagraph = `${company}'s engineering assessment focuses on strong engineering fundamentals, transparent problem-solving, and clean architectural abstractions. Expect interviewers to evaluate not just whether your solution runs, but how clearly you communicate tradeoffs, structure modular functions, and validate edge cases under timed constraints.`;

  if (companyLower.includes('google') || companyLower.includes('alphabet')) {
    archetypeParagraph = `Google evaluates candidates through an engineering lens that strictly values asymptotic complexity, rock-solid data structure manipulation, and zero-leak memory discipline. Expect interviewers to dig deep into Big-O time and space tradeoffs, boundary edge cases (off-by-one, empty inputs, sparse trees), and how your implementations scale when data volume grows by multiple orders of magnitude.`;
  } else if (companyLower.includes('amazon') || companyLower.includes('aws')) {
    archetypeParagraph = `Amazon pairs coding evaluations directly with their Leadership Principles (notably Customer Obsession, Ownership, and Dive Deep). Technical rounds focus heavily on operational robustness: resilient retry policies, idempotent operations, graceful error handling, and writing clean, maintainable modular code that can withstand real-world production failures.`;
  } else if (companyLower.includes('meta') || companyLower.includes('facebook')) {
    archetypeParagraph = `Meta's frontend bar centers on velocity, DOM tree traversal fluency, and intuitive component state architecture. Interviewers assess your ability to implement custom hooks, virtualized lists, and clean compound UI widgets within strict 35–45 minute coding windows, prioritizing clean separation of concerns and immediate bug-free execution.`;
  } else if (companyLower.includes('stripe')) {
    archetypeParagraph = `Stripe is legendary for its practical, real-world development environment interviews. Rather than abstract puzzles, you will build and debug real-world software: designing composable API utilities, implementing rate limiters or LRU caches, handling network race conditions, and writing bulletproof, type-safe code that models financial-grade reliability.`;
  } else if (companyLower.includes('apple')) {
    archetypeParagraph = `Apple's software engineering ethos prioritizes buttery-smooth 60fps responsiveness, pixel-perfect layout mechanics, and strict adherence to accessibility (WAI-ARIA) and privacy contracts. Expect focus on event loop performance, clean lifecycle teardown, and deterministic UI state machines.`;
  } else if (companyLower.includes('netflix')) {
    archetypeParagraph = `Netflix engineering emphasizes distributed client-side resilience, telemetry, caching layers, and media playback synchronization. Technical screenings value proactive defensive programming, observable error metrics, and decoupled asynchronous state management.`;
  }

  // Candidate calibration paragraph
  const weaknessList = request.candidateWeaknesses && request.candidateWeaknesses.length > 0
    ? request.candidateWeaknesses.join(', ')
    : 'core component state transitions and asynchronous lifecycle edge cases';
  const calibrationParagraph = `To address your calibrated focus areas (${weaknessList}), this curriculum prioritizes high-yield hands-on drills that convert theoretical knowledge into instantaneous muscle memory. Regular spaced intervals will ensure that syntactic speed and invariant validation become second nature during live whiteboard or pairing sessions.`;

  // Gap analysis paragraph (What Flashcards Don't Cover)
  const gapsParagraph = `Topics Not Covered by Flashcards (Gap Analysis): While this flashcard deck builds rapid retrieval for in-browser JavaScript, TypeScript, DOM APIs, and React component mechanics, standard interview loops also feature non-coding rounds. Specifically, you must prepare for: 1) Frontend System Design & High-Level Architecture (data normalization, offline caching, SSR vs CSR tradeoffs), 2) Real-time Data Plumbing (WebSockets vs Server-Sent Events vs long-polling), and 3) Build Tooling & Core Web Vitals (bundling strategies, code splitting, and INP/LCP profiling).`;

  // External resource recommendations paragraph
  const resourcesParagraph = `Recommended External Resources: To bridge these architectural gaps, we recommend: Alex Xu's 'System Design Interview – An Insider's Guide' (Vol 2), the GreatFrontEnd System Design Playbook, web.dev's Core Web Vitals architecture guide, and the MDN WAI-ARIA authoring practices. Review these alongside your daily spaced-repetition drills to ensure full-spectrum interview readiness.`;

  const executiveSummary = `${archetypeParagraph}\n\n${calibrationParagraph}\n\n${gapsParagraph}\n\n${resourcesParagraph}`;

  const dossierId = `dossier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const initialPromptNote = `Ask questions about this company's interview loop, request curriculum adjustments (e.g. "trim deck to 12 cards", "add more state machine problems"), or ask for an analysis of your current Leitner box progress as you practice. Type any request below.`;
  const initialMessage: DossierMessage = {
    id: `msg_${Date.now().toString(36)}_0`,
    role: 'assistant',
    content: `${executiveSummary}\n\n${initialPromptNote}`,
    timestamp: Date.now(),
  };

  return {
    id: dossierId,
    company,
    role,
    targetDate: request.targetDate,
    deckName: `${company} — ${role} Core`,
    deckDescription: `Curated ${selectedCards.length}-card curriculum for ${company} technical interviews`,
    executiveSummary,
    selectedCards,
    externalTopics: getDefaultExternalTopics(),
    interactiveTools: getDefaultInteractiveTools(),
    countdownChecklist: getDefaultChecklist(),
    generatedAt: Date.now(),
    conversation: [initialMessage],
  };
}

export function getDefaultExternalTopics(): ExternalStudyTopic[] {
  return [
    {
      topic: 'Web Performance & Core Web Vitals',
      priority: 'high',
      description: 'Focus on Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and layout stability (CLS). Be ready to explain code-splitting and asset optimization.',
      recommendedResources: [
        { title: 'Web.dev Core Web Vitals Guide', url: 'https://web.dev/vitals/' },
      ],
    },
    {
      topic: 'Frontend System Design & Architecture',
      priority: 'high',
      description: 'Component state isolation, server-side rendering caching strategies, WebSocket synchronization, and client-side data stores.',
      recommendedResources: [
        { title: 'GreatFrontEnd System Design Playbook', url: 'https://www.greatfrontend.com' },
      ],
    },
    {
      topic: 'Web Accessibility & Semantic HTML',
      priority: 'medium',
      description: 'WAI-ARIA roles, roving tabindex keyboard navigation, screen reader live regions, and color contrast ratios.',
      recommendedResources: [
        { title: 'MDN Web Accessibility Tutorials', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility' },
      ],
    },
  ];
}

export function getDefaultInteractiveTools(): InteractiveToolRecommendation[] {
  return [
    { name: 'Flexbox Froggy', url: 'https://flexboxfroggy.com', focus: 'CSS Flexbox layout alignment speed drills' },
    { name: 'Grid Garden', url: 'https://cssgridgarden.com', focus: 'CSS Grid template areas and spatial layouts' },
    { name: 'CSSBattle', url: 'https://cssbattle.dev', focus: 'Precision CSS visual mastery and selector fluency' },
    { name: 'Web.dev Learn Accessibility', url: 'https://web.dev/learn/accessibility', focus: 'Hands-on interactive accessibility audits' },
  ];
}

export function getDefaultChecklist(): string[] {
  return [
    '24 Hours Out: Complete a timed review of all Box 1 and setback cards in the trainer',
    'Interview Environment: Test webcam, microphone, screen sharing, and Node environment in CoderPad/CodeSandbox',
    'First 5 Minutes: Clarify requirements, expected input/output ranges, scale, and constraints before typing',
    'During Coding: State your time and space complexity upfront and verify edge cases explicitly',
  ];
}

/**
 * Generates an InterviewPrepDossier by querying the active AI provider
 */
export async function generateInterviewPrepDossier(
  request: InterviewPrepRequest,
  catalog: CatalogIndexEntry[]
): Promise<InterviewPrepDossier> {
  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();

  // If no API key configured, use the deterministic heuristic generator
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 400));
    return generateHeuristicDossier(request, catalog);
  }

  const { system, user } = buildInterviewPrepPrompt(request, catalog);

  try {
    if (provider === 'gemini') {
      const model = getStoredModel() || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: 'application/json',
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`Gemini error (${response.status}): ${await response.text()}`);
      }
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      return parseInterviewPrepResponse(rawText, catalog, request);
    } else if (provider === 'anthropic') {
      const model = getStoredModel() || 'claude-3-5-sonnet-20241022';
      const endpoint = 'https://api.anthropic.com/v1/messages';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 3000,
          temperature: 0.2,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });
      if (!response.ok) {
        throw new Error(`Anthropic error (${response.status}): ${await response.text()}`);
      }
      const data = await response.json();
      const rawText = data.content?.[0]?.text?.trim() || '';
      return parseInterviewPrepResponse(rawText, catalog, request);
    } else {
      let baseUrl = getStoredBaseUrl();
      let model = getStoredModel();
      if (provider === 'openai') {
        baseUrl = baseUrl || 'https://api.openai.com/v1';
        model = model || 'gpt-4o-mini';
      } else if (provider === 'groq') {
        baseUrl = baseUrl || 'https://api.groq.com/openai/v1';
        model = model || 'llama-3.3-70b-versatile';
      } else if (provider === 'cerebras') {
        baseUrl = baseUrl || 'https://api.cerebras.ai/v1';
        model = model || 'llama3.3-70b';
      } else if (provider === 'mistral') {
        baseUrl = baseUrl || 'https://api.mistral.ai/v1';
        model = model || 'codestral-latest';
      } else if (provider === 'openrouter') {
        baseUrl = baseUrl || 'https://openrouter.ai/api/v1';
        model = model || 'anthropic/claude-3.5-sonnet';
      }

      const endpoint = `${(baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '')}/chat/completions`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error (${response.status}): ${await response.text()}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content?.trim() || '';
      return parseInterviewPrepResponse(rawText, catalog, request);
    }
  } catch {
    // If external call fails, gracefully fall back to heuristic generator
    return generateHeuristicDossier(request, catalog);
  }
}

// ---------------------------------------------------------------------------
// AI Copilot Dialogue & Refinement
// ---------------------------------------------------------------------------

export interface DialogueResponse {
  reply: string;
  updatedCards?: InterviewPrepCardSelection[];
}

export async function continueInterviewDialogue(
  dossier: InterviewPrepDossier,
  userMessage: string,
  catalog: CatalogIndexEntry[],
  progressContext?: {
    box1Count: number;
    box2Count: number;
    box3PlusCount: number;
    masteredCount: number;
    recentBox1Titles: string[];
  }
): Promise<DialogueResponse> {
  const validIds = new Set(catalog.map((c) => c.id));
  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();

  if (!apiKey) {
    return generateHeuristicDialogueReply(dossier, userMessage, catalog, progressContext);
  }

  const selectedCardsSummary = dossier.selectedCards
    .map((c) => {
      const entry = catalog.find((x) => x.id === c.id);
      return `- [${c.priority.toUpperCase()}] ${c.id}: ${entry?.title || c.id} (${entry?.track || 'track'}) — ${c.rationale}`;
    })
    .join('\n');

  const progressSummary = progressContext
    ? `Candidate Leitner Practice Progress:
- Mastered / High Retention (Box 3+): ${progressContext.box3PlusCount + progressContext.masteredCount}
- Maturing (Box 2): ${progressContext.box2Count}
- Recent Setbacks / Active Retention Need (Box 1): ${progressContext.box1Count}
${progressContext.recentBox1Titles.length > 0 ? `Setback Cards: ${progressContext.recentBox1Titles.join(', ')}` : ''}`
    : 'No live Leitner progress reported yet.';

  const systemPrompt = `You are an expert technical interview coach for a candidate preparing for an upcoming technical interview at ${dossier.company} for the role of ${dossier.role}.
The candidate has a tailored curriculum of ${dossier.selectedCards.length} flashcards and an interview preparation dossier.

CURRENT CURRICULUM:
${selectedCardsSummary}

PROGRESS STATUS:
${progressSummary}

FULL CARD CATALOG AVAILABLE FOR MODIFICATIONS OR SWAPS:
${formatCompactCatalogForDialogue(catalog)}

COACHING DIRECTIVES:
1. Provide concise, direct, senior-level coaching and tactical advice.
2. If the user asks questions or reports progress, analyze what they should focus on next with actionable suggestions.
3. If the user asks to ADD, REMOVE, TRIM, or MODIFY cards in their custom deck (e.g. "trim to 10 cards", "remove algorithms", "add more react hooks"), make the necessary adjustments to the curriculum.
4. If you modified the curriculum, append a JSON block at the very end of your response with the FULL updated selected cards list:
\`\`\`json
{
  "updatedCards": [
    { "id": "card-id-from-catalog", "priority": "must-know" | "recommended" | "optional", "rationale": "one concise sentence" }
  ]
}
\`\`\`
Only include this JSON block if the candidate requested a modification to the deck cards.`;

  // Build a normalized message sequence:
  // 1. system prompt
  // 2. user introduction if the conversation history starts with an assistant message
  // 3. alternating user/assistant history without consecutive duplicates
  // 4. final user message
  const normalizedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  const history = (dossier.conversation || []).slice(-6);
  if (history.length > 0 && history[0].role === 'assistant') {
    normalizedMessages.push({
      role: 'user',
      content: `Hello coach, let's review my preparation for ${dossier.company} (${dossier.role}).`,
    });
  }

  for (const msg of history) {
    if (normalizedMessages.length > 0 && normalizedMessages[normalizedMessages.length - 1].role === msg.role) {
      normalizedMessages[normalizedMessages.length - 1].content += `\n\n${msg.content}`;
    } else {
      normalizedMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  if (normalizedMessages.length > 0 && normalizedMessages[normalizedMessages.length - 1].role === 'user') {
    normalizedMessages[normalizedMessages.length - 1].content += `\n\n${userMessage}`;
  } else {
    normalizedMessages.push({ role: 'user', content: userMessage });
  }

  try {
    let rawReply = '';
    if (provider === 'gemini') {
      const model = getStoredModel() || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

      const geminiContents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];
      for (const m of normalizedMessages.filter((msg) => msg.role !== 'system')) {
        geminiContents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiContents,
          generationConfig: { temperature: 0.3 },
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[AI Coach] Gemini error (${response.status}):`, errText);
        throw new Error(`Gemini error (${response.status}): ${errText}`);
      }
      const data = await response.json();
      rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    } else if (provider === 'anthropic') {
      const model = getStoredModel() || 'claude-3-5-sonnet-20241022';
      const endpoint = 'https://api.anthropic.com/v1/messages';

      const anthropicMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
      for (const m of normalizedMessages.filter(
        (msg): msg is { role: 'user' | 'assistant'; content: string } => msg.role !== 'system'
      )) {
        anthropicMessages.push({
          role: m.role,
          content: m.content,
        });
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          system: systemPrompt,
          messages: anthropicMessages,
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[AI Coach] Anthropic error (${response.status}):`, errText);
        throw new Error(`Anthropic error (${response.status}): ${errText}`);
      }
      const data = await response.json();
      rawReply = data.content?.[0]?.text?.trim() || '';
    } else {
      let baseUrl = getStoredBaseUrl();
      let model = getStoredModel();
      if (provider === 'openai') {
        baseUrl = baseUrl || 'https://api.openai.com/v1';
        model = model || 'gpt-4o-mini';
      } else if (provider === 'groq') {
        baseUrl = baseUrl || 'https://api.groq.com/openai/v1';
        model = model || 'openai/gpt-oss-120b';
      } else if (provider === 'cerebras') {
        baseUrl = baseUrl || 'https://api.cerebras.ai/v1';
        model = model || 'llama3.3-70b';
      } else if (provider === 'mistral') {
        baseUrl = baseUrl || 'https://api.mistral.ai/v1';
        model = model || 'codestral-latest';
      } else if (provider === 'openrouter') {
        baseUrl = baseUrl || 'https://openrouter.ai/api/v1';
        model = model || 'anthropic/claude-3.5-sonnet';
      }
      const endpoint = `${(baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '')}/chat/completions`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: normalizedMessages,
          temperature: 0.3,
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[AI Coach] ${provider} error (${response.status}):`, errText);
        let errorSnippet = errText;
        try {
          const parsedErr = JSON.parse(errText);
          if (parsedErr.error?.message) errorSnippet = parsedErr.error.message;
        } catch {
          /* ignore */
        }
        throw new Error(`${provider} (${response.status}): ${errorSnippet}`);
      }
      const data = await response.json();
      rawReply = data.choices?.[0]?.message?.content?.trim() || '';
    }

    if (!rawReply) {
      return generateHeuristicDialogueReply(dossier, userMessage, catalog, progressContext);
    }

    const jsonMatch = rawReply.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let updatedCards: InterviewPrepCardSelection[] | undefined = undefined;
    let cleanReply = rawReply;

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        if (Array.isArray(parsed.updatedCards)) {
          const cards: InterviewPrepCardSelection[] = [];
          const seen = new Set<string>();
          for (const c of parsed.updatedCards) {
            if (c && typeof c.id === 'string' && validIds.has(c.id) && !seen.has(c.id)) {
              seen.add(c.id);
              cards.push({
                id: c.id,
                priority: c.priority === 'must-know' || c.priority === 'optional' ? c.priority : 'recommended',
                rationale: typeof c.rationale === 'string' ? c.rationale : `Targeted for ${dossier.company}.`,
              });
            }
          }
          if (cards.length > 0) {
            updatedCards = cards;
            cleanReply = rawReply.replace(/```(?:json)?\s*[\s\S]*?\s*```/, '').trim();
          }
        }
      } catch {
        /* ignore parsing issues in chat */
      }
    }

    return { reply: cleanReply, updatedCards };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[AI Coach] Dialogue request error, falling back:', errorMsg);
    const fallback = generateHeuristicDialogueReply(dossier, userMessage, catalog, progressContext);
    if (apiKey) {
      return {
        ...fallback,
        reply: `*(Note: Live model request error: ${errorMsg.slice(0, 120)}. Showing coaching guidance:)*\n\n${fallback.reply}`,
      };
    }
    return fallback;
  }
}

export function generateHeuristicDialogueReply(
  dossier: InterviewPrepDossier,
  userMessage: string,
  catalog: CatalogIndexEntry[],
  progressContext?: {
    box1Count: number;
    box2Count: number;
    box3PlusCount: number;
    masteredCount: number;
    recentBox1Titles: string[];
  }
): DialogueResponse {
  const msgLower = userMessage.toLowerCase();

  // 1. Deck modification: Trimming / reducing cards
  if (/trim|reduce|cut|smaller|10 card|fewer/i.test(msgLower)) {
    const desiredMatch = msgLower.match(/\b([1-9]|1[0-9]|20)\b/);
    const desiredCount = desiredMatch ? parseInt(desiredMatch[1], 10) : 10;
    const targetCount = Math.max(6, Math.min(desiredCount, 24));
    const sorted = [...dossier.selectedCards].sort((a, b) => {
      const pOrder = { 'must-know': 0, 'recommended': 1, 'optional': 2 };
      return pOrder[a.priority] - pOrder[b.priority];
    });
    const updatedCards = sorted.slice(0, targetCount);
    return {
      reply: `I've streamlined your curriculum down to the top ${updatedCards.length} highest-priority cards for ${dossier.company}. This focuses your preparation on essential state contracts, core architectural patterns, and accessibility requirements without unnecessary fatigue.`,
      updatedCards,
    };
  }

  // 2. Deck modification: Adding more React / hooks cards
  if (/more react|hooks|component|custom hook/i.test(msgLower)) {
    const reactCards = catalog.filter(
      (c) =>
        (c.track === 'react-components' || c.tags.includes('react') || c.tags.includes('hooks')) &&
        !dossier.selectedCards.some((sc) => sc.id === c.id)
    );
    const additions: InterviewPrepCardSelection[] = reactCards.slice(0, 3).map((c) => ({
      id: c.id,
      priority: 'must-know',
      rationale: `Direct React pattern assessment for ${dossier.company}.`,
    }));
    const updatedCards = [...dossier.selectedCards, ...additions];
    return {
      reply: `I've expanded the curriculum with ${additions.length} additional targeted React component and custom hook drills (${additions.map((a) => a.id).join(', ')}). These reinforce component isolation, state machine synchronization, and lifecycle cleanups.`,
      updatedCards,
    };
  }

  // 3. Question predictions / what to expect in the interview rounds
  if (/predict|question|expect|ask|interview loop|type of question|what kind/i.test(msgLower)) {
    const topCards = dossier.selectedCards.slice(0, 3).map((c) => `\`${c.id}\``).join(', ');
    return {
      reply: `For **${dossier.company}**'s **${dossier.role}** technical interviews, interviewers typically structure coding screens around 3 core archetypes:

1. **Live Component Construction & State Machines**: Rapid implementation of stateful interactive widgets from scratch within 35–45 minutes (e.g. ${topCards || 'compound widgets and async lists'}). They will watch whether you isolate state cleanly, avoid unnecessary re-renders, and manage cleanup lifecycles.
2. **Async Orchestration & Data Plumbing**: Handling debounced search inputs, cancellation via \`AbortController\`, in-memory LRU caching, or resilient polling with backoff.
3. **Accessibility (a11y) & Production Invariants**: Testing keyboard trap contracts (\`Escape\`, arrow navigation, roving tabindex), screen reader live announcements (\`aria-live\`), and input validation boundaries.

💡 **Coach Tip:** Start each coding drill by clarifying boundary constraints (empty lists, extreme scale, error states) before typing any implementation code!`,
    };
  }

  // 4. External resources / study allocation / books / documentation
  if (/resource|external|spend|time|read|book|study|doc|where should i/i.test(msgLower)) {
    const topicsList = (dossier.externalTopics || [])
      .slice(0, 3)
      .map((t) => `- **${t.topic}** (${t.priority.toUpperCase()} priority): ${t.description}`)
      .join('\n');

    const toolsList = (dossier.interactiveTools || [])
      .slice(0, 3)
      .map((tool) => `- [${tool.name}](${tool.url}): ${tool.focus}`)
      .join('\n');

    return {
      reply: `Here is the recommended study time breakdown for your **${dossier.company}** interview:

⏱️ **Recommended Time Allocation:**
- **50% Flashcard Coding Drills (Trainer):** Practice your customized ${dossier.selectedCards.length}-card deck under strict 20-minute timers. Aim to reproduce solutions cold without looking at reference implementations.
- **30% Architecture & Non-Flashcard Topics:**
${topicsList || '- Frontend System Design & Micro-frontends\n- Web Performance & Core Web Vitals'}
- **20% Interactive Layout Fluency & Speed:**
${toolsList || '- Flexbox Froggy & CSSBattle for layout speed'}

Prioritize the HIGH-priority external topics above first, especially topics not covered by 30-minute flashcard coding exercises!`,
    };
  }

  // 5. Company evaluation rubric / culture / archetypes
  if (/culture|archetype|rubric|value|evaluate|grading|signal/i.test(msgLower)) {
    return {
      reply: `At **${dossier.company}**, candidates for **${dossier.role}** are evaluated against 4 primary signals:
1. **Architectural Clarity:** Can you articulate *why* you chose a particular data structure or state shape before writing code?
2. **Cold-Start Speed:** Can you scaffold TypeScript interfaces, error guards, and core loop logic without relying on Google or AI autocompletion?
3. **Resilience & Defensive Coding:** Do you account for async race conditions, unmounted state updates, and boundary edge cases?
4. **Communication & Collaboration:** Do you think aloud, communicate trade-offs, and treat the interviewer as a peer engineer?`,
    };
  }

  // 6. Countdown checklist / final hours before the interview
  if (/checklist|countdown|timer|24 hour|day of|tip|advice/i.test(msgLower)) {
    const checklistItems = (dossier.countdownChecklist || [])
      .map((item, idx) => `${idx + 1}. ${item}`)
      .join('\n');
    return {
      reply: `Here is your targeted countdown checklist for **${dossier.company}**:\n\n${checklistItems || '1. Review Box 1 setbacks\n2. Clarify requirements upfront\n3. Test camera and CoderPad environment'}`,
    };
  }

  // 7. Progress inquiry
  if (/progress|mastered|leitner|box|status|how am i doing/i.test(msgLower) && progressContext) {
    const totalPracticed =
      progressContext.box1Count + progressContext.box2Count + progressContext.box3PlusCount;
    if (totalPracticed === 0) {
      return {
        reply: `You haven't recorded any completed trials in this deck yet. I recommend starting with the top 3 "MUST-KNOW" cards today in 25-minute focused bursts. Aim to write code cold without looking at reference solutions!`,
      };
    }
    const mastered = progressContext.box3PlusCount + progressContext.masteredCount;
    return {
      reply: `Solid progress! You currently have ${mastered} cards at high retention (Box 3+), ${progressContext.box2Count} developing in Box 2, and ${progressContext.box1Count} in Box 1 setbacks.\n\n🎯 **Immediate Next Step:** Clear the ${progressContext.box1Count} Box 1 setback cards first before attempting new cards. In ${dossier.company} interviews, stumbling on basic syntax or edge cases causes setbacks—re-drilling these cements immediate fluency.`,
    };
  }

  // 8. Dynamic fallback addressing user question directly
  return {
    reply: `Regarding "${userMessage.trim()}": For your upcoming **${dossier.company}** (${dossier.role}) technical screening, keep your daily preparation anchored to the ${dossier.selectedCards.length} cards in this curriculum. 

Focus especially on:
1. Writing solutions cold from scratch without reference peeks.
2. Explaining time and space complexity upfront before typing.
3. Specifying explicit TypeScript interfaces and accessibility semantics.

Feel free to ask me to modify your curriculum (e.g. "trim deck to 10 cards" or "add more react hooks"), ask about specific external topics, or report your Leitner box retention progress as you practice!`,
  };
}

// ---------------------------------------------------------------------------
// LocalStorage Persistence for Dossiers
// ---------------------------------------------------------------------------

export function loadAllInterviewDossiers(): Record<string, InterviewPrepDossier> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(INTERVIEW_DOSSIERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    let mutated = false;
    for (const key of Object.keys(parsed)) {
      const item = parsed[key];
      if (!item || typeof item !== 'object') {
        delete parsed[key];
        mutated = true;
        continue;
      }
      if (!item.id) {
        item.id = key.startsWith('dossier_')
          ? key
          : `dossier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        mutated = true;
      }
    }
    if (mutated) {
      localStorage.setItem(INTERVIEW_DOSSIERS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return {};
  }
}

export function saveInterviewDossier(deckOrDossierId: string, dossier: InterviewPrepDossier): void {
  if (typeof window === 'undefined') return;
  const all = loadAllInterviewDossiers();
  if (!dossier.id) {
    dossier.id = deckOrDossierId.startsWith('dossier_')
      ? deckOrDossierId
      : `dossier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  }
  all[deckOrDossierId] = dossier;
  if (dossier.id && dossier.id !== deckOrDossierId) {
    all[dossier.id] = dossier;
  }
  try {
    localStorage.setItem(INTERVIEW_DOSSIERS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore storage quotas */
  }
}

export function getInterviewDossier(deckOrDossierId: string): InterviewPrepDossier | null {
  const all = loadAllInterviewDossiers();
  return all[deckOrDossierId] || null;
}

export function getAllSavedDossiers(): InterviewPrepDossier[] {
  const all = loadAllInterviewDossiers();
  const list = Object.values(all);
  const map = new Map<string, InterviewPrepDossier>();
  for (const d of list) {
    if (!d) continue;
    const key = d.id || `${d.company || 'briefing'}_${d.role || 'prep'}_${d.generatedAt || 0}`;
    if (!map.has(key) || ((map.get(key)!.generatedAt || 0) < (d.generatedAt || 0))) {
      map.set(key, d);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => (b.generatedAt || 0) - (a.generatedAt || 0)
  );
}

export function deleteInterviewDossier(
  target: string | Partial<InterviewPrepDossier>
): void {
  if (typeof window === 'undefined') return;
  const all = loadAllInterviewDossiers();

  const targetStr = typeof target === 'string' ? target.trim() : '';
  const targetObj = typeof target === 'object' && target !== null ? target : undefined;

  let targetId = targetStr || targetObj?.id || '';
  let targetCompany = targetObj?.company;
  let targetRole = targetObj?.role;
  let targetGeneratedAt = targetObj?.generatedAt;
  let targetDeckName = targetObj?.deckName;

  if (targetStr && all[targetStr]) {
    const item = all[targetStr];
    targetId = targetId || item.id || targetStr;
    targetCompany = targetCompany || item.company;
    targetRole = targetRole || item.role;
    targetGeneratedAt = targetGeneratedAt || item.generatedAt;
    targetDeckName = targetDeckName || item.deckName;
  }

  // Also check if any dossier in `all` matches targetId
  if (targetId) {
    for (const item of Object.values(all)) {
      if (item && item.id === targetId) {
        targetCompany = targetCompany || item.company;
        targetRole = targetRole || item.role;
        targetGeneratedAt = targetGeneratedAt || item.generatedAt;
        targetDeckName = targetDeckName || item.deckName;
        break;
      }
    }
  }

  for (const key of Object.keys(all)) {
    const item = all[key];
    const matchesTargetStr = Boolean(targetStr && key === targetStr);
    const matchesId = Boolean(targetId && (key === targetId || item?.id === targetId));
    const matchesMeta = Boolean(
      targetCompany &&
      item?.company &&
      item.company.toLowerCase() === targetCompany.toLowerCase() &&
      (!targetRole || !item?.role || item.role.toLowerCase() === targetRole.toLowerCase()) &&
      (!targetGeneratedAt || !item?.generatedAt || Math.abs(item.generatedAt - targetGeneratedAt) < 60000)
    );
    const matchesDeck = Boolean(
      targetDeckName &&
      item?.deckName &&
      item.deckName.trim().toLowerCase() === targetDeckName.trim().toLowerCase()
    );
    const matchesTimestamp = Boolean(
      targetGeneratedAt &&
      item?.generatedAt &&
      item.generatedAt === targetGeneratedAt
    );

    if (matchesTargetStr || matchesId || matchesMeta || matchesDeck || matchesTimestamp) {
      delete all[key];
    }
  }

  // Fallback: If only 1 dossier exists in storage and delete was invoked, delete it
  if (Object.keys(all).length === 1 && !targetStr && !targetId && !targetCompany) {
    for (const key of Object.keys(all)) {
      delete all[key];
    }
  }

  try {
    localStorage.setItem(INTERVIEW_DOSSIERS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function clearAllInterviewDossiers(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(INTERVIEW_DOSSIERS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}


