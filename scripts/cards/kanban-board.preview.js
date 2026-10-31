const defaultColumns = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 't1', title: 'Implement Auth Flow', description: 'JWT tokens and refresh flow' },
      { id: 't2', title: 'Cache Strategy', description: 'Configure Redis cache layers' },
    ],
  },
  {
    id: 'in-dev',
    title: 'In Progress',
    cards: [
      { id: 'd1', title: 'Kanban board card authoring', description: 'Adding full TS types' },
    ],
  },
  {
    id: 'done',
    title: 'Completed',
    cards: [
      { id: 'c1', title: 'Interactive Stepper' },
      { id: 'c2', title: 'Popover positioning' },
    ],
  },
];

function KanbanBoardPreview() {
  const {
    initialColumns = defaultColumns,
    onCardMove,
    onCardAdd,
  } = usePreviewProps({
    initialColumns: defaultColumns,
  });

  const parsedColumns = Array.isArray(initialColumns) && initialColumns.length > 0 ? initialColumns : defaultColumns;
  const [logMsg, setLogMsg] = useState('Try moving cards or creating a new task');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Sprint Board Preview</h4>
        <span style={{ fontSize: '12px', color: '#38bdf8' }}>{logMsg}</span>
      </div>

      <KanbanBoard
        key={JSON.stringify(parsedColumns)}
        initialColumns={parsedColumns}
        onCardMove={(cardId, fromCol, toCol, newIdx) => {
          setLogMsg(`Moved ${cardId} (${fromCol} → ${toCol} at index ${newIdx})`);
          if (onCardMove) onCardMove(cardId, fromCol, toCol, newIdx);
          log('onCardMove', cardId, fromCol, toCol, newIdx);
        }}
        onCardAdd={(colId, card) => {
          setLogMsg(`Added "${card.title}" to ${colId}`);
          if (onCardAdd) onCardAdd(colId, card);
          log('onCardAdd', colId, card);
        }}
      />
    </div>
  );
}

<KanbanBoardPreview />
