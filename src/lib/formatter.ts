/**
 * In-browser code formatting using Prettier standalone.
 * Supports JavaScript, JSX, and TypeScript syntax without external server round-trips.
 */

export interface FormatResult {
  success: boolean;
  code: string;
  error?: string;
}

export async function formatCode(
  source: string,
  isTypeScript = false
): Promise<FormatResult> {
  if (!source || !source.trim()) {
    return { success: true, code: source };
  }

  try {
    const prettier = await import('prettier/standalone');
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
