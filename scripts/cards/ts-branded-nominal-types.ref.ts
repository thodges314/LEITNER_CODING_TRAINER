type Brand<K, T> = K & { readonly __brand: T };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type PositiveNumber = Brand<number, 'PositiveNumber'>;

function toUserId(id: string): UserId {
  return id as UserId;
}

function toOrderId(id: string): OrderId {
  return id as OrderId;
}

function toPositiveNumber(n: number): PositiveNumber {
  if (n <= 0) throw new Error('Number must be positive');
  return n as PositiveNumber;
}
