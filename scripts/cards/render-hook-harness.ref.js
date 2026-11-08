function renderHook(renderCallback, options = {}) {
  const { initialProps, wrapper } = options;
  const result = { current: undefined };
  let currentProps = initialProps;

  function TestComponent({ props }) {
    result.current = renderCallback(props);
    return null;
  }

  function getElement(p) {
    const probe = React.createElement(TestComponent, { props: p });
    return wrapper ? React.createElement(wrapper, null, probe) : probe;
  }

  const domRender = typeof $dom !== 'undefined' && typeof $dom.render === 'function'
    ? $dom.render
    : null;

  if (domRender) {
    const r = domRender(getElement(currentProps));
    return {
      result,
      rerender(newProps) {
        if (newProps !== undefined) currentProps = newProps;
        r.rerender(getElement(currentProps));
      },
      unmount() {
        r.unmount();
      },
    };
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);
  const act = typeof $dom !== 'undefined' && typeof $dom.act === 'function'
    ? $dom.act
    : (typeof React.act === 'function' ? React.act : (cb) => cb());

  act(() => {
    root.render(getElement(currentProps));
  });

  return {
    result,
    rerender(newProps) {
      if (newProps !== undefined) currentProps = newProps;
      act(() => {
        root.render(getElement(currentProps));
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}
