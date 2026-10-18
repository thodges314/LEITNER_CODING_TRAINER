import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { PieChart, Activity, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TopicItem, LeitnerDeckState, TrackType } from '../lib/leitner';
import { getTrackMeta } from '../lib/leitner';
import type { AppTheme } from '../lib/theme';

export type StatsViewMode = 'orbit' | 'radar' | 'tiers';

interface DeckStatsWidgetProps {
  state: LeitnerDeckState;
  topics: TopicItem[];
  theme?: AppTheme;
  onSelectTrack?: (track: string) => void;
}

const DARK_TRACK_COLORS: Record<string, string> = {
  'algorithms': '#f59e0b',
  'async-js': '#06b6d4',
  'js-language': '#f97316',
  'js-utilities': '#10b981',
  'dom-browser': '#84cc16',
  'react': '#38bdf8',
  'react-components': '#818cf8',
  'typescript-patterns': '#3b82f6',
  'testing-tooling': '#f43f5e',
};

const GSOS_TRACK_COLORS: Record<string, string> = {
  'algorithms': '#b45309',
  'async-js': '#0284c7',
  'js-language': '#c2410c',
  'js-utilities': '#047857',
  'dom-browser': '#4d7c0f',
  'react': '#0e7490',
  'react-components': '#4338ca',
  'typescript-patterns': '#1d4ed8',
  'testing-tooling': '#be123c',
};

const RADAR_DOMAINS: { id: string; label: string; tracks: TrackType[] }[] = [
  { id: 'algorithms', label: 'Algorithms', tracks: ['algorithms'] },
  { id: 'async', label: 'Concurrency', tracks: ['async-js'] },
  { id: 'react', label: 'React & UI', tracks: ['react', 'react-components'] },
  { id: 'typescript', label: 'TypeScript', tracks: ['typescript-patterns'] },
  { id: 'dom', label: 'DOM & Web APIs', tracks: ['dom-browser'] },
  { id: 'core', label: 'JS Core & Tools', tracks: ['js-language', 'js-utilities', 'testing-tooling'] },
];

export const DeckStatsWidget: React.FC<DeckStatsWidgetProps> = ({
  topics,
  theme,
  onSelectTrack,
}) => {
  const isLight = theme === 'apple-gsos';
  const [mode, setMode] = useState<StatsViewMode>('orbit');
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);

  const trackColors = isLight ? GSOS_TRACK_COLORS : DARK_TRACK_COLORS;

  const activeTopics = useMemo(() => topics.filter((t) => t.status === 'active'), [topics]);

  // Track breakdown for Orbit
  const trackStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of activeTopics) {
      counts[t.track] = (counts[t.track] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([track, count]) => ({
        track: track as TrackType,
        count,
        label: getTrackMeta(track).label,
        color: trackColors[track] || '#94a3b8',
        percentage: activeTopics.length > 0 ? (count / activeTopics.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [activeTopics, trackColors]);

  // Radar data
  const radarData = useMemo(() => {
    return RADAR_DOMAINS.map((domain) => {
      const domainCards = activeTopics.filter((t) => domain.tracks.includes(t.track));
      const count = domainCards.length;
      const avgBox =
        count > 0 ? domainCards.reduce((acc, c) => acc + (c.box || 1), 0) / count : 0;
      const score = Math.min(5, Math.max(0.5, avgBox)); // scale 1-5
      return {
        ...domain,
        count,
        avgBox,
        score,
      };
    });
  }, [activeTopics]);

  // Box Tier Breakdown
  const boxStats = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const t of activeTopics) {
      const b = Math.min(5, Math.max(1, t.box || 1));
      counts[b] = (counts[b] || 0) + 1;
    }
    const colors: Record<number, string> = {
      1: isLight ? '#dd3322' : '#fb7185',
      2: isLight ? '#c2410c' : '#f97316',
      3: isLight ? '#d97706' : '#fbbf24',
      4: isLight ? '#0284c7' : '#38bdf8',
      5: isLight ? '#229955' : '#34d399',
    };
    const intervals: Record<number, string> = {
      1: '+1 trial interval',
      2: '+3/4 trial interval',
      3: '+7/10 trial interval',
      4: '+16/22 trial interval',
      5: '+35/45 trial interval (Mastered)',
    };
    const names: Record<number, string> = {
      1: 'Box 1: Learning',
      2: 'Box 2: Emerging',
      3: 'Box 3: Consolidating',
      4: 'Box 4: Retention',
      5: 'Box 5+: Mastered',
    };
    return [5, 4, 3, 2, 1].map((box) => ({
      box,
      name: names[box],
      count: counts[box] || 0,
      color: colors[box],
      interval: intervals[box],
      percentage: activeTopics.length > 0 ? ((counts[box] || 0) / activeTopics.length) * 100 : 0,
    }));
  }, [activeTopics, isLight]);

  const modes: { id: StatsViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'orbit', label: 'Track Orbit', icon: <PieChart size={13} /> },
    { id: 'radar', label: 'Skill Matrix', icon: <Activity size={13} /> },
    { id: 'tiers', label: 'Mastery Tiers', icon: <Layers size={13} /> },
  ];

  const handleNextMode = () => {
    setMode((prev) => {
      if (prev === 'orbit') return 'radar';
      if (prev === 'radar') return 'tiers';
      return 'orbit';
    });
  };

  const handlePrevMode = () => {
    setMode((prev) => {
      if (prev === 'orbit') return 'tiers';
      if (prev === 'tiers') return 'radar';
      return 'orbit';
    });
  };

  // SVG dimensions
  const width = 280;
  const height = 220;
  const centerX = width / 2;
  const centerY = height / 2;

  // D3 Orbit Arc Generator
  const pieGenerator = useMemo(() => {
    return d3
      .pie<{ track: TrackType; count: number; label: string; color: string; percentage: number }>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.02);
  }, []);

  const arcGenerator = useMemo(() => {
    return d3.arc<d3.PieArcDatum<{ track: TrackType; count: number; label: string; color: string; percentage: number }>>()
      .innerRadius(54)
      .outerRadius(82)
      .cornerRadius(3);
  }, []);

  const hoveredArcGenerator = useMemo(() => {
    return d3.arc<d3.PieArcDatum<{ track: TrackType; count: number; label: string; color: string; percentage: number }>>()
      .innerRadius(52)
      .outerRadius(88)
      .cornerRadius(4);
  }, []);

  const pieSlices = useMemo(() => {
    return pieGenerator(trackStats);
  }, [pieGenerator, trackStats]);

  // D3 Radar Generator
  const radarRadius = 78;
  const angleSlice = (Math.PI * 2) / RADAR_DOMAINS.length;

  const radarPoints = useMemo(() => {
    const scale = d3.scaleLinear().domain([0, 5]).range([0, radarRadius]);
    const points = radarData.map((d, i) => {
      const r = scale(d.score);
      const angle = i * angleSlice - Math.PI / 2;
      return {
        ...d,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        axisX: centerX + radarRadius * Math.cos(angle),
        axisY: centerY + radarRadius * Math.sin(angle),
        labelX: centerX + (radarRadius + 16) * Math.cos(angle),
        labelY: centerY + (radarRadius + 14) * Math.sin(angle),
      };
    });
    const pathString =
      points.length > 0 ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z' : '';
    return { points, pathString };
  }, [radarData, angleSlice, centerX, centerY, radarRadius]);

  const activeTrackObj = trackStats.find((t) => t.track === hoveredTrack);
  const activeDomainObj = radarData.find((d) => d.id === hoveredDomain);
  const activeBoxObj = boxStats.find((b) => b.box === hoveredBox);

  return (
    <div
      className="glass-panel"
      data-testid="deck-stats-widget"
      style={{
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '12px',
        height: '100%',
        minHeight: '260px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header & View Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Analytics & Proportions
          </span>
        </div>

        {/* View Toggle Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={handlePrevMode}
            className="btn btn-secondary"
            style={{ padding: '3px 6px', fontSize: '11px' }}
            title="Previous chart"
            aria-label="Previous chart"
          >
            <ChevronLeft size={13} />
          </button>

          <div
            style={{
              display: 'inline-flex',
              backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
              borderRadius: '6px',
              padding: '2px',
              gap: '2px',
            }}
          >
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                data-testid={`stats-mode-${m.id}`}
                title={m.label}
                onClick={() => setMode(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: mode === m.id ? 600 : 500,
                  backgroundColor:
                    mode === m.id
                      ? isLight
                        ? '#ffffff'
                        : 'rgba(56, 189, 248, 0.2)'
                      : 'transparent',
                  color:
                    mode === m.id
                      ? isLight
                        ? '#2B3A8C'
                        : 'var(--accent-cyan)'
                      : 'var(--text-muted)',
                  boxShadow: mode === m.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNextMode}
            className="btn btn-secondary"
            style={{ padding: '3px 6px', fontSize: '11px' }}
            title="Next chart"
            aria-label="Next chart"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Main Visual SVG Body */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          position: 'relative',
        }}
      >
        {activeTopics.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            No active cards in rotation yet. Unlock topics to see live proportion analytics.
          </div>
        ) : mode === 'orbit' ? (
          /* Mode 1: Track Orbit Donut */
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg data-testid="stats-chart-svg" width={width} height={height} style={{ overflow: 'visible' }}>
              <g transform={`translate(${centerX}, ${centerY})`}>
                {pieSlices.map((slice) => {
                  const isHovered = hoveredTrack === slice.data.track;
                  const path = (isHovered ? hoveredArcGenerator(slice) : arcGenerator(slice)) || '';
                  return (
                    <path
                      key={slice.data.track}
                      data-track={slice.data.track}
                      d={path}
                      fill={slice.data.color}
                      stroke={isLight ? '#ffffff' : '#030712'}
                      strokeWidth={1.5}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: hoveredTrack && !isHovered ? 0.45 : 1,
                        filter: isHovered && !isLight ? `drop-shadow(0 0 6px ${slice.data.color})` : 'none',
                      }}
                      onMouseEnter={() => setHoveredTrack(slice.data.track)}
                      onMouseLeave={() => setHoveredTrack(null)}
                      onClick={() => onSelectTrack && onSelectTrack(slice.data.track)}
                    />
                  );
                })}

                {/* Center Readout */}
                <circle
                  r={50}
                  fill={isLight ? '#f8fafc' : '#061320'}
                  stroke={isLight ? '#e2e8f0' : 'rgba(56, 189, 248, 0.15)'}
                  strokeWidth={1}
                />
                <text
                  textAnchor="middle"
                  dy="-4"
                  style={{
                    fontSize: activeTrackObj ? '13px' : '17px',
                    fontWeight: 700,
                    fill: isLight ? '#0f172a' : '#f1f5f9',
                    fontFamily: 'inherit',
                  }}
                >
                  {activeTrackObj ? `${activeTrackObj.count} cards` : `${activeTopics.length}`}
                </text>
                <text
                  textAnchor="middle"
                  dy="14"
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 500,
                    fill: activeTrackObj ? activeTrackObj.color : 'var(--text-muted)',
                    fontFamily: 'inherit',
                  }}
                >
                  {activeTrackObj ? `${activeTrackObj.percentage.toFixed(0)}% of deck` : 'Active Cards'}
                </text>
              </g>
            </svg>

            {/* Current Hover Track Badge / Caption */}
            <div
              style={{
                marginTop: '-4px',
                fontSize: '11px',
                fontWeight: 600,
                color: activeTrackObj ? activeTrackObj.color : 'var(--text-secondary)',
                minHeight: '16px',
                textAlign: 'center',
              }}
            >
              {activeTrackObj ? (
                <span>
                  {activeTrackObj.label} (click to focus)
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                  Hover over slices to inspect track distributions
                </span>
              )}
            </div>
          </div>
        ) : mode === 'radar' ? (
          /* Mode 2: Skill Matrix Radar */
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg data-testid="stats-chart-svg" width={width} height={height} style={{ overflow: 'visible' }}>
              <g>
                {/* Background Concentric Grid Rings */}
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const r = (radarRadius / 5) * lvl;
                  return (
                    <circle
                      key={lvl}
                      cx={centerX}
                      cy={centerY}
                      r={r}
                      fill="none"
                      stroke={isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.07)'}
                      strokeDasharray={lvl < 5 ? '2,2' : undefined}
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Axis lines and domain labels */}
                {radarPoints.points.map((p) => {
                  return (
                    <g key={p.id}>
                      <line
                        x1={centerX}
                        y1={centerY}
                        x2={p.axisX}
                        y2={p.axisY}
                        stroke={isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.08)'}
                        strokeWidth={1}
                      />
                      <text
                        x={p.labelX}
                        y={p.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: '9.5px',
                          fontWeight: hoveredDomain === p.id ? 700 : 500,
                          fill:
                            hoveredDomain === p.id
                              ? isLight
                                ? '#2B3A8C'
                                : 'var(--accent-cyan)'
                              : 'var(--text-muted)',
                        }}
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                })}

                {/* Filled Mastery Polygon */}
                {radarPoints.pathString && (
                  <path
                    d={radarPoints.pathString}
                    fill={isLight ? 'rgba(68, 85, 170, 0.22)' : 'rgba(56, 189, 248, 0.2)'}
                    stroke={isLight ? '#4455AA' : '#38bdf8'}
                    strokeWidth={2}
                    style={{
                      transition: 'all 0.2s ease',
                      filter: !isLight ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.35))' : 'none',
                    }}
                  />
                )}

                {/* Vertex Dots */}
                {radarPoints.points.map((p) => (
                  <circle
                    key={p.id}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredDomain === p.id ? 5.5 : 3.5}
                    fill={isLight ? '#4455AA' : '#38bdf8'}
                    stroke={isLight ? '#ffffff' : '#030712'}
                    strokeWidth={1.5}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={() => setHoveredDomain(p.id)}
                    onMouseLeave={() => setHoveredDomain(null)}
                  />
                ))}
              </g>
            </svg>

            {/* Radar Legend / Hover Note */}
            <div
              style={{
                marginTop: '-4px',
                fontSize: '11px',
                fontWeight: 600,
                color: activeDomainObj
                  ? isLight
                    ? '#2B3A8C'
                    : 'var(--accent-cyan)'
                  : 'var(--text-secondary)',
                minHeight: '16px',
                textAlign: 'center',
              }}
            >
              {activeDomainObj ? (
                <span>
                  {activeDomainObj.label}: {activeDomainObj.count} cards • Avg Tier{' '}
                  {activeDomainObj.avgBox.toFixed(1)}
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                  Outer rings represent higher Leitner tier mastery
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Mode 3: Mastery Tiers Concentric Rings */
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg data-testid="stats-chart-svg" width={width} height={height} style={{ overflow: 'visible' }}>
              <g transform={`translate(${centerX}, ${centerY})`}>
                {boxStats.map((item, idx) => {
                  const r = 32 + idx * 13;
                  const isHovered = hoveredBox === item.box;
                  const maxArcAngle = Math.PI * 1.7; // 306 degrees arc
                  const fraction = activeTopics.length > 0 ? item.count / activeTopics.length : 0;
                  const arcAngle = Math.max(0.04, fraction * maxArcAngle);

                  const bgArc = d3
                    .arc<void>()
                    .innerRadius(r - 4)
                    .outerRadius(r + 4)
                    .startAngle(-maxArcAngle / 2)
                    .endAngle(maxArcAngle / 2)
                    .cornerRadius(4)();

                  const fgArc = d3
                    .arc<void>()
                    .innerRadius(r - 4)
                    .outerRadius(r + 4)
                    .startAngle(-maxArcAngle / 2)
                    .endAngle(-maxArcAngle / 2 + arcAngle)
                    .cornerRadius(4)();

                  return (
                    <g
                      key={item.box}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredBox(item.box)}
                      onMouseLeave={() => setHoveredBox(null)}
                    >
                      {/* Track background */}
                      <path
                        d={bgArc || ''}
                        fill={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)'}
                      />
                      {/* Progress arc */}
                      <path
                        d={fgArc || ''}
                        fill={item.color}
                        style={{
                          opacity: hoveredBox && !isHovered ? 0.35 : 1,
                          transition: 'all 0.2s ease',
                          filter: isHovered && !isLight ? `drop-shadow(0 0 6px ${item.color})` : 'none',
                        }}
                      />
                    </g>
                  );
                })}

                {/* Center Gauge */}
                <text
                  textAnchor="middle"
                  dy="-4"
                  style={{
                    fontSize: activeBoxObj ? '14px' : '16px',
                    fontWeight: 700,
                    fill: isLight ? '#0f172a' : '#f1f5f9',
                  }}
                >
                  {activeBoxObj ? `${activeBoxObj.count} cards` : `${activeTopics.length}`}
                </text>
                <text
                  textAnchor="middle"
                  dy="12"
                  style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    fill: activeBoxObj ? activeBoxObj.color : 'var(--text-muted)',
                  }}
                >
                  {activeBoxObj ? activeBoxObj.interval : 'Active Cards'}
                </text>
              </g>
            </svg>

            {/* Tier Legend / Hover Note */}
            <div
              style={{
                marginTop: '-4px',
                fontSize: '11px',
                fontWeight: 600,
                color: activeBoxObj ? activeBoxObj.color : 'var(--text-secondary)',
                minHeight: '16px',
                textAlign: 'center',
              }}
            >
              {activeBoxObj ? (
                <span>
                  {activeBoxObj.name}: {activeBoxObj.percentage.toFixed(0)}% of rotation
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                  Outer rings = Mastered tiers; inner rings = Learning tiers
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
