import { describe, it, expect } from 'vitest';
import { getCardPreviewConfig } from './previewConfig';
import { createPreviewSrcDoc } from './reactPreviewFrame';

describe('previewConfig and modular library injection', () => {
  it('always titles the preview as "Live Preview Window"', () => {
    expect(getCardPreviewConfig({ id: 'tic-tac-toe', previewLibraries: ['react'] }).title).toBe('Live Preview Window');
    expect(getCardPreviewConfig({ id: 'd3-graph-theory-visualizer', previewLibraries: ['d3'] }).title).toBe('Live Preview Window');
    expect(getCardPreviewConfig({ id: 'vnode-to-dom', previewLibraries: [] }).title).toBe('Live Preview Window');
  });

  it('correctly configures React cards from explicit previewLibraries', () => {
    const config = getCardPreviewConfig({ id: 'tic-tac-toe', previewLibraries: ['react'] });
    expect(config.isReact).toBe(true);
    expect(config.libraries).toEqual(['react']);

    const html = createPreviewSrcDoc('dark', 'env-react', 'tic-tac-toe', config);
    expect(html).toContain('window.React');
    expect(html).not.toContain('https://cdn.tailwindcss.com');
  });

  it('correctly configures hybrid React + D3 cards from explicit previewLibraries', () => {
    const config = getCardPreviewConfig({ id: 'd3-react-imperative-chart', previewLibraries: ['react', 'd3'] });
    expect(config.isReact).toBe(true);
    expect(config.libraries).toContain('react');
    expect(config.libraries).toContain('d3');

    const html = createPreviewSrcDoc('dark', 'env-hybrid', 'd3-react-imperative-chart', config);
    expect(html).toContain('window.React');
    expect(html).toContain('Mike Bostock');
  });

  it('correctly configures vanilla D3 cards loading only D3 without React', () => {
    const config = getCardPreviewConfig({ id: 'd3-graph-theory-visualizer', previewLibraries: ['d3'] });
    expect(config.isReact).toBe(false);
    expect(config.libraries).toEqual(['d3']);

    const html = createPreviewSrcDoc('dark', 'env-d3', 'd3-graph-theory-visualizer', config);
    // D3 is loaded
    expect(html).toContain('Mike Bostock');
    // React is not bundled or loaded in the preview frame
    expect(html).toContain("Module 'react' is not available in vanilla DOM preview");
  });

  it('correctly configures generic DOM cards without external libraries', () => {
    const config = getCardPreviewConfig({ id: 'vnode-to-dom', previewLibraries: [] });
    expect(config.isReact).toBe(false);
    expect(config.libraries).toEqual([]);

    const html = createPreviewSrcDoc('dark', 'env-vnode', 'vnode-to-dom', config);
    expect(html).toContain("Module 'react' is not available in vanilla DOM preview");
  });

  it('correctly configures Tailwind cards loading Tailwind explicitly', () => {
    const config = getCardPreviewConfig({ id: 'tailwind-pricing-card', previewLibraries: ['tailwind'] });
    expect(config.isReact).toBe(false);
    expect(config.libraries).toContain('tailwind');

    const html = createPreviewSrcDoc('dark', 'env-tailwind', 'tailwind-pricing-card', config);
    expect(html).toContain('https://cdn.tailwindcss.com');
  });

  it('correctly configures Tailwind + React cards loading both explicitly', () => {
    const config = getCardPreviewConfig({ id: 'tailwind-react-card', previewLibraries: ['react', 'tailwind'] });
    expect(config.isReact).toBe(true);
    expect(config.libraries).toContain('react');
    expect(config.libraries).toContain('tailwind');

    const html = createPreviewSrcDoc('dark', 'env-tw-react', 'tailwind-react-card', config);
    expect(html).toContain('window.React');
    expect(html).toContain('https://cdn.tailwindcss.com');
  });

  it('falls back to track when previewLibraries is undefined', () => {
    const reactConfig = getCardPreviewConfig({ id: 'react-card', track: 'react' });
    expect(reactConfig.isReact).toBe(true);
    expect(reactConfig.libraries).toContain('react');

    const d3Config = getCardPreviewConfig({ id: 'd3-card', track: 'd3' });
    expect(d3Config.isReact).toBe(false);
    expect(d3Config.libraries).toEqual([]);
  });
});
