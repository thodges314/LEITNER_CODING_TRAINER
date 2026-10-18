const { render, fire, q, wait } = $dom;
const trigger = (c) => q('button', c);
const tip = (c) => q('[role="tooltip"]', c);
const hover = async (el) => { fire.event(el, new MouseEvent('mouseover', { bubbles: true })); await wait(30); };
const unhover = async (el) => { fire.event(el, new MouseEvent('mouseout', { bubbles: true })); await wait(30); };
{
  const r = render(<Tooltip content="Saves the file"><button>Save</button></Tooltip>);
  $test.check('Hidden by default: the child renders, no tooltip, no aria-describedby', trigger(r.container).textContent === 'Save' && tip(r.container) === null && !trigger(r.container).hasAttribute('aria-describedby'), r.container.innerHTML);
  r.unmount();
}
{
  const r = render(<Tooltip content="Saves the file"><button>Save</button></Tooltip>);
  await hover(trigger(r.container));
  const t = tip(r.container);
  $test.check('Hovering shows role="tooltip" with the content and links it via aria-describedby', t !== null && t.textContent === 'Saves the file' && t.id !== '' && trigger(r.container).getAttribute('aria-describedby') === t.id, r.container.innerHTML);
  r.unmount();
}
{
  const r = render(<Tooltip content="Saves the file"><button>Save</button></Tooltip>);
  await hover(trigger(r.container));
  await unhover(trigger(r.container));
  $test.check('Leaving the trigger hides the tooltip and removes aria-describedby', tip(r.container) === null && !trigger(r.container).hasAttribute('aria-describedby'), r.container.innerHTML);
  r.unmount();
}
{
  const r = render(<Tooltip content="Saves the file"><button>Save</button></Tooltip>);
  fire.focus(trigger(r.container));
  await wait(30);
  const shownOnFocus = tip(r.container) !== null;
  trigger(r.container).blur();
  await wait(30);
  $test.check('Keyboard users get it too: focus shows the tooltip, blur hides it', shownOnFocus && tip(r.container) === null, { shownOnFocus, afterBlur: tip(r.container) !== null });
  r.unmount();
}
{
  const r = render(<Tooltip content="Saves the file"><button>Save</button></Tooltip>);
  fire.focus(trigger(r.container));
  await wait(30);
  fire.keyDown(trigger(r.container), 'Enter');
  await wait(30);
  const stillOpen = tip(r.container) !== null;
  fire.keyDown(trigger(r.container), 'Escape');
  await wait(30);
  $test.check('Escape dismisses the tooltip; other keys do not', stillOpen && tip(r.container) === null, { stillOpen, afterEscape: tip(r.container) !== null });
  r.unmount();
}
{
  const calls = [];
  const r = render(
    <Tooltip content="Tip">
      <button onFocus={() => calls.push('focus')} onMouseEnter={() => calls.push('enter')} onKeyDown={() => calls.push('key')} className="primary">Go</button>
    </Tooltip>
  );
  await hover(trigger(r.container));
  fire.focus(trigger(r.container));
  fire.keyDown(trigger(r.container), 'a');
  await wait(30);
  $test.check("The child's own handlers and props are preserved", calls.join() === 'enter,focus,key' && trigger(r.container).className === 'primary', { calls, className: trigger(r.container).className });
  r.unmount();
}
{
  const r = render(<Tooltip content={<b>Bold tip</b>}><button>?</button></Tooltip>);
  await hover(trigger(r.container));
  $test.check('The content can be any React node', tip(r.container) !== null && tip(r.container).querySelector('b') !== null && tip(r.container).textContent === 'Bold tip', r.container.innerHTML);
  r.unmount();
}
