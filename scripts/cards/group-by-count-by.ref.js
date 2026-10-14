function toKeyFn(keyFnOrProp) {
  return typeof keyFnOrProp === 'function' ? keyFnOrProp : (x) => x[keyFnOrProp];
}

function groupBy(items, keyFnOrProp) {
  const fn = toKeyFn(keyFnOrProp);
  return items.reduce((acc, item, idx) => {
    const key = fn(item, idx);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function countBy(items, keyFnOrProp) {
  const fn = toKeyFn(keyFnOrProp);
  return items.reduce((acc, item, idx) => {
    const key = fn(item, idx);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function keyBy(items, keyFnOrProp) {
  const fn = toKeyFn(keyFnOrProp);
  return items.reduce((acc, item, idx) => {
    acc[fn(item, idx)] = item; // last item wins on duplicate keys
    return acc;
  }, {});
}
