/**
 * UI Hooks - Adapters
 *
 * React Adapter 模块，将 Core 层的 Engine 适配到 React 组件。
 *
 * Adapter 职责：
 * - 使用 useSyncExternalStore 订阅 Engine 状态
 * - 调用 engine.actions 或 engine.commands
 * - 不能修改 Engine 内部状态
 * - 不能编写业务规则判断
 */

export { createReactAdapter } from './createReactAdapter.js'
