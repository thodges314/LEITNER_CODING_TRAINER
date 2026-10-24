import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the DOM harness', ...o });

// react-components, batch 6: Stepper, Popover with placement, Nested comments.
export default {
  'stepper': [
    r('Renders progress navigation list with initial step marked active',
      'steps: Cart Review, Shipping Address, Payment Method',
      '<nav aria-label="Progress"> with <ol>, step 1 marked active, step 2 upcoming',
      { callSignature: '<Stepper steps={STEPS} />' }
    ),
    r('Back button is disabled on step 1 and Next button is labelled Next',
      'initialStep=0',
      'Back button disabled=true; Next button text="Next"',
      { callSignature: '<Stepper steps={STEPS} />' }
    ),
    r('Next button advances to step 2, notifies onStepChange, and enables Back',
      'click Next from step 1',
      'step 1 status="completed", step 2 status="active", onStepChange(1) called, Back enabled',
      { callSignature: 'fire.click(Next button)' }
    ),
    r('Direct navigation allowed to completed steps but blocked for upcoming steps',
      'click upcoming step 3 (blocked) vs click completed step 1 (navigates)',
      'click step 3 does nothing; click step 1 calls onStepChange(0)',
      { callSignature: 'fire.click(step 1 button)' }
    ),
    r('Final step shows Complete button and triggers onComplete on click',
      'initialStep=2 (last step)',
      'Next button labelled "Complete"; clicking invokes onComplete()',
      { callSignature: 'fire.click(Complete button)' }
    ),
  ],

  'popover': [
    r('Initial render shows trigger button with aria-haspopup and popover hidden',
      'closed state',
      '<button data-action="trigger"> with aria-haspopup="dialog" and aria-expanded="false"; dialog hidden',
      { callSignature: '<Popover trigger={<button>Open</button>} content={<p>Body</p>} />' }
    ),
    r('Clicking trigger opens dialog with default bottom placement, title, and body',
      'click trigger',
      'renders <div role="dialog" data-placement="bottom"> with title and content; aria-expanded="true"',
      { callSignature: 'fire.click(trigger)' }
    ),
    r('Custom placement top is applied and close button dismisses dialog',
      'placement="top"; click close button',
      'data-placement="top"; clicking close button dismisses dialog and calls onToggle(false)',
      { callSignature: '<Popover placement="top" ... /> -> click close button' }
    ),
    r('Pressing Escape closes open popover and notifies onToggle',
      'open popover -> keydown Escape',
      'dialog is closed; onToggle(false) called',
      { callSignature: 'fire.keyDown(window, "Escape")' }
    ),
    r('A mousedown outside popover container dismisses the popover',
      'open popover -> mousedown outside',
      'dialog is closed; onToggle(false) called',
      { callSignature: 'fire.event(outsideElement, mousedown)' }
    ),
  ],

  'nested-comments': [
    r('Renders comment hierarchy with author info, text, and nested children',
      'SAMPLE_COMMENTS tree with parent and child comments',
      'displays author name, timestamp, comment text, and nested <ul> for child comments',
      { callSignature: '<NestedComments comments={SAMPLE_COMMENTS} />' }
    ),
    r('Collapse button hides child comments and changes to Expand, and expands on re-click',
      'click Collapse on comment with children',
      'nested children hidden, button text becomes "Expand"; clicking again restores children',
      { callSignature: 'fire.click(Collapse button)' }
    ),
    r('Reply composer submits non-empty text, notifies onAddReply, and closes composer',
      'click Reply on comment -> enter text -> click Submit',
      'onAddReply(id, text) called; reply composer closed',
      { callSignature: 'fire.click(submit reply)' }
    ),
    r('Submitting blank or whitespace-only reply does not invoke onAddReply',
      'click Reply -> submit blank text',
      'onAddReply not called; empty submission ignored',
      { callSignature: 'submit blank reply' }
    ),
    r('Enforces maxDepth by omitting Reply button on comments at or beyond depth limit',
      'maxDepth=2: comment at depth 1 has Reply; comment at depth 2 does not',
      'Reply button present on depth < maxDepth; omitted on depth >= maxDepth',
      { callSignature: '<NestedComments comments={SAMPLE_COMMENTS} maxDepth={2} />' }
    ),
  ],
};
