import { StateContainer } from '../../utils/StateContainer.js';
import { initialState } from './state.js';
import { createCommands } from './commands.js';
import { createRules } from './rules.js';
import { validateDeps } from '../../utils/validation.js';

/**
 * 创建登录引擎
 *
 * 登录引擎是登录业务逻辑的核心封装,管理登录状态、
 * 提供登录动作和登录规则判断。
 *
 * @param {LoginDependencies} deps - 依赖注入对象
 * @returns {LoginEngine} 登录引擎实例
 *
 * @example
 * const engine = createLoginEngine({
 *   loginRequest: async (payload) => { ... },
 *   saveToken: (token) => { ... },
 *   navigate: (path) => { ... }
 * });
 *
 * // 使用引擎
 * engine.commands.setUsername('user');
 * engine.commands.setPassword('pass');
 *
 * if (engine.rules.canSubmit()) {
 *   await engine.commands.submit();
 * }
 *
 * @see {@link ./effects.js} 依赖接口定义
 */
export function createLoginEngine(deps) {
  // 校验依赖
  const depsSchema = {
    loginRequest: 'function',
    saveToken: 'function',
    clearToken: 'function',
    navigate: 'function'
  };

  validateDeps(deps, depsSchema);

  // 创建状态容器
  const container = new StateContainer(initialState());

  // 创建 commands 和 rules
  const commands = createCommands(
    deps,
    () => container.getState(),
    (updater) => container.setState(updater)
  );

  const rules = createRules(() => container.getState());

  // 返回 Engine 标准接口
  return {
    getState: () => container.getState(),
    subscribe: (listener) => container.subscribe(listener),
    commands,
    rules
  };
}
