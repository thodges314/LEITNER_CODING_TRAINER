function transitionBars(selection, config = {}) {
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

