import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    // En développement, /api est transmis au back : même origine, donc cookie accepté
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    // Simule un navigateur pour afficher les composants
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
      reportsDirectory: 'coverage',
      // json-summary : lu par le script de badge et par la CI
      reporter: ['text', 'text-summary', 'json-summary', 'lcov'],
    },
  },
});
