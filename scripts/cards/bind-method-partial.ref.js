function bindMethod(obj, name) {
  return (...args) => obj[name](...args);
}

function partial(fn, ...preset) {
  return function (...later) {
    return fn.apply(this, [...preset, ...later]);
  };
}
