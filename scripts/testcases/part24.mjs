import { c } from './part1.mjs';

// Hand-written cases for batch 24: TypeScript type-level track.
export default {
  'ts-infer-conditional-unpack': [
    c('MyReturnType extracts function return type', `const a: MyReturnType<() => number> = 42;\na`, '42'),
    c('MyReturnType handles boolean return and parameters', `const b: MyReturnType<(x: string) => boolean> = true;\nb`, 'true'),
    c('MyParameters extracts parameter tuple', `const p: MyParameters<(x: string, y: number) => void> = ['hello', 10];\np`, "['hello', 10]"),
    c('DeepAwaited unwraps nested Promise types', `const d: DeepAwaited<Promise<Promise<string>>> = 'unwrapped';\nd`, "'unwrapped'"),
    c('TupleToUnion creates union from array', `const u: TupleToUnion<['red', 'green', 'blue']> = 'green';\nu`, "'green'"),
    c('Flatten unwraps array element type', `const f: Flatten<number[][]> = [1, 2, 3];\nf`, '[1, 2, 3]'),
    c('Flatten leaves non-array primitive type untouched', `const f2: Flatten<string> = 'plain';\nf2`, "'plain'"),
  ],
  'ts-template-literal-strings': [
    c('CamelToKebab converts single camel hump to kebab-case', `const k: CamelToKebab<'userName'> = 'user-name';\nk`, "'user-name'"),
    c('CamelToKebab converts multiple camel humps', `const k2: CamelToKebab<'isReadyNow'> = 'is-ready-now';\nk2`, "'is-ready-now'"),
    c('Split splits string by delimiter into tuple', `const s: Split<'a.b.c', '.'> = ['a', 'b', 'c'];\ns`, "['a', 'b', 'c']"),
    c('DeepDotPath allows valid nested property path string', `const p: DeepDotPath<{ user: { name: string; profile: { avatar: string } } }> = 'user.profile.avatar';\np`, "'user.profile.avatar'"),
    c('getByPath retrieves nested object value along path', `const obj = { a: { b: { c: 99 } } };\ngetByPath(obj, 'a.b.c')`, '99'),
    c('getByPath returns undefined on non-existent path', `const obj = { x: 10 };\ngetByPath(obj, 'x.missing.deep')`, 'undefined'),
  ],
  'ts-branded-nominal-types': [
    c('toUserId and toOrderId return branded values', `const u = toUserId('u-123');\nconst o = toOrderId('o-456');\n[u, o]`, "['u-123', 'o-456']"),
    c('toPositiveNumber returns positive numbers', `const pos = toPositiveNumber(42);\npos`, '42'),
    c('toPositiveNumber throws on non-positive input', `let caught = null;\ntry {\n  toPositiveNumber(-5);\n} catch (e: any) {\n  caught = e.message;\n}\ncaught`, "'Number must be positive'"),
    c('Branded value is assignable to base primitive type', `const u: UserId = toUserId('id-1');\nconst s: string = u;\ns`, "'id-1'"),
  ],
  'ts-overloads-exhaustive-narrowing': [
    c('formatInput formats strings with boolean flag', `[formatInput('hello', true), formatInput('WORLD', false)]`, "['HELLO', 'world']"),
    c('formatInput formats numbers with decimal precision', `[formatInput(3.14159, 2), formatInput(42, 0)]`, "['3.14', '42']"),
    c('assertNever throws with provided or default message', `let caught = null;\ntry {\n  assertNever('invalid' as never);\n} catch (e: any) {\n  caught = e.message;\n}\ncaught`, "'Unexpected value: invalid'"),
    c('isTagged narrows union item by tag', `type Action = { tag: 'add'; val: number } | { tag: 'reset' };\nconst a: Action = { tag: 'add', val: 5 };\nisTagged(a, 'add') ? a.val : 0`, '5'),
    c('isTagged returns false when tag does not match', `type Action = { tag: 'add'; val: number } | { tag: 'reset' };\nconst a: Action = { tag: 'reset' };\nisTagged(a, 'add')`, 'false'),
  ],
  'ts-mapped-modifiers-deep-readonly': [
    c('DeepReadonly allows nested property read access', `const obj = { a: 1, b: { c: 'nested' } };\nconst r: DeepReadonly<typeof obj> = obj;\nr.b.c`, "'nested'"),
    c('Mutable removes readonly modifiers allowing property mutation', `type ReadonlyUser = { readonly id: number; readonly name: string };\nconst u: Mutable<ReadonlyUser> = { id: 1, name: 'Alice' };\nu.name = 'Bob';\nu.name`, "'Bob'"),
    c('Concrete removes optional modifier requiring all properties', `type PartialConfig = { host?: string; port?: number };\nconst c: Concrete<PartialConfig> = { host: 'localhost', port: 8080 };\n[c.host, c.port]`, "['localhost', 8080]"),
    c('makeGetters generates get<Prop> methods for object properties', `const g = makeGetters({ name: 'Alice', age: 30 });\n[g.getName(), g.getAge()]`, "['Alice', 30]"),
  ],
};
