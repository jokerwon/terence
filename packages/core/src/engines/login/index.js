/**
 * LoginEngine - 登录业务引擎
 *
 * 提供完整的登录业务逻辑实现,包括:
 * - 状态管理
 * - 登录动作 (Commands)
 * - 业务规则 (Rules)
 * - 依赖注入 (Dependencies)
 */

export { createLoginEngine } from './engine.js';
export { initialState } from './state.js';
export { createMockDeps } from './effects.js';
