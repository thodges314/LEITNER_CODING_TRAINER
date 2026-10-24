const { render, fire, q, qa } = $dom;

const STEPS = [
  { id: 'cart', title: 'Cart Review', description: 'Check your items' },
  { id: 'shipping', title: 'Shipping Address' },
  { id: 'payment', title: 'Payment Method', description: 'Credit card or PayPal' },
];

const getStepItems = (c) => qa('li', q('ol', c));
const getPrevBtn = (c) => q('button[data-action="prev"]', c);
const getNextBtn = (c) => q('button[data-action="next"]', c);

{
  const r = render(<Stepper steps={STEPS} />);
  const items = getStepItems(r.container);
  const nav = q('nav[aria-label="Progress"]', r.container);
  const initialActive = items[0].getAttribute('data-status') === 'active' || items[0].querySelector('[data-status="active"]') !== null;
  const initialUpcoming = items[1].getAttribute('data-status') === 'upcoming' || items[1].querySelector('[data-status="upcoming"]') !== null;

  $test.check(
    'Renders progress navigation list with initial step marked active',
    nav !== null && items.length === 3 && initialActive && initialUpcoming,
    { itemsCount: items.length, hasNav: nav !== null }
  );
  r.unmount();
}

{
  const r = render(<Stepper steps={STEPS} />);
  const prevBtn = getPrevBtn(r.container);
  const nextBtn = getNextBtn(r.container);

  $test.check(
    'Back button is disabled on step 1 and Next button is labelled Next',
    prevBtn !== null && prevBtn.disabled === true && nextBtn !== null && nextBtn.textContent === 'Next',
    { prevDisabled: prevBtn?.disabled, nextText: nextBtn?.textContent }
  );
  r.unmount();
}

{
  const stepChanges = [];
  const r = render(<Stepper steps={STEPS} onStepChange={(idx) => stepChanges.push(idx)} />);
  const nextBtn = getNextBtn(r.container);

  fire.click(nextBtn);
  const items = getStepItems(r.container);
  const step1Status = items[0].getAttribute('data-status') || items[0].querySelector('button')?.getAttribute('data-status');
  const step2Status = items[1].getAttribute('data-status') || items[1].querySelector('button')?.getAttribute('data-status');
  const prevBtn = getPrevBtn(r.container);

  $test.check(
    'Next button advances to step 2, notifies onStepChange, and enables Back',
    stepChanges.length === 1 && stepChanges[0] === 1 && step1Status === 'completed' && step2Status === 'active' && prevBtn.disabled === false,
    { stepChanges, step1Status, step2Status, prevDisabled: prevBtn?.disabled }
  );
  r.unmount();
}

{
  const stepChanges = [];
  const r = render(<Stepper steps={STEPS} initialStep={1} onStepChange={(idx) => stepChanges.push(idx)} />);
  const items = getStepItems(r.container);
  const step1Btn = items[0].querySelector('button');
  const step3Btn = items[2].querySelector('button');

  fire.click(step3Btn);
  const afterClickUpcoming = stepChanges.length;

  fire.click(step1Btn);
  const afterClickCompleted = stepChanges.slice();

  $test.check(
    'Direct navigation allowed to completed steps but blocked for upcoming steps',
    afterClickUpcoming === 0 && afterClickCompleted.length === 1 && afterClickCompleted[0] === 0,
    { afterClickUpcoming, afterClickCompleted }
  );
  r.unmount();
}

{
  let completed = false;
  const r = render(<Stepper steps={STEPS} initialStep={2} onComplete={() => { completed = true; }} />);
  const nextBtn = getNextBtn(r.container);
  const isCompleteLabel = nextBtn !== null && nextBtn.textContent === 'Complete';

  fire.click(nextBtn);

  $test.check(
    'Final step shows Complete button and triggers onComplete on click',
    isCompleteLabel && completed === true,
    { isCompleteLabel, completed }
  );
  r.unmount();
}
