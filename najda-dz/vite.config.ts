import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Najda-DZ/', // Important for GitHub Pages deployment (repo name)
  build: {
    outDir: 'dist',
  },
});