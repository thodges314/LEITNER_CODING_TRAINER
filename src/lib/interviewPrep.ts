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

  const cardCountText = request.targetCardCount
    ? `Target Card Count: ${request.targetCardCount} cards`
    : 'Target Card Count: Auto (Select an optimal curriculum depth between 10 and 22 cards based on the candidate\'s timeline, role seniority, and intelligence dump. Do not include redundant cards).';

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

  const dossierId = `dossier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const initialMessage: DossierMessage = {
    id: `msg_${Date.now().toString(36)}_0`,
    role: 'assistant',
    content: `I've synthesized your interview preparation dossier for **${company}** (${role}). The curriculum contains **${selectedCards.length} curated flashcards** focused on the highest-probability patterns for this role.

You can ask me to:
- Adjust card selections (e.g. *"Trim deck to 10 most critical cards"*, *"Add more React custom hooks"*)
- Clarify why any problem was selected
- Report your Leitner practice progress and get targeted drill advice!`,
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
    if (/10 card|quick|sprint|short|light/i.test(notesLower)) {
      targetCount = 10;
    } else if (/20 card|thorough|comprehensive|extensive/i.test(notesLower)) {
      targetCount = 20;
    } else {
      targetCount = 14;
    }
  }

  const picked = scored.slice(0, targetCount);

  const selectedCards: InterviewPrepCardSelection[] = picked.map((item, idx) => ({
    id: item.card.id,
    priority: idx < 5 ? 'must-know' : idx < 12 ? 'recommended' : 'optional',
    rationale: `Highly relevant for ${company} ${role} technical screening.`,
  }));

  const dossierId = `dossier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const initialMessage: DossierMessage = {
    id: `msg_${Date.now().toString(36)}_0`,
    role: 'assistant',
    content: `I've synthesized your interview preparation dossier for **${company}** (${role}). The curriculum contains **${selectedCards.length} curated flashcards** focused on the highest-probability patterns for this role.

You can ask me to:
- Adjust card selections (e.g. *"Trim deck to 10 most critical cards"*, *"Add more React custom hooks"*)
- Clarify why any problem was selected
- Report your Leitner practice progress and get targeted drill advice!`,
    timestamp: Date.now(),
  };

  return {
    id: dossierId,
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
${formatCatalogForPrompt(catalog)}

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

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  if (dossier.conversation && dossier.conversation.length > 0) {
    for (const msg of dossier.conversation.slice(-6)) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  messages.push({ role: 'user', content: userMessage });

  try {
    let rawReply = '';
    if (provider === 'gemini') {
      const model = getStoredModel() || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const geminiContents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: geminiContents }),
      });
      if (response.ok) {
        const data = await response.json();
        rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      }
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
          max_tokens: 2000,
          system: systemPrompt,
          messages: messages.filter((m) => m.role !== 'system').map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        rawReply = data.content?.[0]?.text?.trim() || '';
      }
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
          messages,
          temperature: 0.3,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        rawReply = data.choices?.[0]?.message?.content?.trim() || '';
      }
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
  } catch {
    return generateHeuristicDialogueReply(dossier, userMessage, catalog, progressContext);
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

  return {
    reply: `Understood! For ${dossier.company}'s ${dossier.role} technical screening, interviewers look closely for three core signals: (1) structured state architecture without unnecessary re-renders, (2) explicit accessibility semantics (ARIA roles & keyboard navigation), and (3) clean boundary handling for async states. Focus your drills on reproducing solutions cold under a 20-minute timer. Let me know if you'd like to adjust card selections or need specific strategy for any drill!`,
  };
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
    if (!d || !d.company) continue;
    const key = d.id || `${d.company}_${d.role}_${d.generatedAt}`;
    if (!map.has(key) || ((map.get(key)!.generatedAt || 0) < (d.generatedAt || 0))) {
      map.set(key, d);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => (b.generatedAt || 0) - (a.generatedAt || 0)
  );
}

export function deleteInterviewDossier(deckOrDossierId: string): void {
  if (typeof window === 'undefined') return;
  const all = loadAllInterviewDossiers();
  const dossier = all[deckOrDossierId];
  if (all[deckOrDossierId]) {
    delete all[deckOrDossierId];
  }
  if (dossier?.id && all[dossier.id]) {
    delete all[dossier.id];
  }
  try {
    localStorage.setItem(INTERVIEW_DOSSIERS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

