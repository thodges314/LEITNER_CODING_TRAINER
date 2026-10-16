type MyPartial<T> = { [P in keyof T]?: T[P] };

type MyReadonly<T> = { readonly [P in keyof T]: T[P] };

type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

type MyRecord<K extends keyof any, V> = { [P in K]: V };
