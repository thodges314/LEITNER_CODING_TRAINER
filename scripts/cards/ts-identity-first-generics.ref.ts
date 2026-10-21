function identity<T>(value: T): T {
  return value;
}

function first<T>(items: T[]): T | undefined {
  return items[0];
}

interface Box<T> {
  value: T;
}

function makeBox<T>(value: T): Box<T> {
  return { value };
}

function mapBox<T, U>(box: Box<T>, fn: (value: T) => U): Box<U> {
  return { value: fn(box.value) };
}
