import { TRACK_TYPES, isTrackType } from './leitner';
import type { TopicItem, TrackType } from './leitner';
import type { HarnessReport } from './runner';
import { isTsOnlyCard } from './tsOnly';
import { stripTestRunnerBlock } from './stripTestRunner';
import {
  API_KEY_KEY,
  API_KEYS_VAULT_KEY,
  API_PROVIDER_KEY,
  API_MODEL_KEY,
  API_BASE_URL_KEY,
  detectProviderFromKey,
  getAllStoredKeys,
  getStoredApiKey,
  setStoredApiKey,
  clearStoredApiKey,
  getStoredProvider,
  setStoredProvider,
  getStoredModel,
  setStoredModel,
  getStoredBaseUrl,
  setStoredBaseUrl,
  requestProviderCompletion,
} from './aiProviders';
import type { AIProvider, CritiqueFollowUpMessage } from './aiProviders';
import {
  EVALUATION_SYSTEM_PROMPT,
  DRAFT_SYSTEM_PROMPT,
  buildCritiqueFollowUpSystemPrompt,
  SOCRATIC_CLARIFICATION_SYSTEM_PROMPT,
} from './aiPrompts';

export {
  API_KEY_KEY,
  API_KEYS_VAULT_KEY,
  API_PROVIDER_KEY,
  API_MODEL_KEY,
  API_BASE_URL_KEY,
  detectProviderFromKey,
  getAllStoredKeys,
  getStoredApiKey,
  setStoredApiKey,
  clearStoredApiKey,
  getStoredProvider,
  setStoredProvider,
  getStoredModel,
  setStoredModel,
  getStoredBaseUrl,
  setStoredBaseUrl,
  requestProviderCompletion,
  EVALUATION_SYSTEM_PROMPT,
  DRAFT_SYSTEM_PROMPT,
  buildCritiqueFollowUpSystemPrompt,
  SOCRATIC_CLARIFICATION_SYSTEM_PROMPT,
  TRACK_TYPES,
};
export type { AIProvider, CritiqueFollowUpMessage };

export interface EvaluationResult {
  passed: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  invariantsMet: string[];
  invariantsMissed: string[];
  critique: string;
  evaluationSource?: 'api' | 'heuristic-mock';
  /** Set when the reviewer reply could not be parsed as the expected JSON schema. */
  rawOutput?: string;
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

const SCHEMA_KEYS = ['passed', 'timeComplexity', 'spaceComplexity', 'invariantsMet', 'invariantsMissed', 'critique'];

/** True for strings that are JSON scaffolding (braces, bare keys, lone colons) rather than real content. */
function isJsonNoise(s: string): boolean {
  const t = s.trim().replace(/,$/, '');
  if (!t) return true;
  if (/^[[\]{}:,"]+$/.test(t)) return true;
  const key = t.replace(/^"|"?\s*:?\s*[[{]?$/g, '').replace(/"$/, '');
  return SCHEMA_KEYS.includes(key) && /^"?\w+"?\s*:\s*[[{]?$/.test(t);
}

function toStringList(value: unknown): string[] {
  const arr = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  return arr
    .filter((v) => typeof v === 'string' || typeof v === 'number')
    .map((v) => String(v).trim())
    .filter((v) => !isJsonNoise(v));
}

/**
 * Extracts and validates the reviewer's JSON payload. Returns null when the
 * text cannot be parsed into an object carrying the expected schema.
 */
export function parseEvaluationPayload(raw: string): Record<string, unknown> | null {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) text = fence[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) text = text.slice(start, end + 1);
  try {
    let parsed: unknown = JSON.parse(text);
    if (typeof parsed === 'string') parsed = JSON.parse(parsed); // double-encoded payload
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const obj = parsed as Record<string, unknown>;
    if (!SCHEMA_KEYS.some((k) => k in obj)) return null;
    return obj;
  } catch {
    return null;
  }
}

/** Removes // and block comments, so the starter buffer's commented-out examples are never mistaken for the user's code. */
export function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}

/** Names of the failed checks in a harness report (lines look like `label: FAIL details`). */
export function failedCheckNames(harness?: HarnessReport): string[] {
  const names: string[] = [];
  for (const line of harness?.lines ?? []) {
    const match = /^\s*(.*?):\s+FAIL\b/.exec(line);
    if (match && match[1].trim()) names.push(match[1].trim());
  }
  return names;
}

/**
 * Intelligent client-side heuristic evaluator used when no API key is provided
 * or when the user desires instant offline evaluation.
 */
function heuristicEvaluateCode(topic: TopicItem, code: string, harness?: HarnessReport): EvaluationResult {
  const trimmed = stripComments(code).trim();
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
  } else if (topic.track === 'js-utilities') {
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
        }${
          failedCheckNames(harness).length ? ` Failed checks: ${failedCheckNames(harness).slice(0, 6).join('; ')}.` : ''
        }${
          topic.referenceSolution || topic.solution || topic.starterCode
            ? ' The reference solution is shown below: study it, then practice the pattern.'
            : ' Review the problem constraints, especially boundary conditions and error branches.'
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
    const skipDelay =
      typeof window !== 'undefined' &&
      Boolean((window as unknown as { __E2E_FAST_EVAL?: boolean }).__E2E_FAST_EVAL);
    if (!skipDelay) {
      await new Promise((r) => setTimeout(r, 600));
    }
    return heuristicEvaluateCode(topic, submittedCode, harness);
  }

  const isTypeScript = mode === 'ts' || isTsOnlyCard(topic);
  const languageLabel = isTypeScript ? 'TypeScript' : 'JavaScript';
  const codeFence = isTypeScript ? 'typescript' : 'javascript';
  const cleanedCode = stripTestRunnerBlock(submittedCode, topic.testHarness).trim() || submittedCode;

  try {
    const userPrompt = `Topic: ${topic.title} (Track: ${topic.track})
ID: ${topic.id}
Language: ${languageLabel}
${topic.targetTime || topic.targetSpace ? `Target Complexity Goals: Time: ${topic.targetTime || 'O(n)'}, Space: ${topic.targetSpace || 'O(1)'}` : ''}
Instructions & Invariants:
${topic.promptSeed}

Submitted Cold-Start Code:
\`\`\`${codeFence}
${cleanedCode}
\`\`\`

${
      harness?.ran
        ? `\nAutomated test harness result: ${harness.summary}.\nHarness output:\n${harness.lines.slice(0, 40).join('\n')}\n`
        : ''
    }
Evaluate functional correctness and invariants according to your system instructions.`;

    const rawJson = await requestProviderCompletion({
      provider,
      apiKey,
      systemPrompt: EVALUATION_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.1,
      maxTokens: 2048,
      jsonMode: true,
    });

    const parsed = parseEvaluationPayload(rawJson);
    const harnessFailed = Boolean(harness?.ran && !harness.passed);

    if (!parsed) {
      // Malformed reply: show it verbatim instead of fragmenting it across lists.
      const missed: string[] = harnessFailed && harness ? [`Test harness: ${harness.summary}`] : [];
      return {
        harness,
        passed: false,
        timeComplexity: 'Unknown',
        spaceComplexity: 'Unknown',
        invariantsMet: [],
        invariantsMissed: missed,
        critique: 'The reviewer response could not be parsed as structured JSON. Raw output is shown below.',
        evaluationSource: 'api',
        rawOutput: rawJson.trim() || '(empty response)',
      };
    }

    // A failing automated harness always wins over the model's opinion.
    const missed = toStringList(parsed.invariantsMissed);
    if (harnessFailed && harness) missed.unshift(`Test harness: ${harness.summary}`);

    return {
      harness,
      passed: parsed.passed === true && !harnessFailed,
      timeComplexity: String(parsed.timeComplexity || 'O(n)'),
      spaceComplexity: String(parsed.spaceComplexity || 'O(1)'),
      invariantsMet: toStringList(parsed.invariantsMet),
      invariantsMissed: missed,
      critique: typeof parsed.critique === 'string' && parsed.critique.trim() ? parsed.critique : 'Evaluation complete.',
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
      track = 'js-utilities';
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
    const rawJson = await requestProviderCompletion({
      provider,
      apiKey,
      systemPrompt: DRAFT_SYSTEM_PROMPT,
      userPrompt: userNote,
      temperature: 0.2,
      maxTokens: 2048,
      jsonMode: true,
    });

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

export async function askCritiqueFollowUp(
  topic: TopicItem,
  submittedCode: string,
  critique: string,
  question: string,
  history: CritiqueFollowUpMessage[] = []
): Promise<string> {
  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();

  // If no API key, provide a clear, helpful response explaining offline mode and key requirement
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 350));
    return `[Offline Mode] To ask live follow-up questions to the AI mentor, please save an API key (such as free Groq or Google Gemini) in Settings.\n\nTip for "${topic.title}": Focus on satisfying the target complexity (${topic.targetTime || 'O(n)'} time, ${topic.targetSpace || 'O(1)'} space) and checking null/boundary inputs.`;
  }

  const systemPrompt = buildCritiqueFollowUpSystemPrompt(topic.title);
  const cleanedCode = stripTestRunnerBlock(submittedCode, topic.testHarness).trim() || submittedCode;

  const contextPrompt = `Problem: ${topic.title} (${topic.track})
Prompt & Invariants:
${topic.promptSeed}

Submitted Code:
${cleanedCode}

Evaluator Critique:
${critique}

User Follow-Up Question:
${question}`;

  try {
    const reply = await requestProviderCompletion({
      provider,
      apiKey,
      systemPrompt,
      userPrompt: contextPrompt,
      history,
      temperature: 0.2,
      maxTokens: 1024,
    });
    return reply.trim() || 'No response generated.';
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `[Follow-up question failed (${msg})]. Please check your API key or network connection.`;
  }
}

/**
 * Solicits Socratic conceptual guidance, problem requirement clarifications, or
 * debugging hints from the AI tutor without revealing the actual code solution.
 */
export async function askSocraticClarification(
  topic: TopicItem,
  userCode: string,
  question: string,
  history: CritiqueFollowUpMessage[] = []
): Promise<string> {
  const apiKey = getStoredApiKey();
  const provider = getStoredProvider();

  // Offline guidance when no API key is saved
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 250));
    return `**Offline Socratic Coach**\n\nYou are in offline mode. To ask live clarification questions and receive real-time conceptual guidance, configure an API key in **Settings** (Groq offers a 100% free tier!).\n\n💡 **Conceptual Starting Point for "${topic.title}"**:\n- Review the Target Contract table below for boundary cases.\n- Target Complexity: ${topic.targetTime || 'O(n)'} time, ${topic.targetSpace || 'O(1)'} space.`;
  }

  const canonicalCode = topic.referenceSolutionTs || topic.referenceSolution || topic.solution || topic.starterCode || '';

  const contractSample = (topic.testCases || [])
    .slice(0, 8)
    .map((c) => `- Input: ${c.input} -> Expected: ${c.expected} (${c.description})`)
    .join('\n');

  const contextPrompt = `Problem Title: ${topic.title} (${topic.track})
Target Concept: ${topic.concept || 'General'}
Target Complexity: Time ${topic.targetTime || 'O(n)'}, Space ${topic.targetSpace || 'O(1)'}

Prompt & Requirements:
${topic.promptSeed}

Target Contract Cases:
${contractSample || '(Standard contract)'}

Canonical Reference Solution (FOR YOUR EYES ONLY - STRICTLY DO NOT REVEAL OR COPY CODE FROM THIS):
${canonicalCode}

Learner's Current Editor Code:
${userCode ? userCode : '(Editor is currently empty)'}

Learner's Question / Request:
${question}`;

  try {
    const reply = await requestProviderCompletion({
      provider,
      apiKey,
      systemPrompt: SOCRATIC_CLARIFICATION_SYSTEM_PROMPT,
      userPrompt: contextPrompt,
      history,
      temperature: 0.3,
      maxTokens: 1024,
    });
    return reply.trim() || 'No response generated.';
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `[Tutor guidance failed (${msg})]. Please check your API key or network connection.`;
  }
}
