const { render, fire, q } = $dom;
{
  const calls = [];
  const { container } = render(<SearchForm onSearch={(s) => calls.push(s)} />);
  const input = q('input', container);
  const form = q('form', container);
  fire.change(input, 'react');
  $test.check('Input mirrors typed text (controlled)', input.value === 'react', input.value);
  fire.change(input, '  react hooks  ');
  const event = fire.submit(form);
  $test.check('Submit trims whitespace and calls onSearch once', calls.length === 1 && calls[0] === 'react hooks', calls);
  $test.check('Submit prevents the default page reload', event.defaultPrevented === true);
  $test.check('Input keeps its text after submit', input.value === '  react hooks  ', input.value);
  fire.change(input, '   ');
  fire.submit(form);
  $test.check('Blank query does not call onSearch', calls.length === 1, calls);
}
