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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'sans-serif', padding: '6px' }}>
      <style>{`
        [data-kanban-board] {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          overflow-x: auto;
          padding-bottom: 12px;
        }
        [data-column-id] {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          width: 250px;
          min-width: 230px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        [data-column-id] > div:first-child {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 8px;
        }
        [data-column-title] {
          margin: 0;
          font-size: 13.5px;
          font-weight: 600;
          color: #f1f5f9;
        }
        [data-column-count] {
          background: rgba(255, 255, 255, 0.1);
          color: #38bdf8;
          padding: 2px 7px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }
        [data-card-list] {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 40px;
        }
        [data-card-id] {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 10px;
        }
        [data-card-title] {
          margin: 0 0 4px 0;
          font-size: 13px;
          color: #f8fafc;
        }
        [data-card-description] {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.4;
        }
        [data-card-id] button {
          padding: 3px 8px;
          font-size: 11px;
          border-radius: 4px;
          background: #334155;
          color: #fff;
          border: none;
          cursor: pointer;
          margin-right: 4px;
        }
        [data-card-id] button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        [data-action="add-card"] {
          background: transparent;
          border: 1px dashed rgba(255, 255, 255, 0.2);
          color: #94a3b8;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          width: 100%;
        }
        [data-action="add-card"]:hover {
          border-color: #38bdf8;
          color: #38bdf8;
        }
        [data-add-card-form] {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: #0f172a;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #334155;
        }
        [data-add-card-form] input, [data-add-card-form] textarea {
          background: #1e293b;
          border: 1px solid #334155;
          color: #fff;
          padding: 5px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        [data-add-card-form] button {
          padding: 4px 10px;
          font-size: 11px;
          border-radius: 4px;
          cursor: pointer;
        }
        [data-action="submit-card"] {
          background: #0284c7;
          color: #fff;
          border: none;
        }
        [data-action="cancel-card"] {
          background: transparent;
          color: #94a3b8;
          border: 1px solid #334155;
          margin-left: 6px;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Sprint Board Preview</h4>
        <span style={{ fontSize: '12px', color: '#38bdf8' }}>{logMsg}</span>
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
