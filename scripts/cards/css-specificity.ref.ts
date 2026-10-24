type SpecificityTuple = [ids: number, classes: number, elements: number];

function specificity(selector: string): SpecificityTuple {
  let s = selector;
  let ids = 0;
  let classes = 0;
  let elements = 0;

  s = s.replace(/:where\([^)]*\)/g, ''); // contributes nothing
  s = s.replace(/:not\(([^)]*)\)/g, (_, arg: string) => {
    const [a, b, c] = specificity(arg); // the argument counts, :not() itself does not
    ids += a;
    classes += b;
    elements += c;
    return '';
  });
  s = s.replace(/\[[^\]]*\]/g, () => {
    classes++;
    return '';
  });
  s = s.replace(/#[\w-]+/g, () => {
    ids++;
    return '';
  });
  s = s.replace(/\.[\w-]+/g, () => {
    classes++;
    return '';
  });
  s = s.replace(/::[\w-]+/g, () => {
    elements++;
    return '';
  });
  s = s.replace(/:[\w-]+(\([^)]*\))?/g, () => {
    classes++;
    return '';
  });
  s = s.replace(/(^|[\s>+~])([a-zA-Z][\w-]*)/g, (_, pre: string) => {
    elements++;
    return pre;
  });
  return [ids, classes, elements];
}

function compareSpecificity(a: string, b: string): 1 | -1 | 0 {
  const x = specificity(a);
  const y = specificity(b);
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
  }
  return 0;
}
