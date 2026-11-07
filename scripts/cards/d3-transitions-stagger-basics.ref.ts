interface TransitionConfig {
  duration?: number;
  staggerMs?: number;
  ease?: (t: number) => number;
  targetWidths?: number[];
  fillColor?: string;
}

function transitionBars(
  selection: d3.Selection<SVGRectElement>,
  config: TransitionConfig = {}
): d3.Transition<SVGRectElement> {
  const {
    duration = 300,
    staggerMs = 0,
    ease = d3.easeCubicOut,
    targetWidths = [],
    fillColor = 'steelblue',
  } = config;

  return selection
    .transition()
    .duration(duration)
    .ease(ease)
    .delay((_, i) => i * staggerMs)
    .attr('width', (_, i) => targetWidths[i] ?? 0)
    .attr('fill', fillColor);
}

