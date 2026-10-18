import { c } from './part1.mjs';

// Intro rungs (batch 4): notifications, wizard, optimistic-ui.
export default {
  'toast-queue-logic': [
    c('addToast appends a toast', `addToast([], { id: 1, message: 'Saved' })`, "[{ id: 1, message: 'Saved' }]"),
    c('Toasts stay in the order they were added', `addToast([{ id: 1, message: 'a' }], { id: 2, message: 'b' }).map((t) => t.id)`, '[1, 2]'),
    c('The default max is 3: the oldest toast is dropped', `addToast([{ id: 1, message: 'a' }, { id: 2, message: 'b' }, { id: 3, message: 'c' }], { id: 4, message: 'd' }).map((t) => t.id)`, '[2, 3, 4]'),
    c('A custom max is respected', `[addToast([{ id: 1, message: 'a' }, { id: 2, message: 'b' }], { id: 3, message: 'c' }, 2).map((t) => t.id), addToast([{ id: 1, message: 'a' }], { id: 2, message: 'b' }, 1).map((t) => t.id)]`, '[[2, 3], [2]]'),
    c('A toast with an existing id is updated in place and nothing is dropped', `addToast([{ id: 1, message: 'a' }, { id: 2, message: 'b' }], { id: 1, message: 'A!' }, 2)`, "[{ id: 1, message: 'A!' }, { id: 2, message: 'b' }]"),
    c('addToast does not change the list it is given', `const list = [{ id: 1, message: 'a' }];
addToast(list, { id: 2, message: 'b' });
list`, "[{ id: 1, message: 'a' }]"),
    c('dismissToast removes by id; an unknown id changes nothing', `[dismissToast([{ id: 1, message: 'a' }, { id: 2, message: 'b' }], 1), dismissToast([{ id: 1, message: 'a' }], 9)]`, "[[{ id: 2, message: 'b' }], [{ id: 1, message: 'a' }]]"),
    c('expireToasts removes toasts at or before now; toasts without expiresAt stay', `const toasts = [{ id: 1, message: 'a', expiresAt: 100 }, { id: 2, message: 'b', expiresAt: 200 }, { id: 3, message: 'c' }];
[99, 100, 500].map((now) => expireToasts(toasts, now).map((t) => t.id))`, '[[1, 2, 3], [2, 3], [3]]'),
  ],
  'wizard-step-logic': [
    c('Next and Back move by one', `[nextStep(0, 3), nextStep(1, 3), prevStep(2), prevStep(1)]`, '[1, 2, 1, 0]'),
    c('Next stops on the last step and Back stops on the first', `[nextStep(2, 3), nextStep(0, 1), prevStep(0)]`, '[2, 0, 0]'),
    c('stepStatuses marks done, current and upcoming steps', `[stepStatuses(1, 4), stepStatuses(0, 2), stepStatuses(3, 4)]`, "[['done', 'current', 'upcoming', 'upcoming'], ['current', 'upcoming'], ['done', 'done', 'done', 'current']]"),
    c('stepStatuses with no steps is an empty list', `stepStatuses(0, 0)`, '[]'),
    c('missingFields lists blank, null and undefined values in the order of required', `missingFields({ email: 'a@b.c', name: '   ', phone: null }, ['name', 'email', 'phone', 'city'])`, "['name', 'phone', 'city']"),
    c('0 and false are real values, not missing', `missingFields({ age: 0, agreed: false, note: ' x ' }, ['age', 'agreed', 'note'])`, '[]'),
    c('Nothing required means nothing missing', `missingFields({}, [])`, '[]'),
    c('progressPercent is the share of finished steps, rounded', `[progressPercent(0, 4), progressPercent(1, 4), progressPercent(2, 3), progressPercent(3, 4)]`, '[0, 25, 67, 75]'),
    c('progressPercent counts a single finished step as 100', `[progressPercent(1, 1), progressPercent(0, 1)]`, '[100, 0]'),
    c('progressPercent with no steps is 0', `progressPercent(0, 0)`, '0'),
  ],
  'optimistic-list-update': [
    c('toggleLike likes a post: liked flips on and the count goes up', `toggleLike({ id: 7, liked: false, likes: 10 })`, '{ id: 7, liked: true, likes: 11 }'),
    c('toggleLike unlikes a post: liked flips off and the count goes down', `toggleLike({ id: 7, liked: true, likes: 11 })`, '{ id: 7, liked: false, likes: 10 }'),
    c('toggleLike returns a new object and leaves the old post alone', `const post = { id: 7, liked: false, likes: 10 };
const next = toggleLike(post);
[next !== post, post]`, '[true, { id: 7, liked: false, likes: 10 }]'),
    c('applyOptimistic patches the item and marks it pending', `applyOptimistic([{ id: 1, title: 'a' }, { id: 2, title: 'b' }], 2, { title: 'B' })`, "[{ id: 1, title: 'a' }, { id: 2, title: 'B', pending: true }]"),
    c('applyOptimistic keeps other items as the same objects and does not change the original', `const items = [{ id: 1, title: 'a' }, { id: 2, title: 'b' }];
const next = applyOptimistic(items, 2, { title: 'B' });
[next[0] === items[0], next[1] === items[1], items[1]]`, "[true, false, { id: 2, title: 'b' }]"),
    c('confirmOptimistic swaps in the server version with pending: false', `confirmOptimistic([{ id: 1, title: 'a' }, { id: 2, title: 'B', pending: true }], 2, { id: 2, title: 'B (server)' })`, "[{ id: 1, title: 'a' }, { id: 2, title: 'B (server)', pending: false }]"),
    c('rollbackOptimistic puts the original back exactly, without a pending flag', `rollbackOptimistic([{ id: 1, title: 'a' }, { id: 2, title: 'B', pending: true }], 2, { id: 2, title: 'b' })`, "[{ id: 1, title: 'a' }, { id: 2, title: 'b' }]"),
    c('An id that is not in the list changes nothing', `const items = [{ id: 1, title: 'a' }];
[applyOptimistic(items, 9, { title: 'x' }), confirmOptimistic(items, 9, { id: 9 }), rollbackOptimistic(items, 9, { id: 9 })]`, "[[{ id: 1, title: 'a' }], [{ id: 1, title: 'a' }], [{ id: 1, title: 'a' }]]"),
  ],
};
