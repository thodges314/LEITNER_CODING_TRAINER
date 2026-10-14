const { render, fire, q, qa, wait } = $dom;
const SLIDES = ['one', 'two', 'three'];
const slide = (c) => q('[role="group"]', c).textContent;
const btn = (c, text) => qa('button', c).find((b) => b.textContent === text);
const dot = (c, n) => qa('button', c).find((b) => b.getAttribute('aria-label') === `Go to slide ${n}`);
const until = async (fn, ms = 2000) => {
  const start = Date.now();
  while (!fn() && Date.now() - start < ms) await wait(15);
  return fn();
};
{
  const r = render(<Carousel slides={SLIDES} />);
  const group = q('[role="group"]', r.container);
  $test.check('Shows the first slide with a "1 of N" label', slide(r.container) === 'one' && group.getAttribute('aria-label') === '1 of 3' && q('section', r.container).getAttribute('aria-roledescription') === 'carousel' && qa('[role="group"]', r.container).length === 1, group.outerHTML);
  r.unmount();
}
{
  const r = render(<Carousel slides={SLIDES} />);
  fire.click(btn(r.container, 'Next'));
  fire.click(btn(r.container, 'Next'));
  const third = slide(r.container) + '|' + q('[role="group"]', r.container).getAttribute('aria-label');
  fire.click(btn(r.container, 'Previous'));
  $test.check('Next and Previous move between slides', third === 'three|3 of 3' && slide(r.container) === 'two', { third, now: slide(r.container) });
  r.unmount();
}
{
  const r = render(<Carousel slides={SLIDES} />);
  fire.click(btn(r.container, 'Previous'));
  const wrapBack = slide(r.container);
  fire.click(btn(r.container, 'Next'));
  $test.check('With loop the carousel wraps around at both ends', wrapBack === 'three' && slide(r.container) === 'one', { wrapBack, now: slide(r.container) });
  r.unmount();
}
{
  const r = render(<Carousel slides={SLIDES} loop={false} />);
  const atStart = btn(r.container, 'Previous').disabled && !btn(r.container, 'Next').disabled;
  fire.click(btn(r.container, 'Next'));
  fire.click(btn(r.container, 'Next'));
  $test.check('Without loop the buttons are disabled at the ends', atStart && btn(r.container, 'Next').disabled && !btn(r.container, 'Previous').disabled && slide(r.container) === 'three', { slide: slide(r.container) });
  r.unmount();
}
{
  const r = render(<Carousel slides={SLIDES} />);
  fire.click(dot(r.container, 3));
  const current = qa('button[aria-current]', r.container).map((b) => b.getAttribute('aria-label')).join();
  $test.check('Dots jump to a slide and mark only the current one with aria-current', slide(r.container) === 'three' && current === 'Go to slide 3', { slide: slide(r.container), current });
  r.unmount();
}
{
  const r = render(<Carousel slides={SLIDES} />);
  const section = q('section', r.container);
  fire.keyDown(section, 'ArrowRight');
  fire.keyDown(section, 'ArrowRight');
  fire.keyDown(section, 'ArrowLeft');
  $test.check('Arrow keys on the carousel change slides', slide(r.container) === 'two' && section.tabIndex === 0, slide(r.container));
  r.unmount();
}
{
  const r = render(<Carousel slides={SLIDES} autoPlayMs={90} />);
  const advanced = await until(() => slide(r.container) !== 'one');
  const wrapped = await until(() => slide(r.container) === 'one' || slide(r.container) === 'three', 1500);
  $test.check('autoPlayMs advances the slide automatically', advanced && wrapped, slide(r.container));
  r.unmount();
}
