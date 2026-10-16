// One-off: writes the hand-authored batch-15 "language depth" cards (Proxy, WeakMap/WeakSet, property descriptors,
// prototypal inheritance) into scripts/cards/, scripts/difficulty.json and scripts/complexity-cache.json.
// Cases are in scripts/testcases/part15.mjs. Run: node scripts/cards-batch15.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, 'cards');
const diffFile = path.join(here, 'difficulty.json');
const cacheFile = path.join(here, 'complexity-cache.json');
const ladder = JSON.parse(fs.readFileSync(diffFile, 'utf8'));
const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
const R = String.raw;

const cards = [
  {
    id: 'proxy-default-logging', title: 'Proxy: Default Values and Access Counting', tags: ['proxy', 'reflect', 'get-trap', 'basics'],
    difficulty: 1, concept: 'proxy',
    cx: ['O(1)', 'O(k)', 'Each trap call does constant work; the access counter stores one number per distinct key read.'],
    prompt: "Write withDefaults(target, defaults) returning a Proxy whose get trap returns target[key] when the key exists in target (use `key in target`), otherwise defaults[key] (undefined if neither has it). Write countAccesses(target) returning { proxy, counts }: proxy forwards reads to target (use Reflect.get) and records in the plain object counts how many times each STRING key was read (counts.a is 2 after two reads of proxy.a; symbol keys are not counted).",
    ref: R`function withDefaults(target, defaults) {
  return new Proxy(target, {
    get(t, key, receiver) {
      return key in t ? Reflect.get(t, key, receiver) : defaults[key];
    },
  });
}

function countAccesses(target) {
  const counts = {};
  const proxy = new Proxy(target, {
    get(t, key, receiver) {
      if (typeof key === 'string') counts[key] = (counts[key] || 0) + 1;
      return Reflect.get(t, key, receiver);
    },
  });
  return { proxy, counts };
}`,
  },
  {
    id: 'proxy-negative-index', title: 'Proxy: Negative Array Indexing', tags: ['proxy', 'array', 'get-trap', 'set-trap'],
    difficulty: 2, concept: 'proxy',
    cx: ['O(1)', 'O(1)', 'Each trap converts the key with a constant-time check and forwards to the target array.'],
    prompt: "Write negativeIndex(arr) returning a Proxy around the array so that negative indices count from the end: p[-1] is the last element, p[-2] the one before. Reads beyond the start (p[-n] with n > length) give undefined. Assigning p[-1] = x overwrites the last element; assigning with a negative index beyond the start throws a RangeError whose message contains 'out of range'. Everything else (non-negative indices, length, push, map, Array.isArray) must keep working. Negative indices arrive in the traps as STRING keys like '-1'.",
    ref: R`function negativeIndex(arr) {
  const toIndex = (key, length) => {
    if (typeof key === 'string' && /^-\d+$/.test(key)) return length + Number(key);
    return null;
  };
  return new Proxy(arr, {
    get(target, key, receiver) {
      const i = toIndex(key, target.length);
      if (i !== null) return i >= 0 ? target[i] : undefined;
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const i = toIndex(key, target.length);
      if (i !== null) {
        if (i < 0) throw new RangeError('Index out of range: ' + key);
        target[i] = value;
        return true;
      }
      return Reflect.set(target, key, value, receiver);
    },
  });
}`,
  },
  {
    id: 'proxy-validation-traps', title: 'Proxy: Validation, Delete and Has Traps', tags: ['proxy', 'validation', 'set-trap', 'traps'],
    difficulty: 3, concept: 'proxy',
    cx: ['O(1) per trap (O(n) for ownKeys)', 'O(1)', 'Each trap does a constant number of lookups; ownKeys filters the key list once.'],
    prompt: "Write createValidated(target, schema) where schema maps property names to predicate functions. Return a Proxy with: a set trap that throws TypeError('Unknown property: <key>') for keys not in the schema, throws TypeError('Invalid value for <key>') when the predicate rejects the value, and otherwise stores the value and returns true; a deleteProperty trap that throws TypeError('Cannot delete <key>') for schema keys but allows other deletes; a has trap and an ownKeys trap that hide every key starting with '_' (so '_secret' in p is false and Object.keys(p) omits it).",
    ref: R`function createValidated(target, schema) {
  return new Proxy(target, {
    set(t, key, value, receiver) {
      if (!(key in schema)) throw new TypeError('Unknown property: ' + String(key));
      if (!schema[key](value)) throw new TypeError('Invalid value for ' + String(key));
      return Reflect.set(t, key, value, receiver);
    },
    deleteProperty(t, key) {
      if (key in schema) throw new TypeError('Cannot delete ' + String(key));
      return Reflect.deleteProperty(t, key);
    },
    has(t, key) {
      if (typeof key === 'string' && key.startsWith('_')) return false;
      return Reflect.has(t, key);
    },
    ownKeys(t) {
      return Reflect.ownKeys(t).filter((k) => !(typeof k === 'string' && k.startsWith('_')));
    },
  });
}`,
  },
  {
    id: 'proxy-revocable-readonly', title: 'Proxy: Revocable Deep Read-Only View', tags: ['proxy', 'revocable', 'immutability', 'traps'],
    difficulty: 3, concept: 'proxy',
    cx: ['O(1) per access', 'O(d)', 'Each get wraps at most one nested object lazily; one proxy and revoker is kept per wrapped object.'],
    prompt: "Write createReadOnly(obj) returning { proxy, revoke } built with Proxy.revocable. Through proxy: reads work and always reflect the live source object; set, defineProperty and deleteProperty throw TypeError('Read-only'); any property whose value is an object is returned wrapped in its own read-only proxy (so nested writes throw too, deeply). Calling revoke() must revoke the top-level proxy AND every nested proxy created so far, after which any access throws a TypeError (message contains 'revoked').",
    ref: R`function createReadOnly(obj) {
  const revokers = [];
  const wrap = (target) => {
    const { proxy, revoke } = Proxy.revocable(target, {
      get(t, key, receiver) {
        const value = Reflect.get(t, key, receiver);
        return value !== null && typeof value === 'object' ? wrap(value) : value;
      },
      set() {
        throw new TypeError('Read-only');
      },
      defineProperty() {
        throw new TypeError('Read-only');
      },
      deleteProperty() {
        throw new TypeError('Read-only');
      },
    });
    revokers.push(revoke);
    return proxy;
  };
  const proxy = wrap(obj);
  return {
    proxy,
    revoke() {
      revokers.forEach((r) => r());
    },
  };
}`,
  },
  {
    id: 'weak-tag-seen', title: 'WeakMap and WeakSet: Tagging and Seen-Marks', tags: ['weakmap', 'weakset', 'metadata', 'basics'],
    difficulty: 1, concept: 'weak-collections',
    cx: ['O(1)', 'O(n)', 'WeakMap and WeakSet operations are constant time; entries are held only while their key objects stay reachable.'],
    prompt: "Use a module-level WeakMap and WeakSet (no properties may be added to the objects themselves). Write tag(obj, label) that stores a label for obj and returns obj, getTag(obj) returning the label (undefined if none), untag(obj) removing it and returning true if a tag was removed, and markSeen(obj) returning true the first time it is called for an object and false every later time for that same object.",
    ref: R`const tags = new WeakMap();
const seen = new WeakSet();

function tag(obj, label) {
  tags.set(obj, label);
  return obj;
}

function getTag(obj) {
  return tags.get(obj);
}

function untag(obj) {
  return tags.delete(obj);
}

function markSeen(obj) {
  if (seen.has(obj)) return false;
  seen.add(obj);
  return true;
}`,
  },
  {
    id: 'weakmap-private-state', title: 'WeakMap: Private Instance State (Counter, Stack)', tags: ['weakmap', 'privacy', 'class', 'encapsulation'],
    difficulty: 2, concept: 'weak-collections',
    cx: ['O(1)', 'O(n)', 'Each method does one WeakMap lookup plus a constant-time (or array push/pop) operation; the stack stores its n items.'],
    prompt: "Without using # fields, closures-per-instance or properties on the instance, keep each instance's state in module-level WeakMaps. Write class Counter(start = 0) with increment(), decrement(), reset() (back to the start value) and a getter `value`; and class Stack with push(x), pop() (undefined when empty), peek() and a getter `size`. Object.keys(instance) must be [] and JSON.stringify(instance) must be '{}'.",
    ref: R`const counterState = new WeakMap();
const stackState = new WeakMap();

class Counter {
  constructor(start = 0) {
    counterState.set(this, { start, count: start });
  }
  increment() {
    counterState.get(this).count++;
    return this;
  }
  decrement() {
    counterState.get(this).count--;
    return this;
  }
  reset() {
    const state = counterState.get(this);
    state.count = state.start;
    return this;
  }
  get value() {
    return counterState.get(this).count;
  }
}

class Stack {
  constructor() {
    stackState.set(this, []);
  }
  push(x) {
    stackState.get(this).push(x);
  }
  pop() {
    return stackState.get(this).pop();
  }
  peek() {
    const items = stackState.get(this);
    return items[items.length - 1];
  }
  get size() {
    return stackState.get(this).length;
  }
}`,
  },
  {
    id: 'weakmap-memoize-object', title: 'WeakMap: Memoize By Object and Stable IDs', tags: ['weakmap', 'memoize', 'cache', 'identity'],
    difficulty: 2, concept: 'weak-collections',
    cx: ['O(1) per call', 'O(n)', 'Each call is one WeakMap lookup; the cache holds one result per distinct object argument.'],
    prompt: "Write memoizeByObject(fn) returning a function that caches fn's result in a WeakMap keyed by the FIRST argument's identity (the same object returns the cached result without calling fn again, even if the cached result is undefined). If the first argument is not an object or function (primitives, null), do not cache: call fn every time. Also write idOf(obj) returning a stable positive integer id for each object: the same object always gets the same id and each new object gets the next integer (ids increase by 1).",
    ref: R`function memoizeByObject(fn) {
  const cache = new WeakMap();
  return function (arg, ...rest) {
    const cacheable = arg !== null && (typeof arg === 'object' || typeof arg === 'function');
    if (!cacheable) return fn.call(this, arg, ...rest);
    if (cache.has(arg)) return cache.get(arg);
    const result = fn.call(this, arg, ...rest);
    cache.set(arg, result);
    return result;
  };
}

const ids = new WeakMap();
let nextId = 1;

function idOf(obj) {
  if (!ids.has(obj)) ids.set(obj, nextId++);
  return ids.get(obj);
}`,
  },
  {
    id: 'weakset-cycle-detection', title: 'WeakSet: Cycle Detection and Object Counting', tags: ['weakset', 'graph', 'recursion', 'cycle'],
    difficulty: 3, concept: 'weak-collections',
    cx: ['O(n + e)', 'O(n)', 'Each reachable object is entered once and every property edge is followed once, with weak sets storing the visited and ancestor objects.'],
    prompt: "Write hasCycle(value): true when following object/array properties from value ever reaches an object that is currently being visited (a real cycle: a.self = a, a -> b -> a, an array containing itself). The same object referenced twice from different places (a diamond) is NOT a cycle. Primitives and null have no cycle. Use WeakSets (one for the current path, one for finished objects). Write countObjects(root): the number of distinct objects and arrays reachable from root, including root itself, counting each only once even with cycles or sharing (0 for primitives and null).",
    ref: R`function hasCycle(value) {
  const path = new WeakSet();
  const done = new WeakSet();
  const visit = (node) => {
    if (node === null || typeof node !== 'object') return false;
    if (path.has(node)) return true;
    if (done.has(node)) return false;
    path.add(node);
    for (const key of Object.keys(node)) {
      if (visit(node[key])) return true;
    }
    path.delete(node);
    done.add(node);
    return false;
  };
  return visit(value);
}

function countObjects(root) {
  const seen = new WeakSet();
  let count = 0;
  const visit = (node) => {
    if (node === null || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    count++;
    for (const key of Object.keys(node)) visit(node[key]);
  };
  visit(root);
  return count;
}`,
  },
  {
    id: 'descriptor-basics', title: 'Property Descriptors: Hidden, Constant, Flags', tags: ['defineProperty', 'descriptor', 'enumerable', 'basics'],
    difficulty: 1, concept: 'descriptors',
    cx: ['O(1)', 'O(1)', 'Each helper makes a single defineProperty or getOwnPropertyDescriptor call.'],
    prompt: "Use Object.defineProperty. Write defineHidden(obj, key, value): adds a property that is writable and configurable but NOT enumerable (it must not show up in Object.keys or JSON.stringify) and returns obj. Write defineConstant(obj, key, value): adds an enumerable property that cannot be changed or deleted (not writable, not configurable) and returns obj. Write describeFlags(obj, key): undefined if obj has no OWN property key; otherwise { writable, enumerable, configurable } for a data property, or { enumerable, configurable, accessor: true } for a getter/setter property.",
    ref: R`function defineHidden(obj, key, value) {
  return Object.defineProperty(obj, key, {
    value,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

function defineConstant(obj, key, value) {
  return Object.defineProperty(obj, key, {
    value,
    writable: false,
    enumerable: true,
    configurable: false,
  });
}

function describeFlags(obj, key) {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  if (!d) return undefined;
  if ('value' in d) {
    return { writable: d.writable, enumerable: d.enumerable, configurable: d.configurable };
  }
  return { enumerable: d.enumerable, configurable: d.configurable, accessor: true };
}`,
  },
  {
    id: 'getter-setter-pairs', title: 'Descriptors: Getter/Setter Pairs and Lazy Properties', tags: ['defineProperty', 'getter', 'setter', 'lazy'],
    difficulty: 2, concept: 'descriptors',
    cx: ['O(1)', 'O(1)', 'Accessors perform a constant arithmetic step; a lazy property computes once and then stores its value.'],
    prompt: "Write createThermometer(celsius) returning an object with an enumerable data property `celsius` and a NON-enumerable accessor property `fahrenheit` defined with Object.defineProperty: its getter returns celsius * 9 / 5 + 32 and its setter takes a Fahrenheit number and updates celsius to (f - 32) * 5 / 9 (so JSON.stringify of the object only shows celsius). Write defineLazy(obj, key, compute): defines an enumerable, configurable getter that calls compute() on the first read, then REPLACES itself with a plain data property holding that value (writable, enumerable, configurable) so compute never runs again; returns obj.",
    ref: R`function createThermometer(celsius) {
  const t = { celsius };
  Object.defineProperty(t, 'fahrenheit', {
    get() {
      return (this.celsius * 9) / 5 + 32;
    },
    set(f) {
      this.celsius = ((f - 32) * 5) / 9;
    },
    enumerable: false,
    configurable: true,
  });
  return t;
}

function defineLazy(obj, key, compute) {
  Object.defineProperty(obj, key, {
    get() {
      const value = compute();
      Object.defineProperty(obj, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      return value;
    },
    enumerable: true,
    configurable: true,
  });
  return obj;
}`,
  },
  {
    id: 'copy-descriptors-mixin', title: 'Descriptors: Clone With Descriptors and Mixin', tags: ['descriptors', 'mixin', 'clone', 'getOwnPropertyDescriptors'],
    difficulty: 3, concept: 'descriptors',
    cx: ['O(p)', 'O(p)', 'Every own property key (p) is read and redefined once; accessors are copied without being invoked.'],
    prompt: "Write cloneWithDescriptors(obj) returning a new object with the SAME prototype as obj and copies of ALL own properties, preserving non-enumerable properties, getters/setters (as accessors, not their values) and symbol keys. Write mixin(target, ...sources) that copies every own property (string AND symbol keys, enumerable or not) from each source onto target by DESCRIPTOR, so getters stay getters and are never invoked during copying (unlike Object.assign); later sources override earlier ones; return target.",
    ref: R`function cloneWithDescriptors(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}

function mixin(target, ...sources) {
  for (const source of sources) {
    for (const key of Reflect.ownKeys(source)) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    }
  }
  return target;
}`,
  },
  {
    id: 'proto-object-create', title: 'Prototypes: Object.create, hasOwn, Chain Length', tags: ['prototype', 'Object.create', 'inheritance', 'basics'],
    difficulty: 1, concept: 'prototypes',
    cx: ['O(d)', 'O(1)', 'Creating an object is constant time; protoChainLength walks the chain once (depth d).'],
    prompt: "Write inheritFrom(proto, props = {}) that returns a new object whose prototype is proto (use Object.create) and which has the properties of props copied onto it as OWN properties. Write hasOwn(obj, key) that is true only for own (not inherited) properties, using Object.prototype.hasOwnProperty.call. Write protoChainLength(obj): the number of objects on the prototype chain after obj itself (protoChainLength({}) is 1 because of Object.prototype; Object.create(null) gives 0).",
    ref: R`function inheritFrom(proto, props = {}) {
  const obj = Object.create(proto);
  Object.assign(obj, props);
  return obj;
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function protoChainLength(obj) {
  let count = 0;
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    count++;
    proto = Object.getPrototypeOf(proto);
  }
  return count;
}`,
  },
  {
    id: 'manual-prototype-linking', title: 'Prototypes: ES5 Constructor Inheritance (Animal, Dog)', tags: ['prototype', 'constructor', 'inheritance', 'es5'],
    difficulty: 2, concept: 'prototypes',
    cx: ['O(1)', 'O(1)', 'Linking prototypes and calling the parent constructor are constant-time steps per instance.'],
    prompt: "Without using `class`, write the constructor functions Animal(name) and Dog(name, breed). Animal.prototype.speak() returns name + ' makes a sound'. Dog calls the Animal constructor on its own `this`, then sets this.breed. Link Dog.prototype to Animal.prototype with Object.create (do not call new Animal), restore Dog.prototype.constructor to Dog as a NON-enumerable property, and override Dog.prototype.speak to return the Animal version (call Animal.prototype.speak.call(this)) + ' Woof!'. Animal.prototype must stay unchanged.",
    ref: R`function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  return this.name + ' makes a sound';
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Object.defineProperty(Dog.prototype, 'constructor', {
  value: Dog,
  writable: true,
  enumerable: false,
  configurable: true,
});

Dog.prototype.speak = function () {
  return Animal.prototype.speak.call(this) + ' Woof!';
};`,
  },
  {
    id: 'proto-chain-hasinstance', title: 'Prototypes: Chain Walking and Custom instanceof', tags: ['prototype', 'instanceof', 'Symbol.hasInstance', 'chain'],
    difficulty: 3, concept: 'prototypes',
    cx: ['O(d)', 'O(d)', 'Each function walks the prototype chain once (depth d); getProtoChain stores the chain in an array.'],
    prompt: "Write getProtoChain(obj): an array of the objects on obj's prototype chain, nearest first, ending with Object.prototype (empty for Object.create(null)). Write findOwner(obj, key): the first object on the chain starting at obj itself that has key as an OWN property, or null. Write myInstanceOf(value, Ctor) without using the instanceof operator: throw TypeError('Right-hand side is not callable') if Ctor is not a function; if Ctor has a custom [Symbol.hasInstance] (one that is not the default Function.prototype[Symbol.hasInstance]) return its boolean result; otherwise walk the chain of value and compare with Ctor.prototype (primitives and null are never instances).",
    ref: R`function getProtoChain(obj) {
  const chain = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    chain.push(proto);
    proto = Object.getPrototypeOf(proto);
  }
  return chain;
}

function findOwner(obj, key) {
  let node = obj;
  while (node) {
    if (Object.prototype.hasOwnProperty.call(node, key)) return node;
    node = Object.getPrototypeOf(node);
  }
  return null;
}

function myInstanceOf(value, Ctor) {
  if (typeof Ctor !== 'function') throw new TypeError('Right-hand side is not callable');
  const custom = Ctor[Symbol.hasInstance];
  if (custom !== undefined && custom !== Function.prototype[Symbol.hasInstance]) {
    return !!custom.call(Ctor, value);
  }
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return false;
  const target = Ctor.prototype;
  let proto = Object.getPrototypeOf(value);
  while (proto) {
    if (proto === target) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}`,
  },
];

for (const c of cards) {
  fs.writeFileSync(path.join(dir, `${c.id}.meta.json`), JSON.stringify({ track: 'js-language', title: c.title, tags: c.tags }, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, `${c.id}.prompt.txt`), c.prompt + '\n');
  fs.writeFileSync(path.join(dir, `${c.id}.ref.js`), c.ref + '\n');
  ladder[c.id] = { difficulty: c.difficulty, concept: c.concept };
  cache[c.id] = { targetTime: c.cx[0], targetSpace: c.cx[1], complexityExplanation: c.cx[2] };
}
fs.writeFileSync(diffFile, JSON.stringify(ladder, null, 1) + '\n');
fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
console.log(`wrote ${cards.length} cards`);
