function specificity(selector) {
  let s = selector;
  let ids = 0;
  let classes = 0;
  let elements = 0;

  s = s.replace(/:where\([^)]*\)/g, ''); // contributes nothing
  s = s.replace(/:not\(([^)]*)\)/g, (_, arg) => {
    const [a, b, c] = specificity(arg); // the argument counts, :not() itself does not
    ids += a;
    classes += b;
    elements += c;
    return '';
  });
  s = s.replace(/\[[^\]]*\]/g, () => (classes++, ''));
  s = s.replace(/#[\w-]+/g, () => (ids++, ''));
  s = s.replace(/\.[\w-]+/g, () => (classes++, ''));
  s = s.replace(/::[\w-]+/g, () => (elements++, ''));
  s = s.replace(/:[\w-]+(\([^)]*\))?/g, () => (classes++, ''));
  s = s.replace(/(^|[\s>+~])([a-zA-Z][\w-]*)/g, (_, pre) => (elements++, pre));
  return [ids, classes, elements];
}

function compareSpecificity(a, b) {
  const x = specificity(a);
  const y = specificity(b);
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
  }
  return 0;
}
