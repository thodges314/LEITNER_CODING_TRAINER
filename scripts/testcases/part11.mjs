import { c } from './part1.mjs';
const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });

const ROWS = 'rows: Ada 36, Grace 45, Linus 10, Alan 41, Margaret 9, Dennis 70, Barbara 33; pageSize 3';

// React cards, batch 3.
export default {
  'memo-derived-list': [
    r('Renders the items sorted ascending without mutating the prop', '<SortedList items={[30, 4, 100, 12]} />', "<li> 4, 12, 30, 100; the items prop is still [30, 4, 100, 12]"),
    r('Clicking the counter does not recompute the sorted list', "click 'Count: 0' twice", "button 'Count: 2'; onCompute called 1 time in total"),
    r('A new items array does recompute it', 'rerender with items [9, 8]', 'onCompute called 2 times; list 8, 9'),
    r("An empty list renders no items but keeps the counter", "<SortedList items={[]} />", "no <li>; button 'Count: 0'"),
  ],
  'undo-redo-hook': [
    r('Starts with the initial state and nothing to undo or redo', "useHistory('a')", "state 'a'; canUndo false; canRedo false"),
    r('undo and redo do nothing at the ends', 'undo() then redo() on a fresh history', "state still 'a'"),
    r('set pushes a new state and enables undo', "set('b')", "state 'b'; canUndo true; canRedo false"),
    r('undo and redo walk back and forth', 'useHistory(0): set(1), set(2), undo, undo, redo', 'states 1, 0, then 1; canRedo true'),
    r('set after undo discards the redo branch', 'set(1), set(2), undo, set(99)', 'state 99; canRedo false'),
    r('set accepts an updater function and ignores an unchanged value', 'useHistory(5): set(n => n + 1), set(6), undo', 'state 5; canUndo false (the repeated 6 added nothing)'),
    r('limit drops the oldest history entries', 'useHistory(0, 2): set 1, 2, 3; undo three times', 'state 1; canUndo false'),
    r('set, undo and redo keep a stable identity', 'call set(1) and compare functions', 'unchanged references'),
  ],
  'form-state-hook': [
    r('Starts with the initial values and no touched fields', "useForm({ initialValues: { email: '', agree: false } })", "values.email ''; touched {}; isSubmitting false"),
    r('handleChange updates the named field', "handleChange({ target: { name: 'email', value: 'a@b.co' } })", "values.email 'a@b.co'; agree stays false"),
    r('Checkbox inputs use checked instead of value', "handleChange({ target: { name: 'agree', type: 'checkbox', checked: true } })", 'values.agree === true'),
    r('errors come from validate(values) for the current values', "email '' then 'ada@example.com'", "errors.email 'Invalid email', then undefined"),
    r('handleBlur marks only that field touched', "handleBlur({ target: { name: 'email' } })", 'touched.email true; touched.agree undefined'),
    r('handleSubmit prevents default, touches every field and does not submit invalid values', 'handleSubmit({ preventDefault }) with an invalid email', 'preventDefault called once; onSubmit not called; touched.email and touched.agree true'),
    r('handleSubmit calls onSubmit with the values and isSubmitting is true while it runs', 'valid values; onSubmit returns a pending promise', 'isSubmitting true until it resolves, then false; onSubmit called once with the values'),
    r('reset restores the initial values and clears touched', "change + blur email, then reset()", "values.email ''; touched {}"),
  ],
  'simple-table': [
    r('Renders one header cell per column label', "columns [{ key: 'name', label: 'Name' }, { key: 'age', label: 'Age' }]", "<th> texts: 'Name', 'Age'"),
    r('Renders one row per item with cells in column order', "rows [{ name: 'Ada', age: 36 }, { name: 'Grace', age: 45 }]", "2 <tr>; <td> texts: Ada, 36, Grace, 45"),
    r('Missing, undefined and null values render as empty cells', "rows [{ name: 'Ada' }, { age: null, name: 'Bob' }]", "<td> texts: 'Ada', '', 'Bob', ''"),
    r('An empty table shows a single "No rows" cell spanning all columns', 'rows = []', "one <tr> with <td colSpan=2>No rows</td>"),
  ],
  'data-table': [
    r('Renders a header per column and the first page of rows', ROWS, "headers Name, Age; rows Ada, Grace, Linus; 'Page 1 of 3'"),
    r('Clicking a header sorts ascending, then descending, then restores the original order', "click 'Name' three times", "Ada,Alan,Barbara (ascending) → Margaret,Linus,Grace (descending) → Ada,Grace,Linus (none)"),
    r('Numbers sort numerically (9 before 10) and other columns reset to none', "click 'Age'", "Margaret (9), Linus (10), Barbara (33); Name aria-sort='none', Age 'ascending'"),
    r('Filter matches any column, case-insensitively', "type 'ALAN', then '4'", "'Alan'; then 'Grace, Alan' (ages 45 and 41)"),
    r('No matches shows "No results" and Page 1 of 1', "type 'zzz'", "one row with <td colSpan=2>No results</td>; 'Page 1 of 1'"),
    r('Pagination: Next / Previous move between pages and are disabled at the ends', "click 'Next' twice", "Previous disabled on page 1; page 2 = Alan, Margaret, Dennis ('Page 2 of 3'); page 3 = Barbara with Next disabled"),
    r('Filtering returns to page 1', "go to page 2, then type '4'", "'Page 1 of 1' showing Grace, Alan"),
    r('Sorting applies across all pages, not just the visible one', "click 'Age' twice (descending), then 'Next'", 'page 2 shows Ada, Barbara, Linus (36, 33, 10)'),
  ],
  'dropdown-menu': [
    r('Closed by default: the trigger has aria-haspopup and aria-expanded=false', "<DropdownMenu label='Actions' items={[Edit, Copy, Delete (disabled), Share]} />", "no role='menu'; aria-haspopup='menu'; aria-expanded='false'"),
    r('Clicking the trigger opens the menu (aria-expanded=true, four items)', "click 'Actions'", "role='menu' with 4 menuitems; aria-expanded='true'"),
    r('Opening focuses the first enabled item', "click 'Actions'", "document.activeElement is 'Edit'"),
    r('ArrowDown/ArrowUp move between enabled items, skip disabled ones and wrap', 'open, then ArrowDown ×3, ArrowUp', 'focus: Edit → Copy → Share → Edit → Share (Delete is skipped)'),
    r('Home and End jump to the first and last enabled items', 'open, End, then Home', "focus 'Share', then 'Edit'"),
    r('Clicking an item calls onSelect, closes the menu and refocuses the trigger', "open, click 'Copy'", "onSelect('copy'); menu gone; focus on the trigger"),
    r('Enter on a focused item selects it', "open, ArrowDown (Copy), Enter", "onSelect('copy'); menu closed"),
    r('Escape closes the menu and refocuses the trigger', 'open, Escape', 'menu gone; focus on the trigger'),
    r('A mousedown outside closes the menu', 'open, mousedown on a button outside', 'menu gone'),
    r('Disabled items cannot be selected (the menu stays open)', "open, click 'Delete'", "onSelect not called; menu still open; aria-disabled='true'"),
  ],
  'virtual-list': [
    r('Renders only the visible window plus overscan', "1000 items, itemHeight 20, height 100, overscan 2", "7 listitems: 'Item 0' … 'Item 6'"),
    r('The scroll area has the full virtual height', 'same props', "an inner element with style.height '20000px'"),
    r('Scrolling moves the rendered window', 'scrollTop = 2000 (+ scroll event)', "9 listitems from 'Item 98'; includes 'Item 100'; no 'Item 0'"),
    r('Items are absolutely positioned at index * itemHeight', 'scrollTop = 2000', "'Item 100' has position absolute, top '2000px', height '20px'"),
    r('The window is clamped at the end of the list', 'scrollTop = 19900', "last rendered is 'Item 999'; at most 10 items"),
    r('Short lists render everything', "items ['a', 'b', 'c']", "listitems a, b, c"),
  ],
};
