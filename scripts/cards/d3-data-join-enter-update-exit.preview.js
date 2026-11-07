(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;
  container.innerHTML = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '80');
  svg.style.overflow = 'visible';
  container.appendChild(svg);

  const DATASETS = {
    'Step 1 (A, B, C)': [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
    'Step 2 (C, A, D)': [{ id: 'C' }, { id: 'A' }, { id: 'D' }],
    'Step 3 (B, D, E)': [{ id: 'B' }, { id: 'D' }, { id: 'E' }],
    'Step 4 (Empty)': [],
  };

  let currentProps = Object.assign(
    { dataset: 'Step 1 (A, B, C)' },
    typeof window !== 'undefined' ? window.__previewProps : {}
  );

  function render(props) {
    const dsKey = props && props.dataset;
    const items = Object.prototype.hasOwnProperty.call(DATASETS, dsKey)
      ? DATASETS[dsKey]
      : DATASETS['Step 1 (A, B, C)'];
    if (typeof updateKeyedBars === 'function') {
      updateKeyedBars(svg, items);
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
