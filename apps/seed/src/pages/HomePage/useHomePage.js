import { useMemo } from 'react'

/**
 * HomePage 自定义 hook
 */
export function useHomePage() {
  return useMemo(() => ({
    title: '欢迎使用 @terence/seed',
    message: '这是一个符合 Terence 三层架构规范的示例应用',
  }), [])
}
