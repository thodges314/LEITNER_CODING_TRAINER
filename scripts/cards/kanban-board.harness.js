const { render, fire, q, qa } = $dom;

const SAMPLE_COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 'c1', title: 'Task 1', description: 'First task' },
      { id: 'c2', title: 'Task 2' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [{ id: 'c3', title: 'Task 3' }],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [],
  },
];

// 1. Renders multi-column Kanban board with titles, card counts, and cards
{
  const r = render(<KanbanBoard initialColumns={SAMPLE_COLUMNS} />);
  const cols = qa('[data-column-id]', r.container);
  const todoCol = q('[data-column-id="todo"]', r.container);
  const titleEl = todoCol ? q('[data-column-title]', todoCol) : null;
  const countEl = todoCol ? q('[data-column-count]', todoCol) : null;
  const cards = todoCol ? qa('[data-card-id]', todoCol) : [];

  $test.check(
    'Renders multi-column Kanban board with titles, card counts, and cards',
    cols.length === 3 &&
      titleEl !== null &&
      titleEl.textContent === 'To Do' &&
      countEl !== null &&
      countEl.textContent === '2' &&
      cards.length === 2 &&
      q('[data-card-title]', cards[0])?.textContent === 'Task 1',
    { colCount: cols.length, cardsInTodo: cards.length }
  );
  r.unmount();
}

// 2. Boundary move buttons are disabled for outer columns
{
  const r = render(<KanbanBoard initialColumns={SAMPLE_COLUMNS} />);
  const card1 = q('[data-card-id="c1"]', r.container);
  const moveLeft1 = card1 ? q('button[data-action="move-left"]', card1) : null;
  const moveRight1 = card1 ? q('button[data-action="move-right"]', card1) : null;

  // Move c3 to Done so Done has a card to inspect
  const card3 = q('[data-card-id="c3"]', r.container);
  const moveRight3 = card3 ? q('button[data-action="move-right"]', card3) : null;
  if (moveRight3) fire.click(moveRight3);

  const doneCard3 = q('[data-card-id="c3"]', r.container);
  const moveRightDone = doneCard3 ? q('button[data-action="move-right"]', doneCard3) : null;

  $test.check(
    'Boundary move buttons are disabled for outer columns',
    moveLeft1 !== null &&
      moveLeft1.disabled === true &&
      moveRight1 !== null &&
      moveRight1.disabled === false &&
      moveRightDone !== null &&
      moveRightDone.disabled === true,
    { moveLeft1Disabled: moveLeft1?.disabled, moveRightDoneDisabled: moveRightDone?.disabled }
  );
  r.unmount();
}

// 3. Clicking Move Right shifts card to next column and fires onCardMove callback
{
  let movePayload = null;
  const r = render(
    <KanbanBoard
      initialColumns={SAMPLE_COLUMNS}
      onCardMove={(cardId, fromCol, toCol, newIdx) => {
        movePayload = { cardId, fromCol, toCol, newIdx };
      }}
    />
  );

  const card1 = q('[data-card-id="c1"]', r.container);
  const moveRight1 = card1 ? q('button[data-action="move-right"]', card1) : null;
  if (moveRight1) fire.click(moveRight1);

  const inProgressCards = qa('[data-column-id="in-progress"] [data-card-id]', r.container);
  const passed =
    movePayload !== null &&
    movePayload.cardId === 'c1' &&
    movePayload.fromCol === 'todo' &&
    movePayload.toCol === 'in-progress' &&
    movePayload.newIdx === 1 &&
    inProgressCards.length === 2 &&
    inProgressCards[1].getAttribute('data-card-id') === 'c1';

  $test.check(
    'Clicking Move Right shifts card to next column and fires onCardMove callback',
    passed,
    { movePayload, inProgressCount: inProgressCards.length }
  );
  r.unmount();
}

// 4. Clicking Move Left shifts card to previous column and fires onCardMove callback
{
  let movePayload = null;
  const r = render(
    <KanbanBoard
      initialColumns={SAMPLE_COLUMNS}
      onCardMove={(cardId, fromCol, toCol, newIdx) => {
        movePayload = { cardId, fromCol, toCol, newIdx };
      }}
    />
  );

  const card3 = q('[data-card-id="c3"]', r.container);
  const moveLeft3 = card3 ? q('button[data-action="move-left"]', card3) : null;
  if (moveLeft3) fire.click(moveLeft3);

  const todoCards = qa('[data-column-id="todo"] [data-card-id]', r.container);
  const passed =
    movePayload !== null &&
    movePayload.cardId === 'c3' &&
    movePayload.fromCol === 'in-progress' &&
    movePayload.toCol === 'todo' &&
    movePayload.newIdx === 2 &&
    todoCards.length === 3 &&
    todoCards[2].getAttribute('data-card-id') === 'c3';

  $test.check(
    'Clicking Move Left shifts card to previous column and fires onCardMove callback',
    passed,
    { movePayload, todoCount: todoCards.length }
  );
  r.unmount();
}

// 5. Adding a new card appends it to the column and fires onCardAdd callback
{
  let addPayload = null;
  const r = render(
    <KanbanBoard
      initialColumns={SAMPLE_COLUMNS}
      onCardAdd={(columnId, card) => {
        addPayload = { columnId, card };
      }}
    />
  );

  const doneCol = q('[data-column-id="done"]', r.container);
  const toggleBtn = doneCol ? q('button[data-action="toggle-add-card"]', doneCol) : null;
  if (toggleBtn) fire.click(toggleBtn);

  const titleInput = doneCol ? q('[data-card-input="title"]', doneCol) : null;
  const descInput = doneCol ? q('[data-card-input="description"]', doneCol) : null;
  const submitBtn = doneCol ? q('button[data-action="submit-card"]', doneCol) : null;

  if (titleInput) fire.change(titleInput, 'Ship Feature');
  if (descInput) fire.change(descInput, 'Ready for deployment');
  if (submitBtn) fire.click(submitBtn);

  const doneCards = qa('[data-column-id="done"] [data-card-id]', r.container);
  const passed =
    addPayload !== null &&
    addPayload.columnId === 'done' &&
    addPayload.card.title === 'Ship Feature' &&
    addPayload.card.description === 'Ready for deployment' &&
    doneCards.length === 1 &&
    q('[data-card-title]', doneCards[0])?.textContent === 'Ship Feature';

  $test.check(
    'Adding a new card appends it to the column and fires onCardAdd callback',
    passed,
    { addPayload, doneCardCount: doneCards.length }
  );
  r.unmount();
}
