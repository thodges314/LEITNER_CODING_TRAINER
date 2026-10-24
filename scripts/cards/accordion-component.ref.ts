interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

function Accordion({ items, allowMultiple = false }: AccordionProps): JSX.Element {
  const [open, setOpen] = useState<string[]>([]);
  const base = useId();

  const toggle = (id: string): void => {
    setOpen((current: string[]) => {
      if (current.includes(id)) return current.filter((x: string) => x !== id);
      return allowMultiple ? [...current, id] : [id];
    });
  };

  return (
    <div>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const buttonId = `${base}-btn-${item.id}`;
        const panelId = `${base}-panel-${item.id}`;
        return (
          <div key={item.id}>
            <h3>
              <button id={buttonId} aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(item.id)}>
                {item.title}
              </button>
            </h3>
            {isOpen && (
              <div role="region" id={panelId} aria-labelledby={buttonId}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
