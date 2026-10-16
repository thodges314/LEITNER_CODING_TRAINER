function cloneWithDescriptors(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}

function mixin(target, ...sources) {
  for (const source of sources) {
    for (const key of Reflect.ownKeys(source)) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    }
  }
  return target;
}
