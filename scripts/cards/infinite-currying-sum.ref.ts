interface CurriedSum {
  (): number;
  (...more: number[]): CurriedSum;
  valueOf(): number;
  toString(): string;
}

function sum(...first: number[]): CurriedSum {
  const total = first.reduce((a, b) => a + b, 0);
  const next = ((...more: number[]): any =>
    more.length === 0 ? total : sum(total, ...more)) as CurriedSum;
  next.valueOf = (): number => total;
  next.toString = (): string => String(total);
  return next;
}
