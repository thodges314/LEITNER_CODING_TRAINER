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
 * TypeScript's own lib files (ES2022 and its dependencies) are bundled into this lazily loaded chunk,
 * so strict mode behaves like a real project: String/Array/Promise/Map/... all have their real types.
 */
const LIB_SOURCES = import.meta.glob('../../node_modules/typescript/lib/lib.es*.d.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const LIBS: Record<string, string> = {};
for (const [path, text] of Object.entries(LIB_SOURCES)) {
  LIBS[path.split('/').pop() as string] = text;
}
const DEFAULT_LIB = 'lib.es2022.d.ts';

/**
 * Globals that exist in the browser or in the harness sandbox but not in the ES libs
 * (a deliberately small stand-in for lib.dom, so editors' DOM types do not leak in).
 */
const GLOBALS_FILE = 'sandbox-globals.d.ts';
const SANDBOX_GLOBALS = `
  interface AbortSignal {
    readonly aborted: boolean;
    readonly reason: any;
    addEventListener(type: 'abort', listener: () => void, options?: { once?: boolean }): void;
    removeEventListener(type: 'abort', listener: () => void): void;
  }
  declare var AbortSignal: { prototype: AbortSignal; abort(reason?: any): AbortSignal; timeout(ms: number): AbortSignal };
  interface AbortController { readonly signal: AbortSignal; abort(reason?: any): void }
  declare var AbortController: { new (): AbortController; prototype: AbortController };
  declare class DOMException extends Error { constructor(message?: string, name?: string); readonly code: number }
  declare var console: { log(...a: any[]): void; error(...a: any[]): void; warn(...a: any[]): void; info(...a: any[]): void };
  declare var log: any;
  declare function fetch(input: any, init?: any): Promise<any>;
  declare function setTimeout(cb: (...args: any[]) => void, ms?: number, ...args: any[]): any;
  declare function clearTimeout(id: any): void;
  declare function setInterval(cb: (...args: any[]) => void, ms?: number, ...args: any[]): any;
  declare function clearInterval(id: any): void;
  declare function queueMicrotask(cb: () => void): void;
  declare function btoa(data: string): string;
  declare function atob(data: string): string;
  interface Function {
    myBind(context: any, ...boundArgs: any[]): (...args: any[]) => any;
    myCall(context: any, ...args: any[]): any;
    myApply(context: any, args?: any[]): any;
  }
  interface MutableRefObject<T> { current: T; }
  declare function useRef<T = any>(initialValue?: T): MutableRefObject<T>;
  declare function useState<T = any>(initialState?: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void];
  declare function useReducer<R extends (state: any, action: any) => any, I>(reducer: R, initialArg: I, init?: (arg: I) => any): any;
  declare function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: any[]): T;
  declare function useMemo<T = any>(factory: () => T, deps?: any[]): T;
  declare function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  declare function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void;
  declare function useContext<T = any>(context: any): T;
  declare function useId(): string;
  declare function useSyncExternalStore<Snapshot>(subscribe: (onStoreChange: () => void) => () => void, getSnapshot: () => Snapshot, getServerSnapshot?: () => Snapshot): Snapshot;
  declare function useImperativeHandle<T, R extends T>(ref: any, init: () => R, deps?: any[]): void;
  declare function memo<T = any>(component: T): T;
  declare function forwardRef<T = any, P = any>(render: (props: P, ref: any) => any): any;
  declare function createContext<T = any>(defaultValue?: T): any;
  declare function use<T = any>(usable: any): T;
  declare var Suspense: any;
  declare function startTransition(scope: () => void): void;
  declare function useTransition(): [boolean, (callback: () => void) => void];
  declare function useDeferredValue<T = any>(value: T): T;
  declare function useOptimistic<State, Action = any>(passthrough: State, updateFn?: (currentState: State, optimisticValue: Action) => State): [State, (action: Action) => void];
  declare function useActionState<State, Payload = any>(action: (state: any, payload: Payload) => any, initialState: any, permalink?: string): [any, (payload: Payload) => void, boolean];

  declare class Component<P = {}, S = {}> {
    constructor(props: P);
    props: P & { children?: React.ReactNode };
    state: S;
    setState(state: Partial<S> | ((prevState: Readonly<S>, props: Readonly<P>) => Partial<S> | null), callback?: () => void): void;
    forceUpdate(callback?: () => void): void;
    render(): any;
  }

  interface ReactNamespace {
    Component: typeof Component;
    useRef: typeof useRef;
    useState: typeof useState;
    useReducer: typeof useReducer;
    useCallback: typeof useCallback;
    useMemo: typeof useMemo;
    useEffect: typeof useEffect;
    useLayoutEffect: typeof useLayoutEffect;
    useContext: typeof useContext;
    useId: typeof useId;
    useSyncExternalStore: typeof useSyncExternalStore;
    useImperativeHandle: typeof useImperativeHandle;
    forwardRef: typeof forwardRef;
    memo: typeof memo;
    createContext: typeof createContext;
    use: typeof use;
    Suspense: any;
    startTransition: typeof startTransition;
    useTransition: typeof useTransition;
    useDeferredValue: typeof useDeferredValue;
    useOptimistic: typeof useOptimistic;
    useActionState: typeof useActionState;
    cloneElement: <P = any>(element: any, props?: any, ...children: any[]) => any;
    Children: { only: (children: any) => any; count: (children: any) => number; map: (children: any, fn: (child: any, index: number) => any) => any[]; forEach: (children: any, fn: (child: any, index: number) => void) => void; toArray: (children: any) => any[]; [key: string]: any };
    [key: string]: any;
  }
  declare var React: ReactNamespace;
  declare namespace React {
    type ReactNode = JSX.Element | string | number | boolean | null | undefined | Iterable<ReactNode>;
    type ReactElement<P = any> = JSX.Element;
    type FC<P = {}> = (props: P) => any;
    type PropsWithChildren<P = {}> = P & { children?: ReactNode };
    interface ErrorInfo { componentStack?: string; [key: string]: any; }
  }
  declare namespace JSX {
    interface Element {
      [key: string]: any;
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  declare var ReactDOM: any;
  declare var mount: (componentOrElement: any, props?: any) => void;
  declare var IntersectionObserver: any;
  declare var ResizeObserver: any;
  declare var MutationObserver: any;
  declare var window: any;
  declare var document: any;
  declare var navigator: any;
  declare var location: any;
  declare var history: any;
  declare var localStorage: any;
  declare var sessionStorage: any;
  declare var Storage: any;
  interface Storage { [key: string]: any; }
  declare var URLSearchParams: any;
  interface URLSearchParams { [key: string]: any; }
  declare var FormData: any;
  interface FormData { [key: string]: any; }
  declare var URL: any;
  interface URL { [key: string]: any; }
  interface TextEncoder {
    readonly encoding: string;
    encode(input?: string): Uint8Array;
    encodeInto(source: string, destination: Uint8Array): { read: number; written: number };
  }
  declare var TextEncoder: { new (): TextEncoder; prototype: TextEncoder };
  interface TextDecoder {
    readonly encoding: string;
    readonly fatal: boolean;
    readonly ignoreBOM: boolean;
    decode(input?: any, options?: { stream?: boolean }): string;
  }
  declare var TextDecoder: { new (label?: string, options?: { fatal?: boolean; ignoreBOM?: boolean }): TextDecoder; prototype: TextDecoder };
  declare var Buffer: any;
  declare var Event: any;
  interface Event { [key: string]: any; }
  declare var CustomEvent: any;
  interface CustomEvent extends Event { [key: string]: any; }
  declare var MouseEvent: any;
  interface MouseEvent extends Event { [key: string]: any; }
  declare var KeyboardEvent: any;
  interface KeyboardEvent extends Event { [key: string]: any; }
  declare var Node: any;
  interface Node { [key: string]: any; }
  declare var Element: any;
  interface Element extends Node { [key: string]: any; }
  declare var HTMLElement: any;
  interface HTMLElement extends Element { [key: string]: any; }
  declare var HTMLInputElement: any;
  interface HTMLInputElement extends HTMLElement { value: string; [key: string]: any; }
  declare var HTMLButtonElement: any;
  interface HTMLButtonElement extends HTMLElement { [key: string]: any; }
  declare var HTMLDivElement: any;
  interface HTMLDivElement extends HTMLElement { [key: string]: any; }
  declare var HTMLUListElement: any;
  interface HTMLUListElement extends HTMLElement { [key: string]: any; }
  declare var HTMLLIElement: any;
  interface HTMLLIElement extends HTMLElement { [key: string]: any; }
  declare var HTMLSpanElement: any;
  interface HTMLSpanElement extends HTMLElement { [key: string]: any; }
  declare var Text: any;
  interface Text extends Node { [key: string]: any; }
  declare var requestAnimationFrame: (callback: (time: number) => void) => number;
  declare var cancelAnimationFrame: (handle: number) => void;
  declare var $test: any;
  declare var $dom: any;
  declare var PGlite: any;
  declare var graphql: any;
  declare var buildSchema: any;
  declare var parseGraphql: any;
  declare var validateGraphql: any;
  declare function list<T = any>(...vals: T[]): ListNode<T> | null;
  declare function toArray<T = any>(node: ListNode<T> | null): T[];
  declare class ListNode<T = any> {
    val: T;
    next: ListNode<T> | null;
    constructor(val?: T, next?: ListNode<T> | null);
  }
  declare class TreeNode<T = any> {
    val: T;
    left: TreeNode<T> | null;
    right: TreeNode<T> | null;
    constructor(val?: T, left?: TreeNode<T> | null, right?: TreeNode<T> | null);
  }
  declare class GraphNode<T = any> {
    val: T;
    neighbors: GraphNode<T>[];
    constructor(val?: T, neighbors?: GraphNode<T>[]);
  }

  // GraphQL Domain Interfaces
  interface GraphQLResponse<T = any> {
    data?: T;
    errors?: Array<{
      message: string;
      locations?: Array<{ line: number; column: number }>;
      path?: Array<string | number>;
    }>;
  }
  interface IDataLoader<K, V> {
    load(key: K): Promise<V>;
    loadMany(keys: K[]): Promise<Array<V | Error>>;
    clear(key: K): this;
    clearAll(): this;
  }
  interface Edge<T> {
    node: T;
    cursor: string;
  }
  interface PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  }
  interface Connection<T> {
    edges: Edge<T>[];
    pageInfo: PageInfo;
    totalCount: number;
  }
  interface ConnectionArgs {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  }
  interface PaginationArgs {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  }
  interface PaginationOptions {
    defaultLimit?: number;
    maxLimit?: number;
  }
  interface ParsedPagination {
    isForward: boolean;
    limit: number;
    cursor?: string;
  }
  interface FieldNode {
    name: string;
    args?: Record<string, any>;
    fields?: FieldNode[];
  }
  interface ComplexityConfig {
    defaultCost?: number;
    fieldCosts?: Record<string, number>;
    maxComplexity?: number;
  }
  interface ComplexityResult {
    complexity: number;
    exceeded: boolean;
  }
  interface GraphQLErrorLike {
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: {
      code?: string;
      [key: string]: any;
    };
  }
  interface FormattedError {
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions: {
      code: string;
      [key: string]: any;
    };
  }
  interface FieldDefinition {
    name: string;
    type: string;
    required?: boolean;
    isArray?: boolean;
    itemRequired?: boolean;
  }
  interface ModelDefinition {
    name: string;
    fields: FieldDefinition[];
    description?: string;
  }
  interface InputFieldSchema {
    type: 'String' | 'Int' | 'Float' | 'Boolean' | 'ID' | string;
    required?: boolean;
    enumValues?: string[];
  }
  interface InputSchema {
    [fieldName: string]: InputFieldSchema;
  }
  interface SanitizedResult<T = any> {
    valid: boolean;
    data?: T;
    errors?: string[];
  }
  interface TypeResolverMap {
    [typeName: string]: (value: any) => boolean;
  }
  interface UserPayload {
    id: string;
    roles?: string[];
  }
  interface AuthContext {
    user?: UserPayload | null;
    [key: string]: any;
  }
  interface VariableValidationResult {
    valid: boolean;
    missing: string[];
  }

  // Node.js Domain Interfaces
  interface BackpressurePipeOptions {
    highWaterMark?: number;
  }
  interface ShutdownHandlerOptions {
    priority?: number;
    timeoutMs?: number;
  }
  interface TaskResult {
    name: string;
    status: 'fulfilled' | 'rejected' | 'timed_out';
    error?: string;
  }
  interface ShutdownReport {
    signal: string;
    completed: boolean;
    results: TaskResult[];
  }
  interface WorkerPoolOptions {
    size?: number;
    maxQueueSize?: number;
  }
  interface WorkerPoolStats {
    size: number;
    busyWorkers: number;
    idleWorkers: number;
    pendingQueueLength: number;
  }
  interface TLVRecord {
    type: number;
    value: string;
  }
  interface VirtualFSStat {
    isFile: () => boolean;
    isDirectory: () => boolean;
    size: number;
  }
  type FSStats = VirtualFSStat;
  interface VirtualFSOptions {
    recursive?: boolean;
  }
  interface RouteMatch {
    handler: (...args: any[]) => any;
    params: Record<string, string>;
  }
  type RouteHandler = (...args: any[]) => any;
  type RouteParams = Record<string, string>;
  type PoolStats = WorkerPoolStats;
  type EnvDictionary = Record<string, string>;
  interface ParsedArgv {
    _: Array<string | number>;
    [key: string]: any;
  }

  declare module 'react' {
    const React: any;
    export = React;
  }
  declare module 'react-dom' {
    const ReactDOM: any;
    export = ReactDOM;
  }
  declare module 'react-dom/client' {
    const ReactDOMClient: any;
    export = ReactDOMClient;
  }
`;

const sourceFileCache = new Map<string, ts.SourceFile>();
function cachedLibSource(
  name: string,
  text: string,
  languageVersion: ts.ScriptTarget | ts.CreateSourceFileOptions
): ts.SourceFile {
  const key = `${name}@${JSON.stringify(languageVersion)}`;
  let file = sourceFileCache.get(key);
  if (!file) {
    file = ts.createSourceFile(name, text, languageVersion);
    sourceFileCache.set(key, file);
  }
  return file;
}

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
 * In TSX mode, single unconstrained generic arrow functions (e.g. `<T>(x: T) => x`)
 * are ambiguous with opening JSX tags and trigger TS17008 / TS1382.
 * Appending a trailing comma `<T,>(` disambiguates type parameter lists in TSX.
 */
function normalizeGenericArrowInTsx(src: string): string {
  return src.replace(/<([A-Za-z_$][A-Za-z0-9_$]*)>(\s*\()/g, (match, typeParam, rest) => {
    // If the file explicitly contains a matching JSX closing tag </T>, do not rewrite.
    if (src.includes(`</${typeParam}>`)) return match;
    return `<${typeParam},>${rest}`;
  });
}

export interface FileTargetInfo {
  fileName: 'solution.ts' | 'solution.tsx';
  isJsx: boolean;
  codeToTranspile: string;
}

function getParseDiagnostics(sf: ts.SourceFile): readonly ts.Diagnostic[] {
  return (sf as unknown as { parseDiagnostics?: readonly ts.Diagnostic[] }).parseDiagnostics ?? [];
}

export function determineFileTarget(rawCode: string): FileTargetInfo {
  // 1. Try parsing cleanly as pure TypeScript (.ts)
  const sfTs = ts.createSourceFile('solution.ts', rawCode, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  if (getParseDiagnostics(sfTs).length === 0) {
    return { fileName: 'solution.ts', isJsx: false, codeToTranspile: rawCode };
  }

  // 2. If .ts had parse diagnostics, test .tsx
  const sfTsx = ts.createSourceFile('solution.tsx', rawCode, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  if (getParseDiagnostics(sfTsx).length === 0) {
    return { fileName: 'solution.tsx', isJsx: true, codeToTranspile: rawCode };
  }

  // 3. If both had parse diagnostics, check if normalizing single-parameter generic arrow functions in TSX resolves it
  const normalized = normalizeGenericArrowInTsx(rawCode);
  if (normalized !== rawCode) {
    const sfNorm = ts.createSourceFile('solution.tsx', normalized, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
    if (getParseDiagnostics(sfNorm).length === 0) {
      return { fileName: 'solution.tsx', isJsx: true, codeToTranspile: normalized };
    }
  }

  // 4. Fallback for code with syntax errors: prefer .tsx only if JSX elements/fragments are detected
  const hasJsxClues = /<\s*\/|\/>|<[a-z][a-z0-9-]*(\s|>)/.test(rawCode);
  if (hasJsxClues) {
    return { fileName: 'solution.tsx', isJsx: true, codeToTranspile: normalized !== rawCode ? normalized : rawCode };
  }
  return { fileName: 'solution.ts', isJsx: false, codeToTranspile: rawCode };
}

/**
 * Validates code using ts.transpileModule and strict semantic checking.
 * Returns formatted diagnostics and transpiled code.
 */
export function checkAndTranspileTS(rawCode: string): TypeCheckResult {
  const target = determineFileTarget(rawCode);
  const { fileName, isJsx, codeToTranspile } = target;

  const compilerOptions: ts.CompilerOptions = {
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictPropertyInitialization: true,
    noImplicitThis: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    ...(isJsx ? { jsx: ts.JsxEmit.React } : {}),
    noLib: false,
  };

  // 1. Syntactic check & transpilation via ts.transpileModule
  const transpileResult = ts.transpileModule(codeToTranspile, {
    compilerOptions,
    reportDiagnostics: true,
    fileName,
  });

  const formattedDiagnostics: FormattedDiagnostic[] = [];

  if (transpileResult.diagnostics && transpileResult.diagnostics.length > 0) {
    const harnessStartIndex = codeToTranspile.indexOf('// Test runner example:');
    for (const diag of transpileResult.diagnostics) {
      if (harnessStartIndex !== -1 && diag.start !== undefined && diag.start >= harnessStartIndex) {
        continue;
      }
      formattedDiagnostics.push(formatDiagnostic(diag, codeToTranspile));
    }
  }

  // 2. Semantic strict type-checking using an in-memory virtual program
  // Type-check as a module so top-level await is allowed (appended after a newline; positions are unchanged).
  const checkedSource = `${codeToTranspile}\nexport {};`;

  const fileText = (name: string): string | undefined => {
    if (name === fileName) return checkedSource;
    if (name === GLOBALS_FILE) return SANDBOX_GLOBALS;
    return LIBS[name.split('/').pop() as string];
  };

  const host: ts.CompilerHost = {
    getSourceFile: (name, languageVersion) => {
      const text = fileText(name);
      if (text === undefined) return undefined;
      // Lib files are immutable, so parse them once and reuse them across runs.
      return name === fileName || name === GLOBALS_FILE
        ? ts.createSourceFile(name, text, languageVersion)
        : cachedLibSource(name, text, languageVersion);
    },
    getDefaultLibFileName: () => DEFAULT_LIB,
    writeFile: () => {},
    getCurrentDirectory: () => '',
    getDirectories: () => [],
    fileExists: (name) => fileText(name) !== undefined,
    readFile: fileText,
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };

  try {
    const program = ts.createProgram([fileName, GLOBALS_FILE], { ...compilerOptions, noLib: false, types: [] }, host);
    const semanticDiags = program.getSemanticDiagnostics();

    const harnessStartIndex = codeToTranspile.indexOf('// Test runner example:');

    for (const diag of semanticDiags) {
      if (diag.file && diag.file.fileName !== fileName) continue;

      // Ignore any errors originating inside the test harness
      if (harnessStartIndex !== -1 && diag.start !== undefined && diag.start >= harnessStartIndex) {
        continue;
      }

      formattedDiagnostics.push(formatDiagnostic(diag, codeToTranspile));
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

export interface TSQuickInfo {
  start: number;
  length: number;
  signature: string;
  documentation?: string;
}

let tsLanguageService: ts.LanguageService | null = null;
let activeSourceCode = '';
let activeSourceVersion = 0;

function getOrCreateLanguageService(): ts.LanguageService {
  if (tsLanguageService) return tsLanguageService;

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

  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => ['solution.ts', 'solution.tsx', GLOBALS_FILE],
    getScriptVersion: (name) =>
      name === 'solution.ts' || name === 'solution.tsx' ? String(activeSourceVersion) : '1',
    getScriptSnapshot: (name) => {
      if (name === 'solution.ts' || name === 'solution.tsx') {
        const target = determineFileTarget(activeSourceCode);
        const codeForFile = target.fileName === name ? target.codeToTranspile : activeSourceCode;
        return ts.ScriptSnapshot.fromString(codeForFile);
      }
      if (name === GLOBALS_FILE) return ts.ScriptSnapshot.fromString(SANDBOX_GLOBALS);
      const text = LIBS[name.split('/').pop() as string];
      if (text !== undefined) return ts.ScriptSnapshot.fromString(text);
      return undefined;
    },
    getCurrentDirectory: () => '',
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: () => DEFAULT_LIB,
    fileExists: (name) => {
      if (name === 'solution.ts' || name === 'solution.tsx' || name === GLOBALS_FILE) return true;
      return LIBS[name.split('/').pop() as string] !== undefined;
    },
    readFile: (name) => {
      if (name === 'solution.ts' || name === 'solution.tsx') {
        const target = determineFileTarget(activeSourceCode);
        return target.fileName === name ? target.codeToTranspile : activeSourceCode;
      }
      if (name === GLOBALS_FILE) return SANDBOX_GLOBALS;
      return LIBS[name.split('/').pop() as string];
    },
    readDirectory: () => [],
    directoryExists: () => true,
    getDirectories: () => [],
  };

  tsLanguageService = ts.createLanguageService(host);
  return tsLanguageService;
}

/**
 * Returns TypeScript QuickInfo (signature, type, documentation) for the token at position.
 */
export function getTSQuickInfo(rawCode: string, position: number): TSQuickInfo | null {
  if (position < 0 || position > rawCode.length) return null;

  if (rawCode !== activeSourceCode) {
    activeSourceCode = rawCode;
    activeSourceVersion++;
  }

  try {
    const target = determineFileTarget(rawCode);
    const service = getOrCreateLanguageService();
    const info = service.getQuickInfoAtPosition(target.fileName, position);
    if (!info || !info.displayParts) return null;

    const signature = ts.displayPartsToString(info.displayParts);
    if (!signature || signature.trim() === '') return null;

    const docParts = info.documentation ? ts.displayPartsToString(info.documentation) : undefined;

    return {
      start: info.textSpan.start,
      length: info.textSpan.length,
      signature,
      documentation: docParts?.trim() ? docParts : undefined,
    };
  } catch (err) {
    console.warn('getTSQuickInfo error:', err);
    return null;
  }
}
