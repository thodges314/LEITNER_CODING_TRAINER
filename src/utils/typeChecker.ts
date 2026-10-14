import ts from 'typescript';

export interface FormattedDiagnostic {
  type: 'error' | 'warn';
  line: number;
  character: number;
  code: number;
  message: string;
  formatted: string;
}

export interface TypeCheckResult {
  success: boolean;
  code: string;
  diagnostics: FormattedDiagnostic[];
}

/**
 * Minimal ambient declarations so common JavaScript and React primitives
 * do not report missing lib/DOM errors in an isolated browser environment.
 */
const AMBIENT_DECLARATIONS = `
  interface Boolean {}
  interface Function {}
  interface CallableFunction {}
  interface NewableFunction {}
  interface IArguments {}
  interface Number {}
  interface String {}
  interface RegExp {}
  interface Object {}
  interface Array<T> {
    [n: number]: T;
    length: number;
    push(...items: T[]): number;
    pop(): T | undefined;
    shift(): T | undefined;
    unshift(...items: T[]): number;
    slice(start?: number, end?: number): T[];
    splice(start: number, deleteCount?: number, ...items: T[]): T[];
    map<U>(cb: (val: T, index: number, array: T[]) => U): U[];
    filter(cb: (val: T, index: number, array: T[]) => boolean): T[];
    forEach(cb: (val: T, index: number, array: T[]) => void): void;
    reduce<U>(cb: (acc: U, curr: T, index: number) => U, initialValue: U): U;
    find(cb: (val: T, index: number) => boolean): T | undefined;
    findIndex(cb: (val: T, index: number) => boolean): number;
    some(cb: (val: T, index: number) => boolean): boolean;
    every(cb: (val: T, index: number) => boolean): boolean;
    includes(searchElement: T, fromIndex?: number): boolean;
    indexOf(searchElement: T, fromIndex?: number): number;
    join(separator?: string): string;
    sort(compareFn?: (a: T, b: T) => number): this;
  }
  interface ArrayConstructor {
    isArray(arg: any): arg is any[];
    from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
    new <T = any>(length?: number): T[];
  }
  declare var Array: ArrayConstructor;
  interface ArrayLike<T> { readonly length: number; readonly [n: number]: T; }
  interface Iterable<T> {}
  interface ObjectConstructor {
    keys(o: object): string[];
    values<T>(o: { [k: string]: T } | ArrayLike<T>): T[];
    entries<T>(o: { [k: string]: T }): [string, T][];
    assign<T, U>(target: T, source: U): T & U;
    freeze<T>(o: T): Readonly<T>;
    fromEntries(entries: Iterable<readonly [string, any]>): any;
  }
  declare var Object: ObjectConstructor;
  interface JSON {
    parse(text: string): any;
    stringify(value: any, replacer?: any, space?: string | number): string;
  }
  declare var JSON: JSON;
  interface Math {
    max(...values: number[]): number;
    min(...values: number[]): number;
    floor(x: number): number;
    ceil(x: number): number;
    round(x: number): number;
    abs(x: number): number;
    random(): number;
  }
  declare var Math: Math;
  declare function String(value?: any): string;
  declare function Number(value?: any): number;
  declare function Boolean(value?: any): boolean;
  declare function parseInt(s: string, radix?: number): number;
  declare function parseFloat(s: string): number;
  type Record<K extends keyof any, T> = { [P in K]: T };
  type Partial<T> = { [P in keyof T]?: T[P] };
  type Required<T> = { [P in keyof T]-?: T[P] };
  type Readonly<T> = { readonly [P in keyof T]: T[P] };
  type Pick<T, K extends keyof T> = { [P in K]: T[P] };
  type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
  type Exclude<T, U> = T extends U ? never : T;
  type Extract<T, U> = T extends U ? T : never;
  type NonNullable<T> = T extends null | undefined ? never : T;
  type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
  type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : any;

  interface Promise<T> {
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | null
    ): Promise<TResult1 | TResult2>;
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | Promise<TResult>) | null
    ): Promise<T | TResult>;
    finally(onfinally?: (() => void) | null): Promise<T>;
  }

  interface PromiseConstructor {
    resolve<T>(value: T | Promise<T>): Promise<T>;
    reject<T = never>(reason?: any): Promise<T>;
    all<T>(values: Iterable<T | Promise<T>>): Promise<T[]>;
    allSettled<T>(values: Iterable<T | Promise<T>>): Promise<any[]>;
  }
  declare var Promise: PromiseConstructor;

  interface Map<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): this;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size: number;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void): void;
  }
  interface MapConstructor {
    new <K = any, V = any>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;
  }
  declare var Map: MapConstructor;

  interface Set<T> {
    add(value: T): this;
    has(value: T): boolean;
    delete(value: T): boolean;
    clear(): void;
    size: number;
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void): void;
  }
  interface SetConstructor {
    new <T = any>(values?: readonly T[] | null): Set<T>;
  }
  declare var Set: SetConstructor;

  interface Error {
    name: string;
    message: string;
    stack?: string;
  }
  interface ErrorConstructor {
    new (message?: string): Error;
    (message?: string): Error;
  }
  declare var Error: ErrorConstructor;

  declare var console: any;
  declare var fetch: (input: any, init?: any) => Promise<any>;
  declare var setTimeout: any;
  declare var clearTimeout: any;
  declare var setInterval: any;
  declare var clearInterval: any;
  declare var queueMicrotask: (fn: () => void) => void;
  declare var AbortController: any;
  declare var React: any;
  declare var ReactDOM: any;
  declare var mount: (componentOrElement: any, props?: any) => void;
  declare var useState: any;
  declare var useEffect: any;
  declare var useRef: any;
  declare var useReducer: any;
  declare var useMemo: any;
  declare var useCallback: any;
  declare var useContext: any;
  declare var createContext: any;
`;

/**
 * Format raw TypeScript diagnostic into structured user-friendly error item.
 */
function formatDiagnostic(d: ts.Diagnostic, sourceText: string): FormattedDiagnostic {
  let line = 1;
  let character = 1;

  if (d.file && d.start !== undefined) {
    const pos = d.file.getLineAndCharacterOfPosition(d.start);
    line = pos.line + 1;
    character = pos.character + 1;
  } else if (d.start !== undefined) {
    const before = sourceText.slice(0, d.start);
    const lines = before.split('\n');
    line = lines.length;
    character = (lines[lines.length - 1]?.length ?? 0) + 1;
  }

  const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
  const type = d.category === ts.DiagnosticCategory.Warning ? 'warn' : 'error';
  const formatted = `Line ${line}:${character} - TS${d.code}: ${message}`;

  return {
    type,
    line,
    character,
    code: d.code,
    message,
    formatted,
  };
}

/**
 * Validates code using ts.transpileModule and strict semantic checking.
 * Returns formatted diagnostics and transpiled code.
 */
export function checkAndTranspileTS(rawCode: string): TypeCheckResult {
  const compilerOptions: ts.CompilerOptions = {
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictPropertyInitialization: true,
    noImplicitThis: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.React,
    noLib: false,
  };

  // 1. Syntactic check & transpilation via ts.transpileModule
  const transpileResult = ts.transpileModule(rawCode, {
    compilerOptions,
    reportDiagnostics: true,
    fileName: 'solution.tsx',
  });

  const formattedDiagnostics: FormattedDiagnostic[] = [];

  if (transpileResult.diagnostics && transpileResult.diagnostics.length > 0) {
    for (const diag of transpileResult.diagnostics) {
      formattedDiagnostics.push(formatDiagnostic(diag, rawCode));
    }
  }

  // 2. Semantic strict type-checking using in-memory virtual program
  const fileName = 'solution.tsx';
  const libName = 'lib.d.ts';

  const host: ts.CompilerHost = {
    getSourceFile: (name, languageVersion) => {
      if (name === fileName) return ts.createSourceFile(name, rawCode, languageVersion);
      if (name === libName) return ts.createSourceFile(name, AMBIENT_DECLARATIONS, languageVersion);
      return undefined;
    },
    getDefaultLibFileName: () => libName,
    writeFile: () => {},
    getCurrentDirectory: () => '/',
    getDirectories: () => [],
    fileExists: (name) => name === fileName || name === libName,
    readFile: (name) => (name === fileName ? rawCode : name === libName ? AMBIENT_DECLARATIONS : undefined),
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };

  try {
    const program = ts.createProgram([fileName], compilerOptions, host);
    const semanticDiags = program.getSemanticDiagnostics();

    for (const diag of semanticDiags) {
      // Filter out internal ambient file diagnostics if any
      if (diag.file?.fileName === libName) continue;
      formattedDiagnostics.push(formatDiagnostic(diag, rawCode));
    }
  } catch (err) {
    console.warn('Semantic analysis skipped due to host evaluation error:', err);
  }

  const hasErrors = formattedDiagnostics.some((d) => d.type === 'error');

  return {
    success: !hasErrors,
    code: transpileResult.outputText,
    diagnostics: formattedDiagnostics,
  };
}
