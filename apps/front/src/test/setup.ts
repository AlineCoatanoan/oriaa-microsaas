import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Retire le composant affiché après chaque test
afterEach(() => {
  cleanup();
});
