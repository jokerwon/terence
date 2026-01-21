/**
 * @terence/core - Terence 业务内核
 *
 * 采用双轨模型:
 * - Track A: Stateless Core (默认轨道，80%+ 业务场景)
 * - Track B: Stateful Engine (受限轨道，复杂多阶段流程)
 */

// Utils - 通用工具函数
export * from './utils/index.js'

// Login - 登录业务
export * from './login/index.js'
