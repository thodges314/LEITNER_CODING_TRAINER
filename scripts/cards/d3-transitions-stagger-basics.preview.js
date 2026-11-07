(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;
  container.innerHTML = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '130');
  svg.style.overflow = 'visible';
  container.appendChild(svg);

  const sel = d3.select(svg);
  const INITIAL_DATA = [50, 100, 150];

  sel
    .selectAll('rect')
    .data(INITIAL_DATA)
    .join('rect')
    .attr('x', 10)
    .attr('y', (_, i) => i * 38 + 10)
    .attr('height', 26)
    .attr('width', (d) => d)
    .attr('rx', 4)
    .attr('fill', 'steelblue');

  const PRESETS = {
    'Short Bars': [60, 90, 45],
    'Medium Bars': [140, 200, 110],
    'Long Bars': [260, 320, 290],
    'Zero Reset': [0, 0, 0],
  };

  const EASING_MAP = {
    'Elastic (Sproingy)': d3.easeElasticOut,
    'Bounce': d3.easeBounceOut,
    'Back (Overshoot)': d3.easeBackOut,
    'Cubic Out': d3.easeCubicOut,
    'Linear': d3.easeLinear,
  };

  let currentProps = Object.assign(
    {
      preset: 'Medium Bars',
      easing: 'Elastic (Sproingy)',
      duration: 750,
      staggerMs: 80,
    },
    typeof window !== 'undefined' ? window.__previewProps : {}
  );

  function render(props) {
    const key = (props && props.preset) || 'Medium Bars';
    const targetWidths = PRESETS[key] || PRESETS['Medium Bars'];
    const easingKey = (props && props.easing) || 'Elastic (Sproingy)';
    const ease = EASING_MAP[easingKey] || d3.easeElasticOut;
    const duration = Number(props && props.duration) || 750;
    const staggerMs = Number(props && props.staggerMs) || 80;

    if (typeof transitionBars === 'function') {
      const bars = sel.selectAll('rect');
      transitionBars(bars, {
        duration,
        staggerMs,
        ease,
        targetWidths,
        fillColor: key === 'Zero Reset' ? 'slategray' : 'steelblue',
      });
    }
  }

  render(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function (newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      render(currentProps);
    });
  }
})();

