import type { AppTheme } from '../lib/theme';

export interface ThemePalette {
  isLight: boolean;
  bgMain: string;
  bgAppShell: string;
  bgSurface: string;
  bgCard: string;
  bgElevated: string;
  bgEditor: string;
  bgNavigation: string;
  bgTableHeader: string;
  bgTableBody: string;
  bgTableRowHover: string;
  bgModalOverlay: string;

  borderSubtle: string;
  borderMedium: string;
  borderFocus: string;
  borderUi: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;
  textOnAccent: string;

  accentPrimary: string;
  accentSecondary: string;
  accentHighlight: string;
  accentCyan: string;
  accentPurple: string;
  accentTeal: string;
  accentAmber: string;
  accentRose: string;
  accentEmerald: string;
  accentOrange: string;

  boxes: Record<number, string>;
  difficulty: Record<number, string>;
  tracks: Record<string, { color: string; bg: string; border: string }>;
}

export const SYNTHWAVE_DARK_PALETTE: ThemePalette = {
  isLight: false,
  bgMain: '#090c12',
  bgAppShell: '#090c12',
  bgSurface: '#0f141f',
  bgCard: '#141b29',
  bgElevated: '#1a2336',
  bgEditor: '#0c1018',
  bgNavigation: 'rgba(15, 20, 31, 0.85)',
  bgTableHeader: 'rgba(56, 189, 248, 0.12)',
  bgTableBody: 'rgba(2, 6, 23, 0.6)',
  bgTableRowHover: 'rgba(255, 255, 255, 0.03)',
  bgModalOverlay: 'rgba(0, 0, 0, 0.75)',

  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderMedium: 'rgba(255, 255, 255, 0.16)',
  borderFocus: 'rgba(56, 189, 248, 0.5)',
  borderUi: 'rgba(255, 255, 255, 0.16)',

  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textDim: '#475569',
  textOnAccent: '#ffffff',

  accentPrimary: '#38bdf8',
  accentSecondary: '#34d399',
  accentHighlight: '#fb7185',
  accentCyan: '#38bdf8',
  accentPurple: '#c084fc',
  accentTeal: '#2dd4bf',
  accentAmber: '#fbbf24',
  accentRose: '#fb7185',
  accentEmerald: '#34d399',
  accentOrange: '#f97316',

  boxes: {
    1: '#fb7185',
    2: '#f97316',
    3: '#fbbf24',
    4: '#38bdf8',
    5: '#34d399',
    6: '#2dd4bf',
    7: '#818cf8',
    8: '#a78bfa',
    9: '#f472b6',
  },
  difficulty: {
    1: '#34d399',
    2: '#a3e635',
    3: '#fbbf24',
    4: '#fb923c',
    5: '#f87171',
  },
  tracks: {
    'async-js': {
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.35)',
    },
    'react': {
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.35)',
    },
    'algorithms': {
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
    },
    'typescript-patterns': {
      color: '#3178c6',
      bg: 'rgba(49, 120, 198, 0.12)',
      border: 'rgba(49, 120, 198, 0.35)',
    },
    'js-language': {
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.12)',
      border: 'rgba(249, 115, 22, 0.35)',
    },
    'dom-browser': {
      color: '#84cc16',
      bg: 'rgba(132, 204, 22, 0.12)',
      border: 'rgba(132, 204, 22, 0.35)',
    },
    'react-components': {
      color: '#22d3ee',
      bg: 'rgba(34, 211, 238, 0.12)',
      border: 'rgba(34, 211, 238, 0.35)',
    },
    'testing-tooling': {
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.35)',
    },
    'js-utilities': {
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
    },
    'node': {
      color: '#4ade80',
      bg: 'rgba(74, 222, 128, 0.12)',
      border: 'rgba(74, 222, 128, 0.35)',
    },
  },
};

export const APPLE_GSOS_PALETTE: ThemePalette = {
  isLight: true,
  bgMain: '#DDDCD4',
  bgAppShell: '#DDDCD4',
  bgSurface: '#F2F1EA',
  bgCard: '#FFFFFF',
  bgElevated: '#E8E7DF',
  bgEditor: '#FAFAFA',
  bgNavigation: '#F2F1EA',
  bgTableHeader: '#A2B5CD',
  bgTableBody: '#FFFFFF',
  bgTableRowHover: '#F0EFE8',
  bgModalOverlay: 'rgba(60, 60, 60, 0.6)',

  borderSubtle: '#D0CEBE',
  borderMedium: '#8A887E',
  borderFocus: '#4455AA',
  borderUi: '#1C1C1C',

  textPrimary: '#1C1C1C',
  textSecondary: '#555555',
  textMuted: '#555555',
  textDim: '#777777',
  textOnAccent: '#FFFFFF',

  accentPrimary: '#4455AA',
  accentSecondary: '#229955',
  accentHighlight: '#DD3322',
  accentCyan: '#4455AA',
  accentPurple: '#5544AA',
  accentTeal: '#229955',
  accentAmber: '#D97706',
  accentRose: '#DD3322',
  accentEmerald: '#229955',
  accentOrange: '#D97706',

  boxes: {
    1: '#DD3322',
    2: '#D97706',
    3: '#B45309',
    4: '#4455AA',
    5: '#229955',
    6: '#1B7A43',
    7: '#5544AA',
    8: '#6B46C1',
    9: '#990055',
  },
  difficulty: {
    1: '#15803D',
    2: '#4D7C0F',
    3: '#B45309',
    4: '#C2410C',
    5: '#DC2626',
  },
  tracks: {
    'async-js': {
      color: '#0369A1',
      bg: '#E0F2FE',
      border: '#7DD3FC',
    },
    'react': {
      color: '#0E7490',
      bg: '#CFFAFE',
      border: '#67E8F9',
    },
    'algorithms': {
      color: '#B45309',
      bg: '#FEF3C7',
      border: '#FCD34D',
    },
    'typescript-patterns': {
      color: '#1E40AF',
      bg: '#DBEAFE',
      border: '#93C5FD',
    },
    'js-language': {
      color: '#C2410C',
      bg: '#FFEDD5',
      border: '#FDBA74',
    },
    'dom-browser': {
      color: '#4D7C0F',
      bg: '#ECFCCB',
      border: '#BEF264',
    },
    'react-components': {
      color: '#0284C7',
      bg: '#E0F2FE',
      border: '#7DD3FC',
    },
    'testing-tooling': {
      color: '#BE123C',
      bg: '#FFE4E6',
      border: '#FDA4AF',
    },
    'js-utilities': {
      color: '#047857',
      bg: '#D1FAE5',
      border: '#6EE7B7',
    },
    'node': {
      color: '#15803d',
      bg: '#DCFCE7',
      border: '#86EFAC',
    },
  },
};

/**
 * Returns the theme palette for the given theme mode ('dark' or 'apple-gsos').
 */
export function getThemeColors(theme?: AppTheme | string): ThemePalette {
  return theme === 'apple-gsos' ? APPLE_GSOS_PALETTE : SYNTHWAVE_DARK_PALETTE;
}
