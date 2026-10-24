function reorder(list, fromIndex, toIndex) {
  const result = [...list];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

function DragSortableList({ items = [], onReorder = () => {} }) {
  const [list, setList] = useState(items);
  const [draggedIdx, setDraggedIdx] = useState(null);

  useEffect(() => {
    setList(items);
  }, [items]);

  const handleSwap = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= list.length || fromIdx === toIdx) return;
    const nextList = [...list];
    const temp = nextList[fromIdx];
    nextList[fromIdx] = nextList[toIdx];
    nextList[toIdx] = temp;
    setList(nextList);
    if (typeof onReorder === 'function') {
      onReorder(nextList);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', String(index));
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    let sourceIdx = draggedIdx;
    if (e.dataTransfer) {
      const data = e.dataTransfer.getData('text/plain');
      if (data !== '') {
        const parsed = parseInt(data, 10);
        if (!Number.isNaN(parsed)) sourceIdx = parsed;
      }
    }

    if (sourceIdx === null || sourceIdx === undefined || sourceIdx === targetIdx) {
      setDraggedIdx(null);
      return;
    }

    const nextList = reorder(list, sourceIdx, targetIdx);
    setList(nextList);
    setDraggedIdx(null);
    if (typeof onReorder === 'function') {
      onReorder(nextList);
    }
  };

  return (
    <ul data-sortable-list>
      {list.map((item, index) => (
        <li
          key={item.id}
          data-item-id={item.id}
          data-item-index={index}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
        >
          <span data-item-label>{item.label}</span>
          <div>
            <button
              type="button"
              data-action="move-up"
              disabled={index === 0}
              onClick={() => handleSwap(index, index - 1)}
            >
              Move Up
            </button>
            <button
              type="button"
              data-action="move-down"
              disabled={index === list.length - 1}
              onClick={() => handleSwap(index, index + 1)}
            >
              Move Down
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
