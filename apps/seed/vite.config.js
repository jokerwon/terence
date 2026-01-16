import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@terence/core': path.resolve(__dirname, '../../core/src'),
      '@terence/ui': path.resolve(__dirname, '../../ui/src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
