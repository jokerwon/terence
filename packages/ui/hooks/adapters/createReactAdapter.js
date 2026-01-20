/**
 * React Adapter - 连接 Engine 和 React 组件
 *
 * 提供 createReactAdapter 工厂函数，将业务引擎适配到 React 组件。
 * 使用 React 19 的 useSyncExternalStore API 实现订阅机制。
 *
 * @module
 *
 * @example
 * const useLogin = createReactAdapter(loginEngine);
 *
 * function LoginForm() {
 *   const { state, commands, rules } = useLogin();
 *
 *   return (
 *     <form onSubmit={() => commands.submit()}>
 *       <input value={state.username} onChange={(e) => commands.setUsername(e.target.value)} />
 *       <button disabled={!rules.canSubmit()}>登录</button>
 *     </form>
 *   );
 * }
 */
import { useSyncExternalStore } from 'react'

/**
 * 创建 React Adapter
 *
 * @param {Object} engine - 业务引擎实例
 * @returns {Function} React Hook
 *
 * @example
 * const useLogin = createReactAdapter(loginEngine);
 *
 * // 使用 selector 选择部分状态
 * const { status } = useLogin((state) => ({ status: state.status }));
 */
export function createReactAdapter(engine) {
  const subscribeCache = new WeakMap()
  const selectorCache = new WeakMap()

  return function useEngine(selector = (state) => state) {
    // 缓存订阅函数
    let subscribe = subscribeCache.get(engine)
    if (!subscribe) {
      subscribe = (callback) => engine.subscribe(callback)
      subscribeCache.set(engine, subscribe)
    }

    // 缓存 selector
    let getSnapshot = selectorCache.get(selector)
    if (!getSnapshot) {
      getSnapshot = () => selector(engine.getState())
      selectorCache.set(selector, getSnapshot)
    }

    // 使用 useSyncExternalStore
    const state = useSyncExternalStore(
      subscribe,
      getSnapshot,
      () => selector(engine.getState()) // SSR 快照
    )

    return {
      state,
      commands: engine.commands,
      actions: engine.actions,
      rules: engine.rules,
    }
  }
}
