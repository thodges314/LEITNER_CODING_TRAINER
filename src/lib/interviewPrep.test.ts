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
  loadAllInterviewDossiers,
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
  });

  describe('generateInterviewPrepDossier (offline mode)', () => {
    it('returns heuristic dossier when no API key is configured', async () => {
      const dossier = await generateInterviewPrepDossier(
        { company: 'Google', role: 'Software Engineer', rawNotes: '' },
        MOCK_CATALOG
      );

      expect(dossier.company).toBe('Google');
      expect(dossier.selectedCards.length).toBeGreaterThan(0);
    });
  });
});
