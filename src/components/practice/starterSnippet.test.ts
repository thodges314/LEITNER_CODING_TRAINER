import { describe, it, expect } from 'vitest';
import seed from '../../data/topics.json';
import type { TopicItem } from '../../lib/leitner';
import { getStarterSnippet, IMPLEMENTATION_GAP_LINES } from './starterSnippet';
import { detectRedundantScopeInput } from '../../utils/cardPromptTypes';

const cards = seed as unknown as TopicItem[];
const card = (id: string) => cards.find((t) => t.id === id) as TopicItem;
const MARKER = '// Test runner example:\n';
const afterMarker = (snippet: string) => snippet.slice(snippet.indexOf(MARKER) + MARKER.length);

describe('starter snippet: the card checks are live code', () => {
  it('starts with the implementation comment, a large blank gap for the answer, and then the marker', () => {
    const snippet = getStarterSnippet(card('binary-search-exact'));
    const lines = snippet.split('\n');
    expect(lines[0]).toBe('// Write your implementation below');
    const markerAt = lines.indexOf('// Test runner example:');
    expect(markerAt - 1).toBe(IMPLEMENTATION_GAP_LINES); // blank lines in between
    expect(lines.slice(1, markerAt).every((l) => l === '')).toBe(true);
    expect(IMPLEMENTATION_GAP_LINES).toBeGreaterThanOrEqual(10);
  });

  it('contains the card harness exactly, uncommented', () => {
    const c = card('binary-search-exact');
    const body = afterMarker(getStarterSnippet(c));
    expect(body.trim()).toBe(c.testHarness!.trim());
    expect(body.split('\n').filter((l) => l.trim().startsWith('//'))).toEqual([]);
    expect(body).toContain('await $test.run("Target in the right half"');
  });

  it('for a React card, the checks are live and no generic harness template is appended', () => {
    const c = card('progress-bar');
    const body = afterMarker(getStarterSnippet(c));
    expect(body.trim()).toBe(c.testHarness!.trim());
    expect(body).not.toContain('// mount(Harness);');
    expect(body).not.toContain('Inline Component / Hook Test Harness');
  });

  it('a card without a harness gets only the clean implementation buffer', () => {
    const c = { ...card('binary-search-exact'), testHarness: '' };
    const snippet = getStarterSnippet(c);
    expect(snippet).toContain('// Write your implementation below');
    expect(snippet).not.toContain('// Test runner example:');
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
    expect(stepperLines[0]).toBe('// Write your implementation below');
    expect(stepperLines[1]).toBe('// Preloaded in scope: React, useState, StepItem, StepperProps');

    const voronoiSnippet = getStarterSnippet(card('d3-delaunay-voronoi-snapping'));
    const voronoiLines = voronoiSnippet.split('\n');
    expect(voronoiLines[1]).toBe(
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