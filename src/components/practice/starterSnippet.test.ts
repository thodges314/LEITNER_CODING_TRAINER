import { describe, it, expect } from 'vitest';
import seed from '../../data/topics.json';
import type { TopicItem } from '../../lib/leitner';
import { getStarterSnippet } from './starterSnippet';
import { detectRedundantScopeInput } from '../../utils/cardPromptTypes';

const cards = seed as unknown as TopicItem[];
const card = (id: string) => cards.find((t) => t.id === id) as TopicItem;

describe('starter snippet: clean editor without test runner boilerplate', () => {
  it('returns an empty buffer for plain JS/TS cards without preloaded scope', () => {
    const snippet = getStarterSnippet(card('binary-search-exact'));
    expect(snippet).toBe('');
    expect(snippet).not.toContain('// Test runner example:');
    expect(snippet).not.toContain('// Write your implementation below');
  });

  it('for a React card, includes only the preloaded scope comment and no test runner', () => {
    const snippet = getStarterSnippet(card('progress-bar'));
    expect(snippet).toContain('// Preloaded in scope:');
    expect(snippet).not.toContain('// Test runner example:');
    expect(snippet).not.toContain('// Write your implementation below');
  });

  it('for an HTML card, provides pure HTML starter markup without JS test runner block', () => {
    const htmlCard = { ...card('binary-search-exact'), inputLanguage: 'html' as const };
    const snippet = getStarterSnippet(htmlCard);
    expect(snippet).toBe('<!-- Write your HTML markup below -->\n\n');
    expect(snippet).not.toContain('// Test runner example:');
  });

  it('for a SQL or GraphQL card, provides appropriate language comment without JS runner block', () => {
    const sqlCard = { ...card('binary-search-exact'), inputLanguage: 'sql' as const };
    expect(getStarterSnippet(sqlCard)).toBe('-- Write your SQL query below\n\n');

    const gqlCard = { ...card('binary-search-exact'), inputLanguage: 'graphql' as const };
    expect(getStarterSnippet(gqlCard)).toBe('# Write your GraphQL query or schema below\n\n');
  });

  it('is empty for no card', () => {
    expect(getStarterSnippet(null)).toBe('');
  });

  it('includes problem-specific preloaded scope comment for React, D3, and prompt-typed cards', () => {
    const stepperSnippet = getStarterSnippet(card('stepper'));
    const stepperLines = stepperSnippet.split('\n');
    expect(stepperLines[0]).toBe('// Preloaded in scope: React, useState, StepItem, StepperProps');

    const voronoiSnippet = getStarterSnippet(card('d3-delaunay-voronoi-snapping'));
    const voronoiLines = voronoiSnippet.split('\n');
    expect(voronoiLines[0]).toBe(
      '// Preloaded in scope: d3, VoronoiPoint, VoronoiSnappingOptions, VoronoiSnappingInstance'
    );
  });

  it('detects redundant import statements and retyped prompt interfaces for a specific problem', () => {
    const stepperCard = card('stepper');
    const importWarn = detectRedundantScopeInput(
      "import React, { useState } from 'react';\nfunction Stepper() {}",
      stepperCard
    );
    expect(importWarn).not.toBeNull();
    expect(importWarn?.kind).toBe('import');
    expect(importWarn?.message).toContain('React, useState');

    const ifaceWarn = detectRedundantScopeInput(
      'interface StepperProps {\n  steps: StepItem[];\n}\nfunction Stepper(props: StepperProps) {}',
      stepperCard
    );
    expect(ifaceWarn).not.toBeNull();
    expect(ifaceWarn?.kind).toBe('interface');
    expect(ifaceWarn?.matchedText).toBe('StepperProps');
    expect(ifaceWarn?.message).toContain('`StepperProps`');

    // Ignores starter comments and unrelated local helper types
    expect(detectRedundantScopeInput(getStarterSnippet(stepperCard), stepperCard)).toBeNull();
    expect(
      detectRedundantScopeInput('interface LocalState { count: number; }', stepperCard)
    ).toBeNull();
  });
});