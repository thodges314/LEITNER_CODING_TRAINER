const { render, fire, q, qa, wait } = $dom;
const TICK = 60;
const btn = (c, text) => qa('button', c).find((b) => b.textContent === text);
const shown = (c) => q('[role="timer"]', c).textContent;
const until = async (fn, ms = 1500) => {
  const start = Date.now();
  while (!fn() && Date.now() - start < ms) await wait(15);
  return fn();
};
{
  const r = render(<Countdown seconds={3} tickMs={TICK} />);
  await wait(TICK * 3);
  $test.check('Shows the starting seconds and does not run until Start', shown(r.container) === '3', shown(r.container));
  r.unmount();
}
{
  let done = 0;
  const r = render(<Countdown seconds={2} tickMs={TICK} onDone={() => done++} />);
  fire.click(btn(r.container, 'Start'));
  const reached = await until(() => shown(r.container) === '0');
  await wait(TICK * 4);
  $test.check('Start counts down to 0 and calls onDone exactly once', reached && shown(r.container) === '0' && done === 1, { shown: shown(r.container), done });
  r.unmount();
}
{
  const r = render(<Countdown seconds={20} tickMs={TICK} />);
  fire.click(btn(r.container, 'Start'));
  await until(() => Number(shown(r.container)) <= 18);
  fire.click(btn(r.container, 'Pause'));
  const paused = shown(r.container);
  await wait(TICK * 4);
  const still = shown(r.container);
  fire.click(btn(r.container, 'Start'));
  const resumed = await until(() => Number(shown(r.container)) < Number(paused));
  $test.check('Pause stops the countdown and Start resumes it', paused === still && resumed, { paused, still, now: shown(r.container) });
  r.unmount();
}
{
  const r = render(<Countdown seconds={5} tickMs={TICK} />);
  fire.click(btn(r.container, 'Start'));
  await until(() => Number(shown(r.container)) <= 3);
  fire.click(btn(r.container, 'Reset'));
  await wait(TICK * 4);
  $test.check('Reset restores the starting value and stops', shown(r.container) === '5', shown(r.container));
  r.unmount();
}
{
  let done = 0;
  const r = render(<Countdown seconds={1} tickMs={TICK} onDone={() => done++} />);
  fire.click(btn(r.container, 'Start'));
  r.unmount();
  await wait(TICK * 5);
  $test.check('Unmounting stops the timer (no onDone afterwards)', done === 0, done);
}
