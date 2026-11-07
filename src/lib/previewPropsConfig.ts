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
  'vnode-to-dom': [
    { name: 'cardTitle', type: 'string', defaultValue: 'Interactive Card', placeholder: 'Card title', description: 'Heading text for the virtual DOM card' },
    { name: 'description', type: 'string', defaultValue: 'Nested DOM nodes constructed from a virtual node tree.', placeholder: 'Card description', description: 'Body text for the virtual DOM card' },
    { name: 'buttonText', type: 'string', defaultValue: 'Click Me', placeholder: 'Button label', description: 'Text label inside the action button' },
    { name: 'buttonColor', type: 'enum', defaultValue: '#0284c7', options: ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], description: 'Background color applied to the button style object' },
  ],
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
  'd3-react-imperative-chart': [
    {
      name: 'data',
      type: 'json',
      defaultValue: [
        { label: 'Mon', value: 18 },
        { label: 'Tue', value: 42 },
        { label: 'Wed', value: 31 },
        { label: 'Thu', value: 65 },
        { label: 'Fri', value: 50 },
        { label: 'Sat', value: 24 },
        { label: 'Sun', value: 38 },
      ],
      description: 'Array of BarDataPoint objects ({ label, value })',
    },
    {
      name: 'width',
      type: 'number',
      defaultValue: 360,
      min: 200,
      max: 600,
      step: 20,
      description: 'Chart width in pixels',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 160,
      min: 100,
      max: 400,
      step: 10,
      description: 'Chart height in pixels',
    },
  ],
  'd3-css-coordinate-layout': [
    {
      name: 'data',
      type: 'json',
      defaultValue: [
        { id: '1', x: 10, y: 20, value: 15, label: 'A', color: 'steelblue' },
        { id: '2', x: 80, y: 75, value: 45, label: 'B', color: 'seagreen' },
        { id: '3', x: 45, y: 90, value: 30, label: 'C', color: 'crimson' },
        { id: '4', x: 70, y: 30, value: 20, label: 'D', color: 'purple' },
        { id: '5', x: 30, y: 55, value: 40, label: 'E', color: 'teal' },
      ],
      description: 'Array of CoordinatePoint objects ({ id, x, y, value, label, color })',
    },
    {
      name: 'width',
      type: 'number',
      defaultValue: 400,
      min: 250,
      max: 600,
      step: 25,
      description: 'Container width in pixels',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 280,
      min: 180,
      max: 500,
      step: 20,
      description: 'Container height in pixels',
    },
    {
      name: 'onSelectPoint',
      type: 'function',
      description: 'Callback fired on point click: (point: CoordinatePoint) => void',
    },
  ],
  'd3-graph-theory-visualizer': [
    {
      name: 'nodes',
      type: 'json',
      defaultValue: [
        { id: '1', label: 'Router' },
        { id: '2', label: 'Server A' },
        { id: '3', label: 'Server B' },
        { id: '4', label: 'Client 1' },
        { id: '5', label: 'Client 2' },
      ],
      description: 'Array of GraphNode objects ({ id, label })',
    },
    {
      name: 'links',
      type: 'json',
      defaultValue: [
        { source: '1', target: '2' },
        { source: '1', target: '3' },
        { source: '2', target: '4' },
        { source: '3', target: '5' },
      ],
      description: 'Array of GraphLink objects ({ source, target })',
    },
    {
      name: 'width',
      type: 'number',
      defaultValue: 400,
      min: 250,
      max: 600,
      step: 25,
      description: 'SVG canvas width in pixels',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 300,
      min: 200,
      max: 500,
      step: 20,
      description: 'SVG canvas height in pixels',
    },
    {
      name: 'onSelectNode',
      type: 'function',
      description: 'Callback fired on node click: (node: GraphNode) => void',
    },
  ],
  'd3-svg-bar-chart': [
    {
      name: 'data',
      type: 'json',
      defaultValue: [
        { label: 'Mon', value: 24 },
        { label: 'Tue', value: 45 },
        { label: 'Wed', value: 38 },
        { label: 'Thu', value: 72 },
        { label: 'Fri', value: 55 },
        { label: 'Sat', value: 30 },
        { label: 'Sun', value: 42 },
      ],
      description: 'Array of BarDatum objects ({ label, value })',
    },
    {
      name: 'width',
      type: 'number',
      defaultValue: 400,
      min: 250,
      max: 600,
      step: 25,
      description: 'Chart width in pixels',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 260,
      min: 180,
      max: 400,
      step: 20,
      description: 'Chart height in pixels',
    },
    {
      name: 'color',
      type: 'enum',
      defaultValue: 'steelblue',
      options: ['steelblue', 'seagreen', 'orange', 'purple', 'crimson'],
      description: 'Bar fill color',
    },
  ],
  'd3-svg-line-chart': [
    {
      name: 'data',
      type: 'json',
      defaultValue: [
        { x: 1, y: 15 },
        { x: 2, y: 35 },
        { x: 3, y: 22 },
        { x: 4, y: 58 },
        { x: 5, y: 44 },
        { x: 6, y: 68 },
        { x: 7, y: 52 },
      ],
      description: 'Array of LinePoint objects ({ x, y })',
    },
    {
      name: 'width',
      type: 'number',
      defaultValue: 420,
      min: 250,
      max: 600,
      step: 25,
      description: 'Chart width in pixels',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 260,
      min: 180,
      max: 400,
      step: 20,
      description: 'Chart height in pixels',
    },
    {
      name: 'strokeColor',
      type: 'enum',
      defaultValue: 'steelblue',
      options: ['steelblue', 'seagreen', 'orange', 'purple', 'crimson'],
      description: 'Line path stroke color',
    },
    {
      name: 'showPoints',
      type: 'boolean',
      defaultValue: true,
      description: 'Render circle markers at data points',
    },
  ],
  'd3-svg-donut-chart': [
    {
      name: 'data',
      type: 'json',
      defaultValue: [
        { label: 'React', value: 40, color: 'steelblue' },
        { label: 'Vue', value: 25, color: 'seagreen' },
        { label: 'Svelte', value: 20, color: 'orange' },
        { label: 'Angular', value: 15, color: 'crimson' },
      ],
      description: 'Array of DonutDatum objects ({ label, value, color? })',
    },
    {
      name: 'width',
      type: 'number',
      defaultValue: 400,
      min: 250,
      max: 600,
      step: 25,
      description: 'Chart width in pixels',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 300,
      min: 200,
      max: 500,
      step: 20,
      description: 'Chart height in pixels',
    },
    {
      name: 'innerRadius',
      type: 'number',
      defaultValue: 60,
      min: 0,
      max: 120,
      step: 10,
      description: 'Inner radius of donut hole (0 = solid pie chart)',
    },
    {
      name: 'centerLabel',
      type: 'string',
      defaultValue: 'Ecosystem',
      description: 'Summary label rendered in center hole',
    },
  ],
  'd3-svg-scatter-plot': [
    {
      name: 'data',
      type: 'json',
      defaultValue: [
        { x: 15, y: 30, label: 'Feature A', radius: 6 },
        { x: 25, y: 75, label: 'Feature B', radius: 8 },
        { x: 45, y: 50, label: 'Feature C', radius: 5 },
        { x: 60, y: 90, label: 'Feature D', radius: 10 },
        { x: 80, y: 40, label: 'Feature E', radius: 7 },
        { x: 95, y: 65, label: 'Feature F', radius: 9 },
      ],
      description: 'Array of ScatterDatum objects ({ x, y, label?, radius? })',
    },
    {
      name: 'width',
      type: 'number',
      defaultValue: 450,
      min: 300,
      max: 600,
      step: 25,
      description: 'Plot width in pixels',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 300,
      min: 200,
      max: 450,
      step: 20,
      description: 'Plot height in pixels',
    },
    {
      name: 'defaultRadius',
      type: 'number',
      defaultValue: 6,
      min: 3,
      max: 15,
      step: 1,
      description: 'Default point marker radius',
    },
    {
      name: 'color',
      type: 'enum',
      defaultValue: 'steelblue',
      options: ['steelblue', 'seagreen', 'orange', 'purple', 'crimson'],
      description: 'Marker fill color',
    },
  ],
  'd3-stratify-nested-hierarchy': [
    {
      name: 'data',
      type: 'json',
      defaultValue: [
        { id: 'flare', parentId: null },
        { id: 'analytics', parentId: 'flare' },
        { id: 'cluster', parentId: 'analytics', value: 3838 },
        { id: 'graph', parentId: 'analytics', value: 7000 },
        { id: 'optimization', parentId: 'analytics', value: 4500 },
        { id: 'animate', parentId: 'flare', value: 2000 },
        { id: 'physics', parentId: 'flare', value: 3200 },
      ],
      description: 'Flat array of records with id, parentId, and optional value',
    },
  ],
  'd3-quadtree-spatial-index': [
    {
      name: 'points',
      type: 'json',
      defaultValue: [
        { x: 40, y: 50, id: 'P1' },
        { x: 80, y: 120, id: 'P2' },
        { x: 120, y: 60, id: 'P3' },
        { x: 160, y: 200, id: 'P4' },
        { x: 200, y: 140, id: 'P5' },
        { x: 240, y: 80, id: 'P6' },
        { x: 280, y: 220, id: 'P7' },
        { x: 320, y: 110, id: 'P8' },
        { x: 360, y: 170, id: 'P9' },
        { x: 400, y: 90, id: 'P10' },
      ],
      description: 'Array of 2D coordinate objects ({ x, y, id? })',
    },
    {
      name: 'searchRadius',
      type: 'number',
      defaultValue: 45,
      min: 15,
      max: 120,
      step: 5,
      description: 'Interactive spatial search radius in pixels',
    },
    {
      name: 'width',
      type: 'number',
      defaultValue: 440,
      min: 300,
      max: 600,
      step: 20,
      description: 'Canvas width in pixels',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 280,
      min: 200,
      max: 400,
      step: 20,
      description: 'Canvas height in pixels',
    },
  ],
  'd3-delaunay-voronoi-snapping': [
    {
      name: 'points',
      type: 'json',
      defaultValue: [
        { x: 65, y: 55, id: 'p0', label: 'Sensor A' },
        { x: 185, y: 70, id: 'p1', label: 'Sensor B' },
        { x: 340, y: 65, id: 'p2', label: 'Sensor C' },
        { x: 110, y: 155, id: 'p3', label: 'Sensor D' },
        { x: 245, y: 150, id: 'p4', label: 'Sensor E' },
        { x: 380, y: 175, id: 'p5', label: 'Sensor F' },
        { x: 80, y: 240, id: 'p6', label: 'Sensor G' },
        { x: 215, y: 235, id: 'p7', label: 'Sensor H' },
        { x: 335, y: 245, id: 'p8', label: 'Sensor I' },
      ],
      description: 'Array of 2D coordinate points ({ x, y, id?, label? })',
    },
    {
      name: 'pointRadius',
      type: 'number',
      defaultValue: 5,
      min: 3,
      max: 10,
      step: 1,
      description: 'Base point marker radius in pixels',
    },
    {
      name: 'showCells',
      type: 'boolean',
      defaultValue: true,
      description: 'Show Voronoi polygon cell boundaries',
    },
    {
      name: 'pointColor',
      type: 'enum',
      defaultValue: 'steelblue',
      options: ['steelblue', 'seagreen', 'purple', 'teal'],
      description: 'Default point fill color',
    },
    {
      name: 'activeColor',
      type: 'enum',
      defaultValue: 'orange',
      options: ['orange', 'crimson', 'gold', 'deeppink'],
      description: 'Highlighted point fill color on cell hover/click',
    },
  ],
  'd3-treemap-squarified-tiling': [
    {
      name: 'data',
      type: 'json',
      defaultValue: {
        name: 'Frontend Bundle',
        children: [
          {
            name: 'Framework',
            children: [
              { name: 'react-dom', value: 420 },
              { name: 'router', value: 160 },
              { name: 'state', value: 95 },
            ],
          },
          {
            name: 'Visualization',
            children: [
              { name: 'd3-hierarchy', value: 240 },
              { name: 'd3-shape', value: 190 },
              { name: 'd3-scale', value: 145 },
            ],
          },
          {
            name: 'Editor',
            children: [
              { name: 'codemirror', value: 310 },
              { name: 'typescript-worker', value: 275 },
            ],
          },
        ],
      },
      description: 'Hierarchical nested tree data ({ name, value?, children? })',
    },
    {
      name: 'paddingInner',
      type: 'number',
      defaultValue: 3,
      min: 0,
      max: 12,
      step: 1,
      description: 'Inner spacing between sibling treemap cells',
    },
    {
      name: 'paddingOuter',
      type: 'number',
      defaultValue: 3,
      min: 0,
      max: 16,
      step: 1,
      description: 'Outer border padding around treemap container',
    },
    {
      name: 'round',
      type: 'boolean',
      defaultValue: true,
      description: 'Snap cell bounding coordinates to integer pixels',
    },
  ],
  'd3-force-simulation-headless': [
    {
      name: 'chargeStrength',
      type: 'number',
      defaultValue: -160,
      min: -400,
      max: -20,
      step: 10,
      description: 'Many-body electrostatic repulsion strength',
    },
    {
      name: 'linkDistance',
      type: 'number',
      defaultValue: 65,
      min: 25,
      max: 140,
      step: 5,
      description: 'Target spring distance between linked nodes',
    },
    {
      name: 'collisionRadius',
      type: 'number',
      defaultValue: 12,
      min: 4,
      max: 28,
      step: 2,
      description: 'Minimum node collision radius in pixels',
    },
    {
      name: 'maxTicks',
      type: 'number',
      defaultValue: 150,
      min: 5,
      max: 300,
      step: 5,
      description: 'Maximum synchronous numerical integration ticks',
    },
  ],
  'd3-brush-zoom-coordinator': [
    {
      name: 'focusHeight',
      type: 'number',
      defaultValue: 165,
      min: 110,
      max: 240,
      step: 5,
      description: 'Height of the upper focus detail chart',
    },
    {
      name: 'contextHeight',
      type: 'number',
      defaultValue: 55,
      min: 40,
      max: 100,
      step: 5,
      description: 'Height of the lower context brush mini-map',
    },
    {
      name: 'color',
      type: 'enum',
      defaultValue: 'steelblue',
      options: ['steelblue', 'seagreen', 'orange', 'purple', 'crimson'],
      description: 'Primary stroke and dot color for the focus chart',
    },
  ],
  'd3-geo-projection-path': [
    {
      name: 'projectionType',
      type: 'enum',
      defaultValue: 'mercator',
      options: ['mercator', 'equirectangular', 'orthographic'],
      description: 'Cartographic spherical-to-planar projection algorithm',
    },
    {
      name: 'padding',
      type: 'number',
      defaultValue: 20,
      min: 4,
      max: 48,
      step: 4,
      description: 'Viewport inset padding in pixels for fitExtent',
    },
    {
      name: 'activeColor',
      type: 'enum',
      defaultValue: 'steelblue',
      options: ['steelblue', 'seagreen', 'orange', 'purple'],
      description: 'Highlight color for selected region polygon and centroids',
    },
    {
      name: 'showCentroids',
      type: 'boolean',
      defaultValue: true,
      description: 'Render projected region centroid markers',
    },
  ],
  'd3-contour-density-grid': [
    {
      name: 'bandwidth',
      type: 'number',
      defaultValue: 24,
      min: 8,
      max: 50,
      step: 2,
      description: 'Gaussian kernel smoothing bandwidth in pixels',
    },
    {
      name: 'thresholds',
      type: 'number',
      defaultValue: 8,
      min: 3,
      max: 16,
      step: 1,
      description: 'Target number of isoline density elevation bands',
    },
    {
      name: 'cellSize',
      type: 'number',
      defaultValue: 4,
      min: 2,
      max: 16,
      step: 2,
      description: 'Estimator grid cell size (smaller = finer contour resolution)',
    },
    {
      name: 'showPoints',
      type: 'boolean',
      defaultValue: true,
      description: 'Overlay raw data points on top of contour bands',
    },
  ],
  'd3-data-join-enter-update-exit': [
    {
      name: 'dataset',
      type: 'enum',
      defaultValue: 'Step 1 (A, B, C)',
      options: ['Step 1 (A, B, C)', 'Step 2 (C, A, D)', 'Step 3 (B, D, E)', 'Step 4 (Empty)'],
      description: 'Keyed item sequence passed to updateKeyedBars',
    },
  ],
  'd3-transitions-stagger-basics': [
    {
      name: 'preset',
      type: 'enum',
      defaultValue: 'Medium Bars',
      options: ['Short Bars', 'Medium Bars', 'Long Bars', 'Zero Reset'],
      description: 'Target widths sequence for transitionBars',
    },
    {
      name: 'easing',
      type: 'enum',
      defaultValue: 'Elastic (Sproingy)',
      options: ['Elastic (Sproingy)', 'Bounce', 'Cubic Out', 'Back (Overshoot)', 'Linear'],
      description: 'Easing curve (try the sproingy elastic oscillation or bounce!)',
    },
    {
      name: 'duration',
      type: 'number',
      defaultValue: 750,
      description: 'Animation duration in milliseconds',
    },
    {
      name: 'staggerMs',
      type: 'number',
      defaultValue: 80,
      description: 'Delay increment per element index',
    },
  ],
  'd3-stacked-area-series': [
    {
      name: 'width',
      type: 'number',
      defaultValue: 460,
      min: 320,
      max: 600,
      step: 20,
      description: 'SVG viewport width in pixels',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 260,
      min: 180,
      max: 400,
      step: 20,
      description: 'SVG viewport height in pixels',
    },
  ],
  'd3-zoom-pan-rescale': [
    {
      name: 'color',
      type: 'enum',
      defaultValue: 'steelblue',
      options: ['steelblue', 'seagreen', 'orange', 'purple', 'crimson'],
      description: 'Color of data point circle glyphs',
    },
    {
      name: 'scaleExtentMin',
      type: 'number',
      defaultValue: 1,
      min: 0.5,
      max: 2,
      step: 0.25,
      description: 'Minimum allowed zoom scale factor',
    },
    {
      name: 'scaleExtentMax',
      type: 'number',
      defaultValue: 8,
      min: 2,
      max: 16,
      step: 1,
      description: 'Maximum allowed zoom scale factor',
    },
  ],
  'd3-drag-force-graph': [
    {
      name: 'nodeRadius',
      type: 'number',
      defaultValue: 8,
      min: 4,
      max: 20,
      step: 1,
      description: 'Visual circle radius of graph nodes',
    },
    {
      name: 'chargeStrength',
      type: 'number',
      defaultValue: -120,
      min: -300,
      max: -20,
      step: 10,
      description: 'Many-body electrostatic repulsion strength',
    },
    {
      name: 'linkDistance',
      type: 'number',
      defaultValue: 50,
      min: 20,
      max: 120,
      step: 5,
      description: 'Target geometric spring resting distance',
    },
  ],
  'tailwind-badge-component': [
    {
      name: 'variant',
      type: 'enum',
      defaultValue: 'success',
      options: ['success', 'warning', 'danger', 'info', 'neutral'],
      description: 'Semantic status variant styling (color and ring tones)',
    },
    {
      name: 'size',
      type: 'enum',
      defaultValue: 'md',
      options: ['sm', 'md'],
      description: 'Size scaling for typography, padding, and dot dimensions',
    },
    {
      name: 'dot',
      type: 'boolean',
      defaultValue: true,
      description: 'Whether to render the leading status indicator dot',
    },
    {
      name: 'label',
      type: 'string',
      defaultValue: 'Operational',
      placeholder: 'Badge text label...',
      description: 'Text content rendered inside the badge',
    },
    {
      name: 'onClick',
      type: 'function',
      description: 'Callback fired when the badge is clicked: () => void',
    },
  ],
  'tailwind-dismissible-banner': [
    {
      name: 'variant',
      type: 'enum',
      defaultValue: 'info',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Alert tone determining background and border accents',
    },
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Scheduled Maintenance',
      placeholder: 'Alert title...',
      description: 'Bold heading text for the notification banner',
    },
    {
      name: 'message',
      type: 'string',
      defaultValue: 'We will be conducting database upgrades on Sunday at 02:00 UTC.',
      placeholder: 'Alert message...',
      description: 'Descriptive message text inside the alert banner',
    },
    {
      name: 'onDismiss',
      type: 'function',
      description: 'Callback fired when the user dismisses the banner: () => void',
    },
  ],
  'tailwind-button-states': [
    {
      name: 'variant',
      type: 'enum',
      defaultValue: 'primary',
      options: ['primary', 'secondary', 'destructive', 'outline'],
      description: 'Visual button style variant',
    },
    {
      name: 'size',
      type: 'enum',
      defaultValue: 'md',
      options: ['sm', 'md', 'lg'],
      description: 'Padding and typography scale',
    },
    {
      name: 'loading',
      type: 'boolean',
      defaultValue: false,
      description: 'Shows animated loading spinner and disables interactions',
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
      description: 'Prevents clicks and applies muted disabled styles',
    },
    {
      name: 'label',
      type: 'string',
      defaultValue: 'Save Changes',
      placeholder: 'Button text...',
      description: 'Action label text displayed inside the button',
    },
    {
      name: 'onClick',
      type: 'function',
      description: 'Callback fired when button is clicked: (event) => void',
    },
  ],
  'tailwind-pricing-card': [
    {
      name: 'name',
      type: 'string',
      defaultValue: 'Pro Cloud',
      placeholder: 'Tier name...',
      description: 'Subscription plan name',
    },
    {
      name: 'price',
      type: 'number',
      defaultValue: 29,
      min: 0,
      max: 999,
      step: 1,
      description: 'Monthly or recurring cost in USD',
    },
    {
      name: 'period',
      type: 'string',
      defaultValue: '/month',
      placeholder: 'Billing frequency (e.g. /mo)...',
      description: 'Billing interval suffix',
    },
    {
      name: 'popular',
      type: 'boolean',
      defaultValue: true,
      description: 'Highlights the card with an indigo ring and "Most Popular" badge',
    },
    {
      name: 'features',
      type: 'json',
      defaultValue: [
        'Unlimited project sandboxes',
        'Full Tailwind & D3 visualization support',
        'Automated spaced repetition tracking',
      ],
      description: 'Array of included feature bullet points',
    },
    {
      name: 'ctaText',
      type: 'string',
      defaultValue: 'Claim 14-Day Free Trial',
      placeholder: 'Button text...',
      description: 'Call-to-action button label',
    },
    {
      name: 'onSelect',
      type: 'function',
      description: 'Callback fired when the CTA button is clicked: (tier) => void',
    },
  ],
  'tailwind-responsive-card': [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Mechanical Keyboard Pro',
      placeholder: 'Product title...',
      description: 'Name of the e-commerce product',
    },
    {
      name: 'description',
      type: 'string',
      defaultValue:
        'Engineered for developers with hot-swappable tactile switches, per-key RGB backlighting, and aluminum body.',
      placeholder: 'Product description...',
      description: 'Brief product description summary',
    },
    {
      name: 'price',
      type: 'number',
      defaultValue: 129,
      min: 0,
      max: 9999,
      step: 1,
      description: 'Current active purchase price in USD',
    },
    {
      name: 'originalPrice',
      type: 'number',
      defaultValue: 169,
      min: 0,
      max: 9999,
      step: 1,
      description: 'Strikethrough original price for sale items',
    },
    {
      name: 'badge',
      type: 'string',
      defaultValue: 'Hot Deal',
      placeholder: 'Badge tag (e.g. Sale)...',
      description: 'Visual overlay badge on top of the image',
    },
    {
      name: 'rating',
      type: 'number',
      defaultValue: 4.9,
      min: 0,
      max: 5,
      step: 0.1,
      description: 'Customer review rating score (0 - 5)',
    },
    {
      name: 'imageUrl',
      type: 'string',
      defaultValue: '/keyboard-preview.jpeg',
      placeholder: 'Image URL or path (e.g. /keyboard-preview.jpeg)...',
      description: 'Product cover photo source URL',
    },
    {
      name: 'onAddToCart',
      type: 'function',
      description: 'Callback fired when user clicks Add to Cart: () => void',
    },
  ],
  'tailwind-modal-dialog': [
    {
      name: 'isOpen',
      type: 'boolean',
      defaultValue: true,
      description: 'Controlled visibility of the modal dialog overlay',
    },
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Confirm Deployment',
      placeholder: 'Dialog title...',
      description: 'Accessible modal heading text',
    },
    {
      name: 'size',
      type: 'enum',
      defaultValue: 'md',
      options: ['sm', 'md', 'lg'],
      description: 'Max width container sizing variant',
    },
    {
      name: 'content',
      type: 'string',
      defaultValue:
        'You are about to deploy commit #d03e625 to the production edge network. All active traffic will route to this release.',
      placeholder: 'Modal body content...',
      description: 'Body message text rendered inside the dialog',
    },
    {
      name: 'onClose',
      type: 'function',
      description:
        'Callback fired when modal is dismissed (close button, backdrop, Escape): () => void',
    },
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
