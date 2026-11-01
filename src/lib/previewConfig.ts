export type PreviewLibrary = 'react' | 'd3' | 'tailwind' | string;

export interface CardPreviewConfig {
  title: string;
  libraries: PreviewLibrary[];
  isReact: boolean;
}

/**
 * Returns the preview window configuration.
 * Always titled "Live Preview Window", with libraries explicitly loaded
 * based on the card's declared `previewLibraries`.
 */
export function getCardPreviewConfig(card: { id: string; previewLibraries?: string[] }): CardPreviewConfig {
  const libraries = card.previewLibraries || [];
  const isReact = libraries.includes('react');

  return {
    title: 'Live Preview Window',
    libraries,
    isReact,
  };
}
