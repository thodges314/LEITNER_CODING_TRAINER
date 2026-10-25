export type PropType = 'number' | 'string' | 'boolean' | 'enum' | 'function' | 'json';

export interface PropDefinition {
  name: string;
  propName?: string; // Display name when disambiguating multi-component cards (e.g. 'children')
  group?: string; // Component group name (e.g. 'ToggleButton', 'FormField')
  type: PropType;
  defaultValue?: unknown;
  options?: string[]; // for enum dropdowns
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface ComponentPropsConfig {
  cardId: string;
  props: PropDefinition[];
}

export const COMPONENT_PROPS_REGISTRY: Record<string, PropDefinition[]> = {
  'progress-bar': [
    { name: 'value', type: 'number', defaultValue: 45, min: 0, max: 100, step: 5, description: 'Current progress value (clear to trigger indeterminate)' },
    { name: 'max', type: 'number', defaultValue: 100, min: 1, max: 500, description: 'Maximum progress limit (defaults to 100)' },
    { name: 'label', type: 'string', defaultValue: 'Upload Progress', placeholder: 'Progress bar label', description: 'Accessible label (defaults to Progress)' },
  ],
  'star-rating-component': [
    { name: 'value', type: 'number', defaultValue: 3, min: 0, max: 10, step: 1, description: 'Selected star rating' },
    { name: 'max', type: 'number', defaultValue: 5, min: 1, max: 10, step: 1, description: 'Total star count' },
    { name: 'size', type: 'enum', defaultValue: 'medium', options: ['small', 'medium', 'large'], description: 'Visual star size' },
    { name: 'disabled', type: 'boolean', defaultValue: false, description: 'Disable star rating selection' },
    { name: 'onChange', type: 'function', description: 'Triggered when rating changes' },
  ],
  'countdown-component': [
    { name: 'seconds', type: 'number', defaultValue: 10, min: 1, max: 300, description: 'Starting countdown duration in seconds' },
    { name: 'tickMs', type: 'number', defaultValue: 500, min: 100, max: 2000, step: 100, description: 'Timer tick interval in milliseconds' },
    { name: 'onDone', type: 'function', description: 'Callback fired when timer reaches 0' },
  ],
  'switch-toggle-a11y': [
    { name: 'checked', type: 'boolean', defaultValue: false, description: 'Whether the switch is on' },
    { name: 'disabled', type: 'boolean', defaultValue: false, description: 'Prevent user interaction' },
    { name: 'children', type: 'string', defaultValue: 'Wi-Fi', placeholder: 'Switch label text', description: 'Label displayed next to switch' },
    { name: 'onChange', type: 'function', description: 'Callback fired on toggle' },
  ],
  'tag-input': [
    { name: 'max', type: 'number', defaultValue: 5, min: 1, max: 20, description: 'Maximum allowed tags' },
    { name: 'placeholder', type: 'string', defaultValue: 'Add a tag...', placeholder: 'Input placeholder', description: 'Placeholder for new tag input' },
    { name: 'disabled', type: 'boolean', defaultValue: false, description: 'Disable tag entry' },
    { name: 'onChange', type: 'function', description: 'Callback with updated tag array' },
  ],
  'tooltip': [
    { name: 'content', type: 'string', defaultValue: 'Additional details appear on hover or focus', placeholder: 'Tooltip content', description: 'Tooltip popup message' },
    { name: 'placement', type: 'enum', defaultValue: 'top', options: ['top', 'bottom', 'left', 'right'], description: 'Tooltip floating placement' },
    { name: 'delay', type: 'number', defaultValue: 200, min: 0, max: 1500, step: 50, description: 'Hover show delay in ms' },
  ],
  'popover': [
    { name: 'placement', type: 'enum', defaultValue: 'top', options: ['top', 'bottom', 'left', 'right'], description: 'Popover placement relative to trigger' },
    { name: 'title', type: 'string', defaultValue: 'Popover Details', placeholder: 'Popover title', description: 'Header title text' },
    { name: 'content', type: 'string', defaultValue: 'Helpful contextual information and action items.', placeholder: 'Popover content', description: 'Body text inside popover' },
    { name: 'arrow', type: 'boolean', defaultValue: true, description: 'Show triangular indicator arrow' },
  ],
  'stepper': [
    { name: 'initialStep', type: 'number', defaultValue: 0, min: 0, max: 5, description: 'Starting step index (0-indexed)' },
    { name: 'orientation', type: 'enum', defaultValue: 'horizontal', options: ['horizontal', 'vertical'], description: 'Layout orientation of steps' },
    { name: 'onStepChange', type: 'function', description: 'Triggered when active step changes' },
    { name: 'onComplete', type: 'function', description: 'Triggered when stepper finishes' },
  ],
  'dropdown-menu': [
    { name: 'label', type: 'string', defaultValue: 'Actions', placeholder: 'Menu button label', description: 'Trigger button label' },
    { name: 'disabled', type: 'boolean', defaultValue: false, description: 'Disable opening menu' },
    { name: 'onSelect', type: 'function', description: 'Callback when menu item is clicked' },
  ],
  'modal-portal-focus': [
    { name: 'isOpen', type: 'boolean', defaultValue: true, description: 'Controls whether modal is rendered' },
    { name: 'title', type: 'string', defaultValue: 'Confirm Action', placeholder: 'Modal title', description: 'Modal header title' },
    { name: 'closeOnOverlayClick', type: 'boolean', defaultValue: true, description: 'Dismiss when backdrop is clicked' },
    { name: 'onClose', type: 'function', description: 'Callback fired to dismiss modal' },
  ],
  'accordion-component': [
    {
      name: 'items',
      type: 'json',
      defaultValue: [
        { id: '1', title: 'What is Leitner?', content: 'A spaced repetition learning system based on flashcard boxes.' },
        { id: '2', title: 'How does it work?', content: 'Correct answers advance cards; mistakes return them to box 1.' },
        { id: '3', title: 'Why cold retrieval?', content: 'Strengthens recall memory without hints or autocomplete.' },
      ],
      description: 'Array of AccordionItem objects ({ id, title, content })',
    },
    { name: 'allowMultiple', type: 'boolean', defaultValue: false, description: 'Allow expanding multiple accordion panels simultaneously' },
  ],
  'tabs-accordion-compound': [
    { name: 'orientation', type: 'enum', defaultValue: 'horizontal', options: ['horizontal', 'vertical'], description: 'Tabs layout direction' },
    { name: 'defaultIndex', type: 'number', defaultValue: 0, min: 0, max: 4, description: 'Initial active tab index' },
  ],
  'a11y-form-field': [
    {
      name: 'togglePressed',
      propName: 'pressed',
      group: 'ToggleButton',
      type: 'boolean',
      defaultValue: false,
      description: 'Active aria-pressed state of toggle button',
    },
    {
      name: 'toggleChildren',
      propName: 'children',
      group: 'ToggleButton',
      type: 'string',
      defaultValue: 'Unmuted',
      placeholder: 'Button content/label',
      description: 'Button text content',
    },
    {
      name: 'toggleOnPressedChange',
      propName: 'onPressedChange',
      group: 'ToggleButton',
      type: 'function',
      description: 'Callback fired on toggle click: (next: boolean) => void',
    },
    {
      name: 'formLabel',
      propName: 'label',
      group: 'FormField',
      type: 'string',
      defaultValue: 'Email Address:',
      placeholder: 'Label text',
      description: 'Associated form field label',
    },
    {
      name: 'formHint',
      propName: 'hint',
      group: 'FormField',
      type: 'string',
      defaultValue: 'We will not share your email',
      placeholder: 'Helper text (optional)',
      description: 'Accessible helper description',
    },
    {
      name: 'formError',
      propName: 'error',
      group: 'FormField',
      type: 'string',
      defaultValue: '',
      placeholder: 'Error message (optional)',
      description: 'Validation alert message',
    },
    {
      name: 'formChildren',
      propName: 'children',
      group: 'FormField',
      type: 'function',
      description: 'Render prop: (fieldProps) => ReactNode',
    },
    {
      name: 'childControlType',
      propName: 'controlType',
      group: 'Child Control',
      type: 'enum',
      defaultValue: 'input',
      options: ['input', 'textarea', 'generic-div'],
      description: 'Element type rendered by child render prop',
    },
    {
      name: 'childPlaceholder',
      propName: 'placeholder',
      group: 'Child Control',
      type: 'string',
      defaultValue: 'you@domain.com',
      placeholder: 'Placeholder text',
      description: 'Placeholder attribute on child control',
    },
    {
      name: 'childDisabled',
      propName: 'disabled',
      group: 'Child Control',
      type: 'boolean',
      defaultValue: false,
      description: 'Whether child control is disabled',
    },
  ],
  'simple-table': [
    {
      name: 'columns',
      type: 'json',
      defaultValue: [
        { key: 'framework', label: 'Framework' },
        { key: 'language', label: 'Language' },
        { key: 'stars', label: 'GitHub Stars' },
      ],
      description: 'Array of Column<T> objects with key and label',
    },
    {
      name: 'rows',
      type: 'json',
      defaultValue: [
        { framework: 'React', language: 'JavaScript / TypeScript', stars: '220k' },
        { framework: 'Vue', language: 'TypeScript', stars: '205k' },
        { framework: 'Svelte', language: 'TypeScript', stars: '75k' },
      ],
      description: 'Array of row data objects (set to [] to test No rows)',
    },
  ],
  'data-table': [
    {
      name: 'columns',
      type: 'json',
      defaultValue: [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'score', label: 'Score' },
      ],
      description: 'Array of Column<T> objects with key and label',
    },
    {
      name: 'rows',
      type: 'json',
      defaultValue: [
        { name: 'Alice', role: 'Engineer', score: 95 },
        { name: 'Bob', role: 'Designer', score: 88 },
        { name: 'Charlie', role: 'Manager', score: 92 },
        { name: 'Diana', role: 'DevOps', score: 97 },
        { name: 'Evan', role: 'QA', score: 85 },
        { name: 'Fiona', role: 'Engineer', score: 91 },
      ],
      description: 'Array of row data objects',
    },
    { name: 'pageSize', type: 'number', defaultValue: 3, min: 1, max: 25, description: 'Rows per pagination page' },
  ],
  'pagination-controls': [
    { name: 'page', type: 'number', defaultValue: 2, min: 1, max: 20, description: 'Current active page number' },
    { name: 'totalPages', type: 'number', defaultValue: 10, min: 1, max: 100, description: 'Total available pages' },
    { name: 'siblingCount', type: 'number', defaultValue: 1, min: 0, max: 3, description: 'Number of sibling page links adjacent to current' },
    { name: 'onPageChange', type: 'function', description: 'Callback with newly selected page number' },
  ],
  'optimistic-like-button': [
    { name: 'initialLikes', type: 'number', defaultValue: 42, min: 0, max: 9999, description: 'Initial like count' },
    { name: 'initialLiked', type: 'boolean', defaultValue: false, description: 'Whether the current user has already liked' },
    { name: 'onLike', type: 'function', description: 'Async callback invoked on click' },
  ],
  'toast-queue': [
    { name: 'duration', type: 'number', defaultValue: 3000, min: 500, max: 10000, step: 500, description: 'Auto-dismiss delay in ms' },
    { name: 'position', type: 'enum', defaultValue: 'bottom-right', options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'], description: 'Toast stack position on viewport' },
  ],
  'image-carousel': [
    { name: 'loop', type: 'boolean', defaultValue: true, description: 'Wrap around back to first slide after last' },
    { name: 'autoPlay', type: 'boolean', defaultValue: false, description: 'Automatically advance slides on timer' },
    { name: 'interval', type: 'number', defaultValue: 3000, min: 500, max: 10000, step: 500, description: 'Auto-play delay in milliseconds' },
  ],
  'breadcrumbs-router': [
    {
      name: 'pathname',
      type: 'string',
      defaultValue: '/products/electronics/audio',
      placeholder: '/path/to/page',
      description: 'Current router route pathname',
    },
    {
      name: 'labels',
      type: 'json',
      defaultValue: {
        '/': 'Home',
        '/products': 'Catalog',
        '/products/electronics': 'Electronics',
        '/products/electronics/audio': 'Wireless Audio',
      },
      description: 'Record of custom label overrides per subpath',
    },
  ],
  'virtual-list': [
    { name: 'itemHeight', type: 'number', defaultValue: 36, min: 20, max: 100, description: 'Fixed pixel height of each item' },
    { name: 'windowHeight', type: 'number', defaultValue: 240, min: 100, max: 600, description: 'Height of virtual scrolling viewport' },
  ],
  'infinite-scroll-list': [
    { name: 'threshold', type: 'number', defaultValue: 100, min: 10, max: 500, description: 'Bottom scroll threshold in pixels before loading more' },
  ],
  'load-more-list': [
    { name: 'pageSize', type: 'number', defaultValue: 5, min: 1, max: 20, description: 'Number of items fetched per load batch' },
  ],
  'filter-list': [
    {
      name: 'items',
      type: 'json',
      defaultValue: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Swift', 'Kotlin', 'C++'],
      description: 'Array of string items to filter',
    },
  ],
  'typeahead-autocomplete': [
    { name: 'placeholder', type: 'string', defaultValue: 'Search items...', placeholder: 'Typeahead placeholder', description: 'Search input placeholder' },
    { name: 'minChars', type: 'number', defaultValue: 1, min: 1, max: 5, description: 'Minimum keystrokes before suggestions open' },
    { name: 'debounceMs', type: 'number', defaultValue: 200, min: 0, max: 1000, step: 50, description: 'Debounce delay for suggestions' },
  ],
  'combobox-autocomplete-a11y': [
    { name: 'label', type: 'string', defaultValue: 'Choose an option', placeholder: 'Combobox label', description: 'Accessible label' },
    { name: 'placeholder', type: 'string', defaultValue: 'Type to search...', placeholder: 'Search placeholder', description: 'Input placeholder text' },
    { name: 'disabled', type: 'boolean', defaultValue: false, description: 'Disable combobox interaction' },
  ],
  'roving-tabindex-toolbar': [
    { name: 'orientation', type: 'enum', defaultValue: 'horizontal', options: ['horizontal', 'vertical'], description: 'Keyboard arrow navigation direction' },
  ],
  'live-announcer': [
    { name: 'politeness', type: 'enum', defaultValue: 'polite', options: ['polite', 'assertive', 'off'], description: 'ARIA live region politeness' },
    { name: 'message', type: 'string', defaultValue: 'Changes saved successfully', placeholder: 'Announcement text', description: 'Message sent to screen reader' },
  ],
  'form-error-summary': [
    { name: 'title', type: 'string', defaultValue: 'Please fix the following errors:', placeholder: 'Banner title', description: 'Error summary banner title' },
    { name: 'autoFocus', type: 'boolean', defaultValue: true, description: 'Automatically focus banner on mount' },
  ],
  'action-state-form': [
    { name: 'action', type: 'function', description: 'Form submit action handler' },
  ],
  'suspense-use-promise': [
    { name: 'delayMs', type: 'number', defaultValue: 800, min: 100, max: 3000, step: 100, description: 'Simulated async resource delay in ms' },
  ],
  'tabs-transition-suspense': [
    { name: 'defaultTab', type: 'enum', defaultValue: 'profile', options: ['profile', 'settings', 'dashboard'], description: 'Starting tab panel' },
  ],
  'file-explorer-tree': [
    { name: 'expandAll', type: 'boolean', defaultValue: false, description: 'Expand all folders by default' },
  ],
  'nested-checkbox-tree': [
    { name: 'cascade', type: 'boolean', defaultValue: true, description: 'Cascade check state down and up to parent checkboxes' },
  ],
  'nested-comments': [
    { name: 'maxDepth', type: 'number', defaultValue: 4, min: 1, max: 8, description: 'Maximum nesting depth for child replies' },
  ],
  'kanban-board': [
    { name: 'allowNewTasks', type: 'boolean', defaultValue: true, description: 'Enable adding new cards to columns' },
  ],
  'drag-sortable-list': [
    { name: 'direction', type: 'enum', defaultValue: 'vertical', options: ['vertical', 'horizontal'], description: 'List layout orientation' },
  ],
  'transfer-list': [
    { name: 'showSelectAll', type: 'boolean', defaultValue: true, description: 'Display select all / deselect all buttons' },
  ],
  'controlled-vs-uncontrolled-input': [
    { name: 'defaultValue', type: 'string', defaultValue: 'Initial text', placeholder: 'Default text', description: 'Uncontrolled initial value' },
    { name: 'placeholder', type: 'string', defaultValue: 'Type something...', placeholder: 'Input placeholder', description: 'Text input placeholder' },
  ],
  'forward-ref-imperative-handle': [
    { name: 'placeholder', type: 'string', defaultValue: 'Focus me with ref', placeholder: 'Input placeholder', description: 'Input field placeholder' },
  ],
  'memo-stable-callbacks': [
    { name: 'multiplier', type: 'number', defaultValue: 2, min: 1, max: 10, description: 'Calculation multiplier prop' },
  ],
  'memo-derived-list': [
    { name: 'searchTerm', type: 'string', defaultValue: '', placeholder: 'Filter list...', description: 'Substring filter query' },
  ],
  'focus-on-mount': [
    { name: 'autoFocus', type: 'boolean', defaultValue: true, description: 'Focus target input upon mounting' },
  ],
  'error-boundary-reset': [
    { name: 'errorMessage', type: 'string', defaultValue: 'Failed to load component data', placeholder: 'Error message', description: 'Simulated failure message' },
    { name: 'onReset', type: 'function', description: 'Callback invoked to recover from error' },
  ],
  'simple-error-boundary': [
    {
      name: 'fallback',
      type: 'string',
      defaultValue: 'Something went wrong.',
      placeholder: 'Fallback message',
      description: 'Fallback content rendered when an error occurs',
    },
    {
      name: 'onError',
      type: 'function',
      description: 'Callback invoked when a descendant throws',
    },
  ],
  'multi-step-form': [
    { name: 'initialStep', type: 'number', defaultValue: 1, min: 1, max: 3, description: 'Starting form step (1-indexed)' },
  ],
  'route-focus-and-skip-link': [
    { name: 'skipTarget', type: 'string', defaultValue: '#main', placeholder: 'Skip target selector', description: 'Target element ID for skip link' },
  ],
  'context-provider-consumer': [
    { name: 'defaultTheme', type: 'enum', defaultValue: 'light', options: ['light', 'dark'], description: 'Initial theme value' },
  ],
  'stopwatch': [
    { name: 'format', type: 'enum', defaultValue: 'ms', options: ['ms', 'seconds'], description: 'Elapsed time display resolution' },
  ],
  'tic-tac-toe': [
    { name: 'startingPlayer', type: 'enum', defaultValue: 'X', options: ['X', 'O'], description: 'First turn player mark' },
  ],
};

export function getComponentPropsConfig(cardId: string): PropDefinition[] {
  return COMPONENT_PROPS_REGISTRY[cardId] || [];
}

export function getInitialPropValues(cardId: string): Record<string, unknown> {
  const defs = getComponentPropsConfig(cardId);
  const values: Record<string, unknown> = {};
  for (const def of defs) {
    if (def.defaultValue !== undefined) {
      values[def.name] = def.defaultValue;
    }
  }
  return values;
}
