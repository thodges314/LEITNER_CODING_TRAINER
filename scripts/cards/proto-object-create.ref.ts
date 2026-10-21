function inheritFrom(proto: any, props: any = {}): any {
  const obj = Object.create(proto);
  Object.assign(obj, props);
  return obj;
}

function hasOwn(obj: any, key: string | symbol): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function protoChainLength(obj: any): number {
  let count = 0;
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    count++;
    proto = Object.getPrototypeOf(proto);
  }
  return count;
}
