type DeepReadonly<T> = T extends Function
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
      : T;

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type Concrete<T> = {
  [P in keyof T]-?: T[P];
};

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

function makeGetters<T extends Record<string, any>>(obj: T): Getters<T> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
    result[`get${capitalized}`] = () => obj[key];
  }
  return result as Getters<T>;
}
