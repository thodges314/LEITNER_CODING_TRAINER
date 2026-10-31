const defaultSortableItems = [
  { id: 'step-1', label: '1. Gather Requirements' },
  { id: 'step-2', label: '2. Design System Tokens' },
  { id: 'step-3', label: '3. Implement Accessible Components' },
  { id: 'step-4', label: '4. Run Mutation & E2E Tests' },
  { id: 'step-5', label: '5. Deploy to Production' },
];

function DragSortableListPreview() {
  const {
    items = defaultSortableItems,
    onReorder,
  } = usePreviewProps({
    items: defaultSortableItems,
  });

  const parsedItems = Array.isArray(items) && items.length > 0 ? items : defaultSortableItems;
  const [list, setList] = useState(parsedItems);
  useEffect(() => {
    setList(parsedItems);
  }, [items]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Sortable List Preview</h4>
        <span style={{ fontSize: '12px', color: '#38bdf8' }}>Drag or use Move Up / Down</span>
      </div>
      <DragSortableList
        items={list}
        onReorder={(newItems) => {
          setList(newItems);
          if (onReorder) onReorder(newItems);
          log('onReorder', newItems);
        }}
      />
    </div>
  );
}

<DragSortableListPreview />
