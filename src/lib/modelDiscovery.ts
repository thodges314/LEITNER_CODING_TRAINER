import type { AIProvider } from './ai';

export interface DiscoveredModel {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
  isFree?: boolean;
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
  };
  ownedBy?: string;
  recommended?: boolean;
}

export interface ProviderAccountInfo {
  provider: AIProvider;
  tier?: string;
  creditsRemaining?: string;
  tokensRemaining?: string;
  rateLimitSummary?: string;
  totalModelsFound?: number;
  freeModelsCount?: number;
}

export interface ModelDiscoveryResult {
  models: DiscoveredModel[];
  accountInfo?: ProviderAccountInfo;
  error?: string;
}

// Curated priority models to pin at the top per provider for coding cold-start practice
const RECOMMENDED_MODELS: Record<AIProvider, string[]> = {
  groq: [
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-120b',
    'llama-3.1-8b-instant',
    'qwen-2.5-coder-32b',
    'deepseek-r1-distill-llama-70b',
  ],
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ],
  openai: [
    'gpt-4o-mini',
    'gpt-4o',
    'o3-mini',
    'o1-mini',
    'gpt-4-turbo',
  ],
  openrouter: [
    'google/gemini-2.5-flash',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen-2.5-coder-32b-instruct',
    'deepseek/deepseek-chat',
    'openai/gpt-4o-mini',
  ],
  custom: [],
};

export async function fetchProviderModels(
  provider: AIProvider,
  apiKey: string,
  customBaseUrl?: string
): Promise<ModelDiscoveryResult> {
  const trimmedKey = apiKey.trim();

  // If custom without key or base URL
  if (provider === 'custom' && !customBaseUrl) {
    return {
      models: [],
      error: 'Please enter a Base URL for your custom endpoint (e.g. http://localhost:11434/v1).',
    };
  }

  // Without a key (unless OpenRouter which has public models or local custom endpoint)
  if (!trimmedKey && provider !== 'openrouter' && provider !== 'custom') {
    return {
      models: [],
      error: `Please enter an API key for ${provider.toUpperCase()} to query available models.`,
    };
  }

  try {
    switch (provider) {
      case 'groq':
        return await fetchGroqModels(trimmedKey);
      case 'gemini':
        return await fetchGeminiModels(trimmedKey);
      case 'openrouter':
        return await fetchOpenRouterModels(trimmedKey);
      case 'openai':
        return await fetchOpenAIModels(trimmedKey);
      case 'custom':
        return await fetchCustomModels(trimmedKey, customBaseUrl || 'http://localhost:11434/v1');
      default:
        return { models: [], error: 'Unsupported provider' };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      models: [],
      error: msg.includes('Failed to fetch')
        ? 'Network or CORS connection failed. Check your network or provider endpoint.'
        : msg,
    };
  }
}

async function fetchGroqModels(apiKey: string): Promise<ModelDiscoveryResult> {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    let msg = `Groq API error (${res.status})`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error?.message) msg = parsed.error.message;
    } catch {
      // Fallback to HTTP status text if parsing fails
    }
    return { models: [], error: msg };
  }

  // Inspect rate limit headers if provided by Groq
  const remReq = res.headers.get('x-ratelimit-remaining-requests');
  const remTok = res.headers.get('x-ratelimit-remaining-tokens');
  const limTok = res.headers.get('x-ratelimit-limit-tokens');

  const json = await res.json();
  const rawList: Array<{ id: string; owned_by?: string; context_window?: number; active?: boolean }> = json.data || [];

  const recommendedSet = new Set(RECOMMENDED_MODELS.groq);

  const models: DiscoveredModel[] = sortModels(
    rawList
      .filter((m) => m.active !== false && !m.id.includes('whisper'))
      .map((m) => ({
        id: m.id,
        name: formatModelName(m.id),
        contextWindow: m.context_window,
        ownedBy: m.owned_by || 'Groq',
        isFree: true,
        recommended: recommendedSet.has(m.id),
      })),
    'groq'
  );

  let rateLimitSummary: string | undefined;
  if (remTok || limTok) {
    rateLimitSummary = `${remTok ? Number(remTok).toLocaleString() : '?'} / ${limTok ? Number(limTok).toLocaleString() : '?'} TPM remaining`;
  }

  return {
    models,
    accountInfo: {
      provider: 'groq',
      tier: 'Developer Free Tier',
      creditsRemaining: 'Free (Rate limited by TPM/RPM)',
      tokensRemaining: remTok ? `${Number(remTok).toLocaleString()} TPM` : undefined,
      rateLimitSummary: rateLimitSummary || (remReq ? `${remReq} requests remaining` : undefined),
      totalModelsFound: models.length,
      freeModelsCount: models.length,
    },
  };
}

async function fetchGeminiModels(apiKey: string): Promise<ModelDiscoveryResult> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);

  if (!res.ok) {
    const errText = await res.text();
    let msg = `Gemini API error (${res.status})`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error?.message) msg = parsed.error.message;
    } catch {
      // Fallback to HTTP status text if parsing fails
    }
    return { models: [], error: msg };
  }

  const json = await res.json();
  const rawList: Array<{
    name: string;
    displayName?: string;
    description?: string;
    inputTokenLimit?: number;
    outputTokenLimit?: number;
    supportedGenerationMethods?: string[];
  }> = json.models || [];

  const recommendedSet = new Set(RECOMMENDED_MODELS.gemini);

  const models: DiscoveredModel[] = sortModels(
    rawList
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent') && !m.name.includes('embedding') && !m.name.includes('aqa'))
      .map((m) => {
        const cleanId = m.name.replace(/^models\//, '');
        return {
          id: cleanId,
          name: m.displayName || cleanId,
          description: m.description,
          contextWindow: m.inputTokenLimit,
          ownedBy: 'Google',
          isFree: cleanId.includes('flash'),
          recommended: recommendedSet.has(cleanId),
        };
      }),
    'gemini'
  );

  return {
    models,
    accountInfo: {
      provider: 'gemini',
      tier: 'Google AI Studio (Free & Paid Quotas)',
      creditsRemaining: 'Free Tier (15 RPM on Flash models)',
      rateLimitSummary: 'Up to 1M–2M context window per model',
      totalModelsFound: models.length,
    },
  };
}

function formatOpenRouterAmount(amount: number): string {
  if (amount === 0) return '$0.00';
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(2)}`;
}

async function fetchOpenRouterModels(apiKey: string): Promise<ModelDiscoveryResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const [modelsRes, authRes, creditsRes] = await Promise.all([
    fetch('https://openrouter.ai/api/v1/models', { headers }),
    apiKey
      ? fetch('https://openrouter.ai/api/v1/auth/key', { headers }).catch(() => null)
      : Promise.resolve(null),
    apiKey
      ? fetch('https://openrouter.ai/api/v1/credits', { headers }).catch(() => null)
      : Promise.resolve(null),
  ]);

  if (!modelsRes.ok) {
    const errText = await modelsRes.text();
    return { models: [], error: `OpenRouter API error (${modelsRes.status}): ${errText}` };
  }

  const json = await modelsRes.json();
  const rawList: Array<{
    id: string;
    name?: string;
    description?: string;
    context_length?: number;
    pricing?: { prompt?: string; completion?: string };
  }> = json.data || [];

  const recommendedSet = new Set(RECOMMENDED_MODELS.openrouter);
  let freeCount = 0;

  const models: DiscoveredModel[] = sortModels(
    rawList
      .filter((m) => !m.id.includes('embedding'))
      .map((m) => {
        const isFree =
          m.id.endsWith(':free') ||
          (m.pricing?.prompt === '0' && m.pricing?.completion === '0');
        if (isFree) freeCount++;

        return {
          id: m.id,
          name: m.name || m.id,
          description: m.description,
          contextWindow: m.context_length,
          isFree,
          pricing: m.pricing,
          ownedBy: m.id.split('/')[0] || 'OpenRouter',
          recommended: recommendedSet.has(m.id) || m.id === 'google/gemini-2.5-flash',
        };
      }),
    'openrouter'
  );

  let creditsRemaining = 'Public Model Catalog';
  let tier = 'API Access';
  let rateLimitSummary: string | undefined;

  let accountCredits: { totalCredits: number; totalUsage: number; remaining: number } | null = null;
  if (creditsRes && creditsRes.ok) {
    try {
      const creditsData = await creditsRes.json();
      if (
        creditsData?.data &&
        typeof creditsData.data.total_credits === 'number' &&
        typeof creditsData.data.total_usage === 'number'
      ) {
        const remaining = Math.max(0, creditsData.data.total_credits - creditsData.data.total_usage);
        accountCredits = {
          totalCredits: creditsData.data.total_credits,
          totalUsage: creditsData.data.total_usage,
          remaining,
        };
      }
    } catch {
      // Credits endpoint optional / ignore parse errors
    }
  }

  let keyInfo: {
    isFreeTier?: boolean;
    limit?: number | null;
    usage?: number;
    rateLimit?: { requests: number; interval: string };
  } | null = null;

  if (authRes && authRes.ok) {
    try {
      const authData = await authRes.json();
      const info = authData?.data;
      if (info) {
        keyInfo = {
          isFreeTier: info.is_free_tier,
          limit: info.limit,
          usage: info.usage,
          rateLimit: info.rate_limit,
        };
      }
    } catch {
      // Auth endpoint optional, ignore if failed
    }
  }

  if (keyInfo) {
    tier = keyInfo.isFreeTier ? 'Free Tier Account' : 'Paid Account';
    if (keyInfo.rateLimit) {
      rateLimitSummary = `${keyInfo.rateLimit.requests} req / ${keyInfo.rateLimit.interval}`;
    }
  }

  if (accountCredits) {
    const remStr = formatOpenRouterAmount(accountCredits.remaining);
    const spentStr = formatOpenRouterAmount(accountCredits.totalUsage);
    if (keyInfo?.limit != null) {
      const keyLimitStr = formatOpenRouterAmount(keyInfo.limit);
      creditsRemaining = `${remStr} balance (Spent: ${spentStr} • Key cap: ${keyLimitStr})`;
    } else {
      creditsRemaining = `${remStr} balance (Total spent: ${spentStr})`;
    }
  } else if (keyInfo) {
    if (keyInfo.limit != null && keyInfo.usage != null) {
      const rem = Math.max(0, keyInfo.limit - keyInfo.usage);
      creditsRemaining = `${formatOpenRouterAmount(rem)} remaining of key limit (Key used: ${formatOpenRouterAmount(keyInfo.usage)})`;
    } else if (keyInfo.usage != null) {
      creditsRemaining = `Pay-as-you-go (Key used: ${formatOpenRouterAmount(keyInfo.usage)})`;
    }
  }

  return {
    models,
    accountInfo: {
      provider: 'openrouter',
      tier,
      creditsRemaining,
      rateLimitSummary,
      totalModelsFound: models.length,
      freeModelsCount: freeCount,
    },
  };
}

async function fetchOpenAIModels(apiKey: string): Promise<ModelDiscoveryResult> {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    let msg = `OpenAI API error (${res.status})`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error?.message) msg = parsed.error.message;
    } catch {
      // Fallback to HTTP status text if parsing fails
    }
    return { models: [], error: msg };
  }

  const json = await res.json();
  const rawList: Array<{ id: string; owned_by?: string }> = json.data || [];

  const recommendedSet = new Set(RECOMMENDED_MODELS.openai);

  // Filter for models suitable for coding & cold-start evaluation
  const chatModelPrefixes = ['gpt-4', 'gpt-3.5', 'o1', 'o3', 'chatgpt'];
  const models: DiscoveredModel[] = sortModels(
    rawList
      .filter((m) => chatModelPrefixes.some((p) => m.id.startsWith(p)) && !m.id.includes('instruct') && !m.id.includes('realtime') && !m.id.includes('audio'))
      .map((m) => ({
        id: m.id,
        name: formatModelName(m.id),
        ownedBy: m.owned_by || 'OpenAI',
        recommended: recommendedSet.has(m.id),
      })),
    'openai'
  );

  return {
    models,
    accountInfo: {
      provider: 'openai',
      tier: 'OpenAI Account',
      creditsRemaining: 'Per-token standard billing',
      totalModelsFound: models.length,
    },
  };
}

async function fetchCustomModels(apiKey: string, baseUrl: string): Promise<ModelDiscoveryResult> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const endpoint = `${cleanBase}/models`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(endpoint, { headers });
  if (!res.ok) {
    const errText = await res.text();
    return { models: [], error: `Custom endpoint error (${res.status}): ${errText.slice(0, 150)}` };
  }

  const json = await res.json();
  const rawList: Array<{ id?: string; name?: string }> = json.data || json.models || [];

  const models: DiscoveredModel[] = rawList.map((m) => {
    const modelId = m.id || m.name || 'default';
    return {
      id: modelId,
      name: formatModelName(modelId),
      ownedBy: 'Custom Host',
    };
  });

  return {
    models,
    accountInfo: {
      provider: 'custom',
      tier: 'Self-Hosted / Custom Gateway',
      totalModelsFound: models.length,
    },
  };
}

function formatModelName(id: string): string {
  if (id.includes('/')) {
    const parts = id.split('/');
    return `${parts[0]}: ${formatModelName(parts[1])}`;
  }
  return id
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Gpt/g, 'GPT')
    .replace(/Llama/g, 'Llama');
}

function sortModels(models: DiscoveredModel[], provider: AIProvider): DiscoveredModel[] {
  const recList = RECOMMENDED_MODELS[provider] || [];
  return [...models].sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    if (a.recommended && b.recommended) {
      const idxA = recList.indexOf(a.id);
      const idxB = recList.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
    }
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;
    return a.name.localeCompare(b.name);
  });
}

