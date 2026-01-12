import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'Gemmer',
      fileName: (format) => `gemmer.${format}.js`
    }
  }
});
