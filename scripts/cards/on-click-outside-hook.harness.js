const { render, fire, q } = $dom;
function Demo({ onOutside }) {
  const ref = useRef(null);
  useOnClickOutside(ref, onOutside);
  return (
    <div>
      <div ref={ref} id="inside">
        <button id="inner">inner</button>
      </div>
      <button id="outside">outside</button>
    </div>
  );
}
const down = (el, type = 'mousedown') => fire.event(el, new Event(type, { bubbles: true }));
{
  let n = 0;
  const r = render(<Demo onOutside={() => n++} />);
  down(q('#outside', r.container));
  $test.check('Calls the handler on a mousedown outside the element', n === 1, n);
  r.unmount();
}
{
  let n = 0;
  const r = render(<Demo onOutside={() => n++} />);
  down(q('#inside', r.container));
  down(q('#inner', r.container));
  $test.check('Ignores mousedown inside the element (including children)', n === 0, n);
  r.unmount();
}
{
  let n = 0;
  const r = render(<Demo onOutside={() => n++} />);
  down(q('#outside', r.container), 'touchstart');
  $test.check('Also reacts to touchstart', n === 1, n);
  r.unmount();
}
{
  let a = 0;
  let b = 0;
  const r = render(<Demo onOutside={() => a++} />);
  r.rerender(<Demo onOutside={() => b++} />);
  down(q('#outside', r.container));
  $test.check('Uses the latest handler', a === 0 && b === 1, { a, b });
  r.unmount();
}
{
  let n = 0;
  const outside = document.createElement('button');
  document.body.appendChild(outside);
  const r = render(<Demo onOutside={() => n++} />);
  r.unmount();
  down(outside);
  outside.remove();
  $test.check('Removes its listeners on unmount', n === 0, n);
}
