import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Adapter 测试需要浏览器环境
    include: 'tests/**/*.test.js', // 明确指定测试文件位置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/setup.js',
        '**/*.config.js',
        '**/node_modules/**'
      ]
    }
  }
});
