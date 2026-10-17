function hoistingBehavior() {
  var varBefore = typeof x === 'undefined' ? x : null;
  var x = 42;
  function f() {
    return 'hoisted';
  }
  return { varBefore: varBefore, fnResult: f() };
}

function checkTDZ(fn) {
  try {
    fn();
    return 'ok';
  } catch (err) {
    if (err instanceof ReferenceError) return 'ReferenceError';
    return 'error';
  }
}

function makeLoopCallbacksVar(n) {
  var fns = [];
  for (var i = 0; i < n; i++) {
    fns.push(function () {
      return i;
    });
  }
  return fns;
}

function makeLoopCallbacksLet(n) {
  const fns = [];
  for (let i = 0; i < n; i++) {
    fns.push(function () {
      return i;
    });
  }
  return fns;
}
