/**
 * Stateless Core: Login Module
 *
 * 登录业务的无状态 Core 实现。
 *
 * 导出:
 * - rules: 业务规则纯函数
 * - flows: 业务流程函数
 *
 * @module stateless/login
 */

// 业务规则 - 纯函数
export * from './rules.js'

// 业务流程 - 可 async
export * from './flows.js'

export * from './schemas.js'
