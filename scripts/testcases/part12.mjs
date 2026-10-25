import { c } from './part1.mjs';
const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });

// react-components, batch 4.
export default {
  'toast-queue': [
    r('Renders a labelled notifications region, empty at first', '<ToastProvider><Child /></ToastProvider>', "role='region' aria-label='Notifications' with no toasts"),
    r('show adds a status toast with the message and returns an id', "show('Saved!', { duration: 0 })", "one role='status' toast reading 'Saved!'; the return value is a number"),
    r('The Dismiss button removes only its toast', "show('A'), show('B'); click the Dismiss button of A", "only 'B' remains"),
    r('dismiss(id) removes a toast programmatically', "id = show('A'); show('B'); dismiss(id)", "only 'B' remains"),
    r('A toast disappears by itself after its duration', "show('Temp', { duration: 240 })", "'Temp' is there after 40 ms and gone after about 240 ms"),
    r('Only the newest `limit` toasts are kept (default 3), in creation order', "show 1..5 (default limit); then limit={2} and show 1..3", "'3,4,5'; then '2,3'"),
    r('A duration of 0 or Infinity keeps the toast until dismissed', "show('Sticky', { duration: 0 }); show('Forever', { duration: Infinity }); wait 300 ms", "both toasts still shown"),
  ],
  'image-carousel': [
    r(
      'Shows the first slide with a "1 of N" label',
      "<Carousel slides={['one', 'two', 'three']} />",
      '<section aria-roledescription="carousel" aria-label="Gallery" tabIndex={0}><div role="group" aria-roledescription="slide" aria-label="1 of 3">one</div><button>Previous</button><button>Next</button><button aria-label="Go to slide 1" aria-current="true" /><button aria-label="Go to slide 2" /><button aria-label="Go to slide 3" /></section>'
    ),
    r(
      'Next and Previous move between slides',
      'click Next, Next, then Previous',
      'Next x2 shows <div aria-label="3 of 3">three</div>; Previous moves back to <div aria-label="2 of 3">two</div>'
    ),
    r(
      'With loop the carousel wraps around at both ends',
      'click Previous on slide 1, then Next',
      'Previous wraps around to "three" (3 of 3); Next wraps back to "one" (1 of 3)'
    ),
    r(
      'Without loop the buttons are disabled at the ends',
      '<Carousel slides={slides} loop={false} />',
      'at start: Previous is disabled, Next enabled; on slide 3: Next is disabled, Previous enabled'
    ),
    r(
      'Dots jump to a slide and mark only the current one with aria-current',
      'click dot with aria-label="Go to slide 3"',
      'jumps directly to "three"; only dot 3 has aria-current="true"'
    ),
    r(
      'Arrow keys on the carousel change slides',
      'press ArrowRight, ArrowRight, ArrowLeft on section',
      'section tabIndex={0} receives keydown; navigates 1 -> 2 -> 3 -> 2 ("two")'
    ),
    r(
      'autoPlayMs advances the slide automatically',
      '<Carousel slides={slides} autoPlayMs={90} />',
      'timer advances slides automatically (e.g. "one" -> "two" -> "three") and wraps around'
    ),
  ],
  'optimistic-like-button': [
    r('Renders "Like (count)" with aria-pressed false', '<LikeButton initialCount={4} />', "'Like (4)'; aria-pressed='false'"),
    r('Clicking updates the UI immediately, before the request finishes', "click; onToggle still pending", "'Unlike (5)'; aria-pressed='true'; onToggle called once"),
    r('onToggle receives the new liked value and an unlike decrements the count', 'initialLiked, initialCount={2}; click', "onToggle(false); label 'Like (1)'"),
    r('A failed request rolls back the state and shows an alert', "click; onToggle rejects", "'Like (4)'; aria-pressed='false'; <p role='alert'>Could not update</p>"),
    r('Clicks while a request is pending are ignored', 'click three times before the request settles', "onToggle called once; 'Unlike (1)'"),
    r('The error clears on the next click and a successful request keeps the new state', 'fail once, click again, then resolve', "alert gone right after the click; 'Unlike (1)' at the end"),
  ],
};
