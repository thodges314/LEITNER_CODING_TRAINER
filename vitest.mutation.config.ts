import { defineConfig } from 'vitest/config';

// Opt-in mutation check for card harnesses: see scripts/mutation.test.ts (npm run mutation).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/mutation.test.ts'],
    dangerouslyIgnoreUnhandledErrors: true, // broken mutants may throw asynchronously; that is expected
  },
});
