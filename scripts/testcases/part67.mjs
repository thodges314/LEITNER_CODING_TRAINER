import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the DOM harness', ...o });

export default {
  'tabs-basic': [
    r(
      'Renders tablist, tab buttons, and first panel active by default',
      '<Tabs tabs={[{ id: "overview", label: "Overview", content: "Overview content" }, ...]} />',
      'first tab aria-selected="true", others "false", tabpanel shows "Overview content"'
    ),
    r(
      'Respects defaultIndex on initial render',
      '<Tabs tabs={TABS} defaultIndex={1} />',
      'second tab aria-selected="true", tabpanel shows "API reference"'
    ),
    r(
      'Clicking a tab switches aria-selected and the visible tabpanel content',
      'click third tab button',
      'third tab aria-selected="true", tabpanel shows "Usage examples"'
    ),
    r(
      'Empty tabs array renders no tabs and no tabpanel',
      '<Tabs tabs={[]} />',
      '0 role="tab" buttons and no role="tabpanel"'
    ),
  ],
  'render-counter-basics': [
    r(
      'Initial render shows Count 0 and Renders: 1',
      '<RenderCounter />',
      'button "Clicks: 0" and span "Renders: 1"'
    ),
    r(
      'Clicking increments count and render count together',
      '<RenderCounter label="Taps" />; click button twice',
      'button "Taps: 2" and span "Renders: 3"'
    ),
    r(
      'Parent rerender increments Renders while preserving count',
      'click button once, then rerender(<RenderCounter label="B" />)',
      'button "B: 1" and span "Renders: 3"'
    ),
    r(
      'Button uses type="button"',
      '<RenderCounter />',
      'button has attribute type="button"'
    ),
  ],
  'two-step-wizard': [
    r(
      'Starts on Step 1 with Name input and Next disabled until non-empty',
      '<TwoStepWizard onSubmit={fn} />',
      'Name input visible, Email input absent, Next button disabled'
    ),
    r(
      'Next enables when Name is entered',
      'type "Ada" into Name input',
      'Next button is enabled'
    ),
    r(
      'Advances to Step 2 with Email input and Submit disabled initially',
      'click Next',
      'Email input visible, Name input absent, Submit button disabled'
    ),
    r(
      'Back returns to Step 1 and preserves Name',
      'type "ada@example.com", click Back',
      'Name input still has "Ada"'
    ),
    r(
      'Returning to Step 2 preserves Email',
      'click Next',
      'Email input still has "ada@example.com"'
    ),
    r(
      'Submit calls onSubmit with collected { name, email }',
      'click Submit',
      'onSubmit called once with { name: "Ada", email: "ada@example.com" }'
    ),
  ],
  'tailwind-theme-card': [
    r(
      'Article container uses light and dark surface/border classes',
      '<ThemeCard title="Adaptive Surface" description="Uses dark: variants..." badge="v2" />',
      'article has bg-white, dark:bg-slate-900, border-slate-200, dark:border-slate-700'
    ),
    r(
      'Title uses light and dark text contrast classes',
      '<ThemeCard title="Adaptive Surface" ... />',
      'h3 has text-slate-900 and dark:text-slate-100'
    ),
    r(
      'Description uses light and dark muted text classes',
      '<ThemeCard ... description="Uses dark: variants..." />',
      'p has text-slate-600 and dark:text-slate-300'
    ),
    r(
      'Optional badge renders when provided with adaptive classes',
      '<ThemeCard ... badge="v2" />',
      'span renders "v2" with text-indigo-600 and dark:text-indigo-300'
    ),
    r(
      'Omits badge span when badge prop is undefined',
      '<ThemeCard title="No Badge" description="Plain card" />',
      'no badge <span> rendered'
    ),
  ],
};
