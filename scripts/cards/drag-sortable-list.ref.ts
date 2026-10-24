interface SortableItem {
  id: string;
  label: string;
}

interface DragSortableListProps {
  items: SortableItem[];
  onReorder?: (items: SortableItem[]) => void;
}

function reorder(list: SortableItem[], fromIndex: number, toIndex: number): SortableItem[] {
  const result = [...list];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

function DragSortableList({
  items = [],
  onReorder = () => {},
}: DragSortableListProps): JSX.Element {
  const [list, setList] = useState<SortableItem[]>(items);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    setList(items);
  }, [items]);

  const handleSwap = (fromIdx: number, toIdx: number): void => {
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

  const handleDragStart = (
    e: { dataTransfer?: { setData: (format: string, data: string) => void; effectAllowed?: string } },
    index: number
  ): void => {
    setDraggedIdx(index);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', String(index));
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: {
    preventDefault: () => void;
    dataTransfer?: { dropEffect?: string };
  }): void => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (
    e: {
      preventDefault: () => void;
      dataTransfer?: { getData: (format: string) => string };
    },
    targetIdx: number
  ): void => {
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
      {list.map((item: SortableItem, index: number) => (
        <li
          key={item.id}
          data-item-id={item.id}
          data-item-index={index}
          draggable="true"
          onDragStart={(e: { dataTransfer?: { setData: (format: string, data: string) => void; effectAllowed?: string } }): void => handleDragStart(e, index)}
          onDragOver={(e: { preventDefault: () => void; dataTransfer?: { dropEffect?: string } }): void => handleDragOver(e)}
          onDrop={(e: { preventDefault: () => void; dataTransfer?: { getData: (format: string) => string } }): void => handleDrop(e, index)}
        >
          <span data-item-label>{item.label}</span>
          <div>
            <button
              type="button"
              data-action="move-up"
              disabled={index === 0}
              onClick={(): void => handleSwap(index, index - 1)}
            >
              Move Up
            </button>
            <button
              type="button"
              data-action="move-down"
              disabled={index === list.length - 1}
              onClick={(): void => handleSwap(index, index + 1)}
            >
              Move Down
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
