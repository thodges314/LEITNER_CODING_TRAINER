const sampleItems = [
  { id: 'step-1', label: '1. Gather Requirements' },
  { id: 'step-2', label: '2. Design System Tokens' },
  { id: 'step-3', label: '3. Implement Accessible Components' },
  { id: 'step-4', label: '4. Run Mutation & E2E Tests' },
  { id: 'step-5', label: '5. Deploy to Production' },
];

function DragSortableListPreview() {
  const [items, setItems] = useState(sampleItems);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Sortable List Preview</h4>
        <span style={{ fontSize: '12px', opacity: 0.7 }}>Drag or use Move Up / Down</span>
      </div>
      <DragSortableList
        items={items}
        onReorder={(newItems) => {
          setItems(newItems);
          log('onReorder')(newItems);
        }}
      />
    </div>
  );
}

<DragSortableListPreview />
