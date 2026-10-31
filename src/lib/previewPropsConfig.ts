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
    { name: 'onChange', type: 'function', description: 'Callback fired on toggle: (next: boolean) => void' },
  ],
  'tag-input': [
    {
      name: 'value',
      type: 'json',
      defaultValue: ['react', 'javascript', 'typescript'],
      description: 'Array of current string tags',
    },
    { name: 'max', type: 'number', defaultValue: 5, min: 1, max: 20, placeholder: 'Max tags (or empty for Infinity)', description: 'Maximum allowed tags' },
    { name: 'onChange', type: 'function', description: 'Callback with updated tag array: (next: string[]) => void' },
  ],
  'tooltip': [
    { name: 'content', type: 'string', defaultValue: 'Additional details appear on hover or focus', placeholder: 'Tooltip content', description: 'Tooltip popup message' },
  ],
  'popover': [
    { name: 'placement', type: 'enum', defaultValue: 'bottom', options: ['bottom', 'top', 'left', 'right'], description: 'Popover placement relative to trigger' },
    { name: 'title', type: 'string', defaultValue: 'Popover Details', placeholder: 'Popover title (optional)', description: 'Header title text' },
    { name: 'content', type: 'string', defaultValue: 'Helpful contextual information and action items.', placeholder: 'Popover content', description: 'Body text inside popover' },
    { name: 'isOpen', type: 'boolean', defaultValue: false, description: 'Controlled open state (toggle to test controlled mode)' },
    { name: 'onToggle', type: 'function', description: 'Callback fired when open state toggles: (open: boolean) => void' },
  ],
  'stepper': [
    {
      name: 'steps',
      type: 'json',
      defaultValue: [
        { id: '1', title: 'Personal Details', description: 'Name & Contact' },
        { id: '2', title: 'Account Setup', description: 'Password & Security' },
        { id: '3', title: 'Confirmation', description: 'Review & Submit' },
      ],
      description: 'Array of StepItem objects ({ id, title, description? })',
    },
    { name: 'initialStep', type: 'number', defaultValue: 0, min: 0, max: 5, description: 'Starting step index (0-indexed)' },
    { name: 'onStepChange', type: 'function', description: 'Callback fired when active step changes: (index: number) => void' },
    { name: 'onComplete', type: 'function', description: 'Callback fired when stepper finishes: () => void' },
  ],
  'dropdown-menu': [
    { name: 'label', type: 'string', defaultValue: 'Options ▾', placeholder: 'Menu trigger label', description: 'Trigger button label' },
    {
      name: 'items',
      type: 'json',
      defaultValue: [
        { id: 'edit', label: 'Edit Profile' },
        { id: 'duplicate', label: 'Duplicate Entry' },
        { id: 'archive', label: 'Archive Record', disabled: true },
        { id: 'delete', label: 'Delete Forever' },
      ],
      description: 'Array of MenuItem objects ({ id, label, disabled? })',
    },
    { name: 'onSelect', type: 'function', description: 'Callback when menu item is clicked: (id: string) => void' },
  ],
  'modal-portal-focus': [
    { name: 'isOpen', type: 'boolean', defaultValue: false, description: 'Controls whether modal is rendered' },
    { name: 'content', type: 'string', defaultValue: 'Focus is trapped inside this modal while open.', placeholder: 'Modal body text', description: 'Modal body content' },
    { name: 'onClose', type: 'function', description: 'Callback fired to dismiss modal: () => void' },
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
    {
      name: 'defaultValue',
      type: 'enum',
      defaultValue: 'account',
      options: ['account', 'password', 'settings'],
      description: 'Initial active tab value (uncontrolled mode)',
    },
    {
      name: 'value',
      type: 'enum',
      options: ['account', 'password', 'settings'],
      description: 'Controlled active tab value (overrides internal state)',
    },
    { name: 'onChange', type: 'function', description: 'Callback fired when active tab changes' },
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
    { name: 'siblings', type: 'number', defaultValue: 1, min: 0, max: 3, description: 'Number of sibling page links adjacent to current (defaults to 1)' },
    { name: 'onPageChange', type: 'function', description: 'Callback with newly selected page number: (page: number) => void' },
  ],
  'optimistic-like-button': [
    { name: 'initialCount', type: 'number', defaultValue: 42, min: 0, max: 9999, description: 'Initial like count (defaults to 0)' },
    { name: 'initialLiked', type: 'boolean', defaultValue: false, description: 'Whether the current user has already liked (defaults to false)' },
    { name: 'onToggle', type: 'function', description: 'Async callback invoked on like toggle: (nextLiked: boolean) => Promise<unknown>' },
  ],
  'toast-queue': [
    { name: 'limit', type: 'number', defaultValue: 3, min: 1, max: 10, description: 'Maximum visible concurrent toasts' },
    { name: 'duration', type: 'number', defaultValue: 3000, min: 500, max: 10000, step: 500, description: 'Auto-dismiss delay in ms' },
    { name: 'message', type: 'string', defaultValue: 'Changes saved successfully!', placeholder: 'Toast message', description: 'Message for new toast' },
  ],
  'image-carousel': [
    {
      name: 'slides',
      type: 'json',
      defaultValue: [
        'Slide 1: Welcome to Leitner',
        'Slide 2: Spaced Repetition',
        'Slide 3: Cold-Start Mastery',
      ],
      description: 'Array of slide text contents',
    },
    { name: 'loop', type: 'boolean', defaultValue: true, description: 'Wrap around back to first slide after last' },
    { name: 'autoPlayMs', type: 'number', defaultValue: 3000, min: 500, max: 10000, step: 500, placeholder: 'ms (optional)', description: 'Auto-play delay in milliseconds (clear to disable)' },
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
    { name: 'itemHeight', type: 'number', defaultValue: 35, min: 20, max: 100, step: 5, description: 'Fixed pixel height of each item' },
    { name: 'height', type: 'number', defaultValue: 200, min: 100, max: 600, step: 20, description: 'Height in pixels of virtual scrolling viewport' },
    { name: 'overscan', type: 'number', defaultValue: 3, min: 0, max: 10, description: 'Extra buffer items rendered above/below visible window (defaults to 3)' },
    { name: 'itemsCount', type: 'number', defaultValue: 1000, min: 10, max: 10000, step: 100, description: 'Total number of items in dataset' },
  ],
  'infinite-scroll-list': [
    {
      name: 'items',
      type: 'json',
      defaultValue: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
      description: 'Initial array of string items rendered in the list',
    },
    { name: 'hasMore', type: 'boolean', defaultValue: true, description: 'Whether further pages remain to be fetched' },
    { name: 'loading', type: 'boolean', defaultValue: false, description: 'Active loading state flag' },
    { name: 'onLoadMore', type: 'function', description: 'Callback fired when sentinel intersects: () => void' },
  ],
  'load-more-list': [
    {
      name: 'fetchPage',
      type: 'function',
      description: 'Async function: (page: number) => Promise<{ items: string[], hasMore: boolean }>',
    },
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
    { name: 'delay', type: 'number', defaultValue: 100, min: 0, max: 1000, step: 50, placeholder: 'ms (default 300)', description: 'Debounce delay in milliseconds before fetching suggestions' },
    {
      name: 'suggestions',
      type: 'json',
      defaultValue: ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blueberry', 'Cherry', 'Cranberry', 'Date', 'Elderberry', 'Fig', 'Grape'],
      description: 'Suggestion pool filtered by fetchSuggestions',
    },
    { name: 'onSelect', type: 'function', description: 'Callback fired when an item is chosen: (item: string) => void' },
  ],
  'combobox-autocomplete-a11y': [
    { name: 'label', type: 'string', defaultValue: 'Destination Country', placeholder: 'Combobox label', description: 'Accessible label' },
    { name: 'placeholder', type: 'string', defaultValue: 'Search countries...', placeholder: 'Search placeholder', description: 'Input placeholder text' },
    {
      name: 'options',
      type: 'json',
      defaultValue: [
        { id: 'c-us', label: 'United States', value: 'US' },
        { id: 'c-ca', label: 'Canada', value: 'CA' },
        { id: 'c-mx', label: 'Mexico', value: 'MX' },
        { id: 'c-gb', label: 'United Kingdom', value: 'GB' },
        { id: 'c-fr', label: 'France', value: 'FR' },
        { id: 'c-de', label: 'Germany', value: 'DE', disabled: true },
        { id: 'c-jp', label: 'Japan', value: 'JP' },
      ],
      description: 'Array of ComboboxOption objects ({ id, label, value, disabled? })',
    },
    { name: 'onSelect', type: 'function', description: 'Callback fired when an option is selected: (option) => void' },
  ],
  'roving-tabindex-toolbar': [
    { name: 'label', type: 'string', defaultValue: 'Editor Actions', placeholder: 'Toolbar label', description: 'Accessible toolbar label' },
    {
      name: 'items',
      type: 'json',
      defaultValue: [
        { id: 'cut', label: 'Cut' },
        { id: 'copy', label: 'Copy' },
        { id: 'paste', label: 'Paste' },
        { id: 'delete', label: 'Delete' },
      ],
      description: 'Array of ToolbarItem objects ({ id, label })',
    },
  ],
  'live-announcer': [
    { name: 'politeness', type: 'enum', defaultValue: 'polite', options: ['polite', 'assertive'], description: 'ARIA live region politeness' },
    { name: 'message', type: 'string', defaultValue: 'Changes saved successfully.', placeholder: 'Announcement text', description: 'Message sent to screen reader' },
  ],
  'form-error-summary': [
    {
      name: 'onSubmit',
      type: 'function',
      description: 'Callback invoked on valid submission: (values: { name: string, email: string }) => void',
    },
  ],
  'action-state-form': [
    { name: 'delayMs', type: 'number', defaultValue: 600, min: 100, max: 3000, step: 100, description: 'Simulated server network delay in milliseconds' },
    {
      name: 'subscribe',
      type: 'function',
      description: 'Async submission action: (email: string) => Promise<{ ok: boolean; error?: string }>',
    },
  ],
  'suspense-use-promise': [
    { name: 'delayMs', type: 'number', defaultValue: 800, min: 100, max: 3000, step: 100, description: 'Simulated async resource delay in ms' },
    { name: 'name', type: 'string', defaultValue: 'Ada Lovelace', placeholder: 'User name', description: 'User name resolved by promise' },
    { name: 'role', type: 'string', defaultValue: 'Algorithm Pioneer', placeholder: 'User role', description: 'User role resolved by promise' },
  ],
  'tabs-transition-suspense': [
    { name: 'delayMs', type: 'number', defaultValue: 600, min: 100, max: 2000, step: 100, description: 'Simulated async tab data delay in milliseconds' },
    { name: 'load', type: 'function', description: 'Async function fetching tab text: (tabId: string) => Promise<string>' },
  ],
  'file-explorer-tree': [
    {
      name: 'nodes',
      type: 'json',
      defaultValue: [
        {
          name: 'src',
          children: [
            { name: 'App.jsx' },
            { name: 'index.css' },
            {
              name: 'components',
              children: [{ name: 'Button.jsx' }, { name: 'Header.jsx' }],
            },
          ],
        },
        { name: 'package.json' },
        { name: 'README.md' },
      ],
      description: 'Array of FileNode objects ({ name, children? })',
    },
    { name: 'onSelect', type: 'function', description: 'Callback fired when a leaf file node is clicked: (path: string) => void' },
  ],
  'nested-checkbox-tree': [
    {
      name: 'treeData',
      type: 'json',
      defaultValue: [
        {
          id: 'frontend',
          label: 'Frontend',
          children: [
            { id: 'react', label: 'React' },
            { id: 'typescript', label: 'TypeScript' },
          ],
        },
        {
          id: 'backend',
          label: 'Backend',
          children: [
            { id: 'node', label: 'Node.js' },
            { id: 'postgres', label: 'PostgreSQL' },
          ],
        },
      ],
      description: 'Array of TreeNode objects ({ id, label, children? })',
    },
    {
      name: 'initialChecked',
      type: 'json',
      defaultValue: ['react'],
      description: 'Initial array of checked node IDs',
    },
  ],
  'nested-comments': [
    {
      name: 'comments',
      type: 'json',
      defaultValue: [
        {
          id: '1',
          author: 'Sarah Chen',
          timestamp: '3 hours ago',
          text: 'What is the best way to handle optimistic UI updates with nested comments?',
          children: [
            {
              id: '2',
              author: 'Alex River',
              timestamp: '2 hours ago',
              text: 'Assign a client-generated UUID and rollback if the server responds with an error.',
            },
          ],
        },
        {
          id: '3',
          author: 'Jordan Miller',
          timestamp: '1 hour ago',
          text: 'Great article on tree traversals for threaded discussions.',
        },
      ],
      description: 'Array of CommentItem objects ({ id, author, text, timestamp, children? })',
    },
    { name: 'maxDepth', type: 'number', defaultValue: 4, min: 1, max: 8, description: 'Maximum nesting depth for child replies (defaults to 4)' },
    { name: 'onAddReply', type: 'function', description: 'Callback fired when a reply is submitted: (parentId: string, text: string) => void' },
  ],
  'kanban-board': [
    {
      name: 'initialColumns',
      type: 'json',
      defaultValue: [
        {
          id: 'todo',
          title: 'To Do',
          cards: [
            { id: 't1', title: 'Implement Auth Flow', description: 'JWT tokens and refresh flow' },
            { id: 't2', title: 'Cache Strategy', description: 'Configure Redis cache layers' },
          ],
        },
        {
          id: 'in-dev',
          title: 'In Progress',
          cards: [
            { id: 'd1', title: 'Kanban board card authoring', description: 'Adding full TS types' },
          ],
        },
        {
          id: 'done',
          title: 'Completed',
          cards: [
            { id: 'c1', title: 'Interactive Stepper' },
            { id: 'c2', title: 'Popover positioning' },
          ],
        },
      ],
      description: 'Array of KanbanColumn objects ({ id, title, cards: [{ id, title, description? }] })',
    },
    { name: 'onCardMove', type: 'function', description: 'Callback fired when a card moves: (cardId, fromCol, toCol, newIdx) => void' },
    { name: 'onCardAdd', type: 'function', description: 'Callback fired when a card is added: (colId, card) => void' },
  ],
  'drag-sortable-list': [
    {
      name: 'items',
      type: 'json',
      defaultValue: [
        { id: 'step-1', label: '1. Gather Requirements' },
        { id: 'step-2', label: '2. Design System Tokens' },
        { id: 'step-3', label: '3. Implement Accessible Components' },
        { id: 'step-4', label: '4. Run Mutation & E2E Tests' },
        { id: 'step-5', label: '5. Deploy to Production' },
      ],
      description: 'Array of SortableItem objects ({ id, label })',
    },
    { name: 'onReorder', type: 'function', description: 'Callback fired when items are reordered: (items) => void' },
  ],
  'transfer-list': [
    {
      name: 'initialLeft',
      type: 'json',
      defaultValue: ['HTML', 'CSS', 'JavaScript'],
      description: 'Initial array of items in the left available list',
    },
    {
      name: 'initialRight',
      type: 'json',
      defaultValue: ['React', 'TypeScript'],
      description: 'Initial array of items in the right selected list',
    },
  ],
  'controlled-vs-uncontrolled-input': [
    {
      name: 'onSearch',
      type: 'function',
      description: 'Callback invoked with trimmed query string upon form submission',
    },
  ],
  'forward-ref-imperative-handle': [
    { name: 'placeholder', type: 'string', defaultValue: 'Type here...', placeholder: 'Input placeholder', description: 'Input field placeholder' },
    { name: 'defaultValue', type: 'string', defaultValue: 'Hello World', placeholder: 'Initial text value', description: 'Initial input text' },
  ],
  'memo-stable-callbacks': [
    {
      name: 'items',
      type: 'json',
      defaultValue: ['Alpha', 'Beta', 'Gamma', 'Delta'],
      description: 'Array of string items passed to memoized List child',
    },
    { name: 'onListRender', type: 'function', description: 'Callback fired when List child renders: () => void' },
  ],
  'memo-derived-list': [
    {
      name: 'items',
      type: 'json',
      defaultValue: [42, 7, 19, 3, 99, 14, 28],
      description: 'Array of numbers to sort via useMemo',
    },
    { name: 'onCompute', type: 'function', description: 'Callback fired on sort recalculation: () => void' },
  ],
  'focus-on-mount': [
    { name: 'label', type: 'string', defaultValue: 'Username:', placeholder: 'Input label', description: 'Associated input label' },
    { name: 'placeholder', type: 'string', defaultValue: 'Focuses automatically on mount', placeholder: 'Input placeholder', description: 'Input placeholder text' },
  ],
  'error-boundary-reset': [
    { name: 'errorMessage', type: 'string', defaultValue: 'Crashed in BuggyWidget', placeholder: 'Error message', description: 'Simulated failure message' },
    { name: 'resetKey', type: 'number', defaultValue: 0, min: 0, max: 100, description: 'Numeric reset key passed in resetKeys array' },
    { name: 'onError', type: 'function', description: 'Callback invoked when a descendant throws: (error, info) => void' },
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
    {
      name: 'steps',
      type: 'json',
      defaultValue: [
        {
          title: 'Account Information',
          fields: [
            { name: 'username', label: 'Username:' },
            { name: 'email', label: 'Email:' },
          ],
        },
        {
          title: 'Profile Details',
          fields: [
            { name: 'fullName', label: 'Full Name:' },
            { name: 'role', label: 'Role:' },
          ],
        },
      ],
      description: 'Array of StepDef objects ({ title, fields: [{ name, label }] })',
    },
    { name: 'onSubmit', type: 'function', description: 'Callback fired on final step completion: (values: Record<string, string>) => void' },
  ],
  'route-focus-and-skip-link': [
    { name: 'path', type: 'string', defaultValue: '/dashboard', placeholder: '/route/path', description: 'Current router URL path' },
    { name: 'title', type: 'string', defaultValue: 'Dashboard', placeholder: 'Page title', description: 'Current page title' },
    { name: 'children', type: 'string', defaultValue: 'On route change, focus moves to the h1 heading for screen readers. A skip-link is available above.', placeholder: 'Main body content', description: 'Page body content' },
  ],
  'context-provider-consumer': [
    { name: 'defaultTheme', type: 'enum', defaultValue: 'light', options: ['light', 'dark'], description: 'Initial theme value' },
  ],
  'stopwatch': [],
  'tic-tac-toe': [
    { name: 'onGameEnd', type: 'function', description: 'Callback fired when game ends: (result: "X" | "O" | "draw") => void' },
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
