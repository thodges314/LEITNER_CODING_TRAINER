const compileChecks63 = () => {
  // @ts-expect-error — value must have the same type as items
  renderSelect<string>({ items: ['a'], value: 5, onChange: () => {}, getLabel: (s) => s });
  // @ts-expect-error — T cannot be both number (items) and string (value)
  renderSelect({ items: [1, 2], value: 'x', onChange: () => {}, getLabel: (n) => String(n) });
};
$test.check('Compile time: items and value must share one type', typeof compileChecks63 === 'function');
