import { writeCards, R } from './_author.mjs';

writeCards([
  {
    id: 'hoisting-tdz-scope',
    title: 'Scope: Hoisting, Temporal Dead Zone, Loop Closure Capture',
    tags: ['scope', 'hoisting', 'tdz', 'closures'],
    difficulty: 2,
    concept: 'closures',
    track: 'js-language',
    cx: ['O(1)', 'O(1)', 'Direct variable initialization and scope capture checks.'],
    prompt: "Write hoistingBehavior(): returns an object { varBefore: undefined, fnResult: 'hoisted' } demonstrating that var declarations are hoisted and initialized to undefined, and function declarations are hoisted with their body. Write checkTDZ(fn): runs fn(); if accessing a variable before initialization throws a ReferenceError, returns 'ReferenceError'; if it runs cleanly, returns 'ok'; for any other error, returns 'error'. Write makeLoopCallbacksVar(n): returns an array of n zero-argument functions created in a var loop for (var i = 0; i < n; i++) { ... }, where calling any function returns the final shared value n. Write makeLoopCallbacksLet(n): returns an array of n functions created in a let loop for (let i = 0; i < n; i++) { ... }, where calling fn[k]() returns k.",
    ref: R`function hoistingBehavior() {
  var varBefore = typeof x === 'undefined' ? x : null;
  var x = 42;
  function f() {
    return 'hoisted';
  }
  return { varBefore: varBefore, fnResult: f() };
}

function checkTDZ(fn) {
  try {
    fn();
    return 'ok';
  } catch (err) {
    if (err instanceof ReferenceError) return 'ReferenceError';
    return 'error';
  }
}

function makeLoopCallbacksVar(n) {
  var fns = [];
  for (var i = 0; i < n; i++) {
    fns.push(function () {
      return i;
    });
  }
  return fns;
}

function makeLoopCallbacksLet(n) {
  const fns = [];
  for (let i = 0; i < n; i++) {
    fns.push(function () {
      return i;
    });
  }
  return fns;
}`
  },
  {
    id: 'this-context-binding',
    title: 'Context: this Resolution, Detached Methods, Explicit Context Invocation',
    tags: ['this', 'context', 'arrow-functions', 'oop'],
    difficulty: 3,
    concept: 'this-binding',
    track: 'js-language',
    cx: ['O(1)', 'O(1)', 'Method dispatch and invocation with target context.'],
    prompt: "Write createGreeter(name): returns an object with property name, method greet() returning 'Hello, ' + this.name, and method getBoundGreet() returning greet permanently bound to that instance (so even when detached and called without a receiver, it returns 'Hello, ' + this.name). Write invokeWithContext(fn, context, ...args): invokes fn with context as its this value and passes args, without using Function.prototype.call or Function.prototype.apply (e.g. using Reflect.apply or assigning fn to a unique Symbol on context). Write isConstructorCall(TargetClass, ...args): returns true if new TargetClass(...args) constructs an instance of TargetClass; returns false if calling TargetClass without new would throw or if TargetClass is not a valid constructor.",
    ref: R`function createGreeter(name) {
  const obj = {
    name,
    greet() {
      return 'Hello, ' + this.name;
    },
    getBoundGreet() {
      return obj.greet.bind(obj);
    }
  };
  return obj;
}

function invokeWithContext(fn, context, ...args) {
  return Reflect.apply(fn, context, args);
}

function isConstructorCall(TargetClass, ...args) {
  try {
    const inst = Reflect.construct(TargetClass, args);
    return inst instanceof TargetClass;
  } catch {
    return false;
  }
}`
  },
  {
    id: 'tagged-template-literals',
    title: 'Tagged Templates: Safe HTML Escaping, Raw Strings, Highlighting',
    tags: ['template-literals', 'tagged-templates', 'security', 'strings'],
    difficulty: 2,
    concept: 'tagged-templates',
    track: 'js-language',
    cx: ['O(n)', 'O(n)', 'Iterating over template segments and escaping values proportional to output size.'],
    prompt: "Write safeHtml(strings, ...values): a tagged template function that escapes characters & < > \" ' in interpolated values (&amp; &lt; &gt; &quot; &#39;), converting null/undefined to empty strings, and joining literal segments with escaped values. Write highlight(strings, ...values): a tagged template function that wraps every interpolated value in <mark>...</mark>. Write getRawString(strings, ...values): a tagged template function that uses strings.raw to assemble the string without interpreting escape sequences (e.g. \\n stays a literal backslash followed by n).",
    ref: R`function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeHtml(strings, ...values) {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    result += escapeHtml(values[i]) + strings[i + 1];
  }
  return result;
}

function highlight(strings, ...values) {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    result += '<mark>' + String(values[i]) + '</mark>' + strings[i + 1];
  }
  return result;
}

function getRawString(strings, ...values) {
  let result = strings.raw[0];
  for (let i = 0; i < values.length; i++) {
    result += String(values[i]) + strings.raw[i + 1];
  }
  return result;
}`
  },
  {
    id: 'symbol-async-iterator',
    title: 'Async Iterators: Symbol.asyncIterator, For-Await-Of, Async Range',
    tags: ['iterators', 'async', 'symbol', 'stream'],
    difficulty: 3,
    concept: 'iterators',
    track: 'js-language',
    cx: ['O(n)', 'O(1)', 'Yielding items sequentially via async next() promises.'],
    prompt: "Write createAsyncRange(start, end, delayMs = 0): returns an object with a [Symbol.asyncIterator]() method that yields numbers from start up to (but not including) end. Each call to next() returns a Promise resolving to { value, done } after an optional delay of delayMs milliseconds. Write collectAsync(asyncIterable): consumes an async iterable using for await (const item of asyncIterable) and returns a Promise resolving to an array of all collected items. Write mapAsyncIterable(asyncIterable, fn): returns an async iterable object whose [Symbol.asyncIterator]() yields await fn(item) for each item.",
    ref: R`function createAsyncRange(start, end, delayMs = 0) {
  return {
    [Symbol.asyncIterator]() {
      let cur = start;
      return {
        next() {
          if (cur >= end) {
            return Promise.resolve({ value: undefined, done: true });
          }
          const val = cur++;
          if (delayMs > 0) {
            return new Promise((resolve) =>
              setTimeout(() => resolve({ value: val, done: false }), delayMs)
            );
          }
          return Promise.resolve({ value: val, done: false });
        }
      };
    }
  };
}

async function collectAsync(asyncIterable) {
  const items = [];
  for await (const x of asyncIterable) {
    items.push(x);
  }
  return items;
}

function mapAsyncIterable(asyncIterable, fn) {
  return {
    [Symbol.asyncIterator]() {
      const iter = asyncIterable[Symbol.asyncIterator]();
      return {
        async next() {
          const res = await iter.next();
          if (res.done) return res;
          return { value: await fn(res.value), done: false };
        }
      };
    }
  };
}`
  },
  {
    id: 'generators-coroutines',
    title: 'Generators: Coroutines, Bidirectional Communication, Mini-Co Runner',
    tags: ['generators', 'coroutines', 'async', 'co'],
    difficulty: 4,
    concept: 'iterators',
    track: 'js-language',
    cx: ['O(n)', 'O(n)', 'Stepping through yielded promises, resuming on resolution or throwing on rejection.'],
    prompt: "Write function* createEchoGenerator(): a generator function that first yields 'ready'. On subsequent iterations, it receives an input via it.next(val) and yields [val, typeof val]. Write runCoroutine(generatorFn, ...args): a runner (mini 'co') that calls generatorFn(...args) to get an iterator. Each yielded value can be a Promise or plain value; the runner awaits it, passes the result back via it.next(resolvedValue). If a yielded promise rejects, it passes the error into the generator via it.throw(err). Returns a Promise resolving to the generator's final return value.",
    ref: R`function* createEchoGenerator() {
  let val = yield 'ready';
  while (true) {
    val = yield [val, typeof val];
  }
}

function runCoroutine(generatorFn, ...args) {
  const it = generatorFn(...args);
  return new Promise((resolve, reject) => {
    function step(method, arg) {
      let res;
      try {
        res = it[method](arg);
      } catch (err) {
        return reject(err);
      }
      if (res.done) {
        return resolve(res.value);
      }
      Promise.resolve(res.value).then(
        (val) => step('next', val),
        (err) => step('throw', err)
      );
    }
    step('next');
  });
}`
  }
]);
