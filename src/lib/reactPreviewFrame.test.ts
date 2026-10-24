import { describe, it, expect } from 'vitest';
import { createPreviewSrcDoc } from './reactPreviewFrame';
import { stripTestRunnerBlock } from './stripTestRunner';

describe('stripTestRunnerBlock', () => {
  it('strips the test runner block when "// Test runner example:" is present', () => {
    const raw = `function SearchForm({ onSearch }) {
  return <form><input /></form>;
}

// Test runner example:
const { render, fire, q } = $dom;
const { container } = render(<SearchForm />);
$test.check('renders', true);`;

    const expected = `function SearchForm({ onSearch }) {
  return <form><input /></form>;
}`;

    expect(stripTestRunnerBlock(raw)).toBe(expected);
  });

  it('handles Windows CRLF line breaks before and after marker', () => {
    const raw = `function MyComp() {\r\n  return <div>Hello</div>;\r\n}\r\n\r\n// Test runner example:\r\nconst { render } = $dom;\r\n`;
    const expected = `function MyComp() {\r\n  return <div>Hello</div>;\r\n}`;
    expect(stripTestRunnerBlock(raw)).toBe(expected);
  });

  it('leaves code untouched when no test runner block is present', () => {
    const code = `function MyComp() {\n  return <div>Component Only</div>;\n}`;
    expect(stripTestRunnerBlock(code)).toBe(code);
  });

  it('handles empty code gracefully', () => {
    expect(stripTestRunnerBlock('')).toBe('');
    expect(stripTestRunnerBlock('   ')).toBe('   ');
  });
});

describe('createPreviewSrcDoc $dom and $test shims', () => {
  it('injects $dom, $test, and mount safe shims into the preview iframe sandbox', () => {
    const html = createPreviewSrcDoc('dark', 'test-env');
    expect(html).toContain('window.$dom = {');
    expect(html).toContain('window.$test = {');
    expect(html).toContain('window.mount = function() {};');
    expect(html).toContain('render: function(');
    expect(html).toContain('fire: {');
    expect(html).toContain('check: function(');
  });

  it('injects card-specific styles conditionally based on cardId', () => {
    const generic = createPreviewSrcDoc('dark', 'test-env');
    expect(generic).toContain('.flex-row');
    expect(generic).not.toContain('.grid-3x3');
    expect(generic).not.toContain('.kanban-board');
    expect(generic).not.toContain('.toast-viewport');

    const ttt = createPreviewSrcDoc('dark', 'test-env', 'tic-tac-toe');
    expect(ttt).toContain('.grid-3x3');
    expect(ttt).not.toContain('.kanban-board');

    const kanban = createPreviewSrcDoc('dark', 'test-env', 'kanban-board');
    expect(kanban).toContain('.kanban-board');
    expect(kanban).not.toContain('.grid-3x3');

    const toast = createPreviewSrcDoc('dark', 'test-env', 'toast-queue');
    expect(toast).toContain('.toast-viewport');
    expect(toast).not.toContain('.sortable-list');

    const breadcrumbs = createPreviewSrcDoc('dark', 'test-env', 'breadcrumbs-router');
    expect(breadcrumbs).toContain('.breadcrumbs');
    expect(breadcrumbs).not.toContain('.toast-viewport');

    const sortable = createPreviewSrcDoc('dark', 'test-env', 'drag-sortable-list');
    expect(sortable).toContain('.sortable-list');
    expect(sortable).not.toContain('.breadcrumbs');
  });
});

