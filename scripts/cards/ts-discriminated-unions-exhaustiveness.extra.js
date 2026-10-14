// Compile-time checks (strict TS mode): these lines must be type errors, otherwise the directive itself errors.
const compileChecks60 = () => {
  // @ts-expect-error — an unknown status must be rejected
  formatState({ status: 'oops' });
  // @ts-expect-error — the success state requires its data
  formatState({ status: 'success' });
};
$test.check('Compile time: unknown status and missing data are rejected', typeof compileChecks60 === 'function');
