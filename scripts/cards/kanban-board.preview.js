const initialColumns = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      { id: 'b1', title: 'Audit a11y focus rings', description: 'Ensure 3:1 contrast' },
      { id: 'b2', title: 'Optimize bundle splitting' },
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
  const [logMsg, setLogMsg] = useState('Try moving or adding tasks');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Sprint Board Preview</h4>
        <span style={{ fontSize: '12px', opacity: 0.7 }}>{logMsg}</span>
      </div>

      <KanbanBoard
        initialColumns={initialColumns}
        onCardMove={(cardId, fromCol, toCol, newIdx) => {
          setLogMsg(`Moved ${cardId} (${fromCol} → ${toCol} at index ${newIdx})`);
          log('onCardMove')(cardId, fromCol, toCol, newIdx);
        }}
        onCardAdd={(colId, card) => {
          setLogMsg(`Added "${card.title}" to ${colId}`);
          log('onCardAdd')(colId, card);
        }}
      />
    </div>
  );
}

<KanbanBoardPreview />
