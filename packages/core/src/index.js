/**
 * @terence/core - Terence 业务内核
 *
 * 提供 Engine + Adapter 架构的业务逻辑实现。
 */

// Utils
export { StateContainer } from './utils/StateContainer.js'
export { invariant, invariantWithType } from './utils/invariant.js'
export { validateDeps } from './utils/validation.js'

// Engines
export { createLoginEngine, initialState as loginInitialState, createMockDeps as createLoginMockDeps } from './engines/login/index.js'
