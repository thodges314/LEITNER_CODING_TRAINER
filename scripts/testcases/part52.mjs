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
  'tailwind-arbitrary-parser': [
    c(
      'Parses simple dimension arbitrary value',
      `parseArbitraryClass('w-[32rem]')`,
      `({ property: 'w', value: '32rem', isNegative: false })`
    ),
    c(
      'Parses hex color arbitrary value',
      `parseArbitraryClass('bg-[#1da1f2]')`,
      `({ property: 'bg', value: '#1da1f2', isNegative: false })`
    ),
    c(
      'Extracts modifier chain and negative prefix flag',
      `parseArbitraryClass('hover:-mt-[2rem]')`,
      `({ modifier: 'hover', property: 'mt', value: '2rem', isNegative: true })`
    ),
    c(
      'Parses complex property name and multi-modifier chain',
      `parseArbitraryClass('dark:md:grid-cols-[200px_1fr]')`,
      `({ modifier: 'dark:md', property: 'grid-cols', value: '200px_1fr', isNegative: false })`
    ),
    c(
      'Parses calculation expressions containing arithmetic parentheses',
      `parseArbitraryClass('w-[calc(100%-2rem)]')`,
      `({ property: 'w', value: 'calc(100%-2rem)', isNegative: false })`
    ),
    c(
      'Parses standalone negative directional coordinate',
      `parseArbitraryClass('-top-[15px]')`,
      `({ property: 'top', value: '15px', isNegative: true })`
    ),
    c(
      'Returns null for standard non-arbitrary utility classes',
      `parseArbitraryClass('p-4')`,
      `null`
    ),
    c(
      'Returns null for malformed brackets or missing property',
      `parseArbitraryClass('[100px]')`,
      `null`
    ),
    c(
      'Returns null for empty brackets',
      `parseArbitraryClass('w-[]')`,
      `null`
    ),
  ],
  'tailwind-badge-component': [
    r(
      'Renders neutral badge with md size and no dot by default',
      '<Badge>Draft</Badge>',
      'Renders span with inline-flex, rounded-full, text-slate-300, and border-slate-500/20',
      { callSignature: '<Badge>Draft</Badge>' }
    ),
    r(
      'Applies success, warning, danger, and info variant color tokens',
      '<Badge variant="success" />, <Badge variant="warning" />, <Badge variant="danger" />, <Badge variant="info" />',
      'Applies emerald, amber, rose, and sky translucent background and text color tokens',
      { callSignature: '<Badge variant={variant} />' }
    ),
    r(
      'Applies sm size padding and typography classes',
      '<Badge size="sm">Small</Badge>',
      'Applies text-xs and px-2 size classes',
      { callSignature: '<Badge size="sm" />' }
    ),
    r(
      'Renders decorative dot indicator with matching variant color when dot=true',
      '<Badge variant="success" dot={true}>Active</Badge>',
      'Renders child span with rounded-full and bg-emerald-400',
      { callSignature: '<Badge dot={true} />' }
    ),
    r(
      'Forwards extra HTML attributes to the outer container',
      '<Badge data-testid="status-pill" aria-label="System status">Live</Badge>',
      'Forwards data-testid and aria-label attributes to container span',
      { callSignature: '<Badge {...props} />' }
    ),
  ],
  'tailwind-responsive-card': [
    r(
      'Returns null when product is null or undefined',
      '<ResponsiveProductCard product={null} />',
      'Returns null, rendering empty container',
      { callSignature: '<ResponsiveProductCard product={null} />' }
    ),
    r(
      'Renders responsive article with flex-col on mobile and md:flex-row on desktop',
      '<ResponsiveProductCard product={{ title: "Keyboard", price: 99 }} />',
      'Renders semantic article with flex-col and md:flex-row classes',
      { callSignature: '<ResponsiveProductCard product={product} />' }
    ),
    r(
      'Renders product image container with aspect-video and md:w-48 md:aspect-square',
      '<ResponsiveProductCard product={{ title: "Mouse", price: 49, imageUrl: "..." }} />',
      'Renders image wrapper with aspect-video, md:w-48, and md:aspect-square',
      { callSignature: '<ResponsiveProductCard product={product} />' }
    ),
    r(
      'Displays product title, description, and price with optional strikethrough originalPrice',
      '<ResponsiveProductCard product={{ title: "Headphones", price: 199, originalPrice: 249, rating: 4.8 }} />',
      'Displays title, price, line-through original price, and rating',
      { callSignature: '<ResponsiveProductCard product={product} />' }
    ),
    r(
      'Renders badge pill overlay and triggers onAddToCart callback when clicked',
      '<ResponsiveProductCard product={{ title: "Lamp", price: 39, badge: "Best Seller" }} onAddToCart={fn} />',
      'Renders absolute top-3 left-3 badge pill and fires onAddToCart callback',
      { callSignature: '<ResponsiveProductCard product={product} onAddToCart={fn} />' }
    ),
  ],
  'tailwind-modal-dialog': [
    r(
      'Returns null when isOpen is false',
      '<ModalDialog isOpen={false} onClose={fn} title="Test">Body</ModalDialog>',
      'Returns null, rendering empty container',
      { callSignature: '<ModalDialog isOpen={false} onClose={fn} title="Test" />' }
    ),
    r(
      'Renders backdrop overlay with fixed inset-0, z-50, and backdrop-blur-sm when isOpen is true',
      '<ModalDialog isOpen={true} onClose={fn} title="Settings">Body</ModalDialog>',
      'Renders fixed inset-0 z-50 backdrop overlay with backdrop-blur-sm',
      { callSignature: '<ModalDialog isOpen={true} onClose={fn} title="Settings" />' }
    ),
    r(
      'Renders semantic dialog with role="dialog", aria-modal="true", and size classes',
      '<ModalDialog isOpen={true} size="lg" title="Delete" footer={<button>Confirm</button>}>Body</ModalDialog>',
      'Renders dialog with role="dialog", aria-modal="true", max-w-lg, and footer',
      { callSignature: '<ModalDialog isOpen={true} size="lg" title="Delete" />' }
    ),
    r(
      'Invokes onClose when clicking close button or backdrop',
      'Clicking close button and clicking backdrop container',
      'Invokes onClose callback for each dismiss trigger',
      { callSignature: 'onClose()' }
    ),
    r(
      'Invokes onClose when Escape key is pressed',
      'Dispatching keydown event with key: "Escape" on window',
      'Invokes onClose callback on Escape key press',
      { callSignature: 'onClose()' }
    ),
  ],
};
