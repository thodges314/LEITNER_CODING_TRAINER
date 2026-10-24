import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    // Bundle report only on demand: `ANALYZE=1 npm run build` (writes stats.html and opens it).
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: 'stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  build: {
    // The TypeScript compiler chunk is lazy-loaded (only for strict TS mode), so it is allowed to be large.
    chunkSizeWarningLimit: 6000,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
