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
  worker: {
    format: 'es',
  },
  build: {
    // The TypeScript compiler chunk is lazy-loaded (only for strict TS mode), so it is allowed to be large.
    chunkSizeWarningLimit: 6000,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/topics.json')) {
            return 'seed-topics';
          }
          if (
            id.includes('node_modules/@codemirror/view') ||
            id.includes('node_modules/@codemirror/state') ||
            id.includes('node_modules/@codemirror/language') ||
            id.includes('node_modules/@codemirror/commands') ||
            id.includes('node_modules/@codemirror/autocomplete') ||
            id.includes('node_modules/@codemirror/search') ||
            id.includes('node_modules/@codemirror/lint') ||
            id.includes('node_modules/@codemirror/lang-javascript') ||
            id.includes('node_modules/@lezer/common') ||
            id.includes('node_modules/@lezer/highlight') ||
            id.includes('node_modules/@lezer/lr') ||
            id.includes('node_modules/@lezer/javascript') ||
            id.includes('node_modules/@uiw/react-codemirror') ||
            id.includes('node_modules/rainbowbrackets')
          ) {
            return 'vendor-codemirror';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
