const { render, fire, q, qa } = $dom;
const originalTitle = document.title;
const page = (path, title, body = 'content') => (
  <Layout path={path} title={title}>
    <button id="inside">{body}</button>
  </Layout>
);
const active = () => document.activeElement;
{
  const r = render(page('/', 'Home'));
  const first = q('a, button, [tabindex]:not([tabindex="-1"])', r.container);
  const main = q('main', r.container);
  $test.check('The skip link is the first focusable element and points at the main landmark', !!first && first.tagName === 'A' && first.getAttribute('href') === '#main-content' && first.textContent === 'Skip to main content' && !!main && main.id === 'main-content', first && first.outerHTML);
  r.unmount();
}
{
  const r = render(page('/', 'Home'));
  fire.click(q('a', r.container));
  const main = q('main', r.container);
  $test.check('Clicking the skip link moves focus to <main id="main-content" tabindex="-1">', active() === main && main.getAttribute('tabindex') === '-1', active() && active().tagName);
  r.unmount();
}
{
  const r = render(page('/', 'Home'));
  const first = document.title;
  r.rerender(page('/about', 'About'));
  const second = document.title;
  $test.check('The document title follows the page title as "<title> | My App"', first === 'Home | My App' && second === 'About | My App', [first, second]);
  r.unmount();
}
{
  const r = render(page('/', 'Home'));
  $test.check('The first render does not steal focus', active() === document.body || active() === null, active() && active().tagName);
  r.unmount();
}
{
  const r = render(page('/', 'Home'));
  r.rerender(page('/about', 'About'));
  const h1 = q('h1', r.container);
  $test.check('Changing the path moves focus to the new page heading (h1)', active() === h1 && h1.textContent === 'About' && h1.getAttribute('tabindex') === '-1', active() && active().tagName);
  r.unmount();
}
{
  const r = render(page('/', 'Home'));
  r.rerender(page('/about', 'About'));
  q('#inside', r.container).focus();
  r.rerender(page('/about', 'About', 'changed'));
  $test.check('Re-rendering with the same path does not move focus again', active() === q('#inside', r.container), active() && active().tagName);
  r.unmount();
}
document.title = originalTitle;
if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
