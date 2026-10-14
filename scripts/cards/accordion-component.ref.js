function Accordion({ items, allowMultiple = false }) {
  const [open, setOpen] = useState([]);
  const base = useId();

  const toggle = (id) => {
    setOpen((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
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
