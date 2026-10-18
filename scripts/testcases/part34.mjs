import { c } from './part1.mjs';
const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });

// Intro rungs (batch 5): testing-tools, react-fetch.
export default {
  'call-recorder-spy': [
    c('The spy passes its arguments to impl and returns the result', `const add = createSpy((a, b) => a + b);
[add(2, 3), add.calls]`, '[5, [[2, 3]]]'),
    c('Without impl the spy returns undefined', `createSpy()(1)`, 'undefined'),
    c('calls records every call in order, including calls with no arguments', `const s = createSpy();
s('a');
s();
s(1, 2);
s.calls`, "[['a'], [], [1, 2]]"),
    c('results records what each call returned', `const s = createSpy((x) => x * 2);
s(1);
s(2);
s.results`, "[{ type: 'return', value: 2 }, { type: 'return', value: 4 }]"),
    c('A throwing impl is recorded and the error is rethrown', `const s = createSpy(() => { throw new Error('boom'); });
let caught = null;
try { s(); } catch (e) { caught = e.message; }
[caught, s.results[0].type, s.results[0].value.message]`, "['boom', 'throw', 'boom']"),
    c('results stay in call order when returns and throws are mixed', `let n = 0;
const s = createSpy(() => {
  n += 1;
  if (n === 2) throw new Error('x');
  return n;
});
s();
try { s(); } catch (e) { /* expected */ }
s();
s.results.map((r) => r.type)`, "['return', 'throw', 'return']"),
    c('calledWith needs the same arguments in the same order and count', `const s = createSpy();
s(1, 'a');
[s.calledWith(1, 'a'), s.calledWith(1), s.calledWith('a', 1), s.calledWith()]`, '[true, false, false, false]'),
    c('calledWith compares with Object.is, so objects match by reference', `const o = {};
const s = createSpy();
s(o);
[s.calledWith(o), s.calledWith({})]`, '[true, false]'),
    c('The spy forwards `this` to impl', `const obj = { n: 5, get: createSpy(function () { return this.n; }) };
obj.get()`, '5'),
    c('reset clears calls and results', `const s = createSpy();
s(1);
s.reset();
[s.calls.length, s.results.length, s.calledWith(1)]`, '[0, 0, false]'),
  ],
  'use-fetch-basic': [
    r('Initial render shows loading and fetches the url once', "useFetch('/api/a')  // before the request resolves", '{ data: null, loading: true, error: null }; fetch called once with /api/a'),
    r('Resolves with data on 200', "useFetch('/api/a')  // server answers 200 with { id: 1 }", '{ data: { id: 1 }, loading: false, error: null }'),
    r('A non-2xx status gives an Error that mentions the status', "useFetch('/api/a')  // server answers 404", "{ data: null, loading: false, error: Error('HTTP 404') }"),
    r('A network failure gives that Error', "useFetch('/api/a')  // fetch rejects Error('offline')", "{ data: null, loading: false, error: Error('offline') }"),
    r('Changing the url fetches again and shows loading while it runs', "rerender url '/api/a' → '/api/b' after /api/a answered { id: 1 }", "loading: true and data: null until /api/b answers; then data { id: 2 }"),
    r('Re-rendering with the same url does not fetch again', "rerender with the same url '/api/a'", 'fetch called exactly once'),
  ],
};
