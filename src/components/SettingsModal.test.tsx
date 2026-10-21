// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { SettingsModal } from './SettingsModal';
import { getTsHoverEnabled, setTsHoverEnabled } from '../lib/editorSettings';

// @ts-expect-error IS_REACT_ACT_ENVIRONMENT is a React global flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('SettingsModal TypeScript Hover Toggle', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOMClient.Root | null = null;

  beforeEach(() => {
    localStorage.clear();
    setTsHoverEnabled(true);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOMClient.createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = null;
    root = null;
    localStorage.clear();
  });

  it('renders the TypeScript hover tooltips checkbox with default enabled state', async () => {
    await act(async () => {
      root?.render(
        <SettingsModal
          isOpen={true}
          onClose={vi.fn()}
        />
      );
    });

    const checkbox = container?.querySelector('#ts-hover-tooltips-checkbox') as HTMLInputElement | null;
    expect(checkbox).not.toBeNull();
    expect(checkbox?.checked).toBe(true);
    expect(getTsHoverEnabled()).toBe(true);
  });

  it('toggles TypeScript hover tooltips off and updates localStorage and callbacks', async () => {
    const onSettingsSaved = vi.fn();

    await act(async () => {
      root?.render(
        <SettingsModal
          isOpen={true}
          onClose={vi.fn()}
          onSettingsSaved={onSettingsSaved}
        />
      );
    });

    const checkbox = container?.querySelector('#ts-hover-tooltips-checkbox') as HTMLInputElement | null;
    expect(checkbox).not.toBeNull();

    await act(async () => {
      checkbox?.click();
    });

    expect(checkbox?.checked).toBe(false);
    expect(getTsHoverEnabled()).toBe(false);
    expect(onSettingsSaved).toHaveBeenCalled();

    // Re-toggling it turns it back on
    await act(async () => {
      checkbox?.click();
    });

    expect(checkbox?.checked).toBe(true);
    expect(getTsHoverEnabled()).toBe(true);
  });

  it('initializes as unchecked when previously disabled in localStorage', async () => {
    setTsHoverEnabled(false);

    await act(async () => {
      root?.render(
        <SettingsModal
          isOpen={true}
          onClose={vi.fn()}
        />
      );
    });

    const checkbox = container?.querySelector('#ts-hover-tooltips-checkbox') as HTMLInputElement | null;
    expect(checkbox).not.toBeNull();
    expect(checkbox?.checked).toBe(false);
  });
});

