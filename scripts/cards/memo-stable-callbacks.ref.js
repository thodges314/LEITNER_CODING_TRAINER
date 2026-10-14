const List = React.memo(function List({ items, onSelect, onRender }) {
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

function Parent({ items, onListRender }) {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);

  // A stable identity, so React.memo can skip List when only `count` or `selected` change.
  const handleSelect = useCallback((item) => setSelected(item), []);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      <p>Selected: {selected ?? 'none'}</p>
      <List items={items} onSelect={handleSelect} onRender={onListRender} />
    </div>
  );
}
