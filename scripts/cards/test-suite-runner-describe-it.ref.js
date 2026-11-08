function createTestRunner() {
  let currentSuite = '';
  let total = 0;
  let passed = 0;
  let failed = 0;
  let errors = [];

  function describe(name, fn) {
    const prev = currentSuite;
    currentSuite = name;
    try {
      fn();
    } finally {
      currentSuite = prev;
    }
  }

  function it(name, fn) {
    total++;
    try {
      fn();
      passed++;
    } catch (err) {
      failed++;
      const message = err && err.message ? err.message : String(err);
      errors.push({ suite: currentSuite, test: name, message });
    }
  }

  function getReport() {
    return {
      total,
      passed,
      failed,
      errors: [...errors],
    };
  }

  function reset() {
    total = 0;
    passed = 0;
    failed = 0;
    errors = [];
    currentSuite = '';
  }

  return { describe, it, getReport, reset };
}

