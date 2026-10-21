function maxProfit(prices: number[]): number {
  let min = Infinity;
  let best = 0;
  for (const p of prices) {
    min = Math.min(min, p);
    best = Math.max(best, p - min);
  }
  return best;
}

function maxProfitMany(prices: number[]): number {
  let total = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) total += prices[i] - prices[i - 1];
  }
  return total;
}

function maxProfitCooldown(prices: number[]): number {
  let hold = -Infinity;
  let sold = 0;
  let rest = 0;
  for (const p of prices) {
    const prevSold = sold;
    sold = hold + p;
    hold = Math.max(hold, rest - p);
    rest = Math.max(rest, prevSold);
  }
  return Math.max(sold, rest);
}
