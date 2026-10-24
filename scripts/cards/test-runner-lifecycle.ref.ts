interface TestResult {
  title: string;
  status: 'pass' | 'fail';
  error?: string;
}

interface SuiteResult {
  title: string;
  tests: TestResult[];
  suites: SuiteResult[];
}

interface RunnerReport {
  passed: number;
  failed: number;
  total: number;
  suites: SuiteResult[];
}

type AsyncHook = () => void | Promise<void>;

interface InternalSuite {
  title: string;
  tests: { title: string; fn: () => void | Promise<void> }[];
  suites: InternalSuite[];
  beforeAll: AsyncHook[];
  afterAll: AsyncHook[];
  beforeEach: AsyncHook[];
  afterEach: AsyncHook[];
}

class TestRunner {
  private _rootSuite: InternalSuite;
  private _suiteStack: InternalSuite[];

  constructor() {
    this._rootSuite = this._createSuite('');
    this._suiteStack = [this._rootSuite];
    this.describe = this.describe.bind(this);
    this.it = this.it.bind(this);
    this.beforeAll = this.beforeAll.bind(this);
    this.afterAll = this.afterAll.bind(this);
    this.beforeEach = this.beforeEach.bind(this);
    this.afterEach = this.afterEach.bind(this);
    this.run = this.run.bind(this);
  }

  private _createSuite(title: string): InternalSuite {
    return {
      title,
      tests: [],
      suites: [],
      beforeAll: [],
      afterAll: [],
      beforeEach: [],
      afterEach: [],
    };
  }

  describe(title: string, fn: () => void): void {
    const suite = this._createSuite(title);
    this._suiteStack[this._suiteStack.length - 1].suites.push(suite);
    this._suiteStack.push(suite);
    try {
      fn();
    } finally {
      this._suiteStack.pop();
    }
  }

  it(title: string, fn: () => void | Promise<void>): void {
    this._suiteStack[this._suiteStack.length - 1].tests.push({ title, fn });
  }

  beforeAll(fn: AsyncHook): void {
    this._suiteStack[this._suiteStack.length - 1].beforeAll.push(fn);
  }

  afterAll(fn: AsyncHook): void {
    this._suiteStack[this._suiteStack.length - 1].afterAll.push(fn);
  }

  beforeEach(fn: AsyncHook): void {
    this._suiteStack[this._suiteStack.length - 1].beforeEach.push(fn);
  }

  afterEach(fn: AsyncHook): void {
    this._suiteStack[this._suiteStack.length - 1].afterEach.push(fn);
  }

  async run(): Promise<RunnerReport> {
    const runSuite = async (
      suite: InternalSuite,
      inheritedBeforeEach: AsyncHook[] = [],
      inheritedAfterEach: AsyncHook[] = []
    ): Promise<SuiteResult> => {
      const allBeforeEach = [...inheritedBeforeEach, ...suite.beforeEach];
      const allAfterEach = [...suite.afterEach, ...inheritedAfterEach];

      const suiteResult: SuiteResult = {
        title: suite.title,
        tests: [],
        suites: [],
      };

      let beforeAllError: unknown = null;
      for (const hook of suite.beforeAll) {
        try {
          await hook();
        } catch (err) {
          beforeAllError = err;
          break;
        }
      }

      for (const test of suite.tests) {
        if (beforeAllError) {
          const errObj = beforeAllError as { message?: string };
          suiteResult.tests.push({
            title: test.title,
            status: 'fail',
            error: `beforeAll failed: ${errObj.message || String(beforeAllError)}`,
          });
          continue;
        }

        let testError: unknown = null;
        for (const hook of allBeforeEach) {
          try {
            await hook();
          } catch (err) {
            testError = err;
            break;
          }
        }

        if (!testError) {
          try {
            await test.fn();
          } catch (err) {
            testError = err;
          }
        }

        for (const hook of allAfterEach) {
          try {
            await hook();
          } catch (err) {
            if (!testError) testError = err;
          }
        }

        if (testError) {
          const errObj = testError as { message?: string };
          suiteResult.tests.push({
            title: test.title,
            status: 'fail',
            error: errObj.message || String(testError),
          });
        } else {
          suiteResult.tests.push({
            title: test.title,
            status: 'pass',
          });
        }
      }

      for (const childSuite of suite.suites) {
        const childResult = await runSuite(childSuite, allBeforeEach, allAfterEach);
        suiteResult.suites.push(childResult);
      }

      for (const hook of suite.afterAll) {
        try {
          await hook();
        } catch {
          // ignore
        }
      }

      return suiteResult;
    };

    const topSuites: SuiteResult[] = [];
    if (this._rootSuite.tests.length > 0) {
      topSuites.push(await runSuite(this._rootSuite));
    } else {
      for (const s of this._rootSuite.suites) {
        topSuites.push(await runSuite(s));
      }
    }

    let passed = 0;
    let failed = 0;
    const count = (res: SuiteResult): void => {
      for (const t of res.tests) {
        if (t.status === 'pass') passed++;
        else failed++;
      }
      for (const sub of res.suites) {
        count(sub);
      }
    };
    for (const r of topSuites) count(r);

    return {
      passed,
      failed,
      total: passed + failed,
      suites: topSuites,
    };
  }
}

function createTestRunner(): TestRunner {
  return new TestRunner();
}
