// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  getStoredApiKey,
  setStoredApiKey,
  getStoredProvider,
  setStoredProvider,
  getAllStoredKeys,
  clearStoredApiKey,
  detectProviderFromKey,
} from './ai';

describe('AI Multi-Key Vault and Provider Management', () => {
  beforeEach(() => localStorage.clear());

  it('detects provider from standard key prefixes', () => {
    expect(detectProviderFromKey('gsk_1234567890')).toBe('groq');
    expect(detectProviderFromKey('AIzaSyD-123456')).toBe('gemini');
    expect(detectProviderFromKey('sk-ant-api03-12345678')).toBe('anthropic');
    expect(detectProviderFromKey('csk-wafer-scale-12345')).toBe('cerebras');
    expect(detectProviderFromKey('sk-proj-12345678')).toBe('openai');
    expect(detectProviderFromKey('sk-or-v1-abcdef')).toBe('openrouter');
    expect(detectProviderFromKey('some_custom_key')).toBeNull();
  });

  it('stores and switches multiple keys independently in the vault', () => {
    // Save Groq key
    setStoredApiKey('gsk_groq_key_123', 'groq');
    // Save Gemini key
    setStoredApiKey('AIzaSy_gemini_key_456', 'gemini');

    const vault = getAllStoredKeys();
    expect(vault.groq).toBe('gsk_groq_key_123');
    expect(vault.gemini).toBe('AIzaSy_gemini_key_456');

    // Switching provider automatically activates that provider's key
    setStoredProvider('groq');
    expect(getStoredProvider()).toBe('groq');
    expect(getStoredApiKey()).toBe('gsk_groq_key_123');

    setStoredProvider('gemini');
    expect(getStoredProvider()).toBe('gemini');
    expect(getStoredApiKey()).toBe('AIzaSy_gemini_key_456');
  });

  it('clearing a key removes it from the vault for that provider only', () => {
    setStoredApiKey('gsk_groq_key_123', 'groq');
    setStoredApiKey('AIzaSy_gemini_key_456', 'gemini');

    clearStoredApiKey('groq');
    expect(getStoredApiKey('groq')).toBe('');
    expect(getStoredApiKey('gemini')).toBe('AIzaSy_gemini_key_456');
  });

  it('formats prompt with JavaScript mode and code fence for JS cards', async () => {
    setStoredApiKey('gsk_test_key', 'groq');
    setStoredProvider('groq');

    let capturedPayload: { messages: Array<{ role: string; content: string }> } | null = null;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
      capturedPayload = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  passed: true,
                  timeComplexity: 'O(n)',
                  spaceComplexity: 'O(n)',
                  invariantsMet: ['Hash map lookup used'],
                  invariantsMissed: [],
                  critique: 'Clean JavaScript solution',
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    try {
      const { evaluateCodeSubmission } = await import('./ai');
      const topic = {
        id: 'two-sum-hashmap',
        title: 'Two Sum and Hash-Map Lookups',
        track: 'algorithmic-screens',
        promptSeed: 'Write twoSum...',
        box: 1,
        totalReviews: 0,
        consecutiveSuccesses: 0,
        status: 'active',
        difficulty: 'medium',
      } as unknown as import('./leitner').TopicItem;

      await evaluateCodeSubmission(topic, 'const twoSum = (nums, target) => {}', undefined, 'js');

      expect(capturedPayload).not.toBeNull();
      const userContent = capturedPayload!.messages[1].content;
      expect(userContent).toContain('Language: JavaScript');
      expect(userContent).toContain('```javascript\nconst twoSum = (nums, target) => {}\n```');
      expect(userContent).not.toContain('```typescript');

      // Now verify TypeScript mode
      await evaluateCodeSubmission(topic, 'const twoSum = (nums: number[], target: number) => {}', undefined, 'ts');
      expect(capturedPayload).not.toBeNull();
      const tsUserContent = capturedPayload!.messages[1].content;
      expect(tsUserContent).toContain('Language: TypeScript');
      expect(tsUserContent).toContain('```typescript\nconst twoSum = (nums: number[], target: number) => {}\n```');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
