import type { AIProvider } from '../../lib/ai';

export interface ProviderKeyPortal {
  name: string;
  url: string;
  label: string;
  description: string;
}

export const PROVIDER_KEY_PORTALS: Record<AIProvider, ProviderKeyPortal | null> = {
  gemini: {
    name: 'Google AI Studio',
    url: 'https://aistudio.google.com/app/apikey',
    label: 'Get Google Gemini Key',
    description: 'Free tier available (15 RPM on Flash) via Google AI Studio',
  },
  groq: {
    name: 'Groq Console',
    url: 'https://console.groq.com/keys',
    label: 'Get Groq Key',
    description: 'Ultra-fast inference with free tier rate limits (TPM/RPM)',
  },
  cerebras: {
    name: 'Cerebras Cloud',
    url: 'https://cloud.cerebras.ai/platform/',
    label: 'Get Cerebras Key',
    description: 'Blistering fast Wafer-Scale inference (~1,800 T/s) with free developer tier',
  },
  mistral: {
    name: 'Mistral Console',
    url: 'https://console.mistral.ai/api-keys',
    label: 'Get Mistral Key',
    description: 'Free developer tier for Codestral & Mistral models via Mistral Console',
  },
  anthropic: {
    name: 'Anthropic Console',
    url: 'https://console.anthropic.com/settings/keys',
    label: 'Get Anthropic Key',
    description: 'Claude 3.5 Sonnet & Haiku coding benchmark via Anthropic Console',
  },
  openrouter: {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/settings/keys',
    label: 'Get / Manage OpenRouter Keys',
    description: 'Access 400+ models with unified credits & free models',
  },
  openai: {
    name: 'OpenAI Platform',
    url: 'https://platform.openai.com/api-keys',
    label: 'Get OpenAI Key',
    description: 'Create and manage secret keys on OpenAI Platform',
  },
  custom: {
    name: 'Ollama Documentation',
    url: 'https://ollama.com',
    label: 'Ollama Setup',
    description: 'Run local open-source models without an API key',
  },
};

export interface CuratedOpenRouterPick {
  id: string;
  name: string;
  providerBadge: string;
  verdictBadge: string;
  contextWindow: string;
  whyItsSolid: string;
}

export const TOP_OPENROUTER_FREE_PICKS: CuratedOpenRouterPick[] = [
  {
    id: 'nvidia/nemotron-3-super-120b-a12b:free',
    name: 'NVIDIA Nemotron 3 Super (120B)',
    providerBadge: '120B MoE • NVIDIA',
    verdictBadge: 'Best for Algorithmic Logic & Big-O',
    contextWindow: '128k',
    whyItsSolid:
      'With 120B total parameters and an architecture built for instruction following, it performs well at parsing algorithmic logic and evaluating time/space complexity bounds.',
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google Gemma 4 31B Instruct',
    providerBadge: '31B Dense • Google',
    verdictBadge: 'Best for Clean TS/JS Syntax',
    contextWindow: '262k',
    whyItsSolid:
      'A 31B dense model with a 262k context window. It handles syntactic verification, TypeScript/JavaScript idioms, and edge-case detection reliably without hallucinating invalid syntax.',
  },
  {
    id: 'cohere/north-mini-code:free',
    name: 'Cohere North Mini Code',
    providerBadge: 'Code-Tuned • Cohere',
    verdictBadge: 'Best for Fast Grading',
    contextWindow: '256k',
    whyItsSolid:
      'Specifically tuned for code syntax, completions, and code-critique workflows with a 256k context window. It delivers tight, deterministic answers when grading solutions.',
  },
  {
    id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    name: 'NVIDIA Nemotron 3 Nano Omni (Reasoning)',
    providerBadge: '30B Reasoning • NVIDIA',
    verdictBadge: 'Best for Multi-Step Async Bugs',
    contextWindow: '128k',
    whyItsSolid:
      'Designed with reasoning-focused weights, making it effective for breaking down multi-step logic errors or asynchronous patterns.',
  },
];

export const PROVIDER_OPTIONS: ReadonlyArray<{ id: AIProvider; label: string; badge?: string }> = [
  { id: 'groq', label: 'Groq', badge: '⚡ Best Free Speed' },
  { id: 'gemini', label: 'Google Gemini', badge: '🌟 Best Free Volume (1M TPM)' },
  { id: 'cerebras', label: 'Cerebras', badge: '⚡ ~1,800 T/s' },
  { id: 'mistral', label: 'Mistral AI', badge: '💻 Codestral' },
  { id: 'anthropic', label: 'Anthropic', badge: '🎯 Benchmark' },
  { id: 'openrouter', label: 'OpenRouter', badge: '🌐 400+ Models' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'custom', label: 'Custom URL' },
];
