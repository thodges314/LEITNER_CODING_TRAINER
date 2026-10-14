import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // The TypeScript compiler chunk is lazy-loaded (only for strict TS mode), so it is allowed to be large.
    chunkSizeWarningLimit: 3600,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
