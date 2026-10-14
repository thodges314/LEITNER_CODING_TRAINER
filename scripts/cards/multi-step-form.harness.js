const { render, fire, q, qa } = $dom;
const STEPS = [
  { title: 'Account', fields: [{ name: 'email', label: 'Email' }] },
  { title: 'Profile', fields: [{ name: 'first', label: 'First name' }, { name: 'last', label: 'Last name' }] },
  { title: 'Plan', fields: [{ name: 'plan', label: 'Plan' }] },
];
const field = (c, label) => qa('label', c).find((l) => l.textContent.startsWith(label)).querySelector('input');
const btn = (c, text) => qa('button', c).find((b) => b.textContent === text);
const stepText = (c) => q('p', c).textContent;
const title = (c) => q('h2', c).textContent;
{
  const r = render(<Wizard steps={STEPS} onSubmit={() => {}} />);
  $test.check('Shows step 1 of N with its title and fields', stepText(r.container) === 'Step 1 of 3' && title(r.container) === 'Account' && qa('input', r.container).length === 1 && btn(r.container, 'Next') !== undefined, r.container.innerHTML);
  r.unmount();
}
{
  const r = render(<Wizard steps={STEPS} onSubmit={() => {}} />);
  $test.check('Back is disabled on the first step', btn(r.container, 'Back').disabled === true, 'enabled');
  r.unmount();
}
{
  const r = render(<Wizard steps={STEPS} onSubmit={() => {}} />);
  fire.click(btn(r.container, 'Next'));
  const blocked = title(r.container) === 'Account' && q('[role="alert"]', r.container) !== null && q('[role="alert"]', r.container).textContent === 'All fields are required';
  fire.change(field(r.container, 'Email'), '   ');
  fire.click(btn(r.container, 'Next'));
  $test.check('Next is blocked with an alert until every field of the step is filled (blank counts as empty)', blocked && title(r.container) === 'Account' && q('[role="alert"]', r.container) !== null, { title: title(r.container) });
  r.unmount();
}
{
  const r = render(<Wizard steps={STEPS} onSubmit={() => {}} />);
  fire.change(field(r.container, 'Email'), 'ada@example.com');
  fire.click(btn(r.container, 'Next'));
  const second = title(r.container) + '|' + stepText(r.container) + '|' + qa('input', r.container).length;
  fire.click(btn(r.container, 'Next')); // blocked: both fields empty
  const alertShown = q('[role="alert"]', r.container) !== null;
  fire.click(btn(r.container, 'Back'));
  $test.check('Next moves forward, Back returns and keeps typed values, and the alert clears when the step changes', second === 'Profile|Step 2 of 3|2' && alertShown && title(r.container) === 'Account' && field(r.container, 'Email').value === 'ada@example.com' && q('[role="alert"]', r.container) === null, { second });
  r.unmount();
}
{
  const calls = [];
  const r = render(<Wizard steps={STEPS} onSubmit={(v) => calls.push(v)} />);
  fire.change(field(r.container, 'Email'), 'ada@example.com');
  fire.click(btn(r.container, 'Next'));
  fire.change(field(r.container, 'First name'), 'Ada');
  fire.change(field(r.container, 'Last name'), 'Lovelace');
  fire.click(btn(r.container, 'Next'));
  const last = btn(r.container, 'Submit') !== undefined && btn(r.container, 'Next') === undefined;
  fire.change(field(r.container, 'Plan'), 'pro');
  fire.click(btn(r.container, 'Submit'));
  $test.check('The last step shows Submit and submits the values of all steps', last && calls.length === 1 && JSON.stringify(calls[0]) === JSON.stringify({ email: 'ada@example.com', first: 'Ada', last: 'Lovelace', plan: 'pro' }), { last, calls });
  r.unmount();
}
{
  const calls = [];
  const r = render(<Wizard steps={[STEPS[2]]} onSubmit={(v) => calls.push(v)} />);
  fire.click(btn(r.container, 'Submit'));
  $test.check('The last step does not submit while a field is empty', calls.length === 0 && q('[role="alert"]', r.container) !== null, calls);
  r.unmount();
}
