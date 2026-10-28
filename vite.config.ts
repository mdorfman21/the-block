import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Frontend-only prototype: Vite serves the React app and bundles the vehicle
// dataset (data/vehicles.json) directly. No backend process in v1.
export default defineConfig({
  plugins: [react()],
  build: {
    // The 200-vehicle dataset (~280 KB) is bundled into the main chunk on
    // purpose — frontend-only, so the app reads it synchronously with no
    // loading states. It gzips to a small payload; raise the warning ceiling
    // rather than code-split a prototype.
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
