const { render, fire, q, qa, wait } = $dom;
// A controllable clock: the component must read Date.now(), so we can move time without waiting.
const clock = { t: 1000000 };
const realNow = Date.now;
const realSet = globalThis.setInterval;
const realClear = globalThis.clearInterval;
const live = new Set();
Date.now = () => clock.t;
globalThis.setInterval = (...a) => { const id = realSet(...a); live.add(id); return id; };
globalThis.clearInterval = (id) => { live.delete(id); return realClear(id); };
const btn = (c, name) => qa('button', c).find((b) => b.textContent.trim() === name);
const shown = (c) => q('[role="timer"]', c).textContent.trim();
const laps = (c) => qa('ol li', c).map((li) => li.textContent.trim());
const advance = async (ms) => { clock.t += ms; await wait(80); };
try {
  {
    const r = render(<Stopwatch />);
    $test.check('Starts stopped at 00:00.00 with Start enabled and Lap disabled', shown(r.container) === '00:00.00' && btn(r.container, 'Start') !== undefined && btn(r.container, 'Lap').disabled === true && q('[aria-label="Elapsed time"]', r.container) !== null, { shown: shown(r.container) });
    r.unmount();
  }
  {
    const r = render(<Stopwatch />);
    fire.click(btn(r.container, 'Start'));
    await advance(1234);
    $test.check('Start begins counting: the button becomes Pause and 1234 ms reads 00:01.23', btn(r.container, 'Pause') !== undefined && shown(r.container) === '00:01.23', shown(r.container));
    r.unmount();
  }
  {
    const r = render(<Stopwatch />);
    fire.click(btn(r.container, 'Start'));
    await advance(1234);
    fire.click(btn(r.container, 'Pause'));
    await advance(5000);
    const frozen = shown(r.container);
    fire.click(btn(r.container, 'Start'));
    await advance(1000);
    $test.check('Pause freezes the time and resuming does not count the paused interval', frozen === '00:01.23' && shown(r.container) === '00:02.23', { frozen, resumed: shown(r.container) });
    r.unmount();
  }
  {
    const r = render(<Stopwatch />);
    fire.click(btn(r.container, 'Start'));
    await advance(61050);
    $test.check('Minutes roll over: 61050 ms reads 01:01.05', shown(r.container) === '01:01.05', shown(r.container));
    r.unmount();
  }
  {
    const r = render(<Stopwatch />);
    fire.click(btn(r.container, 'Start'));
    await advance(1234);
    fire.click(btn(r.container, 'Lap'));
    await advance(1766);
    fire.click(btn(r.container, 'Lap'));
    $test.check('Lap appends the current time to an ordered list', laps(r.container).join('|') === 'Lap 1 00:01.23|Lap 2 00:03.00', laps(r.container));
    r.unmount();
  }
  {
    const r = render(<Stopwatch />);
    fire.click(btn(r.container, 'Start'));
    await advance(1234);
    fire.click(btn(r.container, 'Lap'));
    fire.click(btn(r.container, 'Reset'));
    await advance(500);
    $test.check('Reset stops the watch, zeroes the time and clears the laps', shown(r.container) === '00:00.00' && laps(r.container).length === 0 && btn(r.container, 'Start') !== undefined, { shown: shown(r.container), laps: laps(r.container) });
    r.unmount();
  }
  {
    const before = live.size;
    const r = render(<Stopwatch />);
    fire.click(btn(r.container, 'Start'));
    const whileRunning = live.size - before;
    fire.click(btn(r.container, 'Pause'));
    const afterPause = live.size - before;
    fire.click(btn(r.container, 'Start'));
    r.unmount();
    const afterUnmount = live.size - before;
    $test.check('The interval is cleared on Pause and on unmount (no leaked timers)', whileRunning === 1 && afterPause === 0 && afterUnmount === 0, { whileRunning, afterPause, afterUnmount });
  }
} finally {
  Date.now = realNow;
  globalThis.setInterval = realSet;
  globalThis.clearInterval = realClear;
}
