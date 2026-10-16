const compileChecksG1 = () => {
  const n: number = identity(5);
  const s: string = identity('a');
  // @ts-expect-error — identity('a') is a string, not a number
  const bad: number = identity('a');
  // @ts-expect-error — first of a number[] is number | undefined, never a string
  const bad2: string = first([1, 2]);
  const box: Box<number> = makeBox(3);
  const mapped: Box<string> = mapBox(box, (v) => String(v));
  // @ts-expect-error — mapping to a string gives Box<string>, not Box<number>
  const bad3: Box<number> = mapBox(box, (v) => String(v));
  return [n, s, bad, bad2, mapped, bad3];
};
$test.check('Compile time: generic results are inferred and checked', typeof compileChecksG1 === 'function');
