interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
}

function Tooltip({ content, children }: TooltipProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const id = useId();
  const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
  const show = (): void => setOpen(true);
  const hide = (): void => setOpen(false);
  const chain = (name: string, handler: (e: unknown) => void) => (e: unknown): void => {
    const fn = child.props[name];
    if (typeof fn === 'function') (fn as (e: unknown) => void)(e);
    handler(e);
  };

  const trigger = React.cloneElement(child, {
    'aria-describedby': open ? id : undefined,
    onMouseEnter: chain('onMouseEnter', show),
    onMouseLeave: chain('onMouseLeave', hide),
    onFocus: chain('onFocus', show),
    onBlur: chain('onBlur', hide),
    onKeyDown: chain('onKeyDown', (e: unknown) => {
      if ((e as KeyboardEvent).key === 'Escape') hide();
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
