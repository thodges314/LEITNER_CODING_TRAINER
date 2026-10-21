function stockSpan(prices: number[]): number[] {
  const spans: number[] = [];
  const stack: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    while (stack.length && prices[stack[stack.length - 1]] <= prices[i]) stack.pop();
    spans.push(stack.length ? i - stack[stack.length - 1] : i + 1);
    stack.push(i);
  }
  return spans;
}

function largestRectangleArea(heights: number[]): number {
  const stack: number[] = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()!];
      const left = stack.length ? stack[stack.length - 1] : -1;
      best = Math.max(best, height * (i - left - 1));
    }
    stack.push(i);
  }
  return best;
}
