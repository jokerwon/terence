import { defineConfig } from 'vitest/config';

export default defineConfig({
  // 统一构建配置
  build: {
    target: 'esnext',
    minify: 'esbuild'
  },

  // Vitest 配置
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/{core,cli}/**/*.test.js'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.js',
        '**/*.config.ts',
        '**/*.config.js'
      ],
      // 测试覆盖率目标
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
});
