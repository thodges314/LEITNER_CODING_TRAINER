import { describe, expect, it } from 'vitest';
import { availableSteps, placeTooltip, TOUR_STEPS, tourAnchorSelector } from './tour';

describe('tour steps', () => {
  it('has 5 steps with unique ids and real copy', () => {
    expect(TOUR_STEPS).toHaveLength(5);
    expect(new Set(TOUR_STEPS.map((s) => s.id)).size).toBe(5);
    for (const s of TOUR_STEPS) {
      expect(s.title.length, s.id).toBeGreaterThan(3);
      expect(s.body.length, s.id).toBeGreaterThan(30);
    }
  });

  it('every anchor a step points at exists in the app source as data-tour="..."', () => {
    const sources = import.meta.glob(['../App.tsx', '../components/*.tsx'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const source = Object.values(sources).join('\n');
    expect(Object.keys(sources).length).toBeGreaterThan(5);
    for (const s of TOUR_STEPS) {
      if (s.anchor !== null) expect(source, `${s.id}: data-tour="${s.anchor}"`).toContain(`data-tour="${s.anchor}"`);
    }
  });

  it('exactly one step is a centered note (no anchor)', () => {
    expect(TOUR_STEPS.filter((s) => s.anchor === null).map((s) => s.id)).toEqual(['next']);
  });
});

describe('availableSteps', () => {
  it('drops steps whose anchor is not on the page and keeps anchor-less steps', () => {
    const onPage = new Set([tourAnchorSelector('editor'), tourAnchorSelector('header')]);
    expect(availableSteps(TOUR_STEPS, (sel) => onPage.has(sel)).map((s) => s.id)).toEqual(['editor', 'next', 'header']);
  });
  it('keeps everything when every anchor exists, and only the note when none do', () => {
    expect(availableSteps(TOUR_STEPS, () => true)).toHaveLength(5);
    expect(availableSteps(TOUR_STEPS, () => false).map((s) => s.id)).toEqual(['next']);
  });
});

describe('placeTooltip', () => {
  const tip = { width: 340, height: 240 };
  const vp = { width: 1280, height: 800 };

  it('goes below the target when there is room, centered on it', () => {
    expect(placeTooltip({ top: 100, left: 100, width: 300, height: 100 }, tip, vp)).toEqual({ top: 214, left: 80 });
  });
  it('goes above the target near the bottom of the screen', () => {
    expect(placeTooltip({ top: 600, left: 100, width: 300, height: 150 }, tip, vp)).toEqual({ top: 346, left: 80 });
  });
  it('overlaps the lower part of a target that fills the screen', () => {
    expect(placeTooltip({ top: 20, left: 20, width: 1200, height: 760 }, tip, vp)).toEqual({ top: 548, left: 450 });
  });
  it('is clamped inside the viewport on both sides', () => {
    expect(placeTooltip({ top: 100, left: 0, width: 40, height: 40 }, tip, vp).left).toBe(12);
    expect(placeTooltip({ top: 100, left: 1250, width: 30, height: 40 }, tip, vp).left).toBe(928);
  });
  it('is centered on screen when there is no target', () => {
    expect(placeTooltip(null, tip, vp)).toEqual({ top: 280, left: 470 });
  });
});
