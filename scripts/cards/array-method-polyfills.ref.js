const define = (name, fn) =>
  Object.defineProperty(Array.prototype, name, { value: fn, writable: true, configurable: true });

define('myMap', function (callback, thisArg) {
  const res = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) res[i] = callback.call(thisArg, this[i], i, this);
  }
  return res;
});

define('myFilter', function (callback, thisArg) {
  const res = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) res.push(this[i]);
  }
  return res;
});

define('myReduce', function (callback, initialValue) {
  let i = 0;
  let acc;
  if (arguments.length >= 2) {
    acc = initialValue;
  } else {
    while (i < this.length && !(i in this)) i++;
    if (i >= this.length) throw new TypeError('Reduce of empty array with no initial value');
    acc = this[i++];
  }
  for (; i < this.length; i++) {
    if (i in this) acc = callback(acc, this[i], i, this);
  }
  return acc;
});
