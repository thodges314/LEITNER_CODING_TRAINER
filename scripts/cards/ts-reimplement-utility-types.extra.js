type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const assertType = <T extends true>(): void => {};

type User = { id: number; name: string };
assertType<Equal<MyPartial<User>, { id?: number; name?: string }>>();
assertType<Equal<MyReadonly<User>, { readonly id: number; readonly name: string }>>();
assertType<Equal<MyPick<User, 'id'>, { id: number }>>();
assertType<Equal<MyRecord<'a' | 'b', number>, { a: number; b: number }>>();

const compileChecksT1 = () => {
  const ro: MyReadonly<User> = { id: 1, name: 'a' };
  // @ts-expect-error — properties of MyReadonly cannot be assigned
  ro.id = 2;
  // @ts-expect-error — name is not part of MyPick<User, 'id'>
  const picked: MyPick<User, 'id'> = { id: 1, name: 'x' };
  return [ro, picked];
};
$test.check('Compile time: the rebuilt utility types have the right shapes', typeof compileChecksT1 === 'function');
