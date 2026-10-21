// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { createTsHoverExtension, tsHoverTooltipSource } from './tsHoverExtension';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

describe('createTsHoverExtension', () => {
  it('instantiates a valid CodeMirror extension', () => {
    const ext = createTsHoverExtension();
    expect(ext).toBeDefined();

    const state = EditorState.create({
      doc: 'function twoSum(nums: number[], target: number): [number, number] { return [0, 1]; }',
      extensions: [ext],
    });
    expect(state).toBeDefined();

    const container = document.createElement('div');
    const view = new EditorView({
      state,
      parent: container,
    });
    expect(view).toBeDefined();
    view.destroy();
  });

  it('generates a tooltip for parameter under cursor', async () => {
    const doc = 'function reverseList(head: ListNode<number> | null): ListNode<number> | null { return head; }';
    const state = EditorState.create({ doc });
    const container = document.createElement('div');
    const view = new EditorView({ state, parent: container });

    const pos = doc.indexOf('head');
    const tooltip = await tsHoverTooltipSource(view, pos);

    expect(tooltip).not.toBeNull();
    expect(tooltip?.pos).toBe(pos);
    expect(tooltip?.end).toBe(pos + 4);

    // Render tooltip DOM
    const result = tooltip!.create(view);
    expect(result.dom.className).toBe('cm-ts-hover-card');
    expect(result.dom.textContent).toContain('(parameter) head: ListNode<number> | null');

    view.destroy();
  });

  it('generates a tooltip for ambient ListNode class', async () => {
    const doc = 'function reverseList(head: ListNode<number> | null) { return head; }';
    const state = EditorState.create({ doc });
    const container = document.createElement('div');
    const view = new EditorView({ state, parent: container });

    const pos = doc.indexOf('ListNode');
    const tooltip = await tsHoverTooltipSource(view, pos);

    expect(tooltip).not.toBeNull();
    const result = tooltip!.create(view);
    expect(result.dom.textContent).toContain('class ListNode<T = any>');

    view.destroy();
  });

  it('returns null for whitespace', async () => {
    const doc = 'const a = 1;      const b = 2;';
    const state = EditorState.create({ doc });
    const container = document.createElement('div');
    const view = new EditorView({ state, parent: container });

    const pos = doc.indexOf('      ') + 2;
    const tooltip = await tsHoverTooltipSource(view, pos);
    expect(tooltip).toBeNull();

    view.destroy();
  });
});
