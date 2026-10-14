import { c } from './part1.mjs';

/** Scenario documented as input -> expected; asserted by the card's DOM harness under the same label. */
const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });

// Cases for new React cards (hand-written harnesses in scripts/cards/<id>.harness.js).
export default {
  'use-local-storage-hook': [
    r('Uses the initial value when nothing is stored', "useLocalStorage('k', 'init') with no stored value", "'init'"),
    r('Reads an existing JSON value on mount', "localStorage k = '{\"a\":1}'; useLocalStorage('k', null)", '{ a: 1 }'),
    r('setValue updates state and stores JSON', "setValue(5)", "state 5; localStorage k === '5'"),
    r('setValue accepts an updater function (two calls in one batch)', 'setValue(n => n + 1) twice in one act()', "state 2; localStorage k === '2'"),
    r('Falls back to the initial value when the stored JSON is corrupt', "localStorage k = '{not valid json'", "'safe' (the initial value)"),
    r('A storage event for the same key updates the value (removal restores the initial value)', "StorageEvent(key k, newValue '\"from another tab\"'), then newValue null", "'from another tab', then 'init'"),
    r('Storage events for other keys are ignored', "StorageEvent with key 'some-other-key'", "value stays 'init'"),
    r('Changing the key reads the new key', "rerender with a different key whose stored value is 'B'", "'B'"),
  ],
  'on-click-outside-hook': [
    r('Calls the handler on a mousedown outside the element', 'mousedown on a button outside the ref element', 'handler called once'),
    r('Ignores mousedown inside the element (including children)', 'mousedown on the ref element and on its child button', 'handler not called'),
    r('Also reacts to touchstart', 'touchstart outside the ref element', 'handler called once'),
    r('Uses the latest handler', 'rerender with a new handler, then mousedown outside', 'only the new handler is called'),
    r('Removes its listeners on unmount', 'unmount, then mousedown outside', 'handler not called'),
  ],
  'external-store-hook': [
    r('setState shallow-merges a partial or an updater result', "createStore({ count: 0, name: 'Ada' }); setState({ count: 1 }); setState(s => ({ count: s.count + 1 }))", "{ count: 2, name: 'Ada' }"),
    r('subscribe notifies listeners until the returned unsubscribe is called', 'subscribe; setState({ n: 1 }); unsubscribe; setState({ n: 2 })', 'listener saw only n = 1'),
    r('setState does not notify when no value changed', 'setState({ n: 0 }) and an updater returning the same value, then setState({ n: 1 })', 'listener called once'),
    r('useStore renders the selected slice and updates on change', "useStore(store, s => s.count); then setState({ count: 5 })", "'count: 0', then 'count: 5'"),
    r('A component re-renders only when its selected slice changes', 'two components select count and name; setState({ count }) twice', 'the name component does not re-render'),
    r('useStore unsubscribes on unmount', 'mount then unmount a component using useStore', '1 active subscription, then 0'),
  ],
  'forward-ref-imperative-handle': [
    r('Other props reach the input', '<FancyInput placeholder="Your name" type="search" />', 'the <input> has that placeholder and type'),
    r('ref.current.focus() focuses the input', 'ref.current.focus()', 'document.activeElement is the input'),
    r('ref.current.getValue() returns the typed text', "type 'hello'; ref.current.getValue()", "'hello'"),
    r('ref.current.clear() empties the input and focuses it', "type 'hello'; ref.current.clear()", "input.value === ''; the input is focused"),
    r('The ref exposes only focus, clear and getValue (not the DOM node)', 'Object.keys(ref.current).sort()', "['clear', 'focus', 'getValue']; not an HTMLElement"),
  ],
  'memo-stable-callbacks': [
    r('Renders one list item per item', "<Parent items={['apple', 'banana', 'cherry']} />", "<li> texts: apple, banana, cherry"),
    r('Clicking an item shows it as selected', "click 'banana'", "'Selected: banana'"),
    r('Incrementing the counter does not re-render the memoized List', "click 'Count: 0' twice", "button 'Count: 2'; onListRender called 1 time in total"),
    r('Selecting an item re-renders Parent but not the List', "click 'apple', then 'cherry'", "'Selected: cherry'; onListRender called 1 time in total"),
    r('A new items array does re-render the List', "rerender with items ['x', 'y']", 'onListRender called 2 times; 2 <li> rendered'),
  ],
  'error-boundary-reset': [
    r('Renders its children when nothing throws', '<ErrorBoundary><Child /></ErrorBoundary> where Child renders normally', "'all good' is rendered"),
    r('Shows the fallback (called with the error) when a child throws', "fallback={(error) => <p>failed: {error.message}</p>}; child throws Error('boom')", "'failed: boom'; the child is not rendered"),
    r('onError receives the error and React error info, once', "child throws Error('boom'); onError={fn}", "fn called once with (Error('boom'), { componentStack: string })"),
    r('reset() from the fallback retries the children', 'fallback shows a retry button calling reset; the child stops throwing; click retry', "child rendered; fallback gone"),
    r('Changing resetKeys resets the boundary automatically', 'resetKeys={[1]} showing the fallback; child fixed; rerender resetKeys={[1]}, then [2]', 'fallback stays for [1]; children render after [2]'),
    r('A plain element works as the fallback', "fallback={<p>static fallback</p>}", "'static fallback' rendered"),
  ],
};
