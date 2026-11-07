import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isBrowserDomOrReactCard,
  supportsWebWorker,
  terminateActiveWorker,
  runInWorker,
} from './workerClient';
import type { TopicItem, TrackType } from './leitner';

function makeCard(track: TrackType, id = 'test-card'): TopicItem {
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
  };
}

describe('workerClient', () => {
  describe('isBrowserDomOrReactCard', () => {
    it('returns true for react, react-components, d3, tailwind, and dom-browser cards', () => {
      expect(isBrowserDomOrReactCard(makeCard('react'))).toBe(true);
      expect(isBrowserDomOrReactCard(makeCard('react-components'))).toBe(true);
      expect(isBrowserDomOrReactCard(makeCard('d3'))).toBe(true);
      expect(isBrowserDomOrReactCard(makeCard('tailwind'))).toBe(true);
      expect(isBrowserDomOrReactCard(makeCard('dom-browser'))).toBe(true);
    });

    it('returns false for non-DOM / non-React tracks', () => {
      expect(isBrowserDomOrReactCard(makeCard('algorithms'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('advanced-algorithms'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('js-utilities'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('js-language'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('async-js'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('typescript-patterns'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('node'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('sql-postgres'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('graphql'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('graphql-server'))).toBe(false);
      expect(isBrowserDomOrReactCard(makeCard('testing-tooling'))).toBe(false);
    });

    it('returns true for cards in non-DOM tracks that have the "dom" tag or reference DOM globals', () => {
      const domTagged = { ...makeCard('testing-tooling'), tags: ['dom'] };
      expect(isBrowserDomOrReactCard(domTagged)).toBe(true);

      const domHarness = {
        ...makeCard('algorithms'),
        testHarness: 'const el = document.createElement("div");',
      };
      expect(isBrowserDomOrReactCard(domHarness)).toBe(true);

      const starterDom = {
        ...makeCard('testing-tooling'),
        starterCode: 'const el = window.document.getElementById("root");',
      };
      expect(isBrowserDomOrReactCard(starterDom)).toBe(true);
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
