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
  declare function fetch(input: any, init?: any): Promise<any>;
  declare function setTimeout(cb: (...args: any[]) => void, ms?: number, ...args: any[]): any;
  declare function clearTimeout(id: any): void;
  declare function setInterval(cb: (...args: any[]) => void, ms?: number, ...args: any[]): any;
  declare function clearInterval(id: any): void;
  declare function queueMicrotask(cb: () => void): void;
  declare var React: any;
  declare var ReactDOM: any;
  declare var mount: (componentOrElement: any, props?: any) => void;
  declare var useState: any;
  declare var useEffect: any;
  declare var useLayoutEffect: any;
  declare var useRef: any;
  declare var useReducer: any;
  declare var useMemo: any;
  declare var useCallback: any;
  declare var useContext: any;
  declare var useId: any;
  declare var useSyncExternalStore: any;
  declare var useImperativeHandle: any;
  declare var forwardRef: any;
  declare var createContext: any;
  declare var use: any;
  declare var Suspense: any;
  declare var startTransition: any;
  declare var useTransition: any;
  declare var useDeferredValue: any;
  declare var useOptimistic: any;
  declare var useActionState: any;
  declare var IntersectionObserver: any;
  declare var $test: any;
  declare var $dom: any;
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

  // 2. Semantic strict type-checking using an in-memory virtual program
  const fileName = 'solution.tsx';

  // Type-check as a module so top-level await is allowed (appended after a newline; positions are unchanged).
  const checkedSource = `${rawCode}\nexport {};`;

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

    for (const diag of semanticDiags) {
      if (diag.file && diag.file.fileName !== fileName) continue; // only report problems in the user's code
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
