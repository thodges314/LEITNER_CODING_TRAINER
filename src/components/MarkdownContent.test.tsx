// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { MarkdownContent } from './MarkdownContent';
import { renderInlineMarkdown } from '../lib/markdown';

// @ts-expect-error IS_REACT_ACT_ENVIRONMENT is a React global flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('MarkdownContent', () => {
  let container: HTMLDivElement;
  let root: ReactDOMClient.Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOMClient.createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders inline code, bold, and italic', () => {
    act(() => {
      root.render(
        <MarkdownContent text="Call `useCounter({ initial = 0 })` with **bold text** and *italic* emphasis." />
      );
    });

    const code = container.querySelector('code');
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe('useCounter({ initial = 0 })');

    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong?.textContent).toBe('bold text');

    const em = container.querySelector('em');
    expect(em).not.toBeNull();
    expect(em?.textContent).toBe('italic');
  });

  it('renders bullet lists', () => {
    const listText = `Requirements:
- First requirement with \`code\`
- Second requirement
- Third requirement`;

    act(() => {
      root.render(<MarkdownContent text={listText} />);
    });

    const ul = container.querySelector('ul');
    expect(ul).not.toBeNull();
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('First requirement with code');
    expect(items[0].querySelector('code')?.textContent).toBe('code');
  });

  it('renders ordered lists', () => {
    const orderedText = `Steps:
1. Initialize counter
2. Increment count`;

    act(() => {
      root.render(<MarkdownContent text={orderedText} />);
    });

    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('Initialize counter');
  });

  it('renders code blocks', () => {
    const textWithBlock = `Example:
\`\`\`javascript
const x = 42;
\`\`\``;

    act(() => {
      root.render(<MarkdownContent text={textWithBlock} />);
    });

    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.querySelector('code')?.textContent?.trim()).toBe('const x = 42;');
  });

  it('renders headings', () => {
    act(() => {
      root.render(<MarkdownContent text={'### Heading 3\n\nSome paragraph text'} />);
    });

    const h4 = container.querySelector('h4');
    expect(h4).not.toBeNull();
    expect(h4?.textContent).toBe('Heading 3');
  });

  it('handles empty text gracefully', () => {
    act(() => {
      root.render(<MarkdownContent text="" />);
    });
    expect(container.innerHTML).toBe('');
  });

  it('renderInlineMarkdown returns node array with formatted tokens', () => {
    const nodes = renderInlineMarkdown('Hello `code` world');
    expect(nodes.length).toBe(3);
    expect(nodes[0]).toBe('Hello ');
    expect(nodes[2]).toBe(' world');
  });

  it('preserves JSX/HTML tags as visible text', () => {
    act(() => {
      root.render(<MarkdownContent text="Render a <table> with a <thead> row and <button>." />);
    });
    expect(container.textContent).toContain('Render a <table> with a <thead> row and <button>.');
  });
});
