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
});
