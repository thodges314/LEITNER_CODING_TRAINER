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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'sans-serif', maxWidth: '480px', padding: '10px' }}>
      <style>{`
        [data-sortable-list] {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        [data-item-id] {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #f1f5f9;
          font-size: 13px;
          cursor: grab;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        [data-item-id]:active {
          cursor: grabbing;
        }
        [data-item-id] button {
          padding: 4px 9px;
          font-size: 11px;
          border-radius: 4px;
          background: #334155;
          color: #fff;
          border: none;
          cursor: pointer;
          margin-left: 4px;
        }
        [data-item-id] button:hover:not(:disabled) {
          background: #0284c7;
        }
        [data-item-id] button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Sortable List Preview</h4>
        <span style={{ fontSize: '12px', color: '#38bdf8' }}>Drag or use Move Up / Down</span>
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
