const { render, fire, q, qa } = $dom;
const seen = [];
function Speaker({ message, options }) {
  const announce = useAnnounce();
  seen.push(announce);
  return <button onClick={() => announce(message, options)}>{'say ' + message}</button>;
}
const setup = (message = 'Saved', options) => {
  seen.length = 0;
  const r = render(<AnnouncerProvider><p id="child">page</p><Speaker message={message} options={options} /></AnnouncerProvider>);
  return { r, polite: () => q('[role="status"]', r.container), alert: () => q('[role="alert"]', r.container), button: () => q('button', r.container) };
};
{
  const { r, polite, alert } = setup();
  const p = polite();
  const a = alert();
  $test.check('Renders a polite status region and an assertive alert region, both atomic', !!p && !!a && p.getAttribute('aria-live') === 'polite' && p.getAttribute('aria-atomic') === 'true' && a.getAttribute('aria-live') === 'assertive' && a.getAttribute('aria-atomic') === 'true', [p && p.outerHTML, a && a.outerHTML]);
  r.unmount();
}
{
  const { r, polite, alert, button } = setup('Saved');
  fire.click(button());
  $test.check('announce(message) writes to the polite region', polite().textContent === 'Saved' && alert().textContent === '', { polite: polite().textContent, alert: alert().textContent });
  r.unmount();
}
{
  const { r, polite, alert, button } = setup('Failed', { politeness: 'assertive' });
  fire.click(button());
  $test.check("announce(message, { politeness: 'assertive' }) writes to the alert region and clears the polite one", alert().textContent === 'Failed' && polite().textContent === '', { polite: polite().textContent, alert: alert().textContent });
  r.unmount();
}
{
  const { r, polite, button } = setup('Saved');
  fire.click(button());
  const first = polite().textContent;
  fire.click(button());
  const second = polite().textContent;
  fire.click(button());
  const third = polite().textContent;
  $test.check('Announcing the same message twice changes the raw text so it is read again', first === 'Saved' && second !== first && second.trim() === 'Saved' && third !== second && third.trim() === 'Saved', [first, second, third].map((t) => JSON.stringify(t)));
  r.unmount();
}
{
  const { r, polite, alert } = setup();
  const bad = (el) => {
    const s = el.style;
    return el.hidden || s.display === 'none' || s.visibility === 'hidden' || el.getAttribute('hidden') !== null;
  };
  const p = polite();
  const a = alert();
  $test.check('The regions are visually hidden but never display:none or hidden', !bad(p) && !bad(a) && p.style.position === 'absolute' && a.style.position === 'absolute' && p.style.overflow === 'hidden' && a.style.overflow === 'hidden', [p.getAttribute('style'), a.getAttribute('style')]);
  r.unmount();
}
{
  seen.length = 0;
  function App() {
    const [n, setN] = useState(0);
    return (
      <AnnouncerProvider>
        <p id="child">page</p>
        <Speaker message="Saved" options={{ n }} />
        <button id="bump" onClick={() => setN(n + 1)}>bump</button>
      </AnnouncerProvider>
    );
  }
  const r = render(<App />);
  const speak = () => qa('button', r.container).find((b) => b.textContent === 'say Saved');
  fire.click(speak());
  fire.click(q('#bump', r.container));
  fire.click(speak());
  fire.click(q('#bump', r.container));
  $test.check('children render, and announce keeps the same identity across renders', !!q('#child', r.container) && seen.length >= 3 && seen.every((fn) => fn === seen[0]) && typeof seen[0] === 'function', { renders: seen.length });
  r.unmount();
}
