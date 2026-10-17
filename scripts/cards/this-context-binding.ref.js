function createGreeter(name) {
  const obj = {
    name,
    greet() {
      return 'Hello, ' + this.name;
    },
    getBoundGreet() {
      return obj.greet.bind(obj);
    }
  };
  return obj;
}

function invokeWithContext(fn, context, ...args) {
  return Reflect.apply(fn, context, args);
}

function isConstructorCall(TargetClass, ...args) {
  try {
    const inst = Reflect.construct(TargetClass, args);
    return inst instanceof TargetClass;
  } catch {
    return false;
  }
}
