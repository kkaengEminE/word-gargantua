import { defineConfig } from 'vite';

export default defineConfig({
  base: '/word-gargantua/',
  build: {
    target: 'es2020',
    outDir: 'dist',
  }
});
