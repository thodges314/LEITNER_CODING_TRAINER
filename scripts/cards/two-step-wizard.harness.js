const { render, fire, q, qa } = $dom;
const byText = (root, text) => qa('button', root).find((b) => b.textContent.trim() === text);

{
  const r = render(<TwoStepWizard onSubmit={() => {}} />);
  const nameInput = q('input[aria-label="Name"]', r.container);
  const nextBtn = byText(r.container, 'Next');
  $test.check(
    'Starts on Step 1 with Name input and Next disabled until non-empty',
    !!nameInput && !q('input[aria-label="Email"]', r.container) && nextBtn?.disabled === true,
    r.container.innerHTML
  );
  r.unmount();
}

{
  const submitted = [];
  const r = render(<TwoStepWizard onSubmit={(d) => submitted.push(d)} />);
  fire.change(q('input[aria-label="Name"]', r.container), 'Ada');
  const nextBtn = byText(r.container, 'Next');
  $test.check('Next enables when Name is entered', nextBtn?.disabled === false, nextBtn?.disabled);
  fire.click(nextBtn);

  const emailInput = q('input[aria-label="Email"]', r.container);
  const submitBtn = byText(r.container, 'Submit');
  $test.check(
    'Advances to Step 2 with Email input and Submit disabled initially',
    !!emailInput && !q('input[aria-label="Name"]', r.container) && submitBtn?.disabled === true,
    r.container.innerHTML
  );

  fire.change(emailInput, 'ada@example.com');
  fire.click(byText(r.container, 'Back'));
  $test.check(
    'Back returns to Step 1 and preserves Name',
    q('input[aria-label="Name"]', r.container)?.value === 'Ada',
    q('input[aria-label="Name"]', r.container)?.value
  );

  fire.click(byText(r.container, 'Next'));
  $test.check(
    'Returning to Step 2 preserves Email',
    q('input[aria-label="Email"]', r.container)?.value === 'ada@example.com',
    q('input[aria-label="Email"]', r.container)?.value
  );

  fire.click(byText(r.container, 'Submit'));
  $test.check(
    'Submit calls onSubmit with collected { name, email }',
    submitted.length === 1 && submitted[0].name === 'Ada' && submitted[0].email === 'ada@example.com',
    submitted
  );
  r.unmount();
}
