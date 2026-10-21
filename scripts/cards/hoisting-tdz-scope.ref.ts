function hoistingBehavior(): { varBefore: any; fnResult: string } {
  var varBefore = typeof x === 'undefined' ? (x as any) : null;
  var x: any = 42;
  function f(): string {
    return 'hoisted';
  }
  return { varBefore: varBefore, fnResult: f() };
}

function checkTDZ(fn: () => any): 'ReferenceError' | 'ok' | 'error' {
  try {
    fn();
    return 'ok';
  } catch (err) {
    if (err instanceof ReferenceError) return 'ReferenceError';
    return 'error';
  }
}

function makeLoopCallbacksVar(n: number): (() => number)[] {
  var fns: (() => number)[] = [];
  for (var i = 0; i < n; i++) {
    fns.push(function () {
      return i;
    });
  }
  return fns;
}

function makeLoopCallbacksLet(n: number): (() => number)[] {
  const fns: (() => number)[] = [];
  for (let i = 0; i < n; i++) {
    fns.push(function () {
      return i;
    });
  }
  return fns;
}
