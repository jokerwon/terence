import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@terence/core': path.resolve(__dirname, '../../packages/core/src'),
      '@terence/ui': path.resolve(__dirname, '../../packages/ui/src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
