import { c } from './part1.mjs';

// Intro rungs (batch 3): history-state, carousel, dual-list.
export default {
  'history-stack-basic': [
    c('Starts with the initial value and nothing to undo or redo', `const h = createHistory('a');
[h.getPresent(), h.canUndo(), h.canRedo()]`, "['a', false, false]"),
    c('push changes the present and enables undo', `const h = createHistory(0);
h.push(1);
h.push(2);
[h.getPresent(), h.canUndo(), h.canRedo()]`, '[2, true, false]'),
    c('undo steps back one value at a time and returns the new present', `const h = createHistory(0);
h.push(1);
h.push(2);
[h.undo(), h.undo(), h.getPresent()]`, '[1, 0, 0]'),
    c('redo re-applies undone values in the original order', `const h = createHistory(0);
h.push(1);
h.push(2);
h.undo();
h.undo();
[h.redo(), h.redo(), h.canRedo()]`, '[1, 2, false]'),
    c('Pushing after an undo throws away the redo branch', `const h = createHistory(0);
h.push(1);
h.push(2);
h.undo();
h.push(9);
[h.getPresent(), h.canRedo(), h.undo(), h.undo()]`, '[9, false, 1, 0]'),
    c('undo and redo do nothing at the ends', `const h = createHistory('x');
const a = h.undo();
const b = h.redo();
h.push('y');
const c2 = h.redo();
[a, b, c2, h.canUndo()]`, "['x', 'x', 'y', true]"),
    c('Pushing the present value again creates no history entry', `const h = createHistory(1);
h.push(1);
[h.canUndo(), h.getPresent()]`, '[false, 1]'),
    c('push returns the present, also when the value is ignored', `const h = createHistory(1);
[h.push(2), h.push(2)]`, '[2, 2]'),
    c('One step of history is enough for the undo and redo flags', `const h = createHistory(0);
h.push(1);
const afterPush = [h.canUndo(), h.canRedo()];
h.undo();
[afterPush, [h.canUndo(), h.canRedo()]]`, '[[true, false], [false, true]]'),
    c('Undo works again after a redo, in the right order', `const h = createHistory(0);
h.push(1);
h.push(2);
h.undo();
h.undo();
h.redo();
h.redo();
[h.undo(), h.undo(), h.getPresent()]`, '[1, 0, 0]'),
    c('Two histories are independent', `const a = createHistory(0);
const b = createHistory(0);
a.push(5);
[a.getPresent(), b.getPresent(), b.canUndo()]`, '[5, 0, false]'),
  ],
  'carousel-index-math': [
    c('Next and Previous move by one in the middle', `[nextIndex(1, 5), prevIndex(3, 5)]`, '[2, 2]'),
    c('Next wraps from the last slide to the first', `[nextIndex(4, 5), nextIndex(4, 5, { loop: true })]`, '[0, 0]'),
    c('Previous wraps from the first slide to the last', `[prevIndex(0, 5), prevIndex(0, 5, { loop: true })]`, '[4, 4]'),
    c('With loop: false the ends stay put', `[nextIndex(4, 5, { loop: false }), prevIndex(0, 5, { loop: false })]`, '[4, 0]'),
    c('loop: false still moves normally in the middle', `[nextIndex(2, 5, { loop: false }), prevIndex(2, 5, { loop: false })]`, '[3, 1]'),
    c('A single slide always stays on slide 0', `[nextIndex(0, 1), prevIndex(0, 1), nextIndex(0, 1, { loop: false }), prevIndex(0, 1, { loop: false })]`, '[0, 0, 0, 0]'),
    c('No slides: index 0 and no dots', `[nextIndex(0, 0), prevIndex(0, 0), dotStates(0, 0)]`, '[0, 0, []]'),
    c('The slides next to the ends do not wrap', `[nextIndex(3, 5), nextIndex(3, 5, { loop: false }), prevIndex(1, 5), prevIndex(1, 5, { loop: false })]`, '[4, 4, 0, 0]'),
    c('No slides with loop: false still gives index 0', `[nextIndex(0, 0, { loop: false }), prevIndex(0, 0, { loop: false })]`, '[0, 0]'),
    c('dotStates marks only the current slide', `[dotStates(0, 3), dotStates(2, 4)]`, '[[true, false, false], [false, false, true, false]]'),
  ],
  'move-between-lists': [
    c('Selected items move from left to right and are appended', `moveSelected(['a', 'b', 'c'], ['x'], ['b'], 'right')`, "{ left: ['a', 'c'], right: ['x', 'b'] }"),
    c('Moved items keep their order from the source list, not the order of selected', `moveSelected(['a', 'b', 'c', 'd'], [], ['d', 'a'], 'right')`, "{ left: ['b', 'c'], right: ['a', 'd'] }"),
    c('Direction left moves from the right list to the left list', `moveSelected(['a'], ['x', 'y', 'z'], ['z', 'x'], 'left')`, "{ left: ['a', 'x', 'z'], right: ['y'] }"),
    c('Selected items that are not in the source list are ignored', `moveSelected(['a', 'b'], ['x'], ['x', 'q'], 'right')`, "{ left: ['a', 'b'], right: ['x'] }"),
    c('An empty selection changes nothing', `moveSelected(['a'], ['b'], [], 'right')`, "{ left: ['a'], right: ['b'] }"),
    c('The input arrays are not changed', `const left = ['a', 'b'];
const right = ['x'];
moveSelected(left, right, ['a'], 'right');
[left, right]`, "[['a', 'b'], ['x']]"),
    c('moveAll moves everything in the chosen direction', `[moveAll(['a', 'b'], ['x'], 'right'), moveAll(['a'], ['x', 'y'], 'left')]`, "[{ left: [], right: ['x', 'a', 'b'] }, { left: ['a', 'x', 'y'], right: [] }]"),
  ],
};
