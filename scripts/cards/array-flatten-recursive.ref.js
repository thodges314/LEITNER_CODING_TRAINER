function flatten(arr) {
  let res = [];
  for (const item of arr) {
    if (Array.isArray(item)) res = res.concat(flatten(item));
    else res.push(item);
  }
  return res;
}
