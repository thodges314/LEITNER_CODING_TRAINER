import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProviderModels } from './modelDiscovery';

describe('modelDiscovery service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns error when API key is missing for key-required providers', async () => {
    const res = await fetchProviderModels('groq', '');
    expect(res.models).toHaveLength(0);
    expect(res.error).toMatch(/API key/i);
  });

  it('fetches and sorts Groq models prioritizing recommended models', async () => {
    const mockGroqResponse = {
      data: [
        { id: 'whisper-large-v3', active: true },
        { id: 'llama-3.1-8b-instant', active: true, context_window: 131072, owned_by: 'Meta' },
        { id: 'llama-3.3-70b-versatile', active: true, context_window: 131072, owned_by: 'Meta' },
        { id: 'some-other-model', active: true, context_window: 8192, owned_by: 'Community' },
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'x-ratelimit-remaining-tokens': '5500',
        'x-ratelimit-limit-tokens': '6000',
      }),
      json: async () => mockGroqResponse,
    } as unknown as Response);

    const res = await fetchProviderModels('groq', 'gsk_test123');
    expect(res.error).toBeUndefined();
    // whisper filtered out
    expect(res.models.map((m) => m.id)).not.toContain('whisper-large-v3');
    // recommended models appear first
    expect(res.models[0].recommended).toBe(true);
    expect(res.models[0].id).toBe('llama-3.3-70b-versatile');
    expect(res.accountInfo?.tier).toBe('Developer Free Tier');
    expect(res.accountInfo?.tokensRemaining).toBe('5,500 TPM');
  });

  it('fetches Gemini models and strips models/ prefix', async () => {
    const mockGeminiResponse = {
      models: [
        {
          name: 'models/gemini-2.5-flash',
          displayName: 'Gemini 2.5 Flash',
          supportedGenerationMethods: ['generateContent'],
          inputTokenLimit: 1048576,
        },
        {
          name: 'models/embedding-001',
          displayName: 'Embedding',
          supportedGenerationMethods: ['embedContent'],
        },
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      json: async () => mockGeminiResponse,
    } as unknown as Response);

    const res = await fetchProviderModels('gemini', 'AIzaTestKey');
    expect(res.error).toBeUndefined();
    expect(res.models).toHaveLength(1);
    expect(res.models[0].id).toBe('gemini-2.5-flash');
    expect(res.models[0].isFree).toBe(true);
    expect(res.accountInfo?.provider).toBe('gemini');
  });

  it('fetches OpenRouter models and detects free pricing and auth key usage', async () => {
    const mockOpenRouterModels = {
      data: [
        {
          id: 'meta-llama/llama-3.3-70b-instruct:free',
          name: 'Llama 3.3 70B (free)',
          pricing: { prompt: '0', completion: '0' },
          context_length: 131072,
        },
        {
          id: 'anthropic/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          pricing: { prompt: '0.000003', completion: '0.000015' },
          context_length: 200000,
        },
      ],
    };

    const mockAuthResponse = {
      data: {
        is_free_tier: false,
        usage: 0.12,
        limit: 10.0,
        rate_limit: { requests: 20, interval: '10s' },
      },
    };

    const mockCreditsResponse = {
      data: {
        total_credits: 10.0,
        total_usage: 9.12,
      },
    };

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockOpenRouterModels,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockAuthResponse,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockCreditsResponse,
      } as unknown as Response);

    const res = await fetchProviderModels('openrouter', 'sk-or-v1-test');
    expect(res.error).toBeUndefined();
    expect(res.models).toHaveLength(2);
    expect(res.models[0].isFree).toBe(true);
    expect(res.accountInfo?.tier).toBe('Paid Account');
    expect(res.accountInfo?.creditsRemaining).toBe('$0.88 balance (Spent: $9.12 • Key cap: $10.00)');
  });

  it('falls back to key limit when OpenRouter credits endpoint is unavailable', async () => {
    const mockOpenRouterModels = {
      data: [
        { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' },
      ],
    };

    const mockAuthResponse = {
      data: {
        is_free_tier: false,
        usage: 0.12,
        limit: 10.0,
      },
    };

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockOpenRouterModels,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockAuthResponse,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as unknown as Response);

    const res = await fetchProviderModels('openrouter', 'sk-or-v1-test');
    expect(res.error).toBeUndefined();
    expect(res.accountInfo?.creditsRemaining).toBe('$9.88 remaining of key limit (Key used: $0.12)');
  });
});
