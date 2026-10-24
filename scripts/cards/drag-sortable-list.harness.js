const { render, fire, q, qa } = $dom;

const SAMPLE_ITEMS = [
  { id: 'item-a', label: 'Item Alpha' },
  { id: 'item-b', label: 'Item Beta' },
  { id: 'item-c', label: 'Item Gamma' },
];

// 1. Renders ordered list with items, draggable attributes, and item labels
{
  const r = render(<DragSortableList items={SAMPLE_ITEMS} />);
  const list = q('[data-sortable-list]', r.container);
  const items = qa('[data-item-id]', r.container);
  const firstId = items[0]?.getAttribute('data-item-id');
  const firstIdx = items[0]?.getAttribute('data-item-index');
  const firstDraggable = items[0]?.getAttribute('draggable') === 'true';
  const firstLabel = q('[data-item-label]', items[0])?.textContent;

  $test.check(
    'Renders ordered list with items, draggable attributes, and item labels',
    list !== null &&
      items.length === 3 &&
      firstId === 'item-a' &&
      firstIdx === '0' &&
      firstDraggable &&
      firstLabel === 'Item Alpha',
    { itemCount: items.length, firstId, firstLabel }
  );
  r.unmount();
}

// 2. Move buttons are disabled at list boundaries
{
  const r = render(<DragSortableList items={SAMPLE_ITEMS} />);
  const items = qa('[data-item-id]', r.container);
  const firstUp = items[0] ? q('button[data-action="move-up"]', items[0]) : null;
  const firstDown = items[0] ? q('button[data-action="move-down"]', items[0]) : null;
  const lastUp = items[2] ? q('button[data-action="move-up"]', items[2]) : null;
  const lastDown = items[2] ? q('button[data-action="move-down"]', items[2]) : null;

  $test.check(
    'Move buttons are disabled at list boundaries',
    firstUp !== null &&
      firstUp.disabled === true &&
      firstDown !== null &&
      firstDown.disabled === false &&
      lastUp !== null &&
      lastUp.disabled === false &&
      lastDown !== null &&
      lastDown.disabled === true,
    { firstUpDisabled: firstUp?.disabled, lastDownDisabled: lastDown?.disabled }
  );
  r.unmount();
}

// 3. Clicking Move Down swaps item with adjacent item below and triggers onReorder
{
  let reordered = null;
  const r = render(
    <DragSortableList
      items={SAMPLE_ITEMS}
      onReorder={(newList) => {
        reordered = newList;
      }}
    />
  );

  const items = qa('[data-item-id]', r.container);
  const downBtn = items[0] ? q('button[data-action="move-down"]', items[0]) : null;
  if (downBtn) fire.click(downBtn);

  const itemsAfter = qa('[data-item-id]', r.container);
  const orderAfter = Array.from(itemsAfter).map((el) => el.getAttribute('data-item-id'));
  const passed =
    reordered !== null &&
    reordered.map((i) => i.id).join(',') === 'item-b,item-a,item-c' &&
    orderAfter.join(',') === 'item-b,item-a,item-c';

  $test.check(
    'Clicking Move Down swaps item with adjacent item below and triggers onReorder',
    passed,
    { reordered: reordered?.map((i) => i.id), orderAfter }
  );
  r.unmount();
}

// 4. Clicking Move Up swaps item with adjacent item above and triggers onReorder
{
  let reordered = null;
  const r = render(
    <DragSortableList
      items={SAMPLE_ITEMS}
      onReorder={(newList) => {
        reordered = newList;
      }}
    />
  );

  const items = qa('[data-item-id]', r.container);
  const upBtn = items[2] ? q('button[data-action="move-up"]', items[2]) : null;
  if (upBtn) fire.click(upBtn);

  const itemsAfter = qa('[data-item-id]', r.container);
  const orderAfter = Array.from(itemsAfter).map((el) => el.getAttribute('data-item-id'));
  const passed =
    reordered !== null &&
    reordered.map((i) => i.id).join(',') === 'item-a,item-c,item-b' &&
    orderAfter.join(',') === 'item-a,item-c,item-b';

  $test.check(
    'Clicking Move Up swaps item with adjacent item above and triggers onReorder',
    passed,
    { reordered: reordered?.map((i) => i.id), orderAfter }
  );
  r.unmount();
}

// 5. Drag and drop reorders dragged item to target index and triggers onReorder
{
  let reordered = null;
  const r = render(
    <DragSortableList
      items={SAMPLE_ITEMS}
      onReorder={(newList) => {
        reordered = newList;
      }}
    />
  );

  const items = qa('[data-item-id]', r.container);
  const store = {};
  const dataTransfer = {
    setData: (type, val) => {
      store[type] = String(val);
    },
    getData: (type) => store[type] || '',
  };

  const dragStartEvt = new Event('dragstart', { bubbles: true });
  dragStartEvt.dataTransfer = dataTransfer;
  if (items[0]) items[0].dispatchEvent(dragStartEvt);

  const dragOverEvt = new Event('dragover', { bubbles: true, cancelable: true });
  dragOverEvt.dataTransfer = dataTransfer;
  if (items[2]) items[2].dispatchEvent(dragOverEvt);

  const dropEvt = new Event('drop', { bubbles: true, cancelable: true });
  dropEvt.dataTransfer = dataTransfer;
  if (items[2]) items[2].dispatchEvent(dropEvt);

  const passed =
    reordered !== null &&
    reordered.map((i) => i.id).join(',') === 'item-b,item-c,item-a';

  $test.check(
    'Drag and drop reorders dragged item to target index and triggers onReorder',
    passed,
    { reordered: reordered?.map((i) => i.id) }
  );
  r.unmount();
}
