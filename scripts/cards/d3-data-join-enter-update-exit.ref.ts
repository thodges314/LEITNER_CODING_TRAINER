interface KeyedItem {
  id: string;
}

function updateKeyedBars(
  svg: SVGSVGElement,
  items: KeyedItem[] = []
): d3.Selection<KeyedItem> {
  const safeItems = Array.isArray(items) ? items.filter((d) => d && d.id != null) : [];
  return d3
    .select(svg)
    .selectAll('g.box')
    .data(safeItems, (d) => d.id)
    .join(
      (enter) => {
        const g = enter.append('g').attr('class', 'box').attr('data-id', (d) => d.id);
        g.append('rect')
          .attr('width', 40)
          .attr('height', 40)
          .attr('fill', 'steelblue');
        g.append('text')
          .attr('x', 20)
          .attr('y', 25)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .text((d) => d.id);
        return g;
      },
      (update) => update,
      (exit) => exit.remove()
    )
    .attr('transform', (_, i) => `translate(${i * 50}, 10)`);
}
