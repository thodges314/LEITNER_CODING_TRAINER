import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the DOM harness', ...o });

// react-components, batch 7: Kanban Board, Drag & Keyboard Sortable List, Accessible Combobox (ARIA 1.2).
export default {
  'kanban-board': [
    r('Renders multi-column Kanban board with titles, card counts, and cards',
      'initialColumns with todo, in-progress, done',
      'renders 3 columns with matching data-column-title, counts, and data-card-id cards',
      { callSignature: '<KanbanBoard initialColumns={COLUMNS} />' }
    ),
    r('Boundary move buttons are disabled for outer columns',
      'todo (first) and done (last) columns',
      'Move Left disabled on first column cards; Move Right disabled on last column cards',
      { callSignature: '<KanbanBoard ... />' }
    ),
    r('Clicking Move Right shifts card to next column and fires onCardMove callback',
      'click Move Right on card 1 in todo',
      'card moved to end of in-progress column; onCardMove(cardId, "todo", "in-progress", newIdx) called',
      { callSignature: 'fire.click(moveRight)' }
    ),
    r('Clicking Move Left shifts card to previous column and fires onCardMove callback',
      'click Move Left on card 3 in in-progress',
      'card moved to end of todo column; onCardMove(cardId, "in-progress", "todo", newIdx) called',
      { callSignature: 'fire.click(moveLeft)' }
    ),
    r('Adding a new card appends it to the column and fires onCardAdd callback',
      'toggle add card -> input title and description -> submit',
      'new card rendered in column; onCardAdd(columnId, card) called',
      { callSignature: 'fire.click(submitCard)' }
    ),
  ],

  'drag-sortable-list': [
    r('Renders ordered list with items, draggable attributes, and item labels',
      'items with item-a, item-b, item-c',
      'renders list with 3 draggable items showing labels and data-item-index 0..2',
      { callSignature: '<DragSortableList items={ITEMS} />' }
    ),
    r('Move buttons are disabled at list boundaries',
      'index 0 and index 2',
      'first item Move Up disabled; last item Move Down disabled',
      { callSignature: '<DragSortableList items={ITEMS} />' }
    ),
    r('Clicking Move Down swaps item with adjacent item below and triggers onReorder',
      'click Move Down on item 0',
      'item-a swapped with item-b; onReorder called with [item-b, item-a, item-c]',
      { callSignature: 'fire.click(moveDown)' }
    ),
    r('Clicking Move Up swaps item with adjacent item above and triggers onReorder',
      'click Move Up on item 2',
      'item-c swapped with item-b; onReorder called with [item-a, item-c, item-b]',
      { callSignature: 'fire.click(moveUp)' }
    ),
    r('Drag and drop reorders dragged item to target index and triggers onReorder',
      'dragstart on item 0 -> drop on item 2',
      'item-a moved to position 2; onReorder called with [item-b, item-c, item-a]',
      { callSignature: 'dispatchEvent(dragstart) -> dispatchEvent(drop)' }
    ),
  ],

  'combobox-autocomplete-a11y': [
    r('Initial render has combobox role, aria-expanded false, and listbox hidden',
      'closed combobox',
      'input has role="combobox", aria-autocomplete="list", aria-expanded="false"; listbox not rendered',
      { callSignature: '<AccessibleCombobox id="fruits" label="Choose" options={OPTIONS} />' }
    ),
    r('Typing query filters options, opens listbox, and announces count in live status',
      'type "ch" into input',
      'listbox renders matching option; aria-expanded="true"; role="status" announces "1 results available"',
      { callSignature: 'fire.change(input, "ch")' }
    ),
    r('ArrowDown navigates active descendant skipping disabled options',
      'ArrowDown to open -> ArrowDown to advance',
      'aria-activedescendant points to active option; skips disabled option',
      { callSignature: 'fire.keyDown(input, "ArrowDown")' }
    ),
    r('Enter key selects active option, closes popup, and fires onSelect',
      'highlight option -> press Enter',
      'calls onSelect(option); updates input text; aria-expanded="false"',
      { callSignature: 'fire.keyDown(input, "Enter")' }
    ),
    r('Mouse click on enabled option selects it while disabled options are ignored',
      'click disabled option vs click enabled option',
      'clicking disabled does nothing; clicking enabled selects and calls onSelect',
      { callSignature: 'fire.click(optionElement)' }
    ),
  ],
};
