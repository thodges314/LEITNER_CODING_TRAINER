// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatCatalogForPrompt,
  buildInterviewPrepPrompt,
  parseInterviewPrepResponse,
  generateHeuristicDossier,
  saveInterviewDossier,
  getInterviewDossier,
  deleteInterviewDossier,
  clearAllInterviewDossiers,
  loadAllInterviewDossiers,
  getAllSavedDossiers,
  continueInterviewDialogue,
  generateInterviewPrepDossier,
  type CatalogIndexEntry,
  type InterviewPrepRequest,
} from './interviewPrep';

const MOCK_CATALOG: CatalogIndexEntry[] = [
  {
    id: 'lru-cache-implementation',
    title: 'LRU Cache Implementation',
    track: 'js-utilities',
    concept: 'lru',
    difficulty: 3,
    tags: ['lru', 'cache', 'data-structures'],
    summary: 'Implement a Least Recently Used cache class operating in O(1) time.',
  },
  {
    id: 'tabs-accordion-compound',
    title: 'Tabs / Accordion Compound Component',
    track: 'react-components',
    concept: 'compound-components',
    difficulty: 4,
    tags: ['react', 'compound-components', 'accessibility'],
    summary: 'Implement compound components sharing state via context.',
  },
  {
    id: 'a11y-form-field',
    title: 'Accessible Form Field Component',
    track: 'react-components',
    concept: 'accessibility',
    difficulty: 3,
    tags: ['react', 'a11y', 'forms'],
    summary: 'Build an accessible form field with proper ARIA attributes.',
  },
  {
    id: 'two-sum-hashmap',
    title: 'Two Sum via Hash Map',
    track: 'algorithms',
    concept: 'hash-map',
    difficulty: 2,
    tags: ['algorithms', 'hash-map', 'arrays'],
    summary: 'Find two indices whose values sum to a target in linear time.',
  },
  {
    id: 'raf-throttle',
    title: 'RAF Animation Frame Throttle',
    track: 'dom-browser',
    concept: 'throttle',
    difficulty: 3,
    tags: ['dom', 'raf', 'throttle'],
    summary: 'Throttle rapid browser events to match the display refresh rate.',
  },
];

describe('Interview Prep Prompt & Pipeline', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('formatCatalogForPrompt', () => {
    it('formats catalog entries into compact, readable lines for prompt injection', () => {
      const output = formatCatalogForPrompt(MOCK_CATALOG);
      expect(output).toContain('- [lru-cache-implementation] LRU Cache Implementation (js-utilities | D3) [lru,cache,data-structures]: Implement a Least Recently Used cache class');
      expect(output).toContain('- [tabs-accordion-compound] Tabs / Accordion Compound Component (react-components | D4)');
    });
  });

  describe('buildInterviewPrepPrompt', () => {
    it('constructs structured system and user prompts with company, role, weaknesses and catalog', () => {
      const req: InterviewPrepRequest = {
        company: 'Stripe',
        role: 'Staff Frontend Engineer',
        targetDate: 'In 5 days',
        rawNotes: 'Recruiter notes: Focus on compound components, form accessibility, and state machines.',
        candidateWeaknesses: ['Accessibility contracts', 'Async race conditions'],
        weakCardIds: ['tabs-accordion-compound'],
        targetCardCount: 15,
      };

      const { system, user } = buildInterviewPrepPrompt(req, MOCK_CATALOG);
      expect(system).toContain('CRITICAL RULES');
      expect(system).toContain('ONLY select card IDs that exist in the provided Card Catalog Index');

      expect(user).toContain('Target Company: Stripe');
      expect(user).toContain('Role & Level: Staff Frontend Engineer');
      expect(user).toContain('Accessibility contracts');
      expect(user).toContain('Candidate Recent Setbacks / Box 1 Cards in Trainer:');
      expect(user).toContain('tabs-accordion-compound');
      expect(user).toContain('Recruiter notes: Focus on compound components');
      expect(user).toContain('Available Card Catalog Index (Choose strictly from these card IDs):');
      expect(user).toContain('lru-cache-implementation');
    });
  });

  describe('parseInterviewPrepResponse', () => {
    it('successfully extracts valid json wrapped in markdown fences and drops hallucinated card IDs', () => {
      const validResponse = `
Here is your study plan:
\`\`\`json
{
  "deckName": "Stripe — Staff Frontend Core",
  "deckDescription": "Targeted curriculum for Stripe onsite rounds",
  "executiveSummary": "Stripe focuses on rock-solid design system primitives and robust data pipelines.",
  "selectedCards": [
    {
      "id": "tabs-accordion-compound",
      "priority": "must-know",
      "rationale": "Key compound component pattern tested in Stripe UI screens."
    },
    {
      "id": "hallucinated-fake-card-id",
      "priority": "must-know",
      "rationale": "This card does not exist in catalog."
    },
    {
      "id": "lru-cache-implementation",
      "priority": "recommended",
      "rationale": "Common data structure in Stripe backend and client caching."
    }
  ],
  "externalTopics": [
    {
      "topic": "GraphQL Caching",
      "priority": "high",
      "description": "Normalized cache policies",
      "recommendedResources": [{ "title": "Apollo Odyssey", "url": "https://odyssey.apollographql.com" }]
    }
  ],
  "interactiveTools": [
    {
      "name": "Flexbox Froggy",
      "url": "https://flexboxfroggy.com",
      "focus": "CSS layout alignment"
    }
  ],
  "countdownChecklist": [
    "Test your local Node environment"
  ]
}
\`\`\`
Hope this helps!`;

      const dossier = parseInterviewPrepResponse(validResponse, MOCK_CATALOG, {
        company: 'Stripe',
        role: 'Staff Frontend Engineer',
      });

      expect(dossier.company).toBe('Stripe');
      expect(dossier.deckName).toBe('Stripe — Staff Frontend Core');
      expect(dossier.selectedCards.length).toBe(2);
      expect(dossier.selectedCards[0].id).toBe('tabs-accordion-compound');
      expect(dossier.selectedCards[0].priority).toBe('must-know');
      expect(dossier.selectedCards[1].id).toBe('lru-cache-implementation');
      // Verify hallucinated card was dropped
      expect(dossier.selectedCards.some((c) => c.id === 'hallucinated-fake-card-id')).toBe(false);

      expect(dossier.externalTopics.length).toBe(1);
      expect(dossier.externalTopics[0].topic).toBe('GraphQL Caching');
      expect(dossier.interactiveTools[0].name).toBe('Flexbox Froggy');
      expect(dossier.countdownChecklist).toContain('Test your local Node environment');
    });

    it('falls back to heuristic dossier gracefully when response text is malformed or empty', () => {
      const dossier = parseInterviewPrepResponse('Not valid JSON at all', MOCK_CATALOG, {
        company: 'Airbnb',
        role: 'Senior UI Engineer',
      });

      expect(dossier.company).toBe('Airbnb');
      expect(dossier.deckName).toContain('Airbnb');
      expect(dossier.selectedCards.length).toBeGreaterThan(0);
      expect(dossier.externalTopics.length).toBeGreaterThan(0);
      expect(dossier.countdownChecklist.length).toBeGreaterThan(0);
    });
  });

  describe('generateHeuristicDossier', () => {
    it('boosts relevant cards based on company archetype and candidate weaknesses', () => {
      const dossier = generateHeuristicDossier(
        {
          company: 'Stripe',
          role: 'Frontend Engineer',
          rawNotes: 'Need strong cache and accessibility skills',
          weakCardIds: ['a11y-form-field'],
          targetCardCount: 3,
        },
        MOCK_CATALOG
      );

      expect(dossier.company).toBe('Stripe');
      expect(dossier.selectedCards.length).toBe(3);
      // Stripe + weakCardIds should place a11y-form-field, lru-cache, and tabs near the top
      const topIds = dossier.selectedCards.map((c) => c.id);
      expect(topIds).toContain('a11y-form-field');
      expect(topIds).toContain('lru-cache-implementation');
    });
  });

  describe('Dossier LocalStorage Persistence', () => {
    it('saves, loads, and deletes interview dossiers by deck ID', () => {
      const dossier = generateHeuristicDossier(
        { company: 'Datadog', role: 'Full Stack Engineer', rawNotes: '' },
        MOCK_CATALOG
      );

      saveInterviewDossier('custom-datadog-123', dossier);

      const retrieved = getInterviewDossier('custom-datadog-123');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.company).toBe('Datadog');

      const all = loadAllInterviewDossiers();
      expect(Object.keys(all)).toContain('custom-datadog-123');

      deleteInterviewDossier('custom-datadog-123');
      expect(getInterviewDossier('custom-datadog-123')).toBeNull();
    });

    it('retrieves all unique saved dossiers sorted by generation date', () => {
      const d1 = generateHeuristicDossier(
        { company: 'Apple', role: 'UI Engineer', rawNotes: '' },
        MOCK_CATALOG
      );
      d1.generatedAt = 1000;
      saveInterviewDossier('apple-deck', d1);

      const d2 = generateHeuristicDossier(
        { company: 'Netflix', role: 'Senior Frontend', rawNotes: '' },
        MOCK_CATALOG
      );
      d2.generatedAt = 2000;
      saveInterviewDossier('netflix-deck', d2);

      const list = getAllSavedDossiers();
      expect(list.length).toBeGreaterThanOrEqual(2);
      expect(list[0].company).toBe('Netflix');
      expect(list[1].company).toBe('Apple');
    });

    it('auto-heals dossiers missing id and deletes by target object or metadata', () => {
      // Simulate an older corrupt entry saved without an id
      const corruptRaw = {
        'old-custom-deck': {
          company: 'Amazon',
          role: 'SDE II',
          deckName: 'Amazon Interview Prep',
          deckDescription: 'Amazon prep cards',
          executiveSummary: 'Amazon briefing',
          selectedCards: [],
          externalTopics: [],
          interactiveTools: [],
          countdownChecklist: [],
          generatedAt: 5000,
        },
      };
      localStorage.setItem('leitner_interview_dossiers', JSON.stringify(corruptRaw));

      // loadAllInterviewDossiers should auto-heal and assign an id
      const loaded = loadAllInterviewDossiers();
      expect(loaded['old-custom-deck']?.id).toBeDefined();
      expect(loaded['old-custom-deck']?.id?.length).toBeGreaterThan(0);

      // deleteInterviewDossier should succeed even when passing an object without an id
      deleteInterviewDossier({
        company: 'Amazon',
        role: 'SDE II',
        generatedAt: 5000,
      } as Partial<InterviewPrepDossier>);

      expect(getAllSavedDossiers().filter((d) => d.company === 'Amazon')).toHaveLength(0);
    });

    it('clearAllInterviewDossiers purges all stored interview dossiers', () => {
      saveInterviewDossier('deck-1', generateHeuristicDossier({ company: 'Meta', role: 'SWE', rawNotes: '' }, MOCK_CATALOG));
      saveInterviewDossier('deck-2', generateHeuristicDossier({ company: 'Google', role: 'SWE', rawNotes: '' }, MOCK_CATALOG));

      expect(getAllSavedDossiers().length).toBeGreaterThanOrEqual(2);

      clearAllInterviewDossiers();
      expect(getAllSavedDossiers()).toHaveLength(0);
      expect(loadAllInterviewDossiers()).toEqual({});
    });
  });

  describe('continueInterviewDialogue', () => {
    it('provides conversational guidance and trims cards when user requests a smaller deck', async () => {
      const dossier = generateHeuristicDossier(
        { company: 'Stripe', role: 'Staff Frontend Engineer', rawNotes: '' },
        MOCK_CATALOG
      );
      expect(dossier.selectedCards.length).toBeGreaterThan(2);

      const res = await continueInterviewDialogue(
        dossier,
        'Can you trim the deck to 2 cards?',
        MOCK_CATALOG
      );

      expect(res.reply).toContain('streamlined your curriculum');
      expect(res.updatedCards).toBeDefined();
      expect(res.updatedCards?.length).toBeLessThanOrEqual(dossier.selectedCards.length);
    });

    it('evaluates Leitner practice progress when reported by candidate', async () => {
      const dossier = generateHeuristicDossier(
        { company: 'Stripe', role: 'Staff Frontend Engineer', rawNotes: '' },
        MOCK_CATALOG
      );

      const res = await continueInterviewDialogue(
        dossier,
        'Report Leitner practice progress: How am I doing with my current box retention?',
        MOCK_CATALOG,
        {
          box1Count: 2,
          box2Count: 4,
          box3PlusCount: 5,
          masteredCount: 1,
          recentBox1Titles: ['LRU Cache Implementation'],
        }
      );

      expect(res.reply).toContain('Box 1 setback cards');
      expect(res.reply).toContain('Solid progress');
    });

    it('predicts interview questions tailored to target company and role', async () => {
      const dossier = generateHeuristicDossier(
        { company: 'IPSY', role: 'Senior Software Engineer', rawNotes: '' },
        MOCK_CATALOG
      );

      const res = await continueInterviewDialogue(
        dossier,
        'What kind of questions do you predict them asking?',
        MOCK_CATALOG
      );

      expect(res.reply).toContain('IPSY');
      expect(res.reply).toContain('Live Component Construction');
      expect(res.reply).toContain('Async Orchestration');
      expect(res.reply).toContain('Accessibility');
    });

    it('guides external resources and study time allocation', async () => {
      const dossier = generateHeuristicDossier(
        { company: 'Airbnb', role: 'Staff UI Engineer', rawNotes: '' },
        MOCK_CATALOG
      );

      const res = await continueInterviewDialogue(
        dossier,
        'Which external resources should I spend the most time on?',
        MOCK_CATALOG
      );

      expect(res.reply).toContain('Airbnb');
      expect(res.reply).toContain('Time Allocation');
      expect(res.reply).toContain('Flashcard Coding Drills');
    });

    it('dynamically addresses custom inquiries rather than repeating a single canned string', async () => {
      const dossier = generateHeuristicDossier(
        { company: 'Datadog', role: 'Systems Engineer', rawNotes: '' },
        MOCK_CATALOG
      );

      const res1 = await continueInterviewDialogue(
        dossier,
        'What is their company culture and rubric?',
        MOCK_CATALOG
      );
      const res2 = await continueInterviewDialogue(
        dossier,
        'Give me a countdown checklist for the day of the interview',
        MOCK_CATALOG
      );

      expect(res1.reply).toContain('Architectural Clarity');
      expect(res2.reply).toContain('countdown checklist');
      expect(res1.reply).not.toEqual(res2.reply);
    });
  });

  describe('generateInterviewPrepDossier (offline mode)', () => {
    it('returns heuristic dossier when no API key is configured', async () => {
      const dossier = await generateInterviewPrepDossier(
        { company: 'Google', role: 'Software Engineer', rawNotes: '' },
        MOCK_CATALOG
      );

      expect(dossier.company).toBe('Google');
      expect(dossier.selectedCards.length).toBeGreaterThan(0);
      expect(dossier.conversation).toBeDefined();
      expect(dossier.conversation?.length).toBeGreaterThan(0);
    });

    it('auto-determines card count when targetCardCount is omitted', async () => {
      const dossierShort = await generateInterviewPrepDossier(
        { company: 'DoorDash', role: 'Frontend', rawNotes: 'Quick 10 card sprint' },
        MOCK_CATALOG
      );
      // MOCK_CATALOG has 5 total cards, so it caps at available catalog entries
      expect(dossierShort.selectedCards.length).toBe(MOCK_CATALOG.length);
    });
  });
});
