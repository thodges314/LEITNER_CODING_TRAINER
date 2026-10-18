// @vitest-environment jsdom
/**
 * Mutation check for card harnesses (slow, opt-in).
 *
 *   VITE_MUTATE=1 npx vitest run --config vitest.mutation.config.ts
 *   VITE_MUTATE=1 VITE_SHARD=0/4 VITE_MUT_MAX=25 VITE_MUT_ONLY='^(debounce|tooltip)' npx vitest run --config vitest.mutation.config.ts
 *
 * For each non-TypeScript card the reference solution is mutated (see mutate.ts) and every mutant that compiles must make
 * the harness FAIL. One JSON line per card is appended to VITE_MUT_OUT (default /tmp/mutation-report.jsonl; cards already in the file are skipped); a survivor is either an equivalent mutant (ignore) or a missing
 * hand-written case (add one). The regular `npm test` skips this file.
 */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'vitest';
import seed from '../src/data/topics.json';
import { runHarness } from '../src/lib/runner';
import { generateMutants, sampleMutants } from '../src/lib/mutate';
import type { TopicItem } from '../src/lib/leitner';

const env = import.meta.env as Record<string, string | undefined>;
const RUN = env.VITE_MUTATE === '1';
const MAX = Number(env.VITE_MUT_MAX ?? 25);
const [shard, shards] = (env.VITE_SHARD ?? '0/1').split('/').map(Number);
const only = env.VITE_MUT_ONLY ? new RegExp(env.VITE_MUT_ONLY) : null;
// Results are appended per card the moment they are known, so a crashed worker loses nothing and a re-run resumes.
const OUT = env.VITE_MUT_OUT ?? '/tmp/mutation-report.jsonl';
const done = new Set<string>(
  existsSync(OUT)
    ? readFileSync(OUT, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((l: string) => (JSON.parse(l as string) as { id: string }).id)
    : []
);

const topics = (seed as unknown as TopicItem[])
  .filter((t) => t.track !== 'typescript-patterns') // type-level code is not covered by these operators
  .filter((t) => !only || only.test(t.id))
  .filter((t) => !done.has(t.id))
  .filter((_, i) => i % shards === shard);

describe.skipIf(!RUN)('harness mutation check', () => {
  it.each(topics.map((t) => [t.id, t] as const))('%s', async (_id, t) => {
    const ref = t.referenceSolution!;
    const mutants = sampleMutants(generateMutants(ref), MAX, t.id);
    let killed = 0;
    let invalid = 0;
    const survivors: Array<{ op: string; line: number; original: string; replacement: string }> = [];
    for (const m of mutants) {
      const r = await runHarness(t, m.code, 'js', 15000);
      if (!r.ran) invalid++;
      else if (!r.passed) killed++;
      else survivors.push({ op: m.op, line: m.line, original: m.original, replacement: m.replacement });
    }
    appendFileSync(OUT, JSON.stringify({ id: t.id, track: t.track, tested: mutants.length, killed, invalid, survived: survivors.length, survivors }) + '\n');
  }, 900000);
});
