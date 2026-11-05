import { defineConfig } from 'vite';
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
});
