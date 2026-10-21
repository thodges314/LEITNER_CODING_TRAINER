// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { createTsHoverExtension } from './tsHoverExtension';
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
});
