/**
 * React Adapter API 契约
 *
 * 本文件定义了 React Adapter 的完整 API 契约,包括:
 * - createReactAdapter 工厂函数
 * - UseEngine Hook 接口
 * - EngineHookResult 返回值
 *
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} EngineHookResult
 * @description Engine Hook 返回值,包含 state、commands 和 rules
 *
 * @property {State} state - 当前业务状态(不可变)
 * @property {Commands} commands - 业务动作集合
 * @property {Rules} rules - 业务规则集合
 *
 * @example
 * const { state, commands, rules } = useLogin();
 *
 * console.log(state.status); // 'idle'
 * commands.setUsername('user@example.com');
 * console.log(rules.canSubmit()); // true
 */

/**
 * @callback SelectorFunction
 * @description 状态选择器函数,用于选择性订阅部分状态
 * @param {State} state - 完整的业务状态
 * @returns {any} 选择后的状态
 *
 * @example
 * // 只订阅 username
 * const username = useLogin(state => state.username);
 *
 * // 只订阅 status
 * const status = useLogin(state => state.status);
 *
 * // 订阅多个状态
 * const { username, status } = useLogin(state => ({
 *   username: state.username,
 *   status: state.status
 * }));
 */

/**
 * @typedef {Object} ReactAdapterOptions
 * @description React Adapter 配置选项(未来扩展用)
 *
 * @property {boolean} [batchUpdates=false] - 是否批量更新状态
 * @property {function(Error): void} [onError] - 错误处理函数
 * @property {string} [displayName] - Hook 显示名称(用于调试)
 */

/**
 * @callback UseEngine
 * @description React Hook,用于在组件中订阅 Engine 状态
 *
 * @param {SelectorFunction} [selector=(state) => state] - 状态选择器函数(可选)
 * @returns {EngineHookResult} 包含 state、commands、rules 的对象
 *
 * @example
 * // 基本用法:订阅整个状态
 * function LoginForm() {
 *   const { state, commands, rules } = useLogin();
 *
 *   return (
 *     <form onSubmit={() => commands.submit()}>
 *       <input
 *         value={state.username}
 *         onChange={(e) => commands.setUsername(e.target.value)}
 *       />
 *       <button disabled={!rules.canSubmit()}>登录</button>
 *     </form>
 *   );
 * }
 *
 * @example
 * // 选择性订阅:只订阅需要的状态
 * function UsernameInput() {
 *   const username = useLogin(state => state.username);
 *   const setUsername = useLogin(state => state.commands.setUsername);
 *
 *   return (
 *     <input
 *       value={username}
 *       onChange={(e) => setUsername(e.target.value)}
 *     />
 *   );
 * }
 *
 * @example
 * // 订阅特定业务规则
 * function SubmitButton() {
 *   const canSubmit = useLogin(state => state.rules.canSubmit());
 *   const submit = useLogin(state => state.commands.submit);
 *
 *   return (
 *     <button disabled={!canSubmit} onClick={submit}>
 *       登录
 *     </button>
 *   );
 * }
 */

/**
 * @callback CreateReactAdapter
 * @description 创建 React Adapter 工厂函数
 *
 * @param {Engine} engine - 业务引擎实例
 * @param {ReactAdapterOptions} [options] - 配置选项(可选)
 * @returns {UseEngine} React Hook
 *
 * @example
 * import { createReactAdapter } from '@terence/core/adapters/react';
 * import { loginEngine } from './engines/login';
 *
 * // 创建 Adapter
 * export const useLogin = createReactAdapter(loginEngine);
 *
 * // 在组件中使用
 * function LoginForm() {
 *   const { state, commands, rules } = useLogin();
 *   // ...
 * }
 *
 * @example
 * // 带选择器使用
 * function LoginForm() {
 *   const username = useLogin(state => state.username);
 *   const canSubmit = useLogin(state => state.rules.canSubmit());
 *
 *   return (
 *     <form>
 *       <input value={username} />
 *       <button disabled={!canSubmit}>登录</button>
 *     </form>
 *   );
 * }
 */

/**
 * @typedef {Object} ReactAdapter
 * @description React Adapter 接口定义
 *
 * @property {CreateReactAdapter} createReactAdapter - 创建 React Adapter 工厂函数
 *
 * @example
 * import { createReactAdapter } from '@terence/core/adapters/react';
 *
 * const useMyEngine = createReactAdapter(myEngine);
 */

/**
 * @typedef {Object} ReactAdapterImplementation
 * @description React Adapter 实现规范
 *
 * 实现要求:
 * - 使用 React.useSyncExternalStore 订阅 Engine 状态
 * - 支持 selector 参数进行选择性订阅
 * - 缓存订阅函数避免重复创建
 * - 支持 SSR(提供 getServerSnapshot)
 * - 处理订阅错误(try-catch)
 *
 * @example
 * function createReactAdapter(engine) {
 *   const subscribeCache = new WeakMap();
 *
 *   return function useEngine(selector = (state) => state) {
 *     // 缓存订阅函数
 *     let subscribe = subscribeCache.get(engine);
 *     if (!subscribe) {
 *       subscribe = (callback) => engine.subscribe(callback);
 *       subscribeCache.set(engine, subscribe);
 *     }
 *
 *     // 使用 useSyncExternalStore
 *     return useSyncExternalStore(
 *       subscribe,
 *       () => selector(engine.getState()),
 *       () => selector(engine.getInitialState()) // SSR 快照
 *     );
 *   };
 * }
 */

// 导出类型定义供 JSDoc 使用
export {
  // Hook 返回值
  EngineHookResult,

  // 函数类型
  SelectorFunction,
  UseEngine,
  CreateReactAdapter,

  // 选项和接口
  ReactAdapterOptions,
  ReactAdapter,
  ReactAdapterImplementation
};
