import { SYNTHWAVE_DARK_PALETTE } from '../styles/colors';

export type TrackType =
  | 'algorithms'
  | 'advanced-algorithms'
  | 'async-js'
  | 'js-language'
  | 'js-utilities'
  | 'dom-browser'
  | 'react'
  | 'react-components'
  | 'd3'
  | 'tailwind'
  | 'typescript-patterns'
  | 'testing-tooling'
  | 'graphql'
  | 'graphql-server'
  | 'node'
  | 'sql-postgres'
  | 'nextjs';

export interface TrackStyleMeta {
  label: string;
  color: string;
  bg: string;
  border: string;
}

const TRACK_LABELS: Record<TrackType, string> = {
  'async-js': 'Async JS',
  'react': 'React Hooks & Patterns',
  'algorithms': 'Algorithms',
  'typescript-patterns': 'TypeScript Patterns',
  'js-language': 'JS Language',
  'dom-browser': 'DOM & Browser',
  'react-components': 'React Components',
  'd3': 'D3',
  'testing-tooling': 'Testing & Tooling',
  'js-utilities': 'JS Utilities',
  'advanced-algorithms': 'Advanced Algorithms',
  'graphql': 'GraphQL',
  'graphql-server': 'GraphQL Server',
  'node': 'Node.js',
  'sql-postgres': 'PostgreSQL',
  'tailwind': 'Tailwind CSS',
  'nextjs': 'Next.js',
};

const DEFAULT_TRACK_STYLE = {
  color: '#94a3b8',
  bg: 'rgba(148, 163, 184, 0.12)',
  border: 'rgba(148, 163, 184, 0.35)',
};

export const TRACK_METADATA: Record<string, TrackStyleMeta> = Object.fromEntries(
  (Object.keys(TRACK_LABELS) as TrackType[]).map((track) => {
    const palette = SYNTHWAVE_DARK_PALETTE.tracks[track] ?? DEFAULT_TRACK_STYLE;
    return [
      track,
      {
        label: TRACK_LABELS[track],
        color: palette.color,
        bg: palette.bg,
        border: palette.border,
      },
    ];
  })
);

export const TRACK_TYPES = Object.keys(TRACK_METADATA) as TrackType[];

export function isTrackType(value: unknown): value is TrackType {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TRACK_METADATA, value);
}

/** React cards (hooks and components) share the React starter/test-harness hints. */
export const isReactTrack = (track: string): boolean =>
  track === 'react' || track === 'react-components';

export function getTrackMeta(track: string): TrackStyleMeta {
  return (
    TRACK_METADATA[track] ?? {
      label: track,
      ...DEFAULT_TRACK_STYLE,
    }
  );
}
