import { c } from './part1.mjs';
const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });

// More React cards (hooks and components).
export default {
  'use-toggle-counter': [
    r('useToggle starts with the initial value (default false)', 'useToggle()', 'value === false'),
    r('useToggle accepts an initial value', 'useToggle(true)', 'value === true'),
    r('toggle flips the value, ignores its arguments and keeps a stable identity', "toggle({ type: 'click' }), then toggle()", 'true, then false; the same toggle function on every render'),
    r('setValue sets the value explicitly', 'setValue(true) twice', 'true both times'),
    r('useCounter increments, decrements and resets', 'useCounter({ initial: 5 }): increment, increment, decrement, reset', 'count 6, then 5 after reset'),
    r('useCounter respects step, min and max (including the initial value)', 'useCounter({ step: 5, min: 0, max: 12 }): 3x increment, decrement, set(-50); useCounter({ initial: 99, max: 10 })', 'count 12, then 0; initial count 10'),
    r('useCounter functions keep a stable identity', 'useCounter({ initial: 1, step: 2 }), increment once, compare functions', 'increment, decrement, reset, set are unchanged'),
  ],
  'filter-list': [
    r('Shows every item and the count before typing', "<FilterList items={['Apple','Banana','Cherry','apricot','Blueberry']} />", "5 <li>; status '5 results'"),
    r('Filters case-insensitively as you type', "type 'AP'", "Apple, apricot; '2 results'"),
    r('Whitespace around the query is ignored', "type '  blue '", 'Blueberry'),
    r('Shows "No matches" when nothing matches', "type 'zzz'", "no <li>; status 'No matches'"),
    r('Uses the singular "1 result" and an empty query shows everything again', "type 'cher', then clear", "'1 result', then '5 results'"),
  ],
  'accordion-component': [
    r('All panels start closed', '<Accordion items={[First, Second, Third]} />', "no role='region'; every button aria-expanded='false'; 3 <h3>"),
    r('Clicking a title opens its panel (aria-expanded=true)', "click 'Second'", "panel 'Beta text'; aria-expanded='true'"),
    r('Opening another panel closes the first by default', "click 'First', then 'Third'", "only 'Gamma text'; First aria-expanded='false'"),
    r('Clicking an open title closes it', "click 'First' twice", 'no panel rendered'),
    r('allowMultiple keeps several panels open', "allowMultiple; click 'First', then 'Third'", "'Alpha text' and 'Gamma text' both rendered"),
    r('Buttons are wired to their panels with aria-controls and aria-labelledby', "open 'Second'", 'button.aria-controls === panel.id; panel.aria-labelledby === button.id'),
  ],
  'simple-error-boundary': [
    r('Renders its children when nothing throws', "<SimpleErrorBoundary fallback={<p>oops</p>}><p>fine</p></...>", "'fine'"),
    r('Shows the fallback when a child throws', 'a child component throws while rendering', "'oops' is rendered instead"),
    r('An error in one boundary does not affect a sibling boundary', 'two boundaries side by side, only the first child throws', "first shows 'failed', second shows 'healthy'"),
    r('onError is called once with the error', "child throws Error('kaput'); onError={fn}", "fn called once with the 'kaput' error"),
  ],
  'a11y-form-field': [
    r('ToggleButton exposes aria-pressed and reports the toggled value', "<ToggleButton pressed={false} onPressedChange={fn}>Bold</ToggleButton>", "aria-pressed 'false' then 'true'; onPressedChange called with true, then false"),
    r('FormField links the label to the control', "<FormField label='Email'>{(p) => <input {...p} />}</FormField>", 'label.htmlFor === input.id (non-empty)'),
    r('Hint and error are referenced by aria-describedby', "<FormField label='Email' hint='We never share it' error='Required'>{(p) => <input {...p} />}</FormField>", "aria-describedby = '<hintId> <errorId>' pointing at both paragraphs"),
    r('An error marks the control aria-invalid and is announced with role="alert"', "<FormField label='Email' error='Required'>{(p) => <input {...p} />}</FormField>", "input aria-invalid='true'; <p role='alert'>Required</p> referenced by aria-describedby"),
    r('Without hint or error there is no aria-describedby or aria-invalid', "<FormField label='Email'>{(p) => <input {...p} />}</FormField>", 'neither attribute on the input; no role=alert'),
  ],
  'load-more-list': [
    r('Loads the first page on mount and shows a loading state', 'mount <LoadMoreList fetchPage={fn} />', "fetchPage(1) called once; <p role='status'> shown; no 'Load more' button"),
    r('Shows the items and a Load more button while hasMore is true', "page 1 resolves { items: ['a','b'], hasMore: true }", "<li> a, b; 'Load more' button; no loading status"),
    r('Load more appends the next page', "click 'Load more'; page 2 resolves ['c']", 'requested pages 1, 2; list a, b, c'),
    r('The button disappears after the last page', "page 2 resolves { items: ['b'], hasMore: false }", "no 'Load more'; list a, b"),
    r('A failed page shows an alert and Retry reloads the same page', "page 2 rejects, click 'Retry'", "alert 'Failed to load' and list 'a'; page 2 requested again; after success list a, b and no alert"),
    r('Ignores extra clicks while a page is loading', "click 'Load more' three times quickly", 'fetchPage called only twice in total'),
  ],
};
