/**
 * @terence/core - Terence 业务内核
 *
 * 采用双轨模型:
 * - Track A: Stateless Core (默认轨道，80%+ 业务场景)
 * - Track B: Stateful Engine (受限轨道，复杂多阶段流程)
 */

// Utils - 通用工具函数
export { StateContainer } from './utils/StateContainer.js'
export { invariant, invariantWithType } from './utils/invariant.js'
export { validateDeps } from './utils/validation.js'

// Track A: Stateless Core
export * from './stateless/login/index.js'

// Track B: Stateful Engines
export { createLoginEngine, initialState as loginInitialState, createMockDeps as createLoginMockDeps } from './engines/login/index.js'
