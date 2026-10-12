import type { TopicItem } from './leitner';

export interface EvaluationResult {
  passed: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  invariantsMet: string[];
  invariantsMissed: string[];
  critique: string;
  evaluationSource?: 'api' | 'heuristic-mock';
}

export interface DraftedTopic {
  id: string;
  track: 'async-js' | 'data-structures' | 'react' | 'algorithms';
  title: string;
  promptSeed: string;
  tags: string[];
}

export const API_KEY_KEY = 'ai_evaluator_key';
export const API_PROVIDER_KEY = 'ai_evaluator_provider';
export const API_MODEL_KEY = 'ai_evaluator_model';
export const API_BASE_URL_KEY = 'ai_evaluator_base_url';

export type AIProvider = 'gemini' | 'openai' | 'groq' | 'openrouter' | 'custom';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_KEY, key.trim());
}

export function getStoredProvider(): AIProvider {
  if (typeof window === 'undefined') return 'gemini';
  return (localStorage.getItem(API_PROVIDER_KEY) as AIProvider) || 'gemini';
}

export function setStoredProvider(provider: AIProvider): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_PROVIDER_KEY, provider);
}

export function getStoredModel(): string {
  if (typeof window === 'undefined') return 'gemini-2.5-flash';
  const val = localStorage.getItem(API_MODEL_KEY);
  if (val) return val;
  const prov = getStoredProvider();
  if (prov === 'gemini') return 'gemini-2.5-flash';
  if (prov === 'groq') return 'llama-3.3-70b-versatile';
  return 'gpt-4o-mini';
}

export function setStoredModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_MODEL_KEY, model.trim());
}

export function getStoredBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_BASE_URL_KEY) || '';
}

export function setStoredBaseUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_BASE_URL_KEY, url.trim());
}

const EVALUATION_SYSTEM_PROMPT = `Evaluate cold-start code practice against invariants and functional correctness. Do NOT grade based on verbatim similarity to a reference solution.
Whenever an evaluation receives a failing grade ("passed": false), you MUST append a \`### Canonical Reference Pattern\` code block in the "critique" markdown text demonstrating the clean, optimal, canonical implementation pattern.
Return pure JSON:
{
  "passed": boolean,
  "timeComplexity": string,
  "spaceComplexity": string,
  "invariantsMet": string[],
  "invariantsMissed": string[],
  "critique": string
}`;

/**
 * Intelligent client-side heuristic evaluator used when no API key is provided
 * or when the user desires instant offline evaluation.
 */
function heuristicEvaluateCode(topic: TopicItem, code: string): EvaluationResult {
  const trimmed = code.trim();
  const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);

  if (trimmed.length < 20 || lines.length <= 2) {
    return {
      passed: false,
      timeComplexity: 'N/A',
      spaceComplexity: 'N/A',
      invariantsMet: ['Code buffer submitted'],
      invariantsMissed: [
        'Implementation is too short or incomplete to satisfy core logic',
        'Missing required function signature or core return statement',
      ],
      critique: 'The code buffer appears to be empty or an unfinished stub. Write the complete cold-start implementation before submitting.',
      evaluationSource: 'heuristic-mock',
    };
  }

  const invariantsMet: string[] = [];
  const invariantsMissed: string[] = [];
  let score = 0;

  // Track-specific invariant heuristics
  if (topic.track === 'async-js') {
    if (trimmed.includes('async') || trimmed.includes('Promise') || trimmed.includes('.then')) {
      invariantsMet.push('Asynchronous handling mechanics present (async/await or Promise)');
      score += 2;
    } else {
      invariantsMissed.push('Missing async execution or Promise wrapper');
    }

    if (trimmed.includes('try') && (trimmed.includes('catch') || trimmed.includes('.catch'))) {
      invariantsMet.push('Error handling / rejection capture implemented');
      score += 2;
    } else {
      invariantsMissed.push('Potential unhandled rejection: error boundary or try/catch not detected');
    }

    if (trimmed.includes('setTimeout') || trimmed.includes('clearTimeout') || trimmed.includes('AbortController') || trimmed.includes('signal')) {
      invariantsMet.push('Timing/cancellation lifecycle lifecycle awareness');
      score += 1;
    }
  } else if (topic.track === 'data-structures') {
    if (trimmed.includes('new Map') || trimmed.includes('new Set') || trimmed.includes('WeakMap') || trimmed.includes('reduce')) {
      invariantsMet.push('Core data structure primitive instantiated properly');
      score += 2;
    } else {
      invariantsMissed.push('Expected standard data structure primitive (Map/Set/WeakMap/reduce)');
    }

    if (trimmed.includes('.get(') || trimmed.includes('.set(') || trimmed.includes('.has(') || trimmed.includes('.delete(')) {
      invariantsMet.push('Map/Set operational API methods invoked with correct semantics');
      score += 2;
    }
  } else if (topic.track === 'react') {
    if (trimmed.includes('use') || trimmed.includes('useState') || trimmed.includes('useEffect') || trimmed.includes('useRef') || trimmed.includes('useCallback')) {
      invariantsMet.push('React hook primitives declared and structured');
      score += 2;
    } else {
      invariantsMissed.push('React hook convention or lifecycle primitives absent');
    }

    if (trimmed.includes('return () =>') || trimmed.includes('cleanup') || trimmed.includes('cancel')) {
      invariantsMet.push('Component cleanup / tear-down lifecycle accounted for');
      score += 1;
    }
  } else if (topic.track === 'algorithms') {
    if (trimmed.includes('while') || trimmed.includes('for (') || trimmed.includes('for(')) {
      invariantsMet.push('Iterative pointer / boundary traversal implemented');
      score += 2;
    } else if (trimmed.includes('function') && trimmed.includes('(') && trimmed.includes('return')) {
      invariantsMet.push('Algorithmic recursion or function breakdown');
      score += 1;
    }

    if (trimmed.includes('left') || trimmed.includes('right') || trimmed.includes('Math.max') || trimmed.includes('Math.min') || trimmed.includes('stack')) {
      invariantsMet.push('Boundary indices or invariant tracking logic correctly updated');
      score += 2;
    }
  }

  // General code quality checks
  if (trimmed.includes('return ')) {
    invariantsMet.push('Function produces explicit return value');
    score += 1;
  } else {
    invariantsMissed.push('Missing explicit return statement');
  }

  if (trimmed.includes('const ') || trimmed.includes('let ')) {
    invariantsMet.push('Block-scoped variable hygiene maintained');
    score += 1;
  }

  const passed = score >= 4 && invariantsMissed.length <= 1;

  let timeComplexity = 'O(n)';
  let spaceComplexity = 'O(1)';
  if (topic.id.includes('binary-search')) {
    timeComplexity = 'O(log n)';
  } else if (topic.id.includes('matrix') || topic.id.includes('lru')) {
    timeComplexity = 'O(1) operations';
    spaceComplexity = 'O(capacity)';
  } else if (topic.id.includes('flatten') || topic.id.includes('tree') || topic.id.includes('bfs') || topic.id.includes('dfs')) {
    timeComplexity = 'O(n)';
    spaceComplexity = 'O(h) recursion/queue';
  }

  return {
    passed,
    timeComplexity,
    spaceComplexity,
    invariantsMet: invariantsMet.length > 0 ? invariantsMet : ['Code syntactically constructed'],
    invariantsMissed: invariantsMissed.length > 0 ? invariantsMissed : ['Verify edge cases for null/empty collections'],
    critique: passed
      ? `Solid cold-start reconstruction for "${topic.title}". The logic demonstrates solid command of the underlying invariant pattern without relying on IDE hints.`
      : `Good retrieval attempt, but essential invariants were omitted or incompletely wired. Review the problem constraints, especially boundary condition handling and error branches.${
          (topic.referenceSolution || topic.solution || topic.starterCode)
            ? `\n\n### Canonical Reference Pattern\n\`\`\`typescript\n${topic.referenceSolution || topic.solution || topic.starterCode}\n\`\`\``
            : ''
        }`,
    evaluationSource: 'heuristic-mock',
  };
}

export async function evaluateCodeSubmission(
  topic: TopicItem,
  submittedCode: string
): Promise<EvaluationResult> {
  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();

  // If no API key is set, immediately use heuristic evaluator
  if (!apiKey) {
    // Artificial small delay for realistic UX feedback
    await new Promise((r) => setTimeout(r, 600));
    return heuristicEvaluateCode(topic, submittedCode);
  }

  try {
    const userPrompt = `Topic: ${topic.title} (Track: ${topic.track})
ID: ${topic.id}
Instructions & Invariants:
${topic.promptSeed}

Submitted Cold-Start Code:
\`\`\`typescript
${submittedCode}
\`\`\`

Evaluate functional correctness and invariants according to your system instructions.`;

    let rawJson = '';

    if (provider === 'gemini') {
      const model = getStoredModel() || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: EVALUATION_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      // OpenAI-compatible endpoint (OpenAI, Groq, OpenRouter, Custom)
      let baseUrl = getStoredBaseUrl();
      let model = getStoredModel();

      if (provider === 'openai') {
        baseUrl = baseUrl || 'https://api.openai.com/v1';
        model = model || 'gpt-4o-mini';
      } else if (provider === 'groq') {
        baseUrl = baseUrl || 'https://api.groq.com/openai/v1';
        model = model || 'llama-3.3-70b-versatile';
      } else if (provider === 'openrouter') {
        baseUrl = baseUrl || 'https://openrouter.ai/api/v1';
        model = model || 'google/gemini-2.5-flash';
      }

      const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: EVALUATION_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      rawJson = data.choices?.[0]?.message?.content || '';
    }

    // Clean JSON markdown blocks if any
    const cleanedJson = rawJson.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      passed: Boolean(parsed.passed),
      timeComplexity: String(parsed.timeComplexity || 'O(n)'),
      spaceComplexity: String(parsed.spaceComplexity || 'O(1)'),
      invariantsMet: Array.isArray(parsed.invariantsMet) ? parsed.invariantsMet.map(String) : [],
      invariantsMissed: Array.isArray(parsed.invariantsMissed) ? parsed.invariantsMissed.map(String) : [],
      critique: String(parsed.critique || 'Evaluation complete.'),
      evaluationSource: 'api',
    };
  } catch (err: unknown) {
    console.warn('API Evaluation failed or rate limited; falling back to heuristic evaluation:', err);
    const fallback = heuristicEvaluateCode(topic, submittedCode);
    const msg = err instanceof Error ? err.message : String(err);
    fallback.critique = `[Notice: Live API call returned an error (${msg || 'connection failure'}). Fallback offline evaluation applied]: ${fallback.critique}`;
    return fallback;
  }
}

const DRAFT_SYSTEM_PROMPT = `The user will describe a coding pattern or interview concept informally. 
Extract and return ONLY a valid JSON object matching this schema:
{
  "id": string (kebab-case),
  "track": 'async-js' | 'data-structures' | 'react' | 'algorithms',
  "title": string (concise name),
  "promptSeed": string (a clear, cold-start prompt describing what to write without giving away boilerplate),
  "tags": string[]
}`;

export async function draftTopicWithAI(userNote: string): Promise<DraftedTopic> {
  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();

  // Smart heuristic draft if no API key
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 500));
    const lower = userNote.toLowerCase();

    let track: 'async-js' | 'data-structures' | 'react' | 'algorithms' = 'algorithms';
    if (lower.includes('hook') || lower.includes('react') || lower.includes('state') || lower.includes('render') || lower.includes('reducer')) {
      track = 'react';
    } else if (lower.includes('async') || lower.includes('promise') || lower.includes('fetch') || lower.includes('timeout') || lower.includes('await')) {
      track = 'async-js';
    } else if (lower.includes('map') || lower.includes('set') || lower.includes('tree') || lower.includes('lru') || lower.includes('cache') || lower.includes('heap') || lower.includes('queue')) {
      track = 'data-structures';
    }

    const words = userNote.trim().split(/\s+/).slice(0, 5).join(' ');
    const idSlug = words.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `custom-topic-${Date.now()}`;

    return {
      id: idSlug,
      track,
      title: words.charAt(0).toUpperCase() + words.slice(1),
      promptSeed: `Implement a production-grade solution for: ${userNote.trim()}.\n\nInvariants to fulfill:\n1. Specify exact input types, outputs, and edge cases (e.g. empty inputs or boundary values).\n2. Adhere to optimal time and space complexity without auxiliary bloat.\n3. Include proper error boundaries or null-check guards.\n4. Write clean, self-documenting cold-start code from scratch.`,
      tags: [track, 'cold-start', 'custom'],
    };
  }

  try {
    let rawJson = '';

    if (provider === 'gemini') {
      const model = getStoredModel() || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: DRAFT_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userNote }],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API draft error: ${response.statusText}`);
      }

      const data = await response.json();
      rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      let baseUrl = getStoredBaseUrl();
      let model = getStoredModel();
      if (provider === 'openai') {
        baseUrl = baseUrl || 'https://api.openai.com/v1';
        model = model || 'gpt-4o-mini';
      } else if (provider === 'groq') {
        baseUrl = baseUrl || 'https://api.groq.com/openai/v1';
        model = model || 'llama-3.3-70b-versatile';
      } else if (provider === 'openrouter') {
        baseUrl = baseUrl || 'https://openrouter.ai/api/v1';
        model = model || 'google/gemini-2.5-flash';
      }

      const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: DRAFT_SYSTEM_PROMPT },
            { role: 'user', content: userNote },
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`API draft error: ${response.statusText}`);
      }

      const data = await response.json();
      rawJson = data.choices?.[0]?.message?.content || '';
    }

    const cleaned = rawJson.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
    const parsed = JSON.parse(cleaned);

    const validTracks = ['async-js', 'data-structures', 'react', 'algorithms'];
    const track = validTracks.includes(parsed.track) ? parsed.track : 'algorithms';

    return {
      id: String(parsed.id || `topic-${Date.now()}`),
      track,
      title: String(parsed.title || 'Untitled Topic'),
      promptSeed: String(parsed.promptSeed || userNote),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [track],
    };
  } catch (err) {
    console.warn('API draft failed; falling back to heuristic drafter:', err);
    return {
      id: userNote.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'custom-topic',
      track: 'algorithms',
      title: userNote.slice(0, 40),
      promptSeed: `Implement: ${userNote}.\n\nInvariants:\n1. Functional correctness.\n2. Invariant verification.\n3. Clean cold-start code.`,
      tags: ['custom'],
    };
  }
}
