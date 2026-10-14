import type { TopicItem } from '../../lib/leitner';
import { extractHarnessContracts } from '../../lib/harnessContracts';

export interface ConsoleLogEntry {
  type: 'log' | 'warn' | 'error' | 'info';
  content: string;
  timestamp: string;
}

export function formatConsoleArg(arg: unknown): string {
  if (arg === undefined) return 'undefined';
  if (arg === null) return 'null';
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'function') return arg.toString();
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`;
  }
  try {
    return JSON.stringify(arg, null, 2);
  } catch {
    return String(arg);
  }
}

export function formatAssertionFailure(args: unknown[], currentCard: TopicItem | null): string | null {
  // Check if any arg indicates an assertion FAIL
  const hasFail = args.some((arg) => {
    if (typeof arg === 'string') {
      return /\bFAIL\b/i.test(arg);
    }
    if (Array.isArray(arg)) {
      return arg.some((item) => typeof item === 'string' && /\bFAIL\b/i.test(item));
    }
    return false;
  });

  if (!hasFail) return null;

  let description = '';
  let expected = '';
  let received = '';
  let foundReceived = false;

  // Case 1: args has a string with FAIL
  const failIndex = args.findIndex((arg) => typeof arg === 'string' && /\bFAIL\b/i.test(arg));
  if (failIndex !== -1) {
    if (failIndex > 0 && typeof args[0] === 'string') {
      description = args[0].replace(/:$/, '').trim();
    }
    const failArg = args[failIndex] as string;

    // Check if failArg has inline "(Expected ...)" or "(<val>)"
    const expectedMatch = failArg.match(/FAIL\s*\(\s*(?:Expected\s+)?([^)]+)\)/i);
    if (expectedMatch) {
      if (/expected/i.test(failArg)) {
        expected = expectedMatch[1].trim();
      } else {
        received = expectedMatch[1].trim();
        foundReceived = true;
      }
    }

    if (args.length > failIndex + 1) {
      received = args.slice(failIndex + 1).map(formatConsoleArg).join(' ');
      foundReceived = true;
    }
  }

  // Case 2: Array format like ['Test 1:', ['FAIL', rawReceived]] or [['FAIL', rawReceived]]
  if (!foundReceived) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (Array.isArray(arg) && arg.length >= 2 && typeof arg[0] === 'string' && /\bFAIL\b/i.test(arg[0])) {
        if (i > 0 && typeof args[0] === 'string') {
          description = args[0].replace(/:$/, '').trim();
        } else if (!description) {
          description = 'Assertion';
        }
        received = formatConsoleArg(arg[1]);
        foundReceived = true;
        break;
      }
    }
  }

  // If description not populated yet, check args[0]
  if (!description && typeof args[0] === 'string' && !/\bFAIL\b/i.test(args[0])) {
    description = args[0].replace(/:$/, '').trim();
  } else if (!description && typeof args[0] === 'string') {
    const match = args[0].match(/^(.*?):\s*FAIL/i);
    if (match) {
      description = match[1].trim();
    }
  }

  // Lookup expected value from currentCard testCases or extractHarnessContracts
  const testCases = currentCard
    ? (currentCard.testCases && currentCard.testCases.length > 0
        ? currentCard.testCases
        : extractHarnessContracts(currentCard.testHarness))
    : [];
  if (!expected && testCases.length > 0) {
    const descLower = description.toLowerCase();
    const matchedTc = testCases.find((tc) => {
      const tcDescLower = (tc.description || '').toLowerCase();
      const tcInputLower = (tc.input || '').toLowerCase();
      if (!descLower) return false;
      return (
        (tcDescLower && (descLower.includes(tcDescLower) || tcDescLower.includes(descLower))) ||
        (tcInputLower && descLower.includes(tcInputLower))
      );
    });

    if (matchedTc) {
      expected = matchedTc.expected;
    } else {
      const numMatch = description.match(/test\s*(\d+)/i);
      if (numMatch) {
        const idx = parseInt(numMatch[1], 10) - 1;
        if (testCases[idx]) {
          expected = testCases[idx].expected;
        }
      }
    }
  }

  // If still not found, check regex patterns in description
  if (!expected && description) {
    const expRegexMatch =
      description.match(/\(Expected\s+([^)]+)\)/i) ||
      description.match(/===\s*([^):,]+)/i) ||
      description.match(/->\s*([^):,]+)/i) ||
      description.match(/\(([0-9a-zA-Z_'".[\]\s]+)\):?$/);
    if (expRegexMatch) {
      expected = expRegexMatch[1].trim();
    }
  }

  if (!expected) {
    expected = 'truthy / expected contract';
  }

  if (!foundReceived || !received) {
    received = 'falsy / check evaluated to false';
  }

  const prefix = description ? `${description}: FAIL` : 'Assertion: FAIL';
  return `${prefix} | Expected: ${expected} | Received: ${received}`;
}
