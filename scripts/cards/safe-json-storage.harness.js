const createStorage = (initial = {}) => {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
  };
};

await $test.run("safeParse parses valid JSON", async () => {
  return safeParse('{"a": [1, 2]}', null);
}, () => ({ a: [1, 2] }));

await $test.run("safeParse returns fallback on invalid JSON", async () => {
  const a = safeParse('{invalid json', 'fallback');
  const b = safeParse('', 'fallback');
  const c = safeParse(undefined, 'fallback');
  const d = safeParse(null, 'fallback');
  return (a === 'fallback' && b === 'fallback' && c === 'fallback' && d === 'fallback') ? 'fallback' : 'failed';
}, () => ('fallback'));

await $test.run("safeSet stores JSON and returns true", async () => {
  const storage = createStorage();
  const ok = safeSet(storage, 'k', { a: 1 });
  return (ok === true && storage.getItem('k') === '{"a":1}');
}, () => (true));

await $test.run("safeGet reads and parses stored JSON value", async () => {
  const storage = createStorage({ k: '[1, 2]' });
  return (safeGet(storage, 'k', null));
}, () => ([1, 2]));

await $test.run("safeGet returns fallback when key is missing", async () => {
  const storage = createStorage();
  return (safeGet(storage, 'missing', 'none'));
}, () => ('none'));

await $test.run("safeGet falls back on corrupt stored text", async () => {
  const storage = createStorage({ bad: '{not json' });
  return (safeGet(storage, 'bad', 'recovered'));
}, () => ('recovered'));

await $test.run("safeSet returns false when storage throws", async () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } };
  return (safeSet(storage, 'k', 1));
}, () => (false));
