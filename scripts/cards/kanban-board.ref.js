function KanbanBoard({
  initialColumns = [],
  onCardMove = () => {},
  onCardAdd = () => {},
}) {
  const [columns, setColumns] = useState(() =>
    initialColumns.map((col) => ({
      ...col,
      cards: col.cards ? [...col.cards] : [],
    }))
  );

  const [activeFormColId, setActiveFormColId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleMove = (cardId, fromColId, direction) => {
    const fromColIdx = columns.findIndex((c) => c.id === fromColId);
    if (fromColIdx === -1) return;

    const toColIdx = fromColIdx + direction;
    if (toColIdx < 0 || toColIdx >= columns.length) return;

    const fromCol = columns[fromColIdx];
    const toCol = columns[toColIdx];
    const cardIdx = fromCol.cards.findIndex((c) => c.id === cardId);
    if (cardIdx === -1) return;

    const card = fromCol.cards[cardIdx];
    const newFromCards = fromCol.cards.filter((_, idx) => idx !== cardIdx);
    const newToCards = [...toCol.cards, card];
    const newTargetIndex = newToCards.length - 1;

    const updated = columns.map((col, idx) => {
      if (idx === fromColIdx) return { ...col, cards: newFromCards };
      if (idx === toColIdx) return { ...col, cards: newToCards };
      return col;
    });

    setColumns(updated);
    if (typeof onCardMove === 'function') {
      onCardMove(cardId, fromCol.id, toCol.id, newTargetIndex);
    }
  };

  const handleAddSubmit = (colId) => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    const trimmedDesc = newDescription.trim();
    const newCard = {
      id: `card-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      title: trimmedTitle,
      ...(trimmedDesc ? { description: trimmedDesc } : {}),
    };

    const updated = columns.map((col) => {
      if (col.id === colId) {
        return { ...col, cards: [...col.cards, newCard] };
      }
      return col;
    });

    setColumns(updated);
    if (typeof onCardAdd === 'function') {
      onCardAdd(colId, {
        title: trimmedTitle,
        ...(trimmedDesc ? { description: trimmedDesc } : {}),
      });
    }

    setNewTitle('');
    setNewDescription('');
    setActiveFormColId(null);
  };

  return (
    <div data-kanban-board className="kanban-board">
      {columns.map((column, colIdx) => (
        <div key={column.id} data-column-id={column.id} className="kanban-column">
          <div className="kanban-column-header">
            <h3 data-column-title className="kanban-column-title">{column.title}</h3>
            <span data-column-count className="kanban-column-count">{column.cards.length}</span>
          </div>

          <div data-card-list className="kanban-card-list">
            {column.cards.map((card) => (
              <div key={card.id} data-card-id={card.id} className="kanban-card">
                <h4 data-card-title className="kanban-card-title">{card.title}</h4>
                {card.description && (
                  <p data-card-description className="kanban-card-description">{card.description}</p>
                )}
                <div className="kanban-card-actions">
                  <button
                    type="button"
                    data-action="move-left"
                    disabled={colIdx === 0}
                    onClick={() => handleMove(card.id, column.id, -1)}
                  >
                    Move Left
                  </button>
                  <button
                    type="button"
                    data-action="move-right"
                    disabled={colIdx === columns.length - 1}
                    onClick={() => handleMove(card.id, column.id, 1)}
                  >
                    Move Right
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            {activeFormColId === column.id ? (
              <form
                className="flex-col gap-xs"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddSubmit(column.id);
                }}
              >
                <input
                  type="text"
                  data-card-input="title"
                  placeholder="Card title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                  data-card-input="description"
                  placeholder="Card description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                <div className="flex-row gap-xs">
                  <button type="submit" data-action="submit-card">
                    Submit
                  </button>
                  <button
                    type="button"
                    data-action="cancel-card"
                    onClick={() => {
                      setNewTitle('');
                      setNewDescription('');
                      setActiveFormColId(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                data-action="toggle-add-card"
                onClick={() => {
                  setNewTitle('');
                  setNewDescription('');
                  setActiveFormColId(column.id);
                }}
              >
                + Add Card
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
