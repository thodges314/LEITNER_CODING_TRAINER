type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

type DeepAwaited<T> = T extends PromiseLike<infer U> ? DeepAwaited<U> : T;

type TupleToUnion<T> = T extends readonly (infer U)[] ? U : never;

type Flatten<T> = T extends (infer U)[] ? U : T;
