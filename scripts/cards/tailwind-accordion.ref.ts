interface AccordionItemData {
  id: string;
  title: string;
  content: any;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  defaultExpandedIds?: string[];
  className?: string;
  [key: string]: any;
}

const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultExpandedIds = [],
  className = '',
  ...props
}: AccordionProps): JSX.Element => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds)
  );

  const toggleItem = (id: string, disabled?: boolean) => {
    if (disabled) return;

    setExpandedIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const containerClasses = [
    'divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} {...props}>
      {items.map((item) => {
        const isOpen = expandedIds.has(item.id);
        const isDisabled = Boolean(item.disabled);

        const headerId = `accordion-header-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        const triggerClasses = [
          'w-full flex items-center justify-between py-4 px-5 text-left font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          isOpen ? 'text-indigo-400' : 'text-slate-200',
          isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800/40 cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={item.id} className="overflow-hidden">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen ? 'true' : 'false'}
                aria-controls={panelId}
                disabled={isDisabled}
                onClick={() => toggleItem(item.id, isDisabled)}
                className={triggerClasses}
              >
                <span>{item.title}</span>
                <svg
                  className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className="px-5 pb-4 pt-1 text-sm text-slate-400 leading-relaxed"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};
