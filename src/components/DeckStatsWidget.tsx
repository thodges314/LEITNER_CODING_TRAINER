import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Activity, BarChart3, PieChart, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActivityView } from './ActivityView';
import type { TopicItem, LeitnerDeckState, TrackType } from '../lib/leitner';
import { getTrackMeta, getSchedulingAlgorithm } from '../lib/leitner';
import type { AppTheme } from '../lib/theme';
import { getThemeColors } from '../styles/colors';

export type StatsViewMode = 'radar' | 'orbit' | 'tiers' | 'activity';

interface DeckStatsWidgetProps {
  state: LeitnerDeckState;
  topics: TopicItem[];
  theme?: AppTheme;
  selectedTracks?: string[];
  selectedBox?: number | number[] | 'all';
  displayedBoxes?: number[];
  onSelectExclusiveTrack?: (track: string) => void;
  onSelectExclusiveTracks?: (tracks: string[]) => void;
  onSelectExclusiveBox?: (box: number | number[] | 'all') => void;
  onSelectCardToPractice?: (card: TopicItem) => void;
  /** Backwards compatibility alias */
  onSelectTrack?: (track: string) => void;
}

const RADAR_DOMAINS: { id: string; label: string; tracks: TrackType[] }[] = [
  { id: 'algorithms', label: 'Algorithms', tracks: ['algorithms'] },
  { id: 'async', label: 'Concurrency', tracks: ['async-js'] },
  { id: 'react', label: 'React & UI', tracks: ['react', 'react-components'] },
  { id: 'typescript', label: 'TypeScript', tracks: ['typescript-patterns'] },
  { id: 'dom', label: 'DOM & Web APIs', tracks: ['dom-browser'] },
  { id: 'core', label: 'JS Core & Tools', tracks: ['js-language', 'js-utilities', 'testing-tooling'] },
  { id: 'node', label: 'Node.js', tracks: ['node'] },
  { id: 'sql-postgres', label: 'PostgreSQL', tracks: ['sql-postgres'] },
];


export const DeckStatsWidget: React.FC<DeckStatsWidgetProps> = ({
  state,
  topics,
  theme,
  selectedTracks,
  selectedBox,
  displayedBoxes,
  onSelectExclusiveTrack,
  onSelectExclusiveTracks,
  onSelectExclusiveBox,
  onSelectTrack,
}) => {
  const isLight = theme === 'apple-gsos';
  const algorithm = getSchedulingAlgorithm(state);
  const isGraduated = algorithm === 'graduated-interval';
  const tierName = isGraduated ? 'Tier' : 'Box';

  const effectiveDisplayedBoxes = useMemo(() => {
    if (displayedBoxes && displayedBoxes.length > 0) return displayedBoxes;
    if (isGraduated) {
      const maxBox = topics.reduce((max, t) => Math.max(max, t.box || 1), 5);
      return Array.from({ length: Math.max(9, maxBox) }, (_, i) => i + 1);
    }
    return [1, 2, 3, 4, 5];
  }, [displayedBoxes, isGraduated, topics]);

  const tiers5Plus = useMemo(() => {
    return effectiveDisplayedBoxes.filter((b) => b >= 5);
  }, [effectiveDisplayedBoxes]);

  // Default view is now Skill Matrix ('radar') per user requirement
  const [mode, setMode] = useState<StatsViewMode>('radar');
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);

  const palette = useMemo(() => getThemeColors(theme), [theme]);
  const trackColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(palette.tracks)) {
      map[k] = v.color;
    }
    return map;
  }, [palette]);

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

  // Radar data: Both depth (average tier) and coverage (active cards / total cards)
  const radarData = useMemo(() => {
    return RADAR_DOMAINS.map((domain) => {
      const allDomainCards = topics.filter((t) => domain.tracks.includes(t.track));
      const activeDomainCards = activeTopics.filter((t) => domain.tracks.includes(t.track));
      const totalCount = allDomainCards.length;
      const activeCount = activeDomainCards.length;
      const avgBox =
        activeCount > 0 ? activeDomainCards.reduce((acc, c) => acc + (c.box || 1), 0) / activeCount : 0;
      // Score on 1-5 scale for the radar polygon depth
      const score = Math.min(5, Math.max(0.8, avgBox));
      const coveragePercent = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;
      return {
        ...domain,
        totalCount,
        activeCount,
        avgBox,
        score,
        coveragePercent,
      };
    });
  }, [topics, activeTopics]);

  // Box Tier Breakdown
  const boxStats = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const t of activeTopics) {
      const b = Math.min(5, Math.max(1, t.box || 1));
      counts[b] = (counts[b] || 0) + 1;
    }
    const colors: Record<number, string> = palette.boxes;
    const intervals: Record<number, string> = {
      1: '+1 trial interval',
      2: '+3/4 trial interval',
      3: '+7/10 trial interval',
      4: '+16/22 trial interval',
      5: '+35/45 trial interval (Mastered)',
    };
    const names: Record<number, string> = {
      1: `${tierName} 1: Learning`,
      2: `${tierName} 2: Emerging`,
      3: `${tierName} 3: Consolidating`,
      4: `${tierName} 4: Retention`,
      5: `${tierName} 5+: Mastered`,
    };
    return [5, 4, 3, 2, 1].map((box) => ({
      box,
      name: names[box],
      count: counts[box] || 0,
      color: colors[box],
      interval: intervals[box],
      percentage: activeTopics.length > 0 ? ((counts[box] || 0) / activeTopics.length) * 100 : 0,
    }));
  }, [activeTopics, palette.boxes, tierName]);

  const modes: { id: StatsViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'radar', label: 'Skill Matrix', icon: <Activity size={13} /> },
    { id: 'orbit', label: 'Topic Orbit', icon: <PieChart size={13} /> },
    { id: 'tiers', label: 'Mastery Tiers', icon: <Layers size={13} /> },
    { id: 'activity', label: 'Activity', icon: <BarChart3 size={13} /> },
  ];

  const handleNextMode = () => {
    setMode((prev) => modes[(modes.findIndex((m) => m.id === prev) + 1) % modes.length].id);
  };

  const handlePrevMode = () => {
    setMode((prev) => modes[(modes.findIndex((m) => m.id === prev) + modes.length - 1) % modes.length].id);
  };

  // Exclusive selection dispatchers
  const handleTrackClick = (track: string) => {
    if (onSelectExclusiveTrack) {
      onSelectExclusiveTrack(track);
    } else if (onSelectTrack) {
      onSelectTrack(track);
    }
  };

  const handleDomainClick = (domainTracks: TrackType[]) => {
    if (onSelectExclusiveTracks) {
      onSelectExclusiveTracks(domainTracks);
    } else if (onSelectExclusiveTrack && domainTracks.length > 0) {
      onSelectExclusiveTrack(domainTracks[0]);
    } else if (onSelectTrack && domainTracks.length > 0) {
      onSelectTrack(domainTracks[0]);
    }
  };

  const handleBoxClick = (box: number | number[]) => {
    if (onSelectExclusiveBox) {
      if (box === 5 && isGraduated) {
        onSelectExclusiveBox(tiers5Plus);
      } else {
        onSelectExclusiveBox(box);
      }
    }
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
    return d3
      .arc<d3.PieArcDatum<{ track: TrackType; count: number; label: string; color: string; percentage: number }>>()
      .innerRadius(54)
      .outerRadius(82)
      .cornerRadius(3);
  }, []);

  const hoveredArcGenerator = useMemo(() => {
    return d3
      .arc<d3.PieArcDatum<{ track: TrackType; count: number; label: string; color: string; percentage: number }>>()
      .innerRadius(51)
      .outerRadius(87)
      .cornerRadius(3);
  }, []);

  const pieSlices = useMemo(() => {
    return pieGenerator(trackStats);
  }, [pieGenerator, trackStats]);

  // D3 Radar Generator
  const radarRadius = 76;
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
        labelX: centerX + (radarRadius + 18) * Math.cos(angle),
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
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
          width: '100%',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Analytics & Proportions
        </span>
      </div>

      {/* View Toggle Tabs - Centered Horizontally */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          width: '100%',
          marginBottom: '8px',
        }}
      >
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
            backgroundColor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)',
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
                padding: '3px 7px',
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

      {/* Main Visual SVG Body */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          minHeight: '236px',
          height: '236px',
          position: 'relative',
        }}
      >
        {mode === 'activity' ? (
          /* Mode 4: reviews per day and share passed. Needs no active cards: the history is kept regardless. */
          <ActivityView stats={state.dailyStats} theme={theme} />
        ) : activeTopics.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            No active cards in rotation yet. Unlock cards to see live proportion analytics.
          </div>
        ) : mode === 'radar' ? (
          /* Mode 1 (Default): Skill Matrix Radar */
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg data-testid="stats-chart-svg" width={width} height={height} style={{ overflow: 'visible' }}>
              <g>
                {/* Background Concentric Grid Rings (Darker in Day View) */}
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const r = (radarRadius / 5) * lvl;
                  return (
                    <circle
                      key={lvl}
                      cx={centerX}
                      cy={centerY}
                      r={r}
                      fill="none"
                      stroke={isLight ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.08)'}
                      strokeDasharray={lvl < 5 ? '3,3' : undefined}
                      strokeWidth={isLight ? 1.3 : 1}
                    />
                  );
                })}

                {/* Axis lines and domain labels (Darker in Day View) */}
                {radarPoints.points.map((p) => {
                  const isDomainSelected =
                    selectedTracks &&
                    p.tracks.length > 0 &&
                    p.tracks.every((trk) => selectedTracks.includes(trk));

                  return (
                    <g
                      key={p.id}
                      data-domain={p.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleDomainClick(p.tracks)}
                      onMouseEnter={() => setHoveredDomain(p.id)}
                      onMouseLeave={() => setHoveredDomain(null)}
                    >
                      <line
                        x1={centerX}
                        y1={centerY}
                        x2={p.axisX}
                        y2={p.axisY}
                        stroke={isLight ? 'rgba(0, 0, 0, 0.40)' : 'rgba(255, 255, 255, 0.12)'}
                        strokeWidth={isLight ? 1.3 : 1}
                      />
                      <text
                        x={p.labelX}
                        y={p.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: '9.5px',
                          fontWeight: hoveredDomain === p.id || isDomainSelected ? 700 : isLight ? 600 : 500,
                          fill:
                            hoveredDomain === p.id || isDomainSelected
                              ? isLight
                                ? '#2B3A8C'
                                : 'var(--accent-cyan)'
                              : isLight
                                ? '#0F172A'
                                : 'var(--text-muted)',
                          transition: 'all 0.15s ease',
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
                    fill={isLight ? 'rgba(68, 85, 170, 0.28)' : 'rgba(56, 189, 248, 0.22)'}
                    stroke={isLight ? '#4455AA' : '#38bdf8'}
                    strokeWidth={2}
                    style={{
                      transition: 'all 0.2s ease',
                      filter: !isLight ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.4))' : 'none',
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
                    onClick={() => handleDomainClick(p.tracks)}
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
                  {activeDomainObj.label}: Tier {activeDomainObj.avgBox.toFixed(1)}/5.0 depth • {activeDomainObj.activeCount}/{activeDomainObj.totalCount} cards active ({activeDomainObj.coveragePercent.toFixed(0)}% unlocked)
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                  Domain Mastery Depth (Tier 1–5+) • Click domain to filter exclusively
                </span>
              )}
            </div>
          </div>
        ) : mode === 'orbit' ? (
          /* Mode 2: Topic Orbit Donut */
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg data-testid="stats-chart-svg" width={width} height={height} style={{ overflow: 'visible' }}>
              <g transform={`translate(${centerX}, ${centerY})`}>
                {pieSlices.map((slice) => {
                  const isHovered = hoveredTrack === slice.data.track;
                  const isTrackSelected = selectedTracks && selectedTracks.includes(slice.data.track);
                  const path = (isHovered ? hoveredArcGenerator(slice) : arcGenerator(slice)) || '';
                  return (
                    <path
                      key={slice.data.track}
                      data-track={slice.data.track}
                      d={path}
                      fill={slice.data.color}
                      stroke={isTrackSelected ? (isLight ? '#2B3A8C' : '#38bdf8') : isLight ? '#ffffff' : '#030712'}
                      strokeWidth={isTrackSelected ? 3 : 1.5}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: hoveredTrack && !isHovered ? 0.45 : 1,
                        filter: isHovered && !isLight ? `drop-shadow(0 0 6px ${slice.data.color})` : 'none',
                      }}
                      onMouseEnter={() => setHoveredTrack(slice.data.track)}
                      onMouseLeave={() => setHoveredTrack(null)}
                      onClick={() => handleTrackClick(slice.data.track)}
                    />
                  );
                })}

                {/* Center Readout */}
                <circle
                  r={50}
                  fill={isLight ? '#f8fafc' : '#061320'}
                  stroke={isLight ? '#cbd5e1' : 'rgba(56, 189, 248, 0.15)'}
                  strokeWidth={1}
                  style={{ pointerEvents: 'none' }}
                />
                <text
                  textAnchor="middle"
                  dy="-4"
                  style={{
                    fontSize: activeTrackObj ? '13px' : '17px',
                    fontWeight: 700,
                    fill: isLight ? '#0f172a' : '#f1f5f9',
                    fontFamily: 'inherit',
                    pointerEvents: 'none',
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
                    pointerEvents: 'none',
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
                  {activeTrackObj.label} (click to focus exclusively)
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                  Hover over slices to inspect • Click to select exclusively
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
                  const isBoxSelected =
                    selectedBox !== 'all' &&
                    (Array.isArray(selectedBox)
                      ? (item.box === 5 && isGraduated
                          ? (tiers5Plus.length > 0 && tiers5Plus.every((b) => selectedBox.includes(b)))
                          : selectedBox.includes(item.box))
                      : selectedBox === item.box);

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
                      data-box={item.box}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredBox(item.box)}
                      onMouseLeave={() => setHoveredBox(null)}
                      onClick={() => handleBoxClick(item.box)}
                    >
                      {/* Track background */}
                      <path
                        d={bgArc || ''}
                        fill={isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.07)'}
                        stroke={isLight ? 'rgba(0,0,0,0.22)' : 'none'}
                        strokeWidth={isLight ? 0.8 : 0}
                      />
                      {/* Progress arc */}
                      <path
                        d={fgArc || ''}
                        fill={item.color}
                        stroke={isBoxSelected ? (isLight ? '#2B3A8C' : '#38bdf8') : 'none'}
                        strokeWidth={isBoxSelected ? 2 : 0}
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
                    pointerEvents: 'none',
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
                    pointerEvents: 'none',
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
                  {activeBoxObj.name}: {activeBoxObj.percentage.toFixed(0)}% of rotation (click to filter)
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
