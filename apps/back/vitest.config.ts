import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Le back s'exécute dans Node (pas dans un navigateur)
    environment: 'node',
    // Fichiers de test
    include: ['tests/**/*.test.ts'],
    // Charge .env.test avant chaque fichier de test
    setupFiles: ['./tests/setup-env.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      reportsDirectory: 'coverage',
      // json-summary : lu par le script de badge et par la CI
      reporter: ['text', 'text-summary', 'json-summary', 'lcov'],
    },
  },
});
