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

export interface JobIntelligenceExtraction {
  companyArchetype: string;
  seniorityLevel: string;
  coreLanguages: string[];
  frameworksAndLibs: string[];
  concepts: string[];
  specificQuestionsMentioned: string[];
  candidateWeaknessFocus: string[];
}

export interface DeterministicMatchResult {
  selectedCards: InterviewPrepCardSelection[];
  matchedQuestions: string[];
  unmatchedQuestions: string[];
}

export interface GenerateDossierOptions {
  onProgress?: (step: 'extracting' | 'matching' | 'synthesizing', message: string) => void;
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
    generatedAt: Date.now(),
    conversation: [initialMessage],
  };
}

// ---------------------------------------------------------------------------
// Step 1: Input Compression & Extraction (The "Filter" Call)
// ---------------------------------------------------------------------------

function extractJsonPayload(rawText: string): Record<string, unknown> | null {
  try {
    let text = rawText.trim();
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      text = jsonMatch[1].trim();
    }
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx > startIdx) {
      text = text.slice(startIdx, endIdx + 1);
    }
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* ignore parsing errors */
  }
  return null;
}

export function buildJobExtractionPrompt(request: InterviewPrepRequest): { system: string; user: string } {
  const system = `You are an elite technical interview intelligence parser.
Analyze raw interview notes, job postings, recruiter communications, candidate weaknesses, and company details.
Extract clean, structured intelligence keywords and SPECIFIC interview questions mentioned.

CRITICAL INSTRUCTIONS:
1. Extract "specificQuestionsMentioned": An array of specific coding challenges or interview problems explicitly mentioned in the notes (e.g. "LRU Cache with TTL", "Nested Comments UI", "EventEmitter with once and emit", "Second Highest Salary", "WebRTC Video Stream", "Two Sum"). Do not invent questions if none are mentioned.
2. Extract "coreLanguages": (e.g. ["TypeScript", "JavaScript", "SQL"]).
3. Extract "frameworksAndLibs": (e.g. ["React", "Next.js", "Redux", "Node.js"]).
4. Extract "concepts": (e.g. ["LRU Cache", "DOM Manipulation", "Compound Components", "Virtualization", "Debounce / Throttle", "Concurrency", "Accessibility"]).
5. Extract "candidateWeaknessFocus": candidate self-reported weaknesses.
6. Extract "companyArchetype": summary of the company interview focus (e.g. "Stripe (Financial Reliability & System Primitives)", "Meta (UI Velocity & DOM Trees)").
7. Extract "seniorityLevel": ("Junior", "Mid-level", "Senior", "Staff / Principal").
8. Return ONLY valid JSON matching the specified schema. No markdown prose outside the JSON.`;

  const user = `Target Company: ${request.company || 'Tech Company'}
Role & Level: ${request.role || 'Software Engineer'}
Target Date / Timeline: ${request.targetDate || 'Upcoming in 1-2 weeks'}
Self-Reported Weaknesses: ${(request.candidateWeaknesses || []).join(', ') || 'None specified'}

Raw Intelligence Dump (Recruiter emails, round notes, glassdoor questions, job description):
"""
${request.rawNotes.trim() || 'General frontend and full-stack software engineer interview.'}
"""

Respond with a JSON object adhering strictly to this schema:
{
  "companyArchetype": "Company (Interview Focus)",
  "seniorityLevel": "Senior",
  "coreLanguages": ["TypeScript", "JavaScript"],
  "frameworksAndLibs": ["React"],
  "concepts": ["LRU Cache", "DOM Trees", "State Management"],
  "specificQuestionsMentioned": ["LRU Cache with TTL", "Nested Comments UI"],
  "candidateWeaknessFocus": ["Accessibility contracts"]
}`;

  return { system, user };
}

export function extractHeuristicIntelligence(
  request: InterviewPrepRequest
): JobIntelligenceExtraction {
  const notes = request.rawNotes || '';
  const notesLower = notes.toLowerCase();
  const company = request.company?.trim() || 'Tech Company';
  const role = request.role?.trim() || 'Software Engineer';
  const roleLower = role.toLowerCase();

  // Seniority extraction
  let seniorityLevel = 'Mid-level';
  if (/staff|principal|distinguished|director/i.test(roleLower)) {
    seniorityLevel = 'Staff / Principal';
  } else if (/senior|lead|sr\b/i.test(roleLower)) {
    seniorityLevel = 'Senior';
  } else if (/junior|entry|associate|intern|new grad/i.test(roleLower)) {
    seniorityLevel = 'Junior / Entry';
  }

  // Company Archetype
  let companyArchetype = `${company} Engineering`;
  if (/google|alphabet/i.test(company)) companyArchetype = 'Google (Algorithmic Rigor & Scale)';
  else if (/amazon|aws/i.test(company)) companyArchetype = 'Amazon (Leadership Principles & Operational Robustness)';
  else if (/meta|facebook/i.test(company)) companyArchetype = 'Meta (Rapid UI Execution & Tree Traversal)';
  else if (/stripe/i.test(company)) companyArchetype = 'Stripe (Production Pragmatism & Financial Reliability)';
  else if (/airbnb/i.test(company)) companyArchetype = 'Airbnb (Design Systems & Component Quality)';
  else if (/datadog/i.test(company)) companyArchetype = 'Datadog (High-Frequency Telemetry & Browser Performance)';
  else if (/apple/i.test(company)) companyArchetype = 'Apple (Pixel Precision & Accessibility)';
  else if (/netflix/i.test(company)) companyArchetype = 'Netflix (Distributed Client Resilience & Telemetry)';

  // Core languages
  const coreLanguages: string[] = [];
  if (/typescript|\bts\b/i.test(notesLower) || /typescript/i.test(roleLower)) coreLanguages.push('TypeScript');
  if (/javascript|\bjs\b/i.test(notesLower) || /frontend|web|ui/i.test(roleLower)) coreLanguages.push('JavaScript');
  if (/sql|postgres|database/i.test(notesLower) || /fullstack|backend/i.test(roleLower)) coreLanguages.push('SQL');
  if (coreLanguages.length === 0) coreLanguages.push('TypeScript', 'JavaScript');

  // Frameworks & libraries
  const frameworksAndLibs: string[] = [];
  if (/react/i.test(notesLower) || /react/i.test(roleLower)) frameworksAndLibs.push('React');
  if (/next\.?js/i.test(notesLower)) frameworksAndLibs.push('Next.js');
  if (/vue/i.test(notesLower)) frameworksAndLibs.push('Vue');
  if (/node/i.test(notesLower) || /backend/i.test(roleLower)) frameworksAndLibs.push('Node.js');
  if (/graphql/i.test(notesLower)) frameworksAndLibs.push('GraphQL');
  if (/redux|zustand|recoil/i.test(notesLower)) frameworksAndLibs.push('State Management (Redux/Zustand)');

  // Concepts
  const concepts: string[] = [];
  const conceptDictionary = [
    { regex: /lru|cache/i, name: 'LRU Cache & In-Memory Caching' },
    { regex: /debounce|throttle/i, name: 'Debounce & Throttle Timing' },
    { regex: /promise|async|await|event loop|concurrency/i, name: 'Async JS & Concurrency' },
    { regex: /dom|event delegation|virtual dom/i, name: 'DOM Manipulation & Event Plumbing' },
    { regex: /compound|context|hook/i, name: 'React Hooks & Compound Patterns' },
    { regex: /a11y|accessibility|aria|keyboard/i, name: 'Web Accessibility (a11y) & ARIA' },
    { regex: /tree|graph|traversal|bfs|dfs/i, name: 'Trees & Graph Traversal' },
    { regex: /sort|search|binary search/i, name: 'Sorting & Binary Search' },
    { regex: /hash ?map|two sum/i, name: 'Hash Maps & Fast Lookups' },
    { regex: /rate limit/i, name: 'Rate Limiting & Throttling' },
  ];
  for (const item of conceptDictionary) {
    if (item.regex.test(notesLower)) {
      concepts.push(item.name);
    }
  }

  // Specific questions mentioned:
  // Parse lines and conjunctions (and, also, as well as, bullets, semicolons)
  const specificQuestionsMentioned: string[] = [];
  const lines = notes.split(/\r?\n|[;•]/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const segments = trimmed.split(/\s+(?:and|also|plus|as well as)\s+/i);
    for (const segment of segments) {
      const segTrimmed = segment.trim();
      const questionMatch = segTrimmed.match(
        /^[-*•\d.)\s]*(?:asked|question|challenge|problem|implement|build|design|create|expect)?\s*:?\s*(.+)$/i
      );
      const candidate = questionMatch ? questionMatch[1].trim() : segTrimmed;
      if (
        candidate.length >= 4 &&
        candidate.length <= 120 &&
        /(lru|cache|two sum|throttle|debounce|accordion|tabs|modal|autocomplete|typeahead|event ?emitter|flatten|curry|deep ?clone|promise|virtual|tree|comment|salary|sql|webrtc|timer|clock|stopwatch|carousel|slider|calendar|star rating)/i.test(
          candidate
        )
      ) {
        const clean = candidate
          .replace(/^["'`]|["'`]$/g, '')
          .replace(/^(?:expect|asked|implement|build)\s+/i, '')
          .replace(/[.]+$/, '')
          .trim();
        if (clean.length >= 3 && !specificQuestionsMentioned.includes(clean)) {
          specificQuestionsMentioned.push(clean);
        }
      }
    }
  }

  return {
    companyArchetype,
    seniorityLevel,
    coreLanguages,
    frameworksAndLibs,
    concepts,
    specificQuestionsMentioned,
    candidateWeaknessFocus: request.candidateWeaknesses || [],
  };
}

export function parseJobExtractionResponse(
  rawText: string,
  fallbackRequest: InterviewPrepRequest
): JobIntelligenceExtraction {
  const parsed = extractJsonPayload(rawText);
  if (!parsed) {
    return extractHeuristicIntelligence(fallbackRequest);
  }

  const toStringArray = (val: unknown): string[] => {
    if (!Array.isArray(val)) return [];
    return val
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((s) => s.trim());
  };

  const heuristic = extractHeuristicIntelligence(fallbackRequest);

  return {
    companyArchetype:
      typeof parsed.companyArchetype === 'string' && parsed.companyArchetype.trim()
        ? parsed.companyArchetype.trim()
        : heuristic.companyArchetype,
    seniorityLevel:
      typeof parsed.seniorityLevel === 'string' && parsed.seniorityLevel.trim()
        ? parsed.seniorityLevel.trim()
        : heuristic.seniorityLevel,
    coreLanguages:
      toStringArray(parsed.coreLanguages).length > 0
        ? toStringArray(parsed.coreLanguages)
        : heuristic.coreLanguages,
    frameworksAndLibs:
      toStringArray(parsed.frameworksAndLibs).length > 0
        ? toStringArray(parsed.frameworksAndLibs)
        : heuristic.frameworksAndLibs,
    concepts:
      toStringArray(parsed.concepts).length > 0
        ? toStringArray(parsed.concepts)
        : heuristic.concepts,
    specificQuestionsMentioned:
      Array.isArray(parsed.specificQuestionsMentioned)
        ? toStringArray(parsed.specificQuestionsMentioned)
        : heuristic.specificQuestionsMentioned,
    candidateWeaknessFocus:
      toStringArray(parsed.candidateWeaknessFocus).length > 0
        ? toStringArray(parsed.candidateWeaknessFocus)
        : heuristic.candidateWeaknessFocus,
  };
}

// ---------------------------------------------------------------------------
// Step 2: Deterministic Catalog Matching Engine with Exact-Match Detection
// ---------------------------------------------------------------------------

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function extractSignificantTokens(str: string): Set<string> {
  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'and', 'or',
    'implement', 'implementation', 'create', 'build', 'write', 'design', 'code',
    'problem', 'question', 'challenge', 'component', 'function', 'class', 'exercise',
    'screen', 'screening', 'round', 'interview', 'asked', 'asking', 'via', 'using'
  ]);
  const words = normalizeText(str)
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));
  return new Set(words);
}

function matchQuestionToCard(
  question: string,
  card: CatalogIndexEntry
): { isMatch: boolean; confidence: number } {
  const normQ = normalizeText(question);
  const normTitle = normalizeText(card.title);
  const normId = normalizeText(card.id.replace(/-/g, ' '));

  // 1. Exact match on normalized title or slug
  if (normQ === normTitle || normQ === normId) {
    return { isMatch: true, confidence: 1.0 };
  }

  // 2. Exact substring containment
  if (normQ.length >= 6 && (normTitle.includes(normQ) || normId.includes(normQ))) {
    return { isMatch: true, confidence: 0.95 };
  }
  if (normTitle.length >= 6 && normQ.includes(normTitle)) {
    return { isMatch: true, confidence: 0.95 };
  }

  // 3. Token Jaccard & Significant Word Overlap
  const qTokens = extractSignificantTokens(question);
  const cardTokens = extractSignificantTokens(`${card.id} ${card.title} ${card.concept}`);

  if (qTokens.size === 0 || cardTokens.size === 0) {
    return { isMatch: false, confidence: 0 };
  }

  let intersectionCount = 0;
  for (const t of qTokens) {
    if (cardTokens.has(t)) {
      intersectionCount++;
    } else {
      // Check prefix/stem match (e.g. "throttling" vs "throttle", "cached" vs "cache")
      for (const ct of cardTokens) {
        if ((t.length >= 4 && ct.startsWith(t)) || (ct.length >= 4 && t.startsWith(ct))) {
          intersectionCount += 0.85;
          break;
        }
      }
    }
  }

  const unionCount = qTokens.size + cardTokens.size - intersectionCount;
  const jaccard = unionCount > 0 ? intersectionCount / unionCount : 0;
  const coverageOfCard = cardTokens.size > 0 ? intersectionCount / cardTokens.size : 0;
  const coverageOfQ = qTokens.size > 0 ? intersectionCount / qTokens.size : 0;

  if (jaccard >= 0.45 || (qTokens.size >= 2 && coverageOfCard >= 0.65) || (qTokens.size >= 2 && coverageOfQ >= 0.65)) {
    return { isMatch: true, confidence: Math.max(jaccard, Math.min(coverageOfCard, coverageOfQ)) };
  }

  return { isMatch: false, confidence: 0 };
}

export function matchCatalogDeterministically(
  extraction: JobIntelligenceExtraction,
  catalog: CatalogIndexEntry[],
  options?: {
    weakCardIds?: string[];
    targetCardCount?: number;
    targetDate?: string;
  }
): DeterministicMatchResult {
  const companyLower = extraction.companyArchetype.toLowerCase();
  const matchedQuestionMap = new Map<string, string>(); // card.id -> question
  const matchedQuestions = new Set<string>();

  // Check each specific question against catalog cards
  for (const question of extraction.specificQuestionsMentioned) {
    let bestMatch: { card: CatalogIndexEntry; confidence: number } | null = null;
    for (const card of catalog) {
      const match = matchQuestionToCard(question, card);
      if (match.isMatch && (!bestMatch || match.confidence > bestMatch.confidence)) {
        bestMatch = { card, confidence: match.confidence };
      }
    }
    if (bestMatch) {
      matchedQuestionMap.set(bestMatch.card.id, question);
      matchedQuestions.add(question);
    }
  }

  const unmatchedQuestions = extraction.specificQuestionsMentioned.filter(
    (q) => !matchedQuestions.has(q)
  );

  // Score all cards deterministically
  const scored = catalog.map((card) => {
    let score = 0;
    const cardText = `${card.id} ${card.title} ${card.concept} ${card.tags.join(' ')} ${card.summary}`.toLowerCase();
    const matchedQ = matchedQuestionMap.get(card.id);

    // Exact or near-perfect question match gets top priority
    if (matchedQ) {
      score += 150;
    }

    // Recent Box 1 Setback boost
    if (options?.weakCardIds?.includes(card.id)) {
      score += 35;
    }

    // Candidate self-reported weaknesses boost
    for (const weakness of extraction.candidateWeaknessFocus) {
      const wTokens = extractSignificantTokens(weakness);
      let matchCount = 0;
      for (const token of wTokens) {
        if (cardText.includes(token)) matchCount++;
      }
      if (matchCount > 0) {
        score += matchCount * 10;
      }
    }

    // Company Archetype boosts
    if (companyLower.includes('stripe')) {
      if (/lru|a11y|compound|tab|event-emitter|fetch|form|retry|cache/i.test(cardText)) score += 12;
    } else if (companyLower.includes('airbnb')) {
      if (/calendar|star|carousel|combobox|modal|date|rating|accordion/i.test(cardText)) score += 12;
    } else if (companyLower.includes('datadog')) {
      if (/raf|throttle|debounce|observer|progress|spy|metric/i.test(cardText)) score += 12;
    } else if (companyLower.includes('meta') || companyLower.includes('facebook')) {
      if (/dom|tree|virtual|hook|memo|search|traversal|comment/i.test(cardText)) score += 12;
    } else if (companyLower.includes('google') || companyLower.includes('alphabet')) {
      if (/tree|graph|binary|algorithm|sort|hash/i.test(cardText)) score += 12;
    } else if (companyLower.includes('amazon') || companyLower.includes('aws')) {
      if (/retry|promise|async|queue|throttle/i.test(cardText)) score += 12;
    }

    // Concepts & Frameworks Overlap
    for (const concept of extraction.concepts) {
      const cTokens = extractSignificantTokens(concept);
      for (const token of cTokens) {
        if (cardText.includes(token)) score += 8;
      }
    }
    for (const lib of extraction.frameworksAndLibs) {
      if (cardText.includes(lib.toLowerCase())) score += 8;
    }

    return {
      card,
      score,
      matchedQuestion: matchedQ,
    };
  });

  scored.sort((a, b) => b.score - a.score || a.card.difficulty - b.card.difficulty);

  // Determine optimal deck size
  let targetCount = options?.targetCardCount;
  if (!targetCount) {
    if (
      /sprint|urgent|tomorrow|3-day|3 day|48 hour|immediate|quick/i.test(extraction.companyArchetype) ||
      /sprint|urgent/i.test(options?.targetDate || '')
    ) {
      targetCount = 8;
    } else if (
      /google|amazon|meta|facebook|apple|stripe|netflix/i.test(companyLower) ||
      /staff|principal/i.test(extraction.seniorityLevel)
    ) {
      targetCount = 36;
    } else {
      targetCount = 18;
    }
  }

  // Ensure all directly matched questions are included
  const minRequiredCount = Math.max(matchedQuestionMap.size, 1);
  targetCount = Math.max(minRequiredCount, Math.min(catalog.length, Math.min(75, targetCount)));

  const picked = scored.slice(0, targetCount);

  // Guarantee any card with a matchedQuestion is in picked even if beyond targetCount
  for (const item of scored) {
    if (item.matchedQuestion && !picked.some((p) => p.card.id === item.card.id)) {
      picked.push(item);
    }
  }

  const mustKnowCutoff = Math.max(2, Math.floor(picked.length * 0.3));
  const recommendedCutoff = Math.max(mustKnowCutoff + 2, Math.floor(picked.length * 0.75));

  const selectedCards: InterviewPrepCardSelection[] = picked.map((item, idx) => {
    let priority: CardPriority;
    let rationale: string;

    if (item.matchedQuestion) {
      priority = 'must-know';
      rationale = `Direct match for interview question reported for ${extraction.companyArchetype}: "${item.matchedQuestion}"`;
    } else if (options?.weakCardIds?.includes(item.card.id)) {
      priority = 'must-know';
      rationale = `Recent Leitner Box 1 setback. Re-drilling cements syntax fluency under timed constraints.`;
    } else if (idx < mustKnowCutoff) {
      priority = 'must-know';
      rationale = `Essential foundation for ${extraction.companyArchetype} technical screening.`;
    } else if (idx < recommendedCutoff) {
      priority = 'recommended';
      rationale = `High-yield architectural pattern frequently assessed in ${extraction.companyArchetype} coding rounds.`;
    } else {
      priority = 'optional';
      rationale = `Valuable supplementary practice for edge case handling and timed implementation speed.`;
    }

    return {
      id: item.card.id,
      priority,
      rationale,
    };
  });

  return {
    selectedCards,
    matchedQuestions: Array.from(matchedQuestions),
    unmatchedQuestions,
  };
}

// ---------------------------------------------------------------------------
// Step 3: Curriculum Gap Detection
// ---------------------------------------------------------------------------

export function detectCurriculumGaps(
  extraction: JobIntelligenceExtraction,
  unmatchedQuestions: string[]
): ExternalStudyTopic[] {
  const topics: ExternalStudyTopic[] = [];
  const seenTopics = new Set<string>();

  // 1. Unmatched interview questions become high-priority external topics!
  for (const q of unmatchedQuestions) {
    const key = q.toLowerCase();
    if (!seenTopics.has(key)) {
      seenTopics.add(key);
      topics.push({
        topic: `Reported Question: ${q}`,
        priority: 'high',
        description: `This specific interview challenge was reported for ${extraction.companyArchetype || 'your target company'}, but is not currently in the local flashcard coding catalog. Practice building this offline or in a sandbox.`,
        recommendedResources: [
          {
            title: `Search "${q}" on LeetCode / Discussion Forums`,
            url: `https://www.google.com/search?q=${encodeURIComponent(`${q} interview question leetcode`)}`,
          },
          {
            title: 'MDN Web Docs Reference',
            url: 'https://developer.mozilla.org',
          },
        ],
      });
    }
  }

  // 2. Architectural & non-flashcard topics (System Design, Realtime, WebRTC, Perf, etc.)
  const allText = `${extraction.concepts.join(' ')} ${extraction.frameworksAndLibs.join(' ')} ${unmatchedQuestions.join(' ')}`.toLowerCase();

  if (/webrtc|video|audio|stream/i.test(allText) && !seenTopics.has('webrtc')) {
    seenTopics.add('webrtc');
    topics.push({
      topic: 'WebRTC & Real-Time Media Streaming',
      priority: 'high',
      description: 'PeerConnection negotiation, ICE candidates, SDP offer/answer exchanges, and MediaStream track lifecycle.',
      recommendedResources: [
        { title: 'WebRTC.org Official Architecture Guide', url: 'https://webrtc.org/getting-started/overview' },
        { title: 'MDN WebRTC API Tutorial', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API' },
      ],
    });
  }

  if (/system design|architecture|microfrontend|micro-frontend/i.test(allText) && !seenTopics.has('system-design')) {
    seenTopics.add('system-design');
    topics.push({
      topic: 'Frontend System Design & Scaled Architecture',
      priority: 'high',
      description: 'Client data stores, normalized caching, offline synchronization, Microfrontends (Module Federation), and resilience.',
      recommendedResources: [
        { title: 'GreatFrontEnd System Design Playbook', url: 'https://www.greatfrontend.com' },
        { title: 'ByteByteGo System Design Newsletter', url: 'https://blog.bytebytego.com' },
      ],
    });
  }

  // Always ensure Core Web Vitals & Web Accessibility are present if list is short
  if (topics.length < 3) {
    for (const def of getDefaultExternalTopics()) {
      if (!seenTopics.has(def.topic.toLowerCase()) && topics.length < 5) {
        seenTopics.add(def.topic.toLowerCase());
        topics.push(def);
      }
    }
  }

  return topics;
}

// ---------------------------------------------------------------------------
// Step 4: Strategic Synthesis Call
// ---------------------------------------------------------------------------

export function buildDossierSynthesisPrompt(
  request: InterviewPrepRequest,
  extraction: JobIntelligenceExtraction,
  preFilteredCards: InterviewPrepCardSelection[],
  catalog: CatalogIndexEntry[],
  externalTopics: ExternalStudyTopic[]
): { system: string; user: string } {
  const system = `You are an elite technical interview preparation coach synthesizing a strategic interview briefing and tailored study dossier for ${request.company || 'a top technology company'} (${request.role || 'Software Engineer'}).

CRITICAL RULES:
1. ONLY reference and use the pre-filtered card IDs listed below. DO NOT invent or hallucinate any card IDs.
2. For each card in the provided list, refine its priority ("must-know" | "recommended" | "optional") and provide a crisp 1-sentence rationale tying it directly to ${request.company || 'the target company'}'s interview rounds. If a card was directly matched to a reported question, retain "must-know" priority.
   - STRICT PRIORITY DISTRIBUTION: Assign a tiered distribution across the cards: allocate ~25-35% as "must-know" (top core screening blockers & exact question matches), ~45-55% as "recommended" (high-yield architecture & secondary patterns), and ~15-20% as "optional" (stretch drills). NEVER mark all cards as "must-know".
3. Write a comprehensive, multi-paragraph strategic executive summary (3 to 4 paragraphs):
   - Paragraph 1: Target Company Engineering Archetype & Culture (what this company tests, engineering values, interview format).
   - Paragraph 2: Candidate Risk Calibration (mapping candidate weaknesses & setbacks against the interview rubric).
   - Paragraph 3: Topics Not Covered by Flashcards (Gap Analysis): highlight system design, microfrontends, real-time streaming, WebRTC, performance profiling, and behavioral rounds.
   - Paragraph 4: Recommended External Resources to bridge those gaps.
4. Refine the external topics and interactive learning tools provided.
5. Return ONLY valid JSON adhering strictly to the schema below. No conversational text outside JSON.`;

  const cardsSummary = preFilteredCards
    .map((c) => {
      const entry = catalog.find((x) => x.id === c.id);
      return `- [${c.id}] ${entry?.title || c.id} (${entry?.track || 'track'} | D${entry?.difficulty || 3}) [${c.priority}]: ${c.rationale}`;
    })
    .join('\n');

  const gapsSummary = externalTopics
    .map((t) => `- [${t.priority.toUpperCase()}] ${t.topic}: ${t.description}`)
    .join('\n');

  const user = `Target Company: ${request.company || 'Tech Company'}
Role & Level: ${request.role || 'Software Engineer'} (${extraction.seniorityLevel})
Company Archetype: ${extraction.companyArchetype}
Core Languages: ${extraction.coreLanguages.join(', ')}
Frameworks: ${extraction.frameworksAndLibs.join(', ')}
Key Concepts: ${extraction.concepts.join(', ')}
Specific Questions Mentioned: ${extraction.specificQuestionsMentioned.length > 0 ? extraction.specificQuestionsMentioned.join(', ') : '(None)'}
Candidate Weaknesses: ${extraction.candidateWeaknessFocus.join(', ') || 'None specified'}

Pre-Filtered Coding Cards (Refine rationales & priorities for these exact cards):
${cardsSummary}

Identified Curriculum Gaps & External Topics:
${gapsSummary}

Respond with a JSON object in this exact schema:
{
  "deckName": "${request.company ? `${request.company} — ` : ''}${request.role || 'Interview Prep'} Core",
  "deckDescription": "Targeted curriculum for ${request.company || 'tech'} interview rounds",
  "executiveSummary": "Comprehensive multi-paragraph strategic interview briefing...",
  "selectedCards": [
    {
      "id": "first-card-id-from-above-list",
      "priority": "must-know",
      "rationale": "Direct match for core screening requirement"
    },
    {
      "id": "second-card-id-from-above-list",
      "priority": "recommended",
      "rationale": "High-yield secondary architectural pattern"
    },
    {
      "id": "third-card-id-from-above-list",
      "priority": "optional",
      "rationale": "Valuable supplementary drill for edge cases"
    }
  ],
  "externalTopics": [
    {
      "topic": "Topic Name",
      "priority": "high",
      "description": "Study guidance",
      "recommendedResources": [
        { "title": "Resource Name", "url": "https://..." }
      ]
    }
  ],
  "interactiveTools": [
    {
      "name": "Tool Name",
      "url": "https://...",
      "focus": "Focus description"
    }
  ]
}`;

  return { system, user };
}

export function parseDossierSynthesisResponse(
  rawText: string,
  preFilteredCards: InterviewPrepCardSelection[],
  fallback: { company: string; role: string; targetDate?: string }
): InterviewPrepDossier {
  const parsed = extractJsonPayload(rawText);
  const company = fallback.company || 'Target Company';
  const role = fallback.role || 'Software Engineer';
  const targetDate = fallback.targetDate;

  if (!parsed) {
    throw new Error('Malformed JSON payload from synthesis model');
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

  const validPreFilteredMap = new Map(preFilteredCards.map((c) => [c.id, c]));
  const selectedCards: InterviewPrepCardSelection[] = [];
  const seenIds = new Set<string>();

  if (Array.isArray(parsed.selectedCards)) {
    for (const item of parsed.selectedCards) {
      if (item && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string') {
        const id = (item as { id: string }).id;
        const original = validPreFilteredMap.get(id);
        if (original && !seenIds.has(id)) {
          seenIds.add(id);
          const rawPriority = (item as { priority?: unknown }).priority;
          const priority: CardPriority =
            rawPriority === 'must-know' || rawPriority === 'recommended' || rawPriority === 'optional'
              ? rawPriority
              : original.priority;
          const rawRationale = (item as { rationale?: unknown }).rationale;
          const rationale =
            typeof rawRationale === 'string' && rawRationale.trim()
              ? rawRationale.trim()
              : original.rationale;
          selectedCards.push({ id, priority, rationale });
        }
      }
    }
  }

  // Preserve any preFilteredCards that were not included in the response
  for (const orig of preFilteredCards) {
    if (!seenIds.has(orig.id)) {
      selectedCards.push(orig);
    }
  }

  // Calibrate priorities to ensure balanced distribution
  const calibratedCards = calibrateCardPriorities(selectedCards);

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
    selectedCards: calibratedCards,
    externalTopics: externalTopics.length > 0 ? externalTopics : getDefaultExternalTopics(),
    interactiveTools: interactiveTools.length > 0 ? interactiveTools : getDefaultInteractiveTools(),
    generatedAt: Date.now(),
    conversation: [initialMessage],
  };
}

// ---------------------------------------------------------------------------
// Unified AI Provider JSON Invoker
// ---------------------------------------------------------------------------

async function callAiJson(
  system: string,
  user: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();

  if (!apiKey) {
    throw new Error('No API key configured');
  }

  const temperature = options?.temperature ?? 0.2;
  const maxTokens = options?.maxTokens ?? 2048;

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
          temperature,
          maxOutputTokens: maxTokens,
          response_mime_type: 'application/json',
        },
      }),
    });
    if (!response.ok) {
      throw new Error(`Gemini error (${response.status}): ${await response.text()}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
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
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (!response.ok) {
      throw new Error(`Anthropic error (${response.status}): ${await response.text()}`);
    }
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || '';
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
      model = model || 'meta-llama/llama-3.3-70b-instruct:free';
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
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorSnippet = errText;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error?.message) errorSnippet = parsed.error.message;
      } catch {
        /* ignore */
      }
      throw new Error(`${provider} (${response.status}): ${errorSnippet}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }
}

/**
 * Deterministic heuristic generator when running offline or testing.
 * Uses the deterministic catalog matching and gap detection engine.
 */
export function generateHeuristicDossier(
  request: InterviewPrepRequest,
  catalog: CatalogIndexEntry[]
): InterviewPrepDossier {
  const company = request.company?.trim() || 'Tech Company';
  const role = request.role?.trim() || 'Software Engineer';
  const companyLower = company.toLowerCase();

  const extraction = extractHeuristicIntelligence(request);
  const matchResult = matchCatalogDeterministically(extraction, catalog, {
    weakCardIds: request.weakCardIds,
    targetCardCount: request.targetCardCount,
    targetDate: request.targetDate,
  });
  const externalTopics = detectCurriculumGaps(extraction, matchResult.unmatchedQuestions);

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
  const weaknessList =
    request.candidateWeaknesses && request.candidateWeaknesses.length > 0
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
    deckDescription: `Curated ${matchResult.selectedCards.length}-card curriculum for ${company} technical interviews`,
    executiveSummary,
    selectedCards: calibrateCardPriorities(matchResult.selectedCards),
    externalTopics: externalTopics.length > 0 ? externalTopics : getDefaultExternalTopics(),
    interactiveTools: getDefaultInteractiveTools(),
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

export function calibrateCardPriorities(
  cards: InterviewPrepCardSelection[]
): InterviewPrepCardSelection[] {
  if (!cards || cards.length === 0) return cards;
  const mustKnowCount = cards.filter((c) => c.priority === 'must-know').length;
  const targetMustKnow = Math.max(2, Math.floor(cards.length * 0.28));
  const targetRecommended = Math.max(targetMustKnow + 2, Math.floor(cards.length * 0.78));

  if (mustKnowCount > targetMustKnow) {
    let assignedMustKnow = 0;
    return cards.map((card, idx) => {
      const isExactQuestionMatch = /direct match for interview question/i.test(card.rationale);
      const isBox1Setback = /recent leitner box 1 setback/i.test(card.rationale);

      let priority: CardPriority;
      if ((isExactQuestionMatch || isBox1Setback || assignedMustKnow < targetMustKnow) && assignedMustKnow < targetMustKnow + 1) {
        priority = 'must-know';
        assignedMustKnow++;
      } else if (idx < targetRecommended) {
        priority = 'recommended';
      } else {
        priority = 'optional';
      }
      return { ...card, priority };
    });
  }
  return cards;
}

/**
 * Generates an InterviewPrepDossier through the 4-step pipeline:
 * 1. Fast extraction call (compresses verbose notes to JSON)
 * 2. Deterministic catalog matching with exact question detection
 * 3. Curriculum gap detection (unmatched questions -> external topics)
 * 4. Strategic synthesis call (compact prompt, zero hallucination)
 */
export async function generateInterviewPrepDossier(
  request: InterviewPrepRequest,
  catalog: CatalogIndexEntry[],
  options?: GenerateDossierOptions
): Promise<InterviewPrepDossier> {
  const apiKey = getStoredApiKey();

  // If no API key configured, use deterministic offline pipeline
  if (!apiKey) {
    options?.onProgress?.('matching', 'Matching catalog cards deterministically (offline mode)...');
    await new Promise((r) => setTimeout(r, 400));
    return generateHeuristicDossier(request, catalog);
  }

  try {
    // Step 1: Input Compression & Extraction
    options?.onProgress?.('extracting', 'Extracting requirements & interview questions...');
    let extraction: JobIntelligenceExtraction;
    try {
      const extractionPrompt = buildJobExtractionPrompt(request);
      const rawExtraction = await callAiJson(extractionPrompt.system, extractionPrompt.user, {
        temperature: 0.1,
        maxTokens: 1000,
      });
      extraction = parseJobExtractionResponse(rawExtraction, request);
    } catch (extractErr) {
      console.warn('[AI Prep] Step 1 extraction call failed, using heuristic extraction:', extractErr);
      extraction = extractHeuristicIntelligence(request);
    }

    // Step 2: Deterministic Catalog Matching Engine
    options?.onProgress?.('matching', 'Analyzing catalog for exact question matches & archetypes...');
    const matchResult = matchCatalogDeterministically(extraction, catalog, {
      weakCardIds: request.weakCardIds,
      targetCardCount: request.targetCardCount,
      targetDate: request.targetDate,
    });

    // Step 3: Curriculum Gap Detection
    const externalTopics = detectCurriculumGaps(extraction, matchResult.unmatchedQuestions);

    // Step 4: Strategic Synthesis Call
    options?.onProgress?.('synthesizing', 'Synthesizing strategic briefing & curriculum...');
    let dossier: InterviewPrepDossier;
    try {
      const synthesisPrompt = buildDossierSynthesisPrompt(
        request,
        extraction,
        matchResult.selectedCards,
        catalog,
        externalTopics
      );
      const rawSynthesis = await callAiJson(synthesisPrompt.system, synthesisPrompt.user, {
        temperature: 0.2,
        maxTokens: 2500,
      });
      dossier = parseDossierSynthesisResponse(rawSynthesis, matchResult.selectedCards, request);
      if (dossier.externalTopics.length === 0) {
        dossier.externalTopics = externalTopics;
      }
    } catch (synthErr) {
      console.warn('[AI Prep] Step 4 synthesis call failed, using heuristic synthesis:', synthErr);
      dossier = generateHeuristicDossier(request, catalog);
      dossier.selectedCards = matchResult.selectedCards;
      dossier.externalTopics = externalTopics;
    }

    return dossier;
  } catch (err) {
    console.warn('[AI Prep] Pipeline error, falling back to heuristic dossier:', err);
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

  const wantsCardChanges = /\b(add|swap|replace|include|more cards|change deck|remove|trim)\b/i.test(userMessage);

  const systemPrompt = `You are an expert technical interview coach for a candidate preparing for an upcoming technical interview at ${dossier.company} for the role of ${dossier.role}.
The candidate has a tailored curriculum of ${dossier.selectedCards.length} flashcards and an interview preparation dossier.

CURRENT CURRICULUM:
${selectedCardsSummary}

PROGRESS STATUS:
${progressSummary}
${wantsCardChanges ? `\nFULL CARD CATALOG AVAILABLE FOR MODIFICATIONS OR SWAPS:\n${formatCompactCatalogForDialogue(catalog)}\n` : ''}
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

  const history = (dossier.conversation || []).slice(-4);
  if (history.length > 0 && history[0].role === 'assistant') {
    normalizedMessages.push({
      role: 'user',
      content: `Hello coach, let's review my preparation for ${dossier.company} (${dossier.role}).`,
    });
  }

  for (const msg of history) {
    let content = msg.content;
    // Condense lengthy initial executive briefings in the multi-turn context so tight TPM limits aren't exceeded
    if (msg.role === 'assistant' && content.length > 600) {
      content = content.slice(0, 600) + '... [briefing summary truncated for conversation context]';
    }
    if (normalizedMessages.length > 0 && normalizedMessages[normalizedMessages.length - 1].role === msg.role) {
      normalizedMessages[normalizedMessages.length - 1].content += `\n\n${content}`;
    } else {
      normalizedMessages.push({
        role: msg.role,
        content,
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
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
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
          max_tokens: 1024,
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
        model = model || 'meta-llama/llama-3.3-70b-instruct:free';
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
          max_tokens: 1024,
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

  // 6. Final preparation tips / day of advice
  if (/day of|final tip|prep advice|interview day/i.test(msgLower)) {
    return {
      reply: `Here are core day-of recommendations for your **${dossier.company}** interview:\n\n1. Review your high-priority cards and Box 1 setback patterns\n2. Clarify requirements and constraints upfront before coding\n3. State complexity and trade-offs explicitly\n4. Treat the interviewer as a collaborative engineering peer`,
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


