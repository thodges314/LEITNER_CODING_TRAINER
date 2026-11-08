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

export const TRACK_METADATA: Record<string, TrackStyleMeta> = {
  'async-js': {
    label: 'Async JS',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.35)',
  },
  'react': {
    label: 'React Hooks & Patterns',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
  },
  'algorithms': {
    label: 'Algorithms',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  'typescript-patterns': {
    label: 'TypeScript Patterns',
    color: '#3178c6',
    bg: 'rgba(49, 120, 198, 0.12)',
    border: 'rgba(49, 120, 198, 0.35)',
  },
  'js-language': {
    label: 'JS Language',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
  },
  'dom-browser': {
    label: 'DOM & Browser',
    color: '#84cc16',
    bg: 'rgba(132, 204, 22, 0.12)',
    border: 'rgba(132, 204, 22, 0.35)',
  },
  'react-components': {
    label: 'React Components',
    color: '#22d3ee',
    bg: 'rgba(34, 211, 238, 0.12)',
    border: 'rgba(34, 211, 238, 0.35)',
  },
  'd3': {
    label: 'D3',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
  },
  'testing-tooling': {
    label: 'Testing & Tooling',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.35)',
  },
  'js-utilities': {
    label: 'JS Utilities',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
  },
  'advanced-algorithms': {
    label: 'Advanced Algorithms',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.35)',
  },
  'graphql': {
    label: 'GraphQL',
    color: '#e535ab',
    bg: 'rgba(229, 53, 171, 0.12)',
    border: 'rgba(229, 53, 171, 0.35)',
  },
  'graphql-server': {
    label: 'GraphQL Server',
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.12)',
    border: 'rgba(192, 132, 252, 0.35)',
  },
  'node': {
    label: 'Node.js',
    color: '#4ade80',
    bg: 'rgba(74, 222, 128, 0.12)',
    border: 'rgba(74, 222, 128, 0.35)',
  },
  'sql-postgres': {
    label: 'PostgreSQL',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.35)',
  },
  'tailwind': {
    label: 'Tailwind CSS',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
  },
  'nextjs': {
    label: 'Next.js',
    color: '#f8fafc',
    bg: 'rgba(248, 250, 252, 0.12)',
    border: 'rgba(248, 250, 252, 0.35)',
  },
};

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
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.12)',
      border: 'rgba(148, 163, 184, 0.35)',
    }
  );
}

