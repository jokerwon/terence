/**
 * Order Engine Module
 *
 * 订单流程 Stateful Engine 实现。
 *
 * 展示如何使用 Engine 模式管理复杂的多阶段业务流程。
 *
 * @module engines/order-engine
 */

// Engine 工厂函数
export { createOrderEngine } from './engine.js'

// 状态迁移规则
export { orderTransitions } from './transitions.js'

// 外部能力契约
export { orderEngineContextContract } from './contract.js'
