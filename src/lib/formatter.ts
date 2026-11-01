/**
 * In-browser code formatting using Prettier standalone and sql-formatter.
 * Supports HTML, JavaScript, JSX, TypeScript, GraphQL, and SQL syntax without external server round-trips.
 */
import type { CardInputLanguage } from './leitner';

export interface FormatResult {
  success: boolean;
  code: string;
  error?: string;
}

export async function formatCode(
  source: string,
  modeOrLanguage: boolean | CardInputLanguage = false
): Promise<FormatResult> {
  if (!source || !source.trim()) {
    return { success: true, code: source };
  }

  const lang: CardInputLanguage =
    typeof modeOrLanguage === 'boolean'
      ? (modeOrLanguage ? 'typescript' : 'javascript')
      : modeOrLanguage;

  if (lang === 'sql') {
    try {
      const { format } = await import('sql-formatter');
      const formatted = format(source, {
        language: 'postgresql',
        tabWidth: 2,
        keywordCase: 'upper',
      });
      return { success: true, code: formatted };
    } catch (err: unknown) {
      return {
        success: false,
        code: source,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  try {
    const prettier = await import('prettier/standalone');

    if (lang === 'html') {
      const htmlPlugin = await import('prettier/plugins/html');
      const formatted = await prettier.default.format(source, {
        parser: 'html',
        plugins: [htmlPlugin.default],
        tabWidth: 2,
        printWidth: 100,
      });
      return { success: true, code: formatted };
    }

    if (lang === 'graphql') {
      const graphqlPlugin = await import('prettier/plugins/graphql');
      const formatted = await prettier.default.format(source, {
        parser: 'graphql',
        plugins: [graphqlPlugin.default],
        tabWidth: 2,
      });
      return { success: true, code: formatted };
    }

    const isTypeScript = lang === 'typescript';
    const babelPlugin = await import('prettier/plugins/babel');
    const estreePlugin = await import('prettier/plugins/estree');
    const tsPlugin = isTypeScript
      ? await import('prettier/plugins/typescript')
      : null;

    const plugins = [
      babelPlugin.default,
      estreePlugin.default,
      ...(tsPlugin ? [tsPlugin.default] : []),
    ];

    const formatted = await prettier.default.format(source, {
      parser: isTypeScript ? 'typescript' : 'babel',
      plugins,
      singleQuote: true,
      tabWidth: 2,
      semi: true,
      trailingComma: 'es5',
      bracketSpacing: true,
      printWidth: 80,
    });

    return {
      success: true,
      code: formatted,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      code: source,
      error: message,
    };
  }
}
