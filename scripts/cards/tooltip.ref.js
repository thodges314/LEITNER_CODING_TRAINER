function Tooltip({ content, children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const child = React.Children.only(children);
  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  const chain = (name, handler) => (e) => {
    if (typeof child.props[name] === 'function') child.props[name](e);
    handler(e);
  };

  const trigger = React.cloneElement(child, {
    'aria-describedby': open ? id : undefined,
    onMouseEnter: chain('onMouseEnter', show),
    onMouseLeave: chain('onMouseLeave', hide),
    onFocus: chain('onFocus', show),
    onBlur: chain('onBlur', hide),
    onKeyDown: chain('onKeyDown', (e) => {
      if (e.key === 'Escape') hide();
    }),
  });

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      {open && (
        <span role="tooltip" id={id}>
          {content}
        </span>
      )}
    </span>
  );
}
