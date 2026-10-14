type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const assertType = <T extends true>(): void => {};

type Obj = { id: number; name: string; age: number; active: boolean };
assertType<Equal<PickByType<Obj, number>, { id: number; age: number }>>();
assertType<Equal<PickByType<Obj, string>, { name: string }>>();
assertType<Equal<PickByType<Obj, Date>, {}>>();

type Cfg = { a: number; b: { c: string; d: { e: boolean } } };
assertType<Equal<DeepPartial<Cfg>, { a?: number; b?: { c?: string; d?: { e?: boolean } } }>>();

// @ts-expect-error — `name` is a string, so it is not part of PickByType<Obj, number>
const badPick: PickByType<Obj, number> = { id: 1, name: 'x' };
$test.check('Compile time: PickByType and DeepPartial have the expected shapes', typeof badPick === 'object');
