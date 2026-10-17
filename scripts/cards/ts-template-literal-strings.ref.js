type CamelToKebab<S extends string> = S extends `${infer Head}${infer Tail}`
  ? Tail extends Uncapitalize<Tail>
    ? `${Lowercase<Head>}${CamelToKebab<Tail>}`
    : `${Lowercase<Head>}-${CamelToKebab<Uncapitalize<Tail>>}`
  : S;

type Split<S extends string, Delim extends string> = string extends S
  ? string[]
  : S extends ''
    ? []
    : S extends `${infer Head}${Delim}${infer Tail}`
      ? [Head, ...Split<Tail, Delim>]
      : [S];

type DeepDotPath<T> = T extends object
  ? {
      [K in keyof T & string]: K | `${K}.${DeepDotPath<T[K]>}`;
    }[keyof T & string]
  : never;

function getByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => (acc != null ? acc[part] : undefined), obj);
}
