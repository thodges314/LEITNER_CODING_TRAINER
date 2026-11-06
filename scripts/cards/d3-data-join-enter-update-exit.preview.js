const INITIAL_JOIN_ITEMS = [
  { id: 'cpu', label: 'CPU Load', value: 64 },
  { id: 'mem', label: 'Memory', value: 78 },
  { id: 'net', label: 'Network', value: 42 },
  { id: 'io', label: 'Disk I/O', value: 55 },
];

const EXTRA_POOL = [
  { id: 'gpu', label: 'GPU Cores', value: 88 },
  { id: 'cache', label: 'L3 Cache', value: 71 },
  { id: 'threads', label: 'Worker Pool', value: 49 },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      rowHeight: 36,
      maxValue: 100,
      enterColor: '#10b981',
      updateColor: '#3b82f6',
    },
    typeof window !== 'undefined' ? window.__previewProps : {}
  );

  let currentItems = INITIAL_JOIN_ITEMS.map((d) => Object.assign({}, d));
  let poolIdx = 0;
  let instance = null;

  function mount(props) {
    if (instance && typeof instance.destroy === 'function') {
      try {
        instance.destroy();
      } catch (_) {}
    }
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '10px';

    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.gap = '6px';
    toolbar.style.alignItems = 'center';

    const statusBadge = document.createElement('span');
    statusBadge.style.fontSize = '12px';
    statusBadge.style.fontFamily = 'monospace';
    statusBadge.style.color = '#94a3b8';
    statusBadge.style.marginLeft = 'auto';

    function updateBadge(stats) {
      statusBadge.textContent =
        'enter: ' +
        stats.entered +
        ' · update: ' +
        stats.updated +
        ' · exit: ' +
        stats.exited;
    }

    function makeBtn(label, onClick) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.padding = '4px 8px';
      btn.style.fontSize = '11px';
      btn.style.borderRadius = '4px';
      btn.style.border = '1px solid #334155';
      btn.style.background = '#1e293b';
      btn.style.color = '#e2e8f0';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', onClick);
      return btn;
    }

    const chartBox = document.createElement('div');

    toolbar.appendChild(
      makeBtn('Update & Reorder', function () {
        currentItems = currentItems
          .slice()
          .reverse()
          .map(function (item) {
            return {
              id: item.id,
              label: item.label,
              value: Math.max(15, Math.min(98, item.value + ((item.value * 17) % 29) - 12)),
            };
          });
        const stats = instance.update(currentItems);
        updateBadge(stats);
        if (typeof log === 'function') log('update', stats);
      })
    );

    toolbar.appendChild(
      makeBtn('+ Enter New Key', function () {
        const candidate = EXTRA_POOL[poolIdx % EXTRA_POOL.length];
        poolIdx++;
        const uniqueId = candidate.id + '-' + poolIdx;
        currentItems = currentItems.concat([
          { id: uniqueId, label: candidate.label + ' #' + poolIdx, value: candidate.value },
        ]);
        const stats = instance.update(currentItems);
        updateBadge(stats);
        if (typeof log === 'function') log('enter', uniqueId, stats);
      })
    );

    toolbar.appendChild(
      makeBtn('- Exit First Key', function () {
        if (currentItems.length === 0) return;
        currentItems = currentItems.slice(1);
        const stats = instance.update(currentItems);
        updateBadge(stats);
        if (typeof log === 'function') log('exit', stats);
      })
    );

    toolbar.appendChild(statusBadge);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(chartBox);
    container.appendChild(wrapper);

    instance = renderKeyedDataJoin(chartBox, currentItems, {
      width: 440,
      rowHeight: typeof props.rowHeight === 'number' ? props.rowHeight : 36,
      maxValue: typeof props.maxValue === 'number' ? props.maxValue : 100,
      enterColor: props.enterColor || '#10b981',
      updateColor: props.updateColor || '#3b82f6',
    });

    const svgEl = chartBox.querySelector('svg');
    if (svgEl) {
      svgEl.querySelectorAll('text.join-label').forEach(function (t) {
        t.setAttribute('fill', '#e2e8f0');
        t.setAttribute('font-size', '12');
        t.setAttribute('font-family', 'monospace');
      });
    }

    updateBadge(instance.getStats());
  }

  mount(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function (newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      mount(currentProps);
    });
  }
})();

