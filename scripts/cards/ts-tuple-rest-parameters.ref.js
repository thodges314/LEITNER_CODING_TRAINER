type Concat<A extends readonly any[], B extends readonly any[]> = [...A, ...B];

type Shift<T extends readonly any[]> = T extends readonly [any, ...infer Rest] ? Rest : [];

function tuple<T extends any[]>(...elements: [...T]): [...T] {
  return elements;
}

function partialApply<Leading extends any[], Trailing extends any[], R>(
  fn: (...args: [...Leading, ...Trailing]) => R,
  ...head: Leading
): (...tail: Trailing) => R {
  return (...tail: Trailing): R => fn(...head, ...tail);
}

function callWithTuple<Args extends any[], R>(
  fn: (...args: Args) => R,
  args: [...Args]
): R {
  return fn(...args);
}
