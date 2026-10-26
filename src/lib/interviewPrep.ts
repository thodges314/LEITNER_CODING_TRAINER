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

export interface InterviewPrepDossier {
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
2. Select between 12 and 24 cards tailored to the target role, company interview archetype, and candidate weaknesses.
3. For each selected card, provide:
   - "id": exact matching card ID from the index
   - "priority": "must-know" | "recommended" | "optional"
   - "rationale": concise 1-sentence reason why this card is essential for this company's interview rounds.
4. Extract 2–4 key external topics (System Design, GraphQL, Web Performance, Micro-frontends, CI/CD, SQL, etc.) that are outside flashcard coding scope, with targeted study guidance.
5. Recommend 3–5 interactive learning tools (Flexbox Froggy, CSSBattle, SQLBolt, Web.dev Learn Accessibility, etc.).
6. Provide a 3–5 item 24-hour countdown checklist.
7. Return ONLY valid JSON adhering strictly to the schema below. No conversational chatter outside the JSON.`;

  const catalogText = formatCatalogForPrompt(catalog);

  const weaknessText =
    request.candidateWeaknesses && request.candidateWeaknesses.length > 0
      ? `Candidate Self-Reported Weaknesses:\n${request.candidateWeaknesses.map((w) => `- ${w}`).join('\n')}`
      : 'Candidate Self-Reported Weaknesses: (None specified)';

  const weakCardsText =
    request.weakCardIds && request.weakCardIds.length > 0
      ? `Candidate Recent Setbacks / Box 1 Cards in Trainer:\n${request.weakCardIds.map((id) => `- ${id}`).join('\n')}`
      : 'Candidate Trainer Setbacks: (None recorded)';

  const user = `Target Company: ${request.company || 'Tech Company'}
Role & Level: ${request.role || 'Senior Software Engineer'}
Target Date / Timeline: ${request.targetDate || 'Upcoming in 1-2 weeks'}
Target Card Count: ${request.targetCardCount || 18} cards

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
  "executiveSummary": "2-3 sentence strategic overview of the company's interview focus and how this deck prepares the candidate",
  "selectedCards": [
    {
      "id": "card-id-from-index",
      "priority": "must-know",
      "rationale": "Why this card matters for this company"
    }
  ],
  "externalTopics": [
    {
      "topic": "Topic Name (e.g. GraphQL, System Design)",
      "priority": "high",
      "description": "What to study and focus on",
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

  return {
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

  const targetCount = request.targetCardCount || 16;
  const picked = scored.slice(0, targetCount);

  const selectedCards: InterviewPrepCardSelection[] = picked.map((item, idx) => ({
    id: item.card.id,
    priority: idx < 5 ? 'must-know' : idx < 12 ? 'recommended' : 'optional',
    rationale: `Highly relevant for ${company} ${role} technical screening.`,
  }));

  return {
    company,
    role,
    targetDate: request.targetDate,
    deckName: `${company} — ${role} Core`,
    deckDescription: `Curated ${selectedCards.length}-card curriculum for ${company} technical interviews`,
    executiveSummary: `${company}'s technical interview process emphasizes robust code architecture, predictable error handling, and clean component contracts. This curriculum targets the most frequently assessed patterns for this role.`,
    selectedCards,
    externalTopics: getDefaultExternalTopics(),
    interactiveTools: getDefaultInteractiveTools(),
    countdownChecklist: getDefaultChecklist(),
    generatedAt: Date.now(),
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
// LocalStorage Persistence for Dossiers
// ---------------------------------------------------------------------------

export function loadAllInterviewDossiers(): Record<string, InterviewPrepDossier> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(INTERVIEW_DOSSIERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveInterviewDossier(deckId: string, dossier: InterviewPrepDossier): void {
  if (typeof window === 'undefined') return;
  const all = loadAllInterviewDossiers();
  all[deckId] = dossier;
  try {
    localStorage.setItem(INTERVIEW_DOSSIERS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore storage quotas */
  }
}

export function getInterviewDossier(deckId: string): InterviewPrepDossier | null {
  const all = loadAllInterviewDossiers();
  return all[deckId] || null;
}

export function deleteInterviewDossier(deckId: string): void {
  if (typeof window === 'undefined') return;
  const all = loadAllInterviewDossiers();
  if (all[deckId]) {
    delete all[deckId];
    try {
      localStorage.setItem(INTERVIEW_DOSSIERS_STORAGE_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }
}
