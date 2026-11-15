import { describe, it, expect } from 'vitest';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { computeRainbowBracketDecorations } from './rainbowBrackets';

function collectDecoratedRanges(doc: string, languageExtension = javascript({ typescript: true })) {
  const state = EditorState.create({
    doc,
    extensions: [languageExtension],
  });
  const set = computeRainbowBracketDecorations({
    state,
    viewport: { from: 0, to: doc.length },
  });
  const ranges: Array<{ from: number; to: number; text: string; className: string }> = [];
  const cursor = set.iter();
  while (cursor.value) {
    ranges.push({
      from: cursor.from,
      to: cursor.to,
      text: doc.slice(cursor.from, cursor.to),
      className: (cursor.value.spec as { class?: string }).class ?? '',
    });
    cursor.next();
  }
  return ranges;
}

describe('rainbowBrackets', () => {
  it('does not highlight brackets inside single-line comments', () => {
    const doc = '// Preloaded in scope: ListNode, list(), toArray()\nfunction solve(x) { return [x]; }';
    const ranges = collectDecoratedRanges(doc);

    expect(ranges.every((r) => r.from > doc.indexOf('\n'))).toBe(true);
    expect(ranges.map((r) => [r.text, r.className])).toEqual([
      ['(', 'rainbow-bracket-red'],
      [')', 'rainbow-bracket-red'],
      ['{', 'rainbow-bracket-red'],
      ['[', 'rainbow-bracket-orange'],
      [']', 'rainbow-bracket-orange'],
      ['}', 'rainbow-bracket-red'],
    ]);
  });

  it('ignores unmatched brackets in comments and block comments without corrupting nesting depth', () => {
    const doc = [
      '// TODO: fix (',
      '/* block (comment) [with] {unmatched',
      '*/',
      'const arr = [fn(1)];',
    ].join('\n');
    const ranges = collectDecoratedRanges(doc);

    expect(ranges.map((r) => [r.text, r.className])).toEqual([
      ['[', 'rainbow-bracket-red'],
      ['(', 'rainbow-bracket-orange'],
      [')', 'rainbow-bracket-orange'],
      [']', 'rainbow-bracket-red'],
    ]);
  });

  it('skips brackets in strings and regexes while still highlighting template interpolations', () => {
    const doc = 'const a = "()"; const b = /()/; const c = `text () ${fn(1)}`;';
    const ranges = collectDecoratedRanges(doc);

    expect(ranges.map((r) => [r.text, r.className])).toEqual([
      ['{', 'rainbow-bracket-red'],
      ['(', 'rainbow-bracket-orange'],
      [')', 'rainbow-bracket-orange'],
      ['}', 'rainbow-bracket-red'],
    ]);
  });

  it('skips brackets inside HTML comments', () => {
    const doc = '<!-- comment (ignored) -->\n<div></div>';
    const ranges = collectDecoratedRanges(doc, html());
    expect(ranges).toEqual([]);
  });
});

