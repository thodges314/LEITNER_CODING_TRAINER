interface HookResult<T> {
  current: T;
}

interface RenderHookOptions<P = any> {
  initialProps?: P;
  wrapper?: (props: { children: any }) => any;
}

interface RenderHookReturn<T, P = any> {
  result: HookResult<T>;
  rerender: (newProps?: P) => void;
  unmount: () => void;
}

function renderHook<T, P = any>(
  renderCallback: (props?: P) => T,
  options?: RenderHookOptions<P>
): RenderHookReturn<T, P> {
  const initialProps = options?.initialProps;
  const wrapper = options?.wrapper;
  const result: HookResult<T> = { current: undefined as unknown as T };
  let currentProps = initialProps;

  function TestComponent({ props }: { props?: P }) {
    result.current = renderCallback(props);
    return null;
  }

  function getElement(p?: P) {
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
      rerender(newProps?: P) {
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
    : (typeof React.act === 'function' ? React.act : (cb: () => void) => cb());

  act(() => {
    root.render(getElement(currentProps));
  });

  return {
    result,
    rerender(newProps?: P) {
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
