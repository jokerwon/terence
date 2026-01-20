/**
 * Vitest 全局测试配置
 */

import { vi } from 'vitest'

// 全局测试设置
global.beforeEach(() => {
  // 每个测试前清除所有 mocks
  vi.clearAllMocks()
})

// 全局测试清理
global.afterEach(() => {
  // 每个测试后的清理工作
})
