import { ensureSyntaxTree, syntaxTree } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';

const BRACKET_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'] as const;

const MATCHING_OPEN_BRACKET: Record<string, string> = {
  ')': '(',
  ']': '[',
  '}': '{',
};

const IGNORED_NODE_NAMES = new Set([
  'LineComment',
  'BlockComment',
  'Comment',
  'String',
  'TemplateString',
  'RegExp',
  'AttributeValue',
]);

/**
 * Returns true when a syntax node at a bracket character represents non-code
 * content (comments, string/template literals, regexes) that should keep its
 * own syntax highlighting rather than receiving rainbow bracket colors.
 */
function isNonCodeSyntaxNode(nodeName: string): boolean {
  return (
    IGNORED_NODE_NAMES.has(nodeName) ||
    nodeName.endsWith('Comment') ||
    nodeName.endsWith('String')
  );
}

/**
 * Computes rainbow bracket decorations for `view`, skipping brackets inside
 * comments, strings, template literal text, and regular expression literals.
 */
export function computeRainbowBracketDecorations(view: Pick<EditorView, 'state' | 'viewport'>): DecorationSet {
  const { doc } = view.state;
  const tree = ensureSyntaxTree(view.state, Math.max(view.viewport.to, doc.length), 50) ?? syntaxTree(view.state);
  const decorations = [];
  const stack: Array<{ type: string; from: number }> = [];

  for (let pos = 0; pos < doc.length; pos += 1) {
    const char = doc.sliceString(pos, pos + 1);
    if (char !== '(' && char !== '[' && char !== '{' && char !== ')' && char !== ']' && char !== '}') {
      continue;
    }

    const nodeName = tree.resolveInner(pos, 1).name;
    if (isNonCodeSyntaxNode(nodeName)) {
      continue;
    }

    if (char === '(' || char === '[' || char === '{') {
      stack.push({ type: char, from: pos });
    } else {
      const open = stack.pop();
      if (open && open.type === MATCHING_OPEN_BRACKET[char]) {
        const color = BRACKET_COLORS[stack.length % BRACKET_COLORS.length];
        decorations.push(
          Decoration.mark({ class: `rainbow-bracket-${color}` }).range(open.from, open.from + 1),
          Decoration.mark({ class: `rainbow-bracket-${color}` }).range(pos, pos + 1),
        );
      }
    }
  }

  decorations.sort((a, b) => a.from - b.from);
  return Decoration.set(decorations);
}

const rainbowBracketsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = computeRainbowBracketDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = computeRainbowBracketDecorations(update.view);
      }
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  },
);

const rainbowBracketsTheme = EditorView.baseTheme(
  Object.fromEntries(
    BRACKET_COLORS.flatMap((color) => [
      [`.rainbow-bracket-${color}`, { color }],
      [`.rainbow-bracket-${color} > span`, { color }],
    ]),
  ),
);

/**
 * CodeMirror extension that colorizes matching bracket pairs by nesting depth
 * while leaving comments, strings, and regex literals unhighlighted.
 */
export default function rainbowBrackets(): Extension {
  return [rainbowBracketsPlugin, rainbowBracketsTheme];
}
