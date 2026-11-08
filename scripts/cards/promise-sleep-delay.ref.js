function delay(ms) {
  const duration = typeof ms === 'number' && ms > 0 ? ms : 0;
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function delayValue(value, ms) {
  const duration = typeof ms === 'number' && ms > 0 ? ms : 0;
  return new Promise((resolve) => setTimeout(() => resolve(value), duration));
}

