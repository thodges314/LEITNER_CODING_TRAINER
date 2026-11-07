import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the DOM harness', ...o });

export default {
  'tailwind-cva-variants': [
    c(
      'Applies base classes and resolved default variants',
      `const button = cva('font-medium rounded-lg', {
  variants: {
    intent: {
      primary: 'bg-blue-600 text-white',
      secondary: 'bg-slate-200 text-slate-900',
    },
  },
  defaultVariants: { intent: 'primary' },
});
button()`,
      `'font-medium rounded-lg bg-blue-600 text-white'`
    ),
    c(
      'Overriding default variant and combining multiple variants',
      `const button = cva('btn', {
  variants: {
    intent: { primary: 'bg-blue-600', secondary: 'bg-slate-200' },
    size: { sm: 'text-sm p-1', md: 'text-base p-2' },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});
button({ intent: 'secondary', size: 'sm' })`,
      `'btn bg-slate-200 text-sm p-1'`
    ),
    c(
      'Compound variants trigger when all specified conditions match',
      `const button = cva('btn', {
  variants: {
    intent: { primary: 'bg-blue-600', secondary: 'bg-slate-200' },
    size: { sm: 'p-1', lg: 'p-4' },
  },
  compoundVariants: [
    { intent: 'primary', size: 'lg', className: 'uppercase shadow-lg' },
  ],
});
button({ intent: 'primary', size: 'lg' })`,
      `'btn bg-blue-600 p-4 uppercase shadow-lg'`
    ),
    c(
      'Compound variants do not trigger on partial condition mismatch',
      `const button = cva('btn', {
  variants: {
    intent: { primary: 'bg-blue-600', secondary: 'bg-slate-200' },
    size: { sm: 'p-1', lg: 'p-4' },
  },
  compoundVariants: [
    { intent: 'primary', size: 'lg', className: 'uppercase shadow-lg' },
  ],
});
button({ intent: 'secondary', size: 'lg' })`,
      `'btn bg-slate-200 p-4'`
    ),
    c(
      'Appends extra className passed at invocation time',
      `const button = cva('btn', {
  variants: { intent: { primary: 'bg-blue-600' } },
  defaultVariants: { intent: 'primary' },
});
button({ className: 'm-2 hover:opacity-90' })`,
      `'btn bg-blue-600 m-2 hover:opacity-90'`
    ),
    c(
      'Normalizes array base classes and filters falsy items and extra whitespace',
      `const alert = cva(['font-semibold', '  text-center  ', null, false], {});
alert()`,
      `'font-semibold text-center'`
    ),
    c(
      'Returns empty string when no base classes or variants are provided',
      `const empty = cva();
empty()`,
      `''`
    ),
  ],
  'tailwind-merge-classes': [
    c(
      'Resolves simple padding conflict by overriding earlier utility',
      `twMerge('p-2', 'p-4')`,
      `'p-4'`
    ),
    c(
      'Preserves non-conflicting directional padding and additional classes',
      `twMerge('p-4 px-2', 'px-6 text-white')`,
      `'p-4 px-6 text-white'`
    ),
    c(
      'Overrides background colors while preserving non-conflicting utilities',
      `twMerge('bg-red-500 text-slate-800', 'bg-blue-600')`,
      `'text-slate-800 bg-blue-600'`
    ),
    c(
      'Distinguishes text size utilities from text color utilities without collision',
      `twMerge('text-sm text-red-500', 'text-blue-500 text-lg')`,
      `'text-blue-500 text-lg'`
    ),
    c(
      'Scopes conflict resolution to identical modifier prefixes',
      `twMerge('hover:bg-red-500 bg-slate-900', 'hover:bg-blue-600')`,
      `'bg-slate-900 hover:bg-blue-600'`
    ),
    c(
      'Evaluates object arguments and filters falsy conditions',
      `twMerge('rounded-md', false, { 'rounded-full': true, 'opacity-50': false })`,
      `'rounded-full'`
    ),
    c(
      'Resolves display utility conflicts',
      `twMerge('flex items-center', 'hidden')`,
      `'items-center hidden'`
    ),
    c(
      'Returns empty string when all arguments are empty or falsy',
      `twMerge('', null, undefined, false)`,
      `''`
    ),
  ],
  'tailwind-button-states': [
    r(
      'Renders button element with primary variant and md size by default',
      '<Button>Save Changes</Button>',
      'Button rendered with type="button", primary bg-indigo-600, text-white, px-4, and text-sm',
      { callSignature: '<Button>Save Changes</Button>' }
    ),
    r(
      'Applies secondary, destructive, and outline variant styling classes',
      '<Button variant="secondary" />, <Button variant="destructive" />, <Button variant="outline" />',
      'Applies bg-slate-800, bg-rose-600, and border border-slate-700 styling classes',
      { callSignature: '<Button variant={variant} />' }
    ),
    r(
      'Applies sm and lg size padding and typography classes',
      '<Button size="sm" />, <Button size="lg" />',
      'sm applies text-xs px-2.5; lg applies text-base px-5',
      { callSignature: '<Button size={size} />' }
    ),
    r(
      'Disables button and applies disabled styling classes when disabled=true',
      '<Button disabled={true} onClick={fn}>Disabled Action</Button>',
      'Button receives disabled attribute, disabled styling classes, and suppresses click events',
      { callSignature: '<Button disabled={true} />' }
    ),
    r(
      'Renders animated SVG spinner and sets aria-busy when loading=true',
      '<Button loading={true}>Submitting</Button>',
      'Button receives aria-busy="true", disabled attribute, and inline SVG spinner with animate-spin',
      { callSignature: '<Button loading={true} />' }
    ),
    r(
      'Forwards extra HTML attributes and responds to click events when active',
      '<Button data-testid="submit-btn" aria-label="Confirm Action" onClick={fn}>Confirm</Button>',
      'Passes extra HTML attributes and executes onClick callback on user click',
      { callSignature: '<Button onClick={fn} {...props} />' }
    ),
  ],
};
