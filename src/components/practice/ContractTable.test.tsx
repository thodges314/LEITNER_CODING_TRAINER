// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import ReactDOM from 'react-dom/client';
import { ContractTable } from './ContractTable';
import type { TestCaseItem } from '../../lib/leitner';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('ContractTable', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOM.Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
    container = null;
    root = null;
  });

  const sampleCases: TestCaseItem[] = [
    { input: 'twoSum([2, 7, 11, 15], 9)', expected: '[0, 1]', description: 'Basic pair' },
    { input: 'twoSum([3, 2, 4], 6)', expected: '[1, 2]', description: 'Indices not ordered' },
    { input: 'twoSum([1], 2)', expected: 'throws Error', description: 'Invalid length' },
  ];

  it('renders nothing when testCases array is empty', async () => {
    await act(async () => {
      root?.render(
        <ContractTable
          contractCases={[]}
          showHarness={true}
          onToggleShowHarness={vi.fn()}
        />
      );
    });

    expect(container?.innerHTML).toBe('');
  });

  it('renders header with case count badge and toggles collapse', async () => {
    const handleToggle = vi.fn();

    await act(async () => {
      root?.render(
        <ContractTable
          contractCases={sampleCases}
          showHarness={true}
          onToggleShowHarness={handleToggle}
        />
      );
    });

    const header = container?.querySelector('.contract-table-header');
    expect(header).toBeDefined();
    expect(header?.textContent).toContain('3 cases');

    const toggleBtn = container?.querySelector('.contract-table-collapse-btn') as HTMLButtonElement | null;
    expect(toggleBtn).toBeDefined();
    expect(toggleBtn?.textContent).toContain('Hide');

    await act(async () => {
      toggleBtn?.click();
    });
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('renders table rows and badges correctly', async () => {
    await act(async () => {
      root?.render(
        <ContractTable
          contractCases={sampleCases}
          showHarness={true}
          onToggleShowHarness={vi.fn()}
        />
      );
    });

    const rows = container?.querySelectorAll('tbody tr');
    expect(rows?.length).toBe(3);

    // Checks description
    expect(rows?.[0].textContent).toContain('Basic pair');
    expect(rows?.[0].textContent).toContain('[0, 1]');

    // Checks error styling class on throws Error
    const errorBadge = rows?.[2].querySelector('.contract-expected-error');
    expect(errorBadge).toBeDefined();
    expect(errorBadge?.textContent).toContain('throws Error');
  });

  it('hides table body when showHarness is false', async () => {
    await act(async () => {
      root?.render(
        <ContractTable
          contractCases={sampleCases}
          showHarness={false}
          onToggleShowHarness={vi.fn()}
        />
      );
    });

    expect(container?.querySelector('tbody')).toBeNull();
    const toggleBtn = container?.querySelector('.contract-table-collapse-btn');
    expect(toggleBtn?.textContent).toContain('Show');
  });
});
