function cloneWithDescriptors<T extends object>(obj: T): T {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}

function mixin<T extends object>(target: T, ...sources: any[]): T {
  for (const source of sources) {
    for (const key of Reflect.ownKeys(source)) {
      const desc = Object.getOwnPropertyDescriptor(source, key);
      if (desc) {
        Object.defineProperty(target, key, desc);
      }
    }
  }
  return target;
}
