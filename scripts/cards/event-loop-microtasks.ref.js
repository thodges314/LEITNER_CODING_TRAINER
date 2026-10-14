function getExecutionOrder() {
  const order = [];
  return new Promise((resolve) => {
    setTimeout(() => {
      order.push('timeout');
      resolve(order);
    }, 0);
    Promise.resolve().then(() => order.push('promise'));
    queueMicrotask(() => order.push('microtask'));
    order.push('sync');
  });
}
