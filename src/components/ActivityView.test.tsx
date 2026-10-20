// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { DeckStatsWidget } from './DeckStatsWidget';
import { ActivityView } from './ActivityView';
import { localDateKey } from '../lib/dailyStats';
import type { TopicItem, LeitnerDeckState } from '../lib/leitner';

// @ts-expect-error IS_REACT_ACT_ENVIRONMENT is a React global flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const topic = (id: string, box: number): TopicItem => ({
  id, title: id, track: 'algorithms', box, status: 'active', streak: 0, promptSeed: '', tags: [], nextEligibleTrial: 0,
});
const stateWith = (dailyStats?: LeitnerDeckState['dailyStats']): LeitnerDeckState => ({ topics: [], totalCompletedReviews: 0, dailyStats });

const today = new Date();
const dayKey = (offset: number) => localDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset, 12).getTime());

let container: HTMLDivElement;
let root: ReactDOMClient.Root;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = ReactDOMClient.createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const q = (testId: string) => container.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
const click = async (el: Element | null) => {
  await act(async () => (el as HTMLElement).click());
};

describe('ActivityView', () => {
  it('shows an explanatory empty state when there is no history yet', async () => {
    await act(async () => root.render(<ActivityView stats={undefined} />));
    expect(q('activity-empty')?.textContent).toContain('will appear here after your first scored review');
    expect(container.querySelectorAll('[data-testid="activity-bar"]').length).toBe(0);
  });

  it('draws one bar per day for 30 days, ending today, and summarises the window', async () => {
    const stats = { [dayKey(0)]: { reviews: 4, passes: 3 }, [dayKey(1)]: { reviews: 1, passes: 1 } };
    await act(async () => root.render(<ActivityView stats={stats} />));
    const bars = [...container.querySelectorAll('[data-testid="activity-bar"]')] as SVGElement[];
    expect(bars).toHaveLength(30);
    expect(bars[29].getAttribute('data-date')).toBe(dayKey(0));
    expect(bars[28].getAttribute('data-date')).toBe(dayKey(1));
    expect(bars.map((b) => Number(b.getAttribute('data-reviews'))).reduce((a, b) => a + b, 0)).toBe(5);
    expect(q('activity-summary')?.textContent).toBe('5 reviews · 2 active days · 80% passed');
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('Last 30 days: 5 reviews on 2 days, 80% passed.');
  });

  it('uses singular words for a single review', async () => {
    await act(async () => root.render(<ActivityView stats={{ [dayKey(0)]: { reviews: 1, passes: 0 } }} />));
    expect(q('activity-summary')?.textContent).toBe('1 review · 1 active day · 0% passed');
  });

  it('ignores history older than the window', async () => {
    await act(async () => root.render(<ActivityView stats={{ [dayKey(45)]: { reviews: 9, passes: 9 } }} />));
    expect(q('activity-empty')).not.toBeNull();
  });
});

describe('Activity as the fourth mode of the stats widget', () => {
  const render = (state: LeitnerDeckState, topics: TopicItem[]) =>
    act(async () => root.render(<DeckStatsWidget state={state} topics={topics} theme="dark" />));

  it('adds an "Activity" tab after the three existing ones', async () => {
    await render(stateWith(), [topic('a', 1)]);
    const tabs = [...container.querySelectorAll('[data-testid^="stats-mode-"]')].map((b) => b.getAttribute('data-testid'));
    expect(tabs).toEqual(['stats-mode-radar', 'stats-mode-orbit', 'stats-mode-tiers', 'stats-mode-activity']);
    expect(q('stats-mode-activity')?.textContent).toContain('Activity');
    expect(q('activity-view')).toBeNull(); // the default view is still the Skill Matrix
  });

  it('shows the activity view with data when the tab is clicked', async () => {
    await render(stateWith({ [dayKey(0)]: { reviews: 2, passes: 2 } }), [topic('a', 1)]);
    await click(q('stats-mode-activity'));
    expect(q('activity-view')).not.toBeNull();
    expect(q('activity-summary')?.textContent).toBe('2 reviews · 1 active day · 100% passed');
  });

  it('works with no active cards at all: the history is still shown', async () => {
    await render(stateWith({ [dayKey(2)]: { reviews: 3, passes: 1 } }), []);
    await click(q('stats-mode-activity'));
    expect(q('activity-summary')?.textContent).toBe('3 reviews · 1 active day · 33% passed');
    expect(container.textContent).not.toContain('No active cards in rotation');
  });

  it('the chevrons cycle through all four views and wrap in both directions', async () => {
    await render(stateWith(), [topic('a', 1)]);
    const next = container.querySelector('button[aria-label="Next chart"]') as HTMLElement;
    const prev = container.querySelector('button[aria-label="Previous chart"]') as HTMLElement;
    const visible = () => (q('activity-view') ? 'activity' : 'other');

    await click(prev); // radar -> activity (wraps backwards)
    expect(visible()).toBe('activity');
    await click(next); // activity -> radar (wraps forwards)
    expect(visible()).toBe('other');
    await click(next); // radar -> orbit
    await click(next); // orbit -> tiers
    expect(visible()).toBe('other');
    await click(next); // tiers -> activity
    expect(visible()).toBe('activity');
    await click(prev); // activity -> tiers
    expect(visible()).toBe('other');
  });
});
