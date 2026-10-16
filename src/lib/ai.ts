import { TRACK_TYPES, isTrackType } from './leitner';
import type { TopicItem, TrackType } from './leitner';
import type { HarnessReport } from './runner';

export interface EvaluationResult {
  passed: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  invariantsMet: string[];
  invariantsMissed: string[];
  critique: string;
  evaluationSource?: 'api' | 'heuristic-mock';
  /** Result of running the card's test harness; when present it decides pass/fail. */
  harness?: HarnessReport;
}

export interface DraftedTopic {
  id: string;
  track: TrackType;
  title: string;
  promptSeed: string;
  tags: string[];
  targetTime?: string;
  targetSpace?: string;
  complexityExplanation?: string;
  starterCode?: string;
  referenceSolution?: string;
  testHarness?: string;
  difficulty?: number;
  concept?: string;
}

export const API_KEY_KEY = 'ai_evaluator_key';
export const API_KEYS_VAULT_KEY = 'ai_evaluator_keys_vault';
export const API_PROVIDER_KEY = 'ai_evaluator_provider';
export const API_MODEL_KEY = 'ai_evaluator_model';
export const API_BASE_URL_KEY = 'ai_evaluator_base_url';

export type AIProvider =
  | 'gemini'
  | 'groq'
  | 'cerebras'
  | 'mistral'
  | 'anthropic'
  | 'openrouter'
  | 'openai'
  | 'custom';

export function detectProviderFromKey(key: string): AIProvider | null {
  const trimmed = key.trim();
  if (trimmed.startsWith('gsk_')) return 'groq';
  if (trimmed.startsWith('AIzaSy')) return 'gemini';
  if (trimmed.startsWith('sk-ant-')) return 'anthropic';
  if (trimmed.startsWith('csk-')) return 'cerebras';
  if (trimmed.startsWith('sk-or-')) return 'openrouter';
  if (trimmed.startsWith('sk-')) return 'openai';
  return null;
}

export function getAllStoredKeys(): Record<AIProvider, string> {
  if (typeof window === 'undefined') {
    return {
      gemini: '',
      groq: '',
      cerebras: '',
      mistral: '',
      anthropic: '',
      openrouter: '',
      openai: '',
      custom: '',
    };
  }
  let vault: Record<string, string> = {};
  try {
    const raw = localStorage.getItem(API_KEYS_VAULT_KEY);
    if (raw) vault = JSON.parse(raw);
  } catch {
    vault = {};
  }
  // Migrate legacy single key into vault if missing
  const legacyKey = localStorage.getItem(API_KEY_KEY) || '';
  const detected = detectProviderFromKey(legacyKey);
  const currentProvider = detected || (localStorage.getItem(API_PROVIDER_KEY) as AIProvider) || 'gemini';
  if (legacyKey && !vault[currentProvider]) {
    vault[currentProvider] = legacyKey;
    try {
      localStorage.setItem(API_KEYS_VAULT_KEY, JSON.stringify(vault));
    } catch {
      /* ignore */
    }
  }
  return {
    gemini: vault.gemini || '',
    groq: vault.groq || '',
    cerebras: vault.cerebras || '',
    mistral: vault.mistral || '',
    anthropic: vault.anthropic || '',
    openrouter: vault.openrouter || '',
    openai: vault.openai || '',
    custom: vault.custom || '',
  };
}

export function getStoredApiKey(targetProvider?: AIProvider): string {
  if (typeof window === 'undefined') return '';
  const prov = targetProvider || getStoredProvider();
  const all = getAllStoredKeys();
  if (all[prov]) return all[prov];
  if (!targetProvider || targetProvider === getStoredProvider()) {
    return localStorage.getItem(API_KEY_KEY) || '';
  }
  return '';
}

export function setStoredApiKey(key: string, targetProvider?: AIProvider): void {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  const detected = detectProviderFromKey(trimmed);
  const prov = targetProvider || detected || getStoredProvider();

  // Save into keys vault
  const all = getAllStoredKeys();
  if (trimmed) {
    all[prov] = trimmed;
  } else {
    delete all[prov];
  }
  try {
    localStorage.setItem(API_KEYS_VAULT_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }

  // If this key is for the active provider or auto-detected, update active API_KEY_KEY
  if (!targetProvider || targetProvider === getStoredProvider() || detected) {
    localStorage.setItem(API_KEY_KEY, trimmed);
  }

  // Auto-set provider and model if key unambiguously belongs to a provider
  if (detected) {
    setStoredProvider(detected);
    if (detected === 'gemini') setStoredModel('gemini-2.5-flash');
    else if (detected === 'groq') setStoredModel('llama-3.3-70b-versatile');
    else if (detected === 'cerebras') setStoredModel('llama3.3-70b');
    else if (detected === 'mistral') setStoredModel('codestral-latest');
    else if (detected === 'anthropic') setStoredModel('claude-3-5-sonnet-20241022');
    else if (detected === 'openai') setStoredModel('gpt-4o-mini');
    else if (detected === 'openrouter') setStoredModel('nvidia/nemotron-3-super-120b-a12b:free');
  }
}

export function clearStoredApiKey(providerToClear?: AIProvider): void {
  if (typeof window === 'undefined') return;
  const prov = providerToClear || getStoredProvider();
  const all = getAllStoredKeys();
  delete all[prov];
  try {
    localStorage.setItem(API_KEYS_VAULT_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }

  if (!providerToClear || providerToClear === getStoredProvider()) {
    localStorage.removeItem(API_KEY_KEY);
  }
}

export function getStoredProvider(): AIProvider {
  if (typeof window === 'undefined') return 'gemini';
  const stored = localStorage.getItem(API_PROVIDER_KEY) as AIProvider | null;
  const key = localStorage.getItem(API_KEY_KEY) || '';
  const detected = detectProviderFromKey(key);

  // If a key with a known unambiguous prefix is active, honor it
  if (detected) {
    if (!stored || (stored === 'gemini' && detected !== 'gemini')) {
      localStorage.setItem(API_PROVIDER_KEY, detected);
      return detected;
    }
  }

  return stored || 'gemini';
}

export function setStoredProvider(provider: AIProvider): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_PROVIDER_KEY, provider);

  // Auto-activate the key for this provider from the vault
  const all = getAllStoredKeys();
  if (all[provider]) {
    localStorage.setItem(API_KEY_KEY, all[provider]);
  } else {
    localStorage.removeItem(API_KEY_KEY);
  }
}

export function getStoredModel(): string {
  if (typeof window === 'undefined') return 'gemini-2.5-flash';
  const prov = getStoredProvider();
  const val = localStorage.getItem(API_MODEL_KEY);
  if (val) {
    // If model conflicts with provider (e.g. model is gemini-2.5-flash but provider is groq)
    if (prov === 'groq' && val.includes('gemini')) return 'llama-3.3-70b-versatile';
    if (prov === 'gemini' && (val.includes('llama') || val.includes('gpt') || val.includes('claude'))) return 'gemini-2.5-flash';
    if (prov === 'openai' && (val.includes('gemini') || val.includes('llama') || val.includes('claude'))) return 'gpt-4o-mini';
    if (prov === 'cerebras' && (val.includes('gemini') || val.includes('gpt') || val.includes('claude'))) return 'llama3.3-70b';
    if (prov === 'mistral' && (val.includes('gemini') || val.includes('gpt') || val.includes('claude'))) return 'codestral-latest';
    if (prov === 'anthropic' && !val.includes('claude')) return 'claude-3-5-sonnet-20241022';
    return val;
  }
  if (prov === 'gemini') return 'gemini-2.5-flash';
  if (prov === 'groq') return 'llama-3.3-70b-versatile';
  if (prov === 'cerebras') return 'llama3.3-70b';
  if (prov === 'mistral') return 'codestral-latest';
  if (prov === 'anthropic') return 'claude-3-5-sonnet-20241022';
  if (prov === 'openrouter') return 'nvidia/nemotron-3-super-120b-a12b:free';
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
Respect the indicated language mode (JavaScript vs TypeScript). Do NOT criticize, dock points, or demand TypeScript type annotations or interfaces unless the problem is explicitly in TypeScript mode or requires TypeScript invariants. Valid idiomatic JavaScript without types is expected and completely correct when running in JavaScript mode.
Standard React hooks and primitives (React, useState, useEffect, useRef, useMemo, useCallback, useReducer, etc.) are pre-injected environment globals in this trainer. Do NOT criticize, dock points, or comment on the absence of explicit import statements (such as 'import { useState } from "react"'). Both implicit globals and explicit imports are valid and accepted in this environment.
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
function heuristicEvaluateCode(topic: TopicItem, code: string, harness?: HarnessReport): EvaluationResult {
  const trimmed = code.trim();
  const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);

  if (!harness?.ran && (trimmed.length < 20 || lines.length <= 2)) {
    // Only trust the stub check when the harness could not run; otherwise tests decide.
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
      harness,
    };
  }

  const invariantsMet: string[] = [];
  const invariantsMissed: string[] = [];

  // Track-specific invariant heuristics
  if (topic.track === 'async-js') {
    if (trimmed.includes('async') || trimmed.includes('Promise') || trimmed.includes('.then')) {
      invariantsMet.push('Asynchronous handling mechanics present (async/await or Promise)');
    } else {
      invariantsMissed.push('Missing async execution or Promise wrapper');
    }

    if (trimmed.includes('try') && (trimmed.includes('catch') || trimmed.includes('.catch'))) {
      invariantsMet.push('Error handling / rejection capture implemented');
    } else {
      invariantsMissed.push('Potential unhandled rejection: error boundary or try/catch not detected');
    }

    if (trimmed.includes('setTimeout') || trimmed.includes('clearTimeout') || trimmed.includes('AbortController') || trimmed.includes('signal')) {
      invariantsMet.push('Timing/cancellation lifecycle lifecycle awareness');
    }
  } else if (topic.track === 'data-structures') {
    if (trimmed.includes('new Map') || trimmed.includes('new Set') || trimmed.includes('WeakMap') || trimmed.includes('reduce')) {
      invariantsMet.push('Core data structure primitive instantiated properly');
    } else {
      invariantsMissed.push('Expected standard data structure primitive (Map/Set/WeakMap/reduce)');
    }

    if (trimmed.includes('.get(') || trimmed.includes('.set(') || trimmed.includes('.has(') || trimmed.includes('.delete(')) {
      invariantsMet.push('Map/Set operational API methods invoked with correct semantics');
    }
  } else if (topic.track === 'react') {
    if (trimmed.includes('use') || trimmed.includes('useState') || trimmed.includes('useEffect') || trimmed.includes('useRef') || trimmed.includes('useCallback')) {
      invariantsMet.push('React hook primitives declared and structured');
    } else {
      invariantsMissed.push('React hook convention or lifecycle primitives absent');
    }

    if (trimmed.includes('return () =>') || trimmed.includes('cleanup') || trimmed.includes('cancel')) {
      invariantsMet.push('Component cleanup / tear-down lifecycle accounted for');
    }
  } else if (topic.track === 'algorithms') {
    if (trimmed.includes('while') || trimmed.includes('for (') || trimmed.includes('for(')) {
      invariantsMet.push('Iterative pointer / boundary traversal implemented');
    } else if (trimmed.includes('function') && trimmed.includes('(') && trimmed.includes('return')) {
      invariantsMet.push('Algorithmic recursion or function breakdown');
    }

    if (trimmed.includes('left') || trimmed.includes('right') || trimmed.includes('Math.max') || trimmed.includes('Math.min') || trimmed.includes('stack')) {
      invariantsMet.push('Boundary indices or invariant tracking logic correctly updated');
    }
  }

  // General code quality checks
  if (trimmed.includes('return ')) {
    invariantsMet.push('Function produces explicit return value');
  } else {
    invariantsMissed.push('Missing explicit return statement');
  }

  if (trimmed.includes('const ') || trimmed.includes('let ')) {
    invariantsMet.push('Block-scoped variable hygiene maintained');
  }

  // The test harness is the source of truth. Structural heuristics are advisory only:
  // without an executed harness result, an unverified submission is never auto-passed.
  const harnessRan = Boolean(harness?.ran);
  const passed = harnessRan ? Boolean(harness?.passed) : false;
  if (harness) {
    if (harness.passed) {
      invariantsMet.unshift(`Test harness: ${harness.summary}`);
    } else {
      invariantsMissed.unshift(`Test harness: ${harness.summary}`);
    }
  }

  let timeComplexity = topic.targetTime || 'O(n)';
  let spaceComplexity = topic.targetSpace || 'O(1)';
  if (!topic.targetTime) {
    if (topic.id.includes('binary-search')) {
      timeComplexity = 'O(log n)';
    } else if (topic.id.includes('matrix') || topic.id.includes('lru')) {
      timeComplexity = 'O(1) operations';
      spaceComplexity = 'O(capacity)';
    } else if (topic.id.includes('flatten') || topic.id.includes('tree') || topic.id.includes('bfs') || topic.id.includes('dfs')) {
      timeComplexity = 'O(n)';
      spaceComplexity = 'O(h) recursion/queue';
    }
  }

  return {
    passed,
    timeComplexity,
    spaceComplexity,
    invariantsMet: invariantsMet.length > 0 ? invariantsMet : ['Code syntactically constructed'],
    invariantsMissed: invariantsMissed.length > 0 ? invariantsMissed : ['Verify edge cases for null/empty collections'],
    harness,
    critique: passed
      ? `Test harness passed (${harness?.summary}) for "${topic.title}". Structural checks below are advisory; use the override if a test depends on the network or timing.`
      : `${
          harnessRan
            ? `Test harness did not pass (${harness?.summary}).`
            : `Could not verify automatically (${harness?.summary ?? 'no harness result'}); structural checks are advisory only. Use the override if you judge the solution correct.`
        } Review the problem constraints, especially boundary condition handling and error branches.${
          (topic.referenceSolution || topic.solution || topic.starterCode)
            ? `\n\n### Canonical Reference Pattern\n\`\`\`typescript\n${topic.referenceSolution || topic.solution || topic.starterCode}\n\`\`\``
            : ''
        }`,
    evaluationSource: 'heuristic-mock',
  };
}

export async function evaluateCodeSubmission(
  topic: TopicItem,
  submittedCode: string,
  harness?: HarnessReport,
  mode?: 'js' | 'ts'
): Promise<EvaluationResult> {
  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();

  // If no API key is set, immediately use heuristic evaluator
  if (!apiKey) {
    // Artificial small delay for realistic UX feedback
    await new Promise((r) => setTimeout(r, 600));
    return heuristicEvaluateCode(topic, submittedCode, harness);
  }

  const isTypeScript = mode === 'ts' || topic.track === 'typescript-patterns';
  const languageLabel = isTypeScript ? 'TypeScript' : 'JavaScript';
  const codeFence = isTypeScript ? 'typescript' : 'javascript';

  try {
    const userPrompt = `Topic: ${topic.title} (Track: ${topic.track})
ID: ${topic.id}
Language: ${languageLabel}
${topic.targetTime || topic.targetSpace ? `Target Complexity Goals: Time: ${topic.targetTime || 'O(n)'}, Space: ${topic.targetSpace || 'O(1)'}` : ''}
Instructions & Invariants:
${topic.promptSeed}

Submitted Cold-Start Code:
\`\`\`${codeFence}
${submittedCode}
\`\`\`

${
      harness?.ran
        ? `\nAutomated test harness result: ${harness.summary}.\nHarness output:\n${harness.lines.slice(0, 40).join('\n')}\n`
        : ''
    }
Evaluate functional correctness and invariants according to your system instructions.`;

    let rawJson = '';

    if (provider === 'gemini') {
      const model = getStoredModel() || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
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
          max_tokens: 2048,
          temperature: 0.1,
          system: EVALUATION_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      rawJson = data.content?.[0]?.text || '';
    } else {
      // OpenAI-compatible endpoint (OpenAI, Groq, Cerebras, Mistral, OpenRouter, Custom)
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
        model = model || 'nvidia/nemotron-3-super-120b-a12b:free';
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

    // A failing automated harness always wins over the model's opinion.
    const harnessFailed = Boolean(harness?.ran && !harness.passed);
    const missed: string[] = Array.isArray(parsed.invariantsMissed) ? parsed.invariantsMissed.map(String) : [];
    if (harnessFailed && harness) missed.unshift(`Test harness: ${harness.summary}`);

    return {
      harness,
      passed: Boolean(parsed.passed) && !harnessFailed,
      timeComplexity: String(parsed.timeComplexity || 'O(n)'),
      spaceComplexity: String(parsed.spaceComplexity || 'O(1)'),
      invariantsMet: Array.isArray(parsed.invariantsMet) ? parsed.invariantsMet.map(String) : [],
      invariantsMissed: missed,
      critique: String(parsed.critique || 'Evaluation complete.'),
      evaluationSource: 'api',
    };
  } catch (err: unknown) {
    console.warn('API Evaluation failed or rate limited; falling back to heuristic evaluation:', err);
    const fallback = heuristicEvaluateCode(topic, submittedCode, harness);
    const msg = err instanceof Error ? err.message : String(err);
    fallback.critique = `[Notice: Live API call returned an error (${msg || 'connection failure'}). Fallback offline evaluation applied]: ${fallback.critique}`;
    return fallback;
  }
}

const DRAFT_SYSTEM_PROMPT = `The user will describe a coding pattern or interview concept informally. 
Extract and return ONLY a valid JSON object matching this schema:
{
  "id": string (kebab-case identifier),
  "track": one of ${TRACK_TYPES.map((t) => `'${t}'`).join(' | ')},
  "title": string (concise name),
  "promptSeed": string (a clear, cold-start prompt describing what to write, requirements, and invariants to satisfy),
  "tags": string[],
  "targetTime": string (e.g. "O(1)", "O(n)", "O(n log n)"),
  "targetSpace": string (e.g. "O(1)", "O(n)"),
  "complexityExplanation": string (succinct 1-2 sentence explanation of the target time and space complexity),
  "starterCode": string (minimal boilerplate function or component signature stub),
  "referenceSolution": string (canonical, optimal, clean implementation),
  "testHarness": string (executable test verification script using $test.check('description', condition))
}`;

export async function draftTopicWithAI(userNote: string): Promise<DraftedTopic> {
  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();

  // Smart heuristic draft if no API key
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 500));
    const lower = userNote.toLowerCase();

    let track: TrackType = 'algorithms';
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
      targetTime: 'O(n)',
      targetSpace: 'O(1)',
      complexityExplanation: 'Linear time scan with constant extra auxiliary memory.',
      starterCode: `export function solution() {\n  // Write cold-start solution here\n}\n`,
      referenceSolution: `export function solution() {\n  // Canonical implementation\n  return true;\n}\n`,
      testHarness: `{\n  $test.check('Defined function exists', typeof solution === 'function');\n}\n`,
      difficulty: 2,
    };
  }

  try {
    let rawJson = '';

    if (provider === 'gemini') {
      const model = getStoredModel() || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
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
          max_tokens: 2048,
          temperature: 0.2,
          system: DRAFT_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userNote }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API draft error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      rawJson = data.content?.[0]?.text || '';
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
        model = model || 'nvidia/nemotron-3-super-120b-a12b:free';
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

    const track: TrackType = isTrackType(parsed.track) ? parsed.track : 'algorithms';

    return {
      id: String(parsed.id || `topic-${Date.now()}`),
      track,
      title: String(parsed.title || 'Untitled Topic'),
      promptSeed: String(parsed.promptSeed || userNote),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [track],
      targetTime: parsed.targetTime ? String(parsed.targetTime) : 'O(n)',
      targetSpace: parsed.targetSpace ? String(parsed.targetSpace) : 'O(1)',
      complexityExplanation: parsed.complexityExplanation ? String(parsed.complexityExplanation) : undefined,
      starterCode: parsed.starterCode ? String(parsed.starterCode) : undefined,
      referenceSolution: parsed.referenceSolution ? String(parsed.referenceSolution) : undefined,
      testHarness: parsed.testHarness ? String(parsed.testHarness) : undefined,
      difficulty: typeof parsed.difficulty === 'number' ? parsed.difficulty : 2,
    };
  } catch (err) {
    console.warn('API draft failed; falling back to heuristic drafter:', err);
    return {
      id: userNote.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'custom-topic',
      track: 'algorithms',
      title: userNote.slice(0, 40),
      promptSeed: `Implement: ${userNote}.\n\nInvariants:\n1. Functional correctness.\n2. Invariant verification.\n3. Clean cold-start code.`,
      tags: ['custom'],
      targetTime: 'O(n)',
      targetSpace: 'O(1)',
      complexityExplanation: 'Linear time scan with constant extra memory.',
      starterCode: `export function solution() {\n  // Write cold-start solution here\n}\n`,
      referenceSolution: `export function solution() {\n  // Canonical implementation\n  return true;\n}\n`,
      testHarness: `{\n  $test.check('Defined function exists', typeof solution === 'function');\n}\n`,
      difficulty: 2,
    };
  }
}
