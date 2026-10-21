interface Greeter {
  name: string;
  greet(): string;
  getBoundGreet(): () => string;
}

function createGreeter(name: string): Greeter {
  const obj: Greeter = {
    name,
    greet() {
      return 'Hello, ' + this.name;
    },
    getBoundGreet() {
      return obj.greet.bind(obj);
    },
  };
  return obj;
}

function invokeWithContext(fn: (...args: any[]) => any, context: any, ...args: any[]): any {
  return Reflect.apply(fn, context, args);
}

function isConstructorCall(TargetClass: any, ...args: any[]): boolean {
  try {
    const inst = Reflect.construct(TargetClass, args);
    return inst instanceof TargetClass;
  } catch {
    return false;
  }
}
