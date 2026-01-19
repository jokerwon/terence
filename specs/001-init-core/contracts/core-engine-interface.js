/**
 * Core Engine 标准接口契约
 *
 * 本文件定义了所有 Engine 必须实现的标准接口。
 * 这是 Core 业务内核的抽象,所有具体的 Engine 实现都必须遵循此契约。
 *
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} Engine
 * @description 业务引擎标准接口,所有 Engine 必须实现此接口
 *
 * @property {function(): State} getState - 获取当前业务状态(不可变副本)
 * @property {function(listener: StateListener): UnsubscribeFunction} subscribe - 订阅状态变化
 * @property {Commands} commands - 业务动作集合
 * @property {Rules} rules - 业务规则集合
 *
 * @example
 * const engine = createLoginEngine(deps);
 *
 * // 获取状态
 * const state = engine.getState();
 *
 * // 订阅变化
 * const unsubscribe = engine.subscribe((newState) => {
 *   console.log('State changed:', newState);
 * });
 *
 * // 执行命令
 * await engine.commands.submit();
 *
 * // 业务判断
 * if (engine.rules.canSubmit()) {
 *   engine.commands.submit();
 * }
 *
 * // 取消订阅
 * unsubscribe();
 */

/**
 * @callback StateListener
 * @description 状态变化监听器
 * @param {State} newState - 新的业务状态
 * @returns {void}
 */

/**
 * @callback UnsubscribeFunction
 * @description 取消订阅函数
 * @returns {void}
 */

/**
 * @typedef {Object} State
 * @description 业务状态接口,所有 Engine State 必须实现
 *
 * 约束条件:
 * - 必须可序列化 (JSON.stringify)
 * - 不包含函数
 * - 不包含循环引用
 * - 有明确的初始值
 *
 * @example
 * {
 *   status: 'idle',
 *   data: null,
 *   error: null
 * }
 */

/**
 * @typedef {Object} Commands
 * @description 业务动作接口,所有 Engine Commands 必须实现
 *
 * 约束条件:
 * - 每个 Command 都有 JSDoc 描述
 * - 每个 Command 都进行参数校验
 * - 每个 Command 失败时抛出明确的 Error
 * - 每个 Command 都更新 state
 *
 * @example
 * {
 *   setUsername: (value) => void,
 *   setPassword: (value) => void,
 *   submit: () => Promise<void>
 * }
 */

/**
 * @typedef {Object} Rules
 * @description 业务规则接口,所有 Engine Rules 必须实现
 *
 * 约束条件:
 * - 每个 Rule 都是纯函数
 * - 每个 Rule 都有 JSDoc 描述
 * - 每个 Rule 不修改 state
 * - 每个 Rule 不调用 deps
 * - 每个 Rule 只依赖 state
 *
 * @example
 * {
 *   canSubmit: () => boolean,
 *   isSubmitting: () => boolean,
 *   hasError: () => boolean
 * }
 */

/**
 * @typedef {Object} Dependencies
 * @description 依赖注入接口,所有 Engine Dependencies 必须实现
 *
 * 约束条件:
 * - 每个 Dependency 都有 JSDoc 契约
 * - 每个 Dependency 在创建 Engine 时校验
 * - 缺失依赖立即抛出 Error
 * - 提供开发模式 Mock
 *
 * @example
 * {
 *   apiRequest: (payload) => Promise<Result>,
 *   saveData: (data) => void,
 *   navigate: (path) => void
 * }
 */

/**
 * @typedef {function(Dependencies): Engine} EngineFactory
 * @description Engine 工厂函数类型
 *
 * @param {Dependencies} deps - 依赖注入对象
 * @returns {Engine} Engine 实例
 *
 * @example
 * const createLoginEngine = (deps) => {
 *   // 实现代码...
 *   return {
 *     getState: () => state,
 *     subscribe: (listener) => { ... },
 *     commands: { ... },
 *     rules: { ... }
 *   };
 * };
 */

// 导出类型定义供 JSDoc 使用
export {
  // 接口
  Engine,
  StateListener,
  UnsubscribeFunction,
  State,
  Commands,
  Rules,
  Dependencies,
  EngineFactory
};
