import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isBrowserDomOrReactCard,
  supportsWebWorker,
  terminateActiveWorker,
  runInWorker,
} from './workerClient';
import type { TopicItem, TrackType } from './leitner';
import seedTopicsData from '../data/topics.json';

const seedTopics = seedTopicsData as unknown as TopicItem[];

function makeCard(track: TrackType, id = 'test-card', requiresDom?: boolean): TopicItem {
  return {
    id,
    title: 'Test',
    track,
    difficulty: 1,
    box: 1,
    streak: 0,
    tags: [],
    nextEligibleTrial: 0,
    status: 'active',
    promptSeed: '',
    testHarness: '',
    requiresDom,
  };
}

describe('workerClient', () => {
  describe('isBrowserDomOrReactCard', () => {
    it('returns true when card.requiresDom is true', () => {
      expect(isBrowserDomOrReactCard(makeCard('react', 'card-1', true))).toBe(true);
      expect(isBrowserDomOrReactCard(makeCard('testing-tooling', 'card-2', true))).toBe(true);
      expect(isBrowserDomOrReactCard(makeCard('algorithms', 'card-3', true))).toBe(true);
    });

    it('returns false when card.requiresDom is false or undefined', () => {
      expect(isBrowserDomOrReactCard(makeCard('algorithms', 'card-4', false))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('algorithms', 'card-5'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('testing-tooling', 'card-6'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('async-js', 'card-7'))).toBe(false);
    });

    it('accurately resolves real seed cards from topics.json', () => {
      const domQueryCard = seedTopics.find((c) => c.id === 'dom-query-testing-library');
      expect(domQueryCard).toBeDefined();
      expect(isBrowserDomOrReactCard(domQueryCard!)).toBe(true);

      const reactCards = seedTopics.filter((c) => c.track === 'react' || c.track === 'react-components');
      expect(reactCards.length).toBeGreaterThan(0);
      for (const card of reactCards) {
        expect(isBrowserDomOrReactCard(card)).toBe(true);
      }

      const pureAlgoCard = seedTopics.find((c) => c.id === 'two-sum-hashmap');
      expect(pureAlgoCard).toBeDefined();
      expect(isBrowserDomOrReactCard(pureAlgoCard!)).toBe(false);

      const testingMatcherCard = seedTopics.find((c) => c.id === 'custom-matcher-expect');
      expect(testingMatcherCard).toBeDefined();
      expect(isBrowserDomOrReactCard(testingMatcherCard!)).toBe(false);
    });
  });

  describe('supportsWebWorker', () => {
    it('returns a boolean based on environment global capabilities', () => {
      const result = supportsWebWorker();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('terminateActiveWorker', () => {
    it('does not throw when no active worker is running', () => {
      expect(() => terminateActiveWorker()).not.toThrow();
    });
  });

  describe('runInWorker mock behavior', () => {
    const originalWorker = globalThis.Worker;

    afterEach(() => {
      terminateActiveWorker();
      globalThis.Worker = originalWorker;
    });

    it('handles worker initialization failures gracefully', async () => {
      // Mock Worker throwing on construction
      (globalThis as unknown as { Worker: unknown }).Worker = class {
        constructor() {
          throw new Error('Worker not permitted');
        }
      };

      const outcome = await runInWorker({
        code: 'console.log("hello");',
        timeoutMs: 1000,
      });

      expect(outcome.report.ran).toBe(false);
      expect(outcome.report.passed).toBe(false);
      expect(outcome.report.errorCount).toBe(1);
      expect(outcome.report.summary).toContain('Worker initialization failed');
    });

    it('handles worker runtime errors gracefully', async () => {
      (globalThis as unknown as { Worker: unknown }).Worker = class {
        onmessage: ((e: MessageEvent) => void) | null = null;
        onerror: ((e: ErrorEvent) => void) | null = null;
        postMessage() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror({ message: 'Out of memory' } as unknown as ErrorEvent);
            }
          }, 10);
        }
        terminate() {}
      };

      const outcome = await runInWorker({
        code: 'console.log("fail");',
        timeoutMs: 1000,
      });

      expect(outcome.report.ran).toBe(true);
      expect(outcome.report.passed).toBe(false);
      expect(outcome.report.errorCount).toBe(1);
      expect(outcome.report.lines[0]).toContain('Worker runtime error: Out of memory');
    });

    it('terminates and resolves with timeout report if execution exceeds timeoutMs', async () => {
      (globalThis as unknown as { Worker: unknown }).Worker = class {
        onmessage: ((e: MessageEvent) => void) | null = null;
        onerror: ((e: ErrorEvent) => void) | null = null;
        terminate = vi.fn();
        postMessage() {
          // Never post message back to simulate an infinite loop
        }
      };

      const outcome = await runInWorker({
        code: 'while(true) {}',
        timeoutMs: 50,
      });

      expect(outcome.report.timedOut).toBe(true);
      expect(outcome.report.passed).toBe(false);
      expect(outcome.report.errorCount).toBe(1);
      expect(outcome.report.lines[0]).toContain('Execution timed out after 50ms');
    });

    it('processes streaming logs and final result message from worker', async () => {
      const logs: unknown[] = [];
      (globalThis as unknown as { Worker: unknown }).Worker = class {
        onmessage: ((e: MessageEvent) => void) | null = null;
        onerror: ((e: ErrorEvent) => void) | null = null;
        terminate = vi.fn();
        postMessage(msg: { id: string }) {
          setTimeout(() => {
            this.onmessage?.({
              data: {
                type: 'log',
                id: msg.id,
                method: 'log',
                text: 'case 1: PASS',
                args: ['case 1: PASS'],
              },
            } as MessageEvent);

            this.onmessage?.({
              data: {
                type: 'result',
                id: msg.id,
                report: {
                  ran: true,
                  passCount: 1,
                  failCount: 0,
                  errorCount: 0,
                  timedOut: false,
                  passed: true,
                  summary: '1 passed, 0 failed',
                  lines: ['[log] case 1: PASS'],
                },
                returnValue: 42,
              },
            } as MessageEvent);
          }, 10);
        }
      };

      const outcome = await runInWorker({
        code: 'return 42;',
        timeoutMs: 1000,
        onLog: (l) => logs.push(l.text),
      });

      expect(logs).toEqual(['case 1: PASS']);
      expect(outcome.report.passed).toBe(true);
      expect(outcome.report.passCount).toBe(1);
      expect(outcome.returnValue).toBe(42);
    });
  });
});
