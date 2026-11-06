function renderKeyedDataJoin(container, initialItems, options = {}) {
  const {
    width = 440,
    rowHeight = 36,
    maxValue = 100,
    enterColor = 'seagreen',
    updateColor = 'steelblue',
  } = options;

  const root = d3.select(container);
  root.selectAll('*').remove();

  const initialList = Array.isArray(initialItems) ? initialItems : [];

  const svgSel = root
    .append('svg')
    .attr('width', String(width))
    .attr('height', String(Math.max(rowHeight, initialList.length * rowHeight)))
    .attr('role', 'img')
    .attr('aria-label', 'Keyed data join chart');

  const rowsGroup = svgSel.append('g').attr('class', 'join-rows');

  let lastStats = {
    entered: 0,
    updated: 0,
    exited: 0,
    total: 0,
  };

  function update(nextItems) {
    const list = Array.isArray(nextItems) ? nextItems : [];
    svgSel.attr('height', String(Math.max(rowHeight, list.length * rowHeight)));

    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(1, maxValue)])
      .range([0, Math.max(40, width - 140)])
      .clamp(true);

    let entered = 0;
    let updated = 0;
    let exited = 0;

    const merged = rowsGroup
      .selectAll('g.join-row')
      .data(list, (d) => d.id)
      .join(
        (enter) => {
          entered = enter.size();
          const row = enter
            .append('g')
            .attr('class', 'join-row')
            .attr('data-join', 'enter');
          row.append('rect').attr('class', 'join-bar');
          row.append('text').attr('class', 'join-label');
          return row;
        },
        (updateSel) => {
          updated = updateSel.size();
          return updateSel.attr('data-join', 'update');
        },
        (exit) => {
          exited = exit.size();
          return exit.remove();
        }
      );

    merged
      .order()
      .attr('data-id', (d) => d.id)
      .attr('data-value', (d) => String(d.value))
      .attr('transform', (_d, i) => `translate(0, ${i * rowHeight})`);

    merged.each(function (d) {
      const row = d3.select(this);
      const joinState = row.attr('data-join');
      row
        .select('rect.join-bar')
        .attr('x', '120')
        .attr('y', '6')
        .attr('rx', '4')
        .attr('height', String(rowHeight - 12))
        .attr('width', String(xScale(d.value)))
        .attr('fill', joinState === 'enter' ? enterColor : updateColor);

      row
        .select('text.join-label')
        .attr('x', '8')
        .attr('y', String(rowHeight / 2))
        .attr('dy', '0.35em')
        .text(`${d.label}: ${d.value}`);
    });

    lastStats = {
      entered,
      updated,
      exited,
      total: list.length,
    };

    return { ...lastStats };
  }

  update(initialList);

  return {
    svg: svgSel.node(),
    update,
    getStats() {
      return { ...lastStats };
    },
    destroy() {
      svgSel.remove();
      container.innerHTML = '';
    },
  };
}

