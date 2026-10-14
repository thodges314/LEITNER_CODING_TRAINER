// Verifies the hand-written testCases against each card's referenceSolution.
//   node scripts/verify-testcases.mjs          -> report
// Cases marked v:false are listed as "not machine-verified" with the reason.
import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { fileURLToPath } from 'node:url';
import { transform } from 'sucrase';
import { loadCases } from './testcases/index.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const topics = JSON.parse(fs.readFileSync(path.join(root, 'src/data/topics.json'), 'utf8'));
const cases = loadCases();

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DATA = {
  '/todos/1': { userId: 1, id: 1, title: 'delectus aut autem', completed: false },
  '/todos/2': { userId: 1, id: 2, title: 'quis ut nam facilis et officia qui', completed: false },
  '/users/1': { id: 1, name: 'Leanne Graham', username: 'Bret' },
};
function mockFetch(url, init = {}) {
  if (url.includes('invalid-non-existent')) return Promise.reject(new TypeError('Failed to fetch'));
  const p = new URL(url).pathname;
  if (p === '/photos') {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => resolve({ ok: true, status: 200, json: async () => [] }), 500);
      init.signal?.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      });
    });
  }
  if (DATA[p]) return Promise.resolve({ ok: true, status: 200, json: async () => DATA[p] });
  return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
}

function buildSource(ref, input, logs) {
  const lines = input.split('\n');
  const expr = logs ? null : lines.pop();
  const body = lines.join('\n');
  const run = logs
    ? `async function __run() {\n${input}\nawait sleep(40);\nreturn __logs;\n}`
    : `async function __run() {\n${body}\nreturn (${expr});\n}`;
  return `${ref}\n${run}`;
}

async function runCase(topic, tc) {
  const logs = [];
  const sandboxConsole = { log: (...a) => logs.push(a.join(' ')), info() {}, warn() {}, error() {} };
  const src = transform(buildSource(topic.referenceSolution, tc.i, tc.logs), { transforms: ['typescript'] }).code;
  const fn = new AsyncFunction('fetch', 'sleep', 'console', '__logs', `${src}\nreturn __run();`);
  const exec = () => fn(mockFetch, sleep, sandboxConsole, logs);
  const withTimeout = (p) => Promise.race([p, sleep(5000).then(() => { throw new Error('timeout (5s)'); })]);

  if (tc.t) {
    try {
      await withTimeout(exec());
    } catch (e) {
      const text = `${e?.name ?? ''}: ${e?.message ?? e}`;
      return new RegExp(tc.t, 'i').test(text) ? null : `rejected with "${text}", expected /${tc.t}/`;
    }
    return 'did not reject';
  }
  let actual;
  try {
    actual = await withTimeout(exec());
  } catch (e) {
    return `threw ${e?.name}: ${e?.message}`;
  }
  const expected = new Function(`return (${tc.ev ?? tc.e})`)();
  return util.isDeepStrictEqual(actual, expected)
    ? null
    : `got ${util.inspect(actual, { depth: 5, breakLength: 120 })}, expected ${util.inspect(expected, { depth: 5, breakLength: 120 })}`;
}

let ok = 0;
const failed = [];
const unverified = [];
const missing = [];
for (const topic of topics) {
  const list = cases[topic.id];
  if (!list || list.length === 0) {
    missing.push(topic.id);
    continue;
  }
  for (const tc of list) {
    if (tc.v === false) {
      unverified.push({ id: topic.id, d: tc.d, note: tc.note ?? 'spec only' });
      continue;
    }
    const err = await runCase(topic, tc);
    if (err) failed.push({ id: topic.id, d: tc.d, err });
    else ok++;
  }
}
const extra = Object.keys(cases).filter((id) => !topics.some((t) => t.id === id));

console.log(`verified OK: ${ok}`);
console.log(`FAILED: ${failed.length}`);
for (const f of failed) console.log(`  ✗ ${f.id} — ${f.d}\n      ${f.err}`);
console.log(`not machine-verified: ${unverified.length}`);
const byNote = {};
for (const u of unverified) (byNote[`${u.id}`] ??= []).push(u.note);
for (const [id, notes] of Object.entries(byNote)) console.log(`  · ${id} (${notes.length}): ${[...new Set(notes)].join('; ')}`);
if (missing.length) console.log(`MISSING cases for: ${missing.join(', ')}`);
if (extra.length) console.log(`UNKNOWN ids in case files: ${extra.join(', ')}`);
process.exit(failed.length || missing.length || extra.length ? 1 : 0);
