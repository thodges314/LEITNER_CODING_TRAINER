await (async () => {
  const dFn = typeof delay === 'function' ? delay : (globalThis as any).delay;
  const dvFn = typeof delayValue === 'function' ? delayValue : (globalThis as any).delayValue;

  const case1 = 'delay(ms) resolves after specified duration with undefined';
  const case2 = 'delayValue(value, ms) resolves with given value after timer';
  const case3 = 'delay handles non-positive values immediately without error';
  const case4 = 'Chains sequential delays correctly';

  if (typeof dFn !== 'function' || typeof dvFn !== 'function') {
    $test.check(case1, false, { error: 'delay or delayValue is not defined' });
    $test.check(case2, false, { error: 'delay or delayValue is not defined' });
    $test.check(case3, false, { error: 'delay or delayValue is not defined' });
    $test.check(case4, false, { error: 'delay or delayValue is not defined' });
    return;
  }

  // Case 1
  const t0 = Date.now();
  const res1 = await dFn(30);
  const elapsed1 = Date.now() - t0;
  $test.check(
    case1,
    res1 === undefined && elapsed1 >= 20,
    { elapsed: elapsed1, res: res1 }
  );

  // Case 2
  const t1 = Date.now();
  const res2 = await dvFn('data_payload', 30);
  const elapsed2 = Date.now() - t1;
  $test.check(
    case2,
    res2 === 'data_payload' && elapsed2 >= 20,
    { elapsed: elapsed2, res: res2 }
  );

  // Case 3
  const t2 = Date.now();
  const res3A = await dFn(0);
  const res3B = await dFn(-100);
  const res3C = await dvFn(42, 0);
  const elapsed3 = Date.now() - t2;
  $test.check(
    case3,
    res3A === undefined && res3B === undefined && res3C === 42 && elapsed3 < 40,
    { elapsed: elapsed3, res3C }
  );

  // Case 4
  const t3 = Date.now();
  await dFn(15);
  const res4 = await dvFn({ ready: true }, 15);
  const elapsed4 = Date.now() - t3;
  $test.check(
    case4,
    res4 && res4.ready === true && elapsed4 >= 25,
    { elapsed: elapsed4, res4 }
  );
})();

