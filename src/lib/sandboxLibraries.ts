/**
 * Extensible On-Demand Sandbox Library Registry
 *
 * Dynamically loads heavy third-party runtime libraries (PGlite, GraphQL, D3, and
 * future track libraries) only when a card's track or source code requires them.
 * Loaded modules are cached in memory so subsequent runs have zero import overhead.
 *
 * To add a new library for future cards:
 * 1. Add its type to `LoadedSandboxLibraries`.
 * 2. Add a loader entry in `loadSandboxLibrariesForCode` matching the track name
 *    and/or identifier regex in `code`.
 * 3. Wire the resolved symbol into `runner.ts` (`SANDBOX_NAMES` / `createSandboxScope`)
 *    and/or `sandboxWorker.ts`.
 */

export interface GraphqlSandboxLib {
  graphql: typeof import('graphql').graphql;
  buildSchema: typeof import('graphql').buildSchema;
  parse: typeof import('graphql').parse;
  validate: typeof import('graphql').validate;
}

export interface LoadedSandboxLibraries {
  PGlite?: typeof import('@electric-sql/pglite').PGlite;
  graphql?: GraphqlSandboxLib;
  d3?: typeof import('d3');
}

const cachedLibraries: LoadedSandboxLibraries = {};

const PGLITE_IDENTIFIER_RE = /\bPGlite\b/;
const GRAPHQL_IDENTIFIER_RE = /\b(?:graphql|buildSchema|parseGraphql|validateGraphql)\b/;
const D3_IDENTIFIER_RE = /\bd3\b/;

export interface LoadSandboxLibrariesOptions {
  /** Whether to load browser DOM visualization libraries such as D3 (default: true). */
  includeDomLibs?: boolean;
}

/**
 * Inspects the active card track and executable code string, dynamically importing
 * only the runtime libraries needed for this execution.
 */
export async function loadSandboxLibrariesForCode(
  code: string,
  track?: string,
  options?: LoadSandboxLibrariesOptions
): Promise<LoadedSandboxLibraries> {
  const includeDomLibs = options?.includeDomLibs ?? true;
  const tasks: Promise<void>[] = [];

  const needsPGlite = track === 'sql-postgres' || PGLITE_IDENTIFIER_RE.test(code);
  if (needsPGlite && !cachedLibraries.PGlite) {
    tasks.push(
      import('@electric-sql/pglite').then((mod) => {
        cachedLibraries.PGlite = mod.PGlite;
      })
    );
  }

  const needsGraphql =
    track === 'graphql' ||
    track === 'graphql-server' ||
    GRAPHQL_IDENTIFIER_RE.test(code);
  if (needsGraphql && !cachedLibraries.graphql) {
    tasks.push(
      import('graphql').then((mod) => {
        cachedLibraries.graphql = {
          graphql: mod.graphql,
          buildSchema: mod.buildSchema,
          parse: mod.parse,
          validate: mod.validate,
        };
      })
    );
  }

  const needsD3 = includeDomLibs && (track === 'd3' || D3_IDENTIFIER_RE.test(code));
  if (needsD3 && !cachedLibraries.d3) {
    tasks.push(
      import('d3').then((mod) => {
        cachedLibraries.d3 = mod;
      })
    );
  }

  if (tasks.length > 0) {
    await Promise.all(tasks);
  }

  return {
    PGlite: needsPGlite ? cachedLibraries.PGlite : undefined,
    graphql: needsGraphql ? cachedLibraries.graphql : undefined,
    d3: needsD3 ? cachedLibraries.d3 : undefined,
  };
}
