function nextStep(step, total) {
  return Math.min(step + 1, Math.max(0, total - 1));
}

function prevStep(step) {
  return Math.max(step - 1, 0);
}

function stepStatuses(current, total) {
  return Array.from({ length: Math.max(0, total) }, (_, i) => (i < current ? 'done' : i === current ? 'current' : 'upcoming'));
}

function missingFields(values, required) {
  return required.filter((name) => {
    const value = values[name];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });
}

function progressPercent(current, total) {
  if (total <= 0) return 0;
  return Math.round((current / total) * 100);
}
