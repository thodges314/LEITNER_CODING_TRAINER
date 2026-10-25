// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import ReactDOM from 'react-dom/client';
import { PropsControlPanel } from './PropsControlPanel';
import type { PropDefinition } from '../../lib/previewPropsConfig';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockPropDefs: PropDefinition[] = [
  { name: 'value', type: 'number', defaultValue: 45, min: 0, max: 100 },
  { name: 'label', type: 'string', defaultValue: 'Progress' },
  { name: 'indeterminate', type: 'boolean', defaultValue: false },
  { name: 'placement', type: 'enum', defaultValue: 'top', options: ['top', 'bottom', 'left', 'right'] },
  { name: 'onChange', type: 'function', description: 'Callback on change' },
];

function setInputValue(input: HTMLInputElement, value: string) {
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  nativeSetter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('PropsControlPanel', () => {
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

  it('renders empty hint when propDefs array is empty', async () => {
    const onChange = vi.fn();
    const onReset = vi.fn();

    await act(async () => {
      root?.render(
        <PropsControlPanel
          cardId="test-card"
          propDefs={[]}
          values={{}}
          onChange={onChange}
          onReset={onReset}
        />
      );
    });

    const emptyHint = container?.querySelector('[data-testid="props-empty-hint"]');
    expect(emptyHint?.textContent).toContain('No configurable props');
    expect(container?.querySelector('[data-testid="props-reset-btn"]')).toBeNull();
  });

  it('renders slots for number, string, boolean, enum, and function props', async () => {
    const onChange = vi.fn();
    const onReset = vi.fn();

    await act(async () => {
      root?.render(
        <PropsControlPanel
          cardId="test-card"
          propDefs={mockPropDefs}
          values={{
            value: 45,
            label: 'Progress',
            indeterminate: false,
            placement: 'top',
          }}
          onChange={onChange}
          onReset={onReset}
        />
      );
    });

    expect(container?.querySelector('[data-testid="props-count-badge"]')?.textContent).toBe('5 props');
    const numberInput = container?.querySelector('[data-testid="prop-input-value"]') as HTMLInputElement;
    expect(numberInput.value).toBe('45');

    const stringInput = container?.querySelector('[data-testid="prop-input-label"]') as HTMLInputElement;
    expect(stringInput.value).toBe('Progress');

    const falseBtn = container?.querySelector('[data-testid="prop-bool-false-indeterminate"]');
    expect(falseBtn?.classList.contains('active-false')).toBe(true);

    const select = container?.querySelector('[data-testid="prop-select-placement"]') as HTMLSelectElement;
    expect(select.value).toBe('top');

    const fnBadge = container?.querySelector('[data-testid="prop-function-onChange"]');
    expect(fnBadge?.textContent).toContain('(callback) → auto-logged');
  });

  it('handles number changes and clearing', async () => {
    const onChange = vi.fn();
    const onReset = vi.fn();

    await act(async () => {
      root?.render(
        <PropsControlPanel
          cardId="test-card"
          propDefs={mockPropDefs}
          values={{ value: 45 }}
          onChange={onChange}
          onReset={onReset}
        />
      );
    });

    const input = container?.querySelector('[data-testid="prop-input-value"]') as HTMLInputElement;

    await act(async () => {
      setInputValue(input, '75');
    });
    expect(onChange).toHaveBeenCalledWith('value', 75);

    await act(async () => {
      setInputValue(input, '');
    });
    expect(onChange).toHaveBeenCalledWith('value', undefined);
  });

  it('handles string changes', async () => {
    const onChange = vi.fn();
    const onReset = vi.fn();

    await act(async () => {
      root?.render(
        <PropsControlPanel
          cardId="test-card"
          propDefs={mockPropDefs}
          values={{ label: 'Upload' }}
          onChange={onChange}
          onReset={onReset}
        />
      );
    });

    const input = container?.querySelector('[data-testid="prop-input-label"]') as HTMLInputElement;

    await act(async () => {
      setInputValue(input, 'Download Progress');
    });
    expect(onChange).toHaveBeenCalledWith('label', 'Download Progress');
  });

  it('handles tri-state boolean selection (true, false, undefined)', async () => {
    const onChange = vi.fn();
    const onReset = vi.fn();

    await act(async () => {
      root?.render(
        <PropsControlPanel
          cardId="test-card"
          propDefs={mockPropDefs}
          values={{ indeterminate: false }}
          onChange={onChange}
          onReset={onReset}
        />
      );
    });

    const trueBtn = container?.querySelector('[data-testid="prop-bool-true-indeterminate"]') as HTMLButtonElement;
    await act(async () => {
      trueBtn.click();
    });
    expect(onChange).toHaveBeenCalledWith('indeterminate', true);

    const undefBtn = container?.querySelector('[data-testid="prop-bool-undefined-indeterminate"]') as HTMLButtonElement;
    await act(async () => {
      undefBtn.click();
    });
    expect(onChange).toHaveBeenCalledWith('indeterminate', undefined);
  });

  it('handles enum select option changes', async () => {
    const onChange = vi.fn();
    const onReset = vi.fn();

    await act(async () => {
      root?.render(
        <PropsControlPanel
          cardId="test-card"
          propDefs={mockPropDefs}
          values={{ placement: 'top' }}
          onChange={onChange}
          onReset={onReset}
        />
      );
    });

    const select = container?.querySelector('[data-testid="prop-select-placement"]') as HTMLSelectElement;

    await act(async () => {
      select.value = 'bottom';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith('placement', 'bottom');

    await act(async () => {
      select.value = '__undefined__';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith('placement', undefined);
  });

  it('triggers onReset when clicking Reset Defaults button', async () => {
    const onChange = vi.fn();
    const onReset = vi.fn();

    await act(async () => {
      root?.render(
        <PropsControlPanel
          cardId="test-card"
          propDefs={mockPropDefs}
          values={{ value: 99 }}
          onChange={onChange}
          onReset={onReset}
        />
      );
    });

    const resetBtn = container?.querySelector('[data-testid="props-reset-btn"]') as HTMLButtonElement;
    await act(async () => {
      resetBtn.click();
    });
    expect(onReset).toHaveBeenCalled();
  });
});
