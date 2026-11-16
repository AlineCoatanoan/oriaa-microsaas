import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              // Bibliothèques utilisées par toutes les pages, rarement mises à jour :
              // fichier à part, gardé en cache par le navigateur d'une version à l'autre
              name: 'vendor',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler|@tanstack)[\\/]/,
            },
          ],
        },
      },
    },
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
