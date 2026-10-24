interface ListProps {
  items: string[];
  onSelect: (item: string) => void;
  onRender?: () => void;
}

interface ParentProps {
  items: string[];
  onListRender?: () => void;
}

const List = React.memo(function List({ items, onSelect, onRender }: ListProps): JSX.Element {
  if (onRender) onRender();
  return (
    <ul>
      {items.map((item) => (
        <li key={item} onClick={() => onSelect(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
});

function Parent({ items, onListRender }: ParentProps): JSX.Element {
  const [count, setCount] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = useCallback((item: string) => setSelected(item), []);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      <p>Selected: {selected ?? 'none'}</p>
      <List items={items} onSelect={handleSelect} onRender={onListRender} />
    </div>
  );
}
