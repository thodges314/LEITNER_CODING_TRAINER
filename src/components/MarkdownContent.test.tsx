// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { MarkdownContent } from './MarkdownContent';
import { renderInlineMarkdown } from '../lib/markdown';

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
      root.render(<MarkdownContent text={'### Heading 3\n\nSome paragraph text\n\n#### Heading 4\n\nLevel 4 paragraph text'} />);
    });

    const h4 = container.querySelector('h4');
    expect(h4).not.toBeNull();
    expect(h4?.textContent).toBe('Heading 3');

    const h5 = container.querySelector('h5');
    expect(h5).not.toBeNull();
    expect(h5?.textContent).toBe('Heading 4');
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

  it('renders double-backtick inline code containing single backticks', () => {
    act(() => {
      root.render(<MarkdownContent text={'Use ``id={`accordion-header-${item.id}`}`` here.'} />);
    });
    const code = container.querySelector('code.markdown-inline-code');
    expect(code?.textContent).toBe('id={`accordion-header-${item.id}`}');
  });

  it('preserves JSX/HTML tags as visible text', () => {
    act(() => {
      root.render(<MarkdownContent text="Render a <table> with a <thead> row and <button>." />);
    });
    expect(container.textContent).toContain('Render a <table> with a <thead> row and <button>.');
  });

  it('renders nested bullet lists with secondary indentation and circle style', () => {
    const nestedText = `Requirements:
- Parent requirement:
  - First sub-requirement
  - Second sub-requirement
- Sibling requirement`;

    act(() => {
      root.render(<MarkdownContent text={nestedText} />);
    });

    const uls = container.querySelectorAll('ul');
    expect(uls.length).toBe(2);
    expect(uls[0].style.listStyleType).toBe('disc');
    expect(uls[1].style.listStyleType).toBe('circle');

    const topLis = uls[0].children;
    expect(topLis.length).toBe(2);

    const subLis = uls[1].children;
    expect(subLis.length).toBe(2);
    expect(subLis[0].textContent).toBe('First sub-requirement');
    expect(subLis[1].textContent).toBe('Second sub-requirement');
  });

  it('renders nested sub-bullets under ordered list steps', () => {
    const mixedText = `Steps:
1. First step
  - Detail A
  - Detail B
2. Second step`;

    act(() => {
      root.render(<MarkdownContent text={mixedText} />);
    });

    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    const nestedUl = container.querySelector('ul');
    expect(nestedUl).not.toBeNull();
    expect(nestedUl?.style.listStyleType).toBe('circle');

    const subLis = nestedUl?.querySelectorAll('li');
    expect(subLis?.length).toBe(2);
    expect(subLis?.[0].textContent).toBe('Detail A');
  });

  it('renders markdown tables with headers, cells, bold, inline code, and br line breaks', () => {
    const tableText = `Below is your question map:

| # | Question bucket | Typical prompt(s) | Quick senior-level tip |
|---|-----------------|-------------------|------------------------|
| 1️⃣ | Core algorithms & data-structures | • "Given an array." <br>• "MinStack." | Write solution **first on the board**. |
| 2️⃣ | JS/TS utilities | • "Implement \`groupBy\` using \`reduce\`." | Walk through **step-by-step**. |`;

    act(() => {
      root.render(<MarkdownContent text={tableText} />);
    });

    const table = container.querySelector('table');
    expect(table).not.toBeNull();

    const ths = container.querySelectorAll('th');
    expect(ths.length).toBe(4);
    expect(ths[1].textContent).toBe('Question bucket');

    const trs = container.querySelectorAll('tbody tr');
    expect(trs.length).toBe(2);

    const tds = container.querySelectorAll('td');
    expect(tds.length).toBe(8);

    // Verify inline markdown rendered inside cells
    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong?.textContent).toBe('first on the board');

    const code = container.querySelector('code');
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe('groupBy');

    // Verify <br> rendered inside cell
    const br = container.querySelector('td br');
    expect(br).not.toBeNull();
  });

  it('renders standard blockquotes', () => {
    const text = `> **Important**: Do not use \`BigInt\` or \`Number()\` on whole strings; process digit by digit.`;

    act(() => {
      root.render(<MarkdownContent text={text} />);
    });

    const bq = container.querySelector('.markdown-blockquote');
    expect(bq).not.toBeNull();
    expect(bq?.textContent).toContain('Important: Do not use BigInt or Number() on whole strings; process digit by digit.');
    expect(bq?.querySelector('strong')?.textContent).toBe('Important');
    expect(bq?.querySelector('code')?.textContent).toBe('BigInt');
  });

  it('renders GitHub-style alerts with custom or default titles', () => {
    const text = `> [!NOTE] Single-File Sandbox & Module Architecture
> In production Next.js, FavoriteButton lives in its own file.
> In this single-file exercise, do NOT add 'use client'.`;

    act(() => {
      root.render(<MarkdownContent text={text} />);
    });

    const alert = container.querySelector('.markdown-alert.markdown-alert-note');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain('Single-File Sandbox & Module Architecture');
    expect(alert?.textContent).toContain('In production Next.js, FavoriteButton lives in its own file.');
    expect(alert?.textContent).toContain("In this single-file exercise, do NOT add 'use client'.");
  });

  it('renders bold inline code (**`code`**) inside bullet lists', () => {
    const text = `- **\`recordEntry(entry: LayoutShiftEntry): number\`**: Ignores entries.`;

    act(() => {
      root.render(<MarkdownContent text={text} />);
    });

    const strong = container.querySelector('li strong');
    expect(strong).not.toBeNull();
    const code = strong?.querySelector('code');
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe('recordEntry(entry: LayoutShiftEntry): number');
  });

  it('renders inline and display KaTeX math expressions ($...$ and $$...$$)', async () => {
    const text =
      'Maintain a Min-Heap of size $K$ in $O(N \\log K)$ time.\n\n$$T(t) = \\min\\left(C,\\; T(t_0) + \\frac{(t - t_0) \\cdot r}{1000}\\right)$$';

    act(() => {
      root.render(<MarkdownContent text={text} />);
    });

    await vi.waitFor(() => {
      const katexNodes = container.querySelectorAll('.katex');
      expect(katexNodes.length).toBe(3);
      expect(container.querySelector('.markdown-math-display .katex-display')).not.toBeNull();
    });
  });

  it('renders array-trace fenced blocks as visual array boxes with indices', () => {
    const text = [
      '```array-trace',
      JSON.stringify({
        title: 'Trace example',
        rows: [
          {
            caption: 'Step 1:',
            offset: 2,
            items: [
              { value: 10, index: 2, state: 'mid' },
              { value: 20, index: 3, state: 'removed' },
            ],
          },
        ],
      }),
      '```',
    ].join('\n');

    act(() => {
      root.render(<MarkdownContent text={text} />);
    });

    const block = container.querySelector('.array-trace-block');
    expect(block).not.toBeNull();
    expect(block?.textContent).toContain('Trace example');
    expect(block?.textContent).toContain('Step 1:');
    expect(block?.textContent).toContain('10');
    expect(block?.textContent).toContain('20');
  });

  it('renders linked-list fenced blocks with pointers, null termination, and cycles', () => {
    const text = [
      '```linked-list',
      JSON.stringify({
        title: 'Linked List Diagram',
        rows: [
          {
            caption: 'Normal list:',
            nodes: [{ val: 1, pointers: ['head'] }, { val: 2 }],
          },
          {
            caption: 'Cycle list:',
            nodes: [{ val: 1, pointers: ['h'] }, { val: 2, state: 'cycle' }],
            cycleToIndex: 1,
          },
        ],
      }),
      '```',
    ].join('\n');

    act(() => {
      root.render(<MarkdownContent text={text} />);
    });

    const block = container.querySelector('.linked-list-block');
    expect(block).not.toBeNull();
    expect(block?.textContent).toContain('Linked List Diagram');
    expect(block?.textContent).toContain('head');
    expect(block?.textContent).toContain('null');
    expect(block?.querySelector('svg')).not.toBeNull();
  });
});
