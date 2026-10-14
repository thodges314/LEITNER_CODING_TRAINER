const { renderHook, act } = $dom;
const INITIAL = { email: '', agree: false };
const validate = (v) => {
  const errors = {};
  if (!/^\S+@\S+$/.test(v.email)) errors.email = 'Invalid email';
  return errors;
};
const evt = (name, value, extra = {}) => ({ target: { name, value, ...extra } });
{
  const h = renderHook(() => useForm({ initialValues: INITIAL, validate }));
  $test.check('Starts with the initial values and no touched fields', h.result.current.values.email === '' && Object.keys(h.result.current.touched).length === 0 && h.result.current.isSubmitting === false, h.result.current);
  h.unmount();
}
{
  const h = renderHook(() => useForm({ initialValues: INITIAL, validate }));
  act(() => h.result.current.handleChange(evt('email', 'a@b.co')));
  $test.check('handleChange updates the named field', h.result.current.values.email === 'a@b.co' && h.result.current.values.agree === false, h.result.current.values);
  h.unmount();
}
{
  const h = renderHook(() => useForm({ initialValues: INITIAL, validate }));
  act(() => h.result.current.handleChange(evt('agree', 'on', { type: 'checkbox', checked: true })));
  $test.check('Checkbox inputs use checked instead of value', h.result.current.values.agree === true, h.result.current.values);
  h.unmount();
}
{
  const h = renderHook(() => useForm({ initialValues: INITIAL, validate }));
  const invalid = h.result.current.errors.email;
  act(() => h.result.current.handleChange(evt('email', 'ada@example.com')));
  $test.check('errors come from validate(values) for the current values', invalid === 'Invalid email' && h.result.current.errors.email === undefined, { invalid, now: h.result.current.errors });
  h.unmount();
}
{
  const h = renderHook(() => useForm({ initialValues: INITIAL, validate }));
  act(() => h.result.current.handleBlur(evt('email', '')));
  $test.check('handleBlur marks only that field touched', h.result.current.touched.email === true && h.result.current.touched.agree === undefined, h.result.current.touched);
  h.unmount();
}
{
  const calls = [];
  let prevented = 0;
  const h = renderHook(() => useForm({ initialValues: INITIAL, validate, onSubmit: (v) => calls.push(v) }));
  await act(async () => {
    await h.result.current.handleSubmit({ preventDefault: () => prevented++ });
  });
  $test.check('handleSubmit prevents default, touches every field and does not submit invalid values', prevented === 1 && calls.length === 0 && h.result.current.touched.email === true && h.result.current.touched.agree === true, { prevented, calls: calls.length, touched: h.result.current.touched });
  h.unmount();
}
{
  const calls = [];
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const h = renderHook(() => useForm({ initialValues: { email: 'ada@example.com', agree: true }, validate, onSubmit: async (v) => { calls.push(v); await gate; } }));
  let pending;
  act(() => {
    pending = h.result.current.handleSubmit({ preventDefault() {} });
  });
  const during = h.result.current.isSubmitting;
  release();
  await act(async () => {
    await pending;
  });
  $test.check('handleSubmit calls onSubmit with the values and isSubmitting is true while it runs', during === true && h.result.current.isSubmitting === false && calls.length === 1 && calls[0].email === 'ada@example.com', { during, after: h.result.current.isSubmitting, calls });
  h.unmount();
}
{
  const h = renderHook(() => useForm({ initialValues: INITIAL, validate }));
  act(() => h.result.current.handleChange(evt('email', 'x')));
  act(() => h.result.current.handleBlur(evt('email', 'x')));
  act(() => h.result.current.reset());
  $test.check('reset restores the initial values and clears touched', h.result.current.values.email === '' && Object.keys(h.result.current.touched).length === 0, h.result.current);
  h.unmount();
}
