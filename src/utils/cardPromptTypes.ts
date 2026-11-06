import type { TopicItem } from '../lib/leitner';

export interface ExtractedPromptType {
  name: string;
  kind: 'interface' | 'type';
  code: string;
}

export interface CardPreloadedScopeInfo {
  globals: string[];
  types: string[];
  allItems: string[];
}

export interface RedundantScopeWarning {
  kind: 'import' | 'interface';
  matchedText: string;
  message: string;
}

const REACT_SANDBOX_HOOKS_AND_APIS = [
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useRef',
  'useReducer',
  'useMemo',
  'useCallback',
  'useContext',
  'useId',
  'useSyncExternalStore',
  'useImperativeHandle',
  'forwardRef',
  'createContext',
  'use',
  'Suspense',
  'startTransition',
  'useTransition',
  'useDeferredValue',
  'useOptimistic',
  'useActionState',
  'createPortal',
] as const;

const GRAPHQL_SANDBOX_APIS = [
  'graphql',
  'buildSchema',
  'parseGraphql',
  'validateGraphql',
] as const;

/**
 * Extracts top-level `interface` and `type` declarations from ```ts / ```typescript
 * code blocks in a card's prompt markdown.
 * Skips `typescript-patterns` cards where authoring the type itself is the exercise.
 */
export function extractPromptTypeDeclarations(
  promptSeed?: string,
  track?: string
): ExtractedPromptType[] {
  if (!promptSeed || track === 'typescript-patterns') return [];

  const results: ExtractedPromptType[] = [];
  const seenNames = new Set<string>();
  const fenceRegex = /```(?:ts|typescript)\s*\n([\s\S]*?)```/g;
  let fenceMatch: RegExpExecArray | null;

  while ((fenceMatch = fenceRegex.exec(promptSeed)) !== null) {
    const block = fenceMatch[1];
    const lines = block.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const ifaceMatch = /^\s*(?:export\s+)?interface\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/.exec(line);
      if (ifaceMatch) {
        const name = ifaceMatch[1];
        const collected: string[] = [line.replace(/^(\s*)export\s+/, '$1')];
        let depth = countBraces(line);
        i++;
        while (i < lines.length && depth > 0) {
          collected.push(lines[i]);
          depth += countBraces(lines[i]);
          i++;
        }
        if (!seenNames.has(name)) {
          seenNames.add(name);
          results.push({
            name,
            kind: 'interface',
            code: collected.join('\n').trim(),
          });
        }
        continue;
      }

      const typeMatch = /^\s*(?:export\s+)?type\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/.exec(line);
      if (typeMatch) {
        const name = typeMatch[1];
        const collected: string[] = [line.replace(/^(\s*)export\s+/, '$1')];
        let depth = countBraces(line);
        let ended = depth <= 0 && line.trim().endsWith(';');
        i++;
        while (i < lines.length && !ended) {
          const nextLine = lines[i];
          // Stop if we hit a new top-level declaration when brace depth is 0
          if (
            depth <= 0 &&
            /^\s*(?:export\s+)?(?:interface|type|function|class|const|let|var)\b/.test(nextLine)
          ) {
            break;
          }
          collected.push(nextLine);
          depth += countBraces(nextLine);
          if (depth <= 0 && nextLine.trim().endsWith(';')) {
            ended = true;
          }
          i++;
        }
        if (!seenNames.has(name)) {
          seenNames.add(name);
          results.push({
            name,
            kind: 'type',
            code: collected.join('\n').trim(),
          });
        }
        continue;
      }

      i++;
    }
  }

  return results;
}

function countBraces(line: string): number {
  let delta = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '{' || ch === '(') delta++;
    else if (ch === '}' || ch === ')') delta--;
  }
  return delta;
}

/**
 * Returns the combined TypeScript `interface` / `type` source blocks from a card's prompt
 * suitable for appending to the global sandbox type definitions.
 */
export function extractPromptTypeBlocks(promptSeed?: string, track?: string): string {
  const decls = extractPromptTypeDeclarations(promptSeed, track);
  if (decls.length === 0) return '';
  return decls.map((d) => d.code).join('\n\n');
}

/**
 * Returns the names of all `interface` and `type` declarations in a card's prompt.
 */
export function extractPromptTypeNames(promptSeed?: string, track?: string): string[] {
  return extractPromptTypeDeclarations(promptSeed, track).map((d) => d.name);
}

/**
 * Computes problem-specific preloaded runtime globals and TypeScript interfaces/types
 * for a given card so the starter comment and editor hints only mention items relevant
 * to that specific problem.
 */
export function getCardPreloadedScopeInfo(card: TopicItem | null): CardPreloadedScopeInfo {
  if (!card) return { globals: [], types: [], allItems: [] };

  const inputLang = card.inputLanguage ?? 'javascript';
  if (inputLang === 'html' || inputLang === 'sql' || inputLang === 'graphql') {
    return { globals: [], types: [], allItems: [] };
  }

  const globals: string[] = [];
  const promptTypes = extractPromptTypeNames(card.promptSeed, card.track);
  const types: string[] = [...promptTypes];

  const refJs = card.referenceSolution ?? card.solution ?? '';
  const refTs = card.referenceSolutionTs ?? '';
  const prompt = card.promptSeed ?? '';
  const harness = card.testHarness ?? '';
  const combinedSource = `${refJs}\n${refTs}\n${prompt}`;

  // 1. React track or React-based cards
  const isReactCard =
    card.track === 'react' ||
    card.track === 'react-components' ||
    card.id === 'd3-react-imperative-chart';

  if (isReactCard) {
    globals.push('React');
    const usedHooks: string[] = [];
    for (const hook of REACT_SANDBOX_HOOKS_AND_APIS) {
      if (new RegExp(`\\b${hook}\\b`).test(combinedSource)) {
        usedHooks.push(hook);
      }
    }
    if (usedHooks.length > 0) {
      globals.push(...usedHooks);
    } else {
      globals.push('useState', 'useEffect');
    }
  }

  // 2. D3 track
  if (card.track === 'd3') {
    globals.push('d3');
  }

  // 3. GraphQL runtime helpers (for JS/TS GraphQL cards)
  if (card.track === 'graphql' || card.track === 'graphql-server') {
    for (const api of GRAPHQL_SANDBOX_APIS) {
      if (new RegExp(`\\b${api}\\b`).test(`${refJs}\n${harness}`)) {
        globals.push(api);
      }
    }
  }

  // 4. Algorithm data structures (ListNode, TreeNode, GraphNode)
  if (/\bListNode\b/.test(`${combinedSource}\n${harness}`)) {
    if (!globals.includes('ListNode') && !types.includes('ListNode')) {
      globals.push('ListNode');
    }
    if (/\blist\s*\(/.test(harness)) globals.push('list()');
    if (/\btoArray\s*\(/.test(harness)) globals.push('toArray()');
    if (!types.includes('ListNode')) types.push('ListNode');
  }

  if (/\bTreeNode\b/.test(`${combinedSource}\n${harness}`)) {
    if (!globals.includes('TreeNode') && !types.includes('TreeNode')) {
      globals.push('TreeNode');
    }
    if (!types.includes('TreeNode')) types.push('TreeNode');
  }

  if (/\bGraphNode\b/.test(`${combinedSource}\n${harness}`)) {
    if (!globals.includes('GraphNode') && !types.includes('GraphNode')) {
      globals.push('GraphNode');
    }
    if (!types.includes('GraphNode')) types.push('GraphNode');
  }

  const allItems: string[] = [];
  const seen = new Set<string>();
  for (const item of [...globals, ...promptTypes]) {
    if (!seen.has(item)) {
      seen.add(item);
      allItems.push(item);
    }
  }

  return { globals, types, allItems };
}

/**
 * Strips block/line comments and the bottom `// Test runner example:` section
 * so we only inspect what the user typed in their implementation area.
 */
function extractUserImplementationArea(code: string): string {
  const markerIdx = code.indexOf('// Test runner example:');
  const userPart = markerIdx !== -1 ? code.slice(0, markerIdx) : code;
  // Remove block comments and single-line comments
  return userPart
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

/**
 * Detects if the user has started typing a redundant `import` statement
 * or retyping one of the problem's predefined TypeScript `interface` / `type` definitions.
 */
export function detectRedundantScopeInput(
  code: string,
  card: TopicItem | null
): RedundantScopeWarning | null {
  if (!card || !code.trim()) return null;

  const cleanUserCode = extractUserImplementationArea(code);
  if (!cleanUserCode.trim()) return null;

  const scopeInfo = getCardPreloadedScopeInfo(card);

  // 1. Check for top-level `import ...` or `require('react' | 'd3' | 'graphql')`
  const importMatch = /^\s*import\s+(?:type\s+)?([A-Za-z0-9_$*{,\s]+)/m.exec(cleanUserCode);
  const requireMatch = /\brequire\s*\(\s*['"](react|react-dom|d3|graphql)['"]\s*\)/.exec(cleanUserCode);

  if (importMatch || requireMatch) {
    const matchedText = (importMatch ? importMatch[0] : requireMatch![0]).trim();
    const globalSummary =
      scopeInfo.globals.length > 0
        ? scopeInfo.globals.slice(0, 6).join(', ')
        : 'React hooks, d3, and sandbox globals';
    return {
      kind: 'import',
      matchedText,
      message: `${globalSummary} ${scopeInfo.globals.length === 1 ? 'is' : 'are'} already preloaded in scope — no import statements needed.`,
    };
  }

  // 2. Check if the user is retyping one of the problem's predefined interfaces or types
  if (scopeInfo.types.length > 0) {
    const escapedNames = scopeInfo.types
      .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const typeRegex = new RegExp(
      `^\\s*(?:export\\s+)?(?:interface|type)\\s+(${escapedNames})\\b`,
      'm'
    );
    const typeMatch = typeRegex.exec(cleanUserCode);
    if (typeMatch) {
      const matchedName = typeMatch[1];
      const otherTypes = scopeInfo.types.filter((t) => t !== matchedName);
      const alsoText =
        otherTypes.length > 0 ? ` (along with ${otherTypes.slice(0, 4).join(', ')})` : '';
      return {
        kind: 'interface',
        matchedText: matchedName,
        message: `\`${matchedName}\`${alsoText} is already predefined in scope — no need to retype prompt interfaces.`,
      };
    }
  }

  return null;
}

