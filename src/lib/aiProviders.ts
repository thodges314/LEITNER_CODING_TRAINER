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

export interface CritiqueFollowUpMessage {
  role: 'user' | 'assistant';
  content: string;
}

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
    else if (detected === 'groq') setStoredModel('openai/gpt-oss-120b');
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
    if (prov === 'groq' && val.includes('gemini')) {
      return 'openai/gpt-oss-120b';
    }
    if (prov === 'gemini' && (val.includes('llama') || val.includes('gpt') || val.includes('claude'))) return 'gemini-2.5-flash';
    if (prov === 'openai' && (val.includes('gemini') || val.includes('llama') || val.includes('claude'))) return 'gpt-4o-mini';
    if (prov === 'cerebras' && (val.includes('gemini') || val.includes('gpt') || val.includes('claude'))) return 'llama3.3-70b';
    if (prov === 'mistral' && (val.includes('gemini') || val.includes('gpt') || val.includes('claude'))) return 'codestral-latest';
    if (prov === 'anthropic' && !val.includes('claude')) return 'claude-3-5-sonnet-20241022';
    return val;
  }
  if (prov === 'gemini') return 'gemini-2.5-flash';
  if (prov === 'groq') return 'openai/gpt-oss-120b';
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

export function resolveOpenAICompatibleConfig(provider: AIProvider): { baseUrl: string; model: string } {
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
    model = model || 'nvidia/nemotron-3-super-120b-a12b:free';
  } else {
    baseUrl = baseUrl || 'https://api.openai.com/v1';
  }

  return { baseUrl, model };
}

export interface ProviderCompletionOptions {
  provider: AIProvider;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  history?: CritiqueFollowUpMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Unified multi-provider completion helper supporting Gemini, Anthropic,
 * and OpenAI-compatible chat completion endpoints (Groq, Cerebras, Mistral, OpenRouter, OpenAI, Custom).
 */
export async function requestProviderCompletion({
  provider,
  apiKey,
  systemPrompt,
  userPrompt,
  history = [],
  temperature = 0.2,
  maxTokens = 2048,
  jsonMode = false,
}: ProviderCompletionOptions): Promise<string> {
  if (provider === 'gemini') {
    const model = getStoredModel() || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const generationConfig: Record<string, unknown> = { temperature };
    if (jsonMode) {
      generationConfig.response_mime_type = 'application/json';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...history.map((h) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
          { role: 'user', parts: [{ text: userPrompt }] },
        ],
        generationConfig,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (provider === 'anthropic') {
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
        system: systemPrompt,
        messages: [
          ...history.map((h) => ({
            role: h.role,
            content: h.content,
          })),
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  const { baseUrl, model } = resolveOpenAICompatibleConfig(provider);
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const payload: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: userPrompt },
    ],
    temperature,
  };
  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
