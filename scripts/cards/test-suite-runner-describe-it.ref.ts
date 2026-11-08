interface TestFailure {
  suite: string;
  test: string;
  message: string;
}

interface TestReport {
  total: number;
  passed: number;
  failed: number;
  errors: TestFailure[];
}

interface TestRunner {
  describe: (name: string, fn: () => void) => void;
  it: (name: string, fn: () => void) => void;
  getReport: () => TestReport;
  reset: () => void;
}

function createTestRunner(): TestRunner {
  let currentSuite = '';
  let total = 0;
  let passed = 0;
  let failed = 0;
  let errors: TestFailure[] = [];

  function describe(name: string, fn: () => void): void {
    const prev = currentSuite;
    currentSuite = name;
    try {
      fn();
    } finally {
      currentSuite = prev;
    }
  }

  function it(name: string, fn: () => void): void {
    total++;
    try {
      fn();
      passed++;
    } catch (err: unknown) {
      failed++;
      const message =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || String(err);
      errors.push({ suite: currentSuite, test: name, message });
    }
  }

  function getReport(): TestReport {
    return {
      total,
      passed,
      failed,
      errors: [...errors],
    };
  }

  function reset(): void {
    total = 0;
    passed = 0;
    failed = 0;
    errors = [];
    currentSuite = '';
  }

  return { describe, it, getReport, reset };
}

