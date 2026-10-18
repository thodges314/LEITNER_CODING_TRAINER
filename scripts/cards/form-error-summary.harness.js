const { render, fire, q, qa } = $dom;
const setup = () => {
  const calls = [];
  const r = render(<SignupForm onSubmit={(v) => calls.push(v)} />);
  const form = q('form', r.container);
  const field = (id) => q('#' + id, r.container);
  const type = (id, value) => fire.change(field(id), value);
  const submit = () => fire.submit(form);
  const summary = () => q('[role="alert"]', r.container);
  return { r, calls, field, type, submit, summary };
};
{
  const { r, calls, type, submit, summary } = setup();
  type('name', '  Ada  ');
  type('email', ' ada@example.com ');
  submit();
  $test.check('A valid form calls onSubmit with trimmed values and shows no error summary', JSON.stringify(calls) === JSON.stringify([{ name: 'Ada', email: 'ada@example.com' }]) && summary() === null, { calls, summary: !!summary() });
  r.unmount();
}
{
  const { r, calls, submit, summary } = setup();
  submit();
  const s = summary();
  const links = s ? qa('a', s) : [];
  $test.check('An invalid submit does not call onSubmit and shows a summary with one link per error, in field order', calls.length === 0 && !!s && links.map((a) => a.textContent).join('|') === 'Enter your name|Enter a valid email address' && q('h2', s).textContent === 'There is a problem', { calls: calls.length, links: links.map((a) => a.textContent) });
  r.unmount();
}
{
  const { r, submit, summary } = setup();
  submit();
  const h2 = summary() && q('h2', summary());
  $test.check('Focus moves to the summary heading after an invalid submit', !!h2 && document.activeElement === h2 && h2.getAttribute('tabindex') === '-1', document.activeElement && document.activeElement.tagName);
  r.unmount();
}
{
  const { r, submit, summary, field } = setup();
  submit();
  const links = qa('a', summary());
  const hrefs = links.map((a) => a.getAttribute('href')).join();
  fire.click(links[1]);
  const onEmail = document.activeElement === field('email');
  fire.click(links[0]);
  const onName = document.activeElement === field('name');
  $test.check('Each summary link points at its field and focuses it', hrefs === '#name,#email' && onEmail && onName, { hrefs, onEmail, onName });
  r.unmount();
}
{
  const { r, type, submit, field } = setup();
  type('name', 'Ada');
  type('email', 'bad');
  submit();
  const name = field('name');
  const email = field('email');
  const msg = document.getElementById(email.getAttribute('aria-describedby') || 'none');
  $test.check('Invalid inputs get aria-invalid and aria-describedby pointing at their inline error; valid ones get neither', email.getAttribute('aria-invalid') === 'true' && email.getAttribute('aria-describedby') === 'email-error' && !!msg && msg.textContent === 'Enter a valid email address' && !name.hasAttribute('aria-invalid') && !name.hasAttribute('aria-describedby'), { email: email.outerHTML, name: name.outerHTML });
  r.unmount();
}
{
  const { r, calls, type, submit, summary } = setup();
  submit();
  type('name', 'Ada');
  submit();
  const links = qa('a', summary());
  const only = links.map((a) => a.textContent).join('|');
  type('email', 'ada@example.com');
  submit();
  $test.check('Fixing one field leaves only the remaining error on the next submit', only === 'Enter a valid email address' && calls.length === 1 && summary() === null, { only, calls: calls.length });
  r.unmount();
}
{
  const { r, submit, summary, field } = setup();
  submit();
  fire.click(qa('a', summary())[0]);
  const onField = document.activeElement === field('name');
  submit();
  const h2 = q('h2', summary());
  $test.check('Focus returns to the summary heading on every invalid submit, not just the first', onField && document.activeElement === h2, { onField, active: document.activeElement && document.activeElement.tagName });
  r.unmount();
}
if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
