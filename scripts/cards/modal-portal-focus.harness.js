const { render, fire, q } = $dom;
function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button id="trigger" onClick={() => setOpen(true)}>Open</button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <button id="first">First</button>
        <button id="last">Last</button>
      </Modal>
    </div>
  );
}
{
  const r = render(<div><Modal isOpen={false} onClose={() => {}}><p id="msg">Hi</p></Modal></div>);
  $test.check('Closed modal renders nothing', q('[role="dialog"]') === null && q('#msg') === null);
  r.unmount();
}
{
  const r = render(<div><Modal isOpen onClose={() => {}}><p id="msg">Hi</p></Modal></div>);
  const msg = q('#msg');
  $test.check('Open modal renders through a portal outside its parent', msg !== null && !r.container.contains(msg) && document.body.contains(msg));
  r.unmount();
}
{
  const calls = [];
  const r = render(<Modal isOpen onClose={() => calls.push('close')}><button id="b">B</button></Modal>);
  const dialog = q('[role="dialog"]');
  fire.keyDown(dialog, 'Escape');
  const afterEscape = calls.length;
  $test.check('Escape calls onClose', afterEscape === 1, calls);
  fire.click(q('#b'));
  const afterContent = calls.length;
  fire.click(dialog.parentElement);
  $test.check('Clicking the backdrop closes but clicking the content does not', afterContent === 1 && calls.length === 2, { afterContent, total: calls.length });
  r.unmount();
}
{
  const r = render(<Demo />);
  const trigger = q('#trigger');
  fire.focus(trigger);
  fire.click(trigger);
  const locked = document.body.style.overflow === 'hidden';
  const first = q('#first');
  const last = q('#last');
  const focusedIn = document.activeElement === first;
  fire.focus(last);
  const forward = fire.keyDown(last, 'Tab');
  const wrappedForward = document.activeElement === first && forward.defaultPrevented;
  const back = fire.keyDown(first, 'Tab', { shiftKey: true });
  const wrappedBack = document.activeElement === last && back.defaultPrevented;
  $test.check('Tab wraps focus inside the dialog', focusedIn && wrappedForward && wrappedBack, { focusedIn, wrappedForward, wrappedBack });
  $test.check('Body scroll is locked while open', locked, document.body.style.overflow);
  fire.keyDown(q('[role="dialog"]'), 'Escape');
  $test.check('Focus returns to the trigger on close', q('[role="dialog"]') === null && document.activeElement === trigger);
  $test.check('Body scroll is restored after close', document.body.style.overflow !== 'hidden', document.body.style.overflow);
  r.unmount();
}
