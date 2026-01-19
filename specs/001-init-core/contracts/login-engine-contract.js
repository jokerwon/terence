/**
 * LoginEngine API 契约
 *
 * 本文件定义了登录引擎的完整 API 契约,包括:
 * - State 结构
 * - Commands 接口
 * - Rules 接口
 * - Dependencies 接口
 *
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} LoginState
 * @description 登录业务状态
 *
 * @property {string} username - 用户名输入
 * @property {string} password - 密码输入
 * @property {'idle'|'editing'|'submitting'|'success'|'error'} status - 登录状态
 *   - idle: 初始状态,用户未输入
 *   - editing: 用户正在输入
 *   - submitting: 正在提交登录请求
 *   - success: 登录成功
 *   - error: 登录失败
 * @property {Error|null} error - 错��信息,仅在 status 为 error 时有值
 * @property {string|null} token - 登录成功后的 token,仅在 status 为 success 时有值
 * @property {User|null} user - 登录成功后的用户信息,仅在 status 为 success 时有值
 *
 * @example
 * {
 *   username: 'user@example.com',
 *   password: 'password123',
 *   status: 'editing',
 *   error: null,
 *   token: null,
 *   user: null
 * }
 */

/**
 * @typedef {Object} LoginCommands
 * @description 登录业务动作接口
 *
 * @property {function(value: string): void} setUsername - 设置用户名
 * @description 更新 username 字段,自动将 status 切换为 editing
 * @param {string} value - 用户名(邮箱格式)
 * @throws {Error} 如果 value 不是字符串
 *
 * @property {function(value: string): void} setPassword - 设置密码
 * @description 更新 password 字段,自动将 status 切换为 editing
 * @param {string} value - 密码(至少 6 位)
 * @throws {Error} 如果 value 不是字符串或长度不足 6 位
 *
 * @property {function(): Promise<void>} submit - 提交登录
 * @description 执行登录流程:
 *   1. 验证用户名和密码格式
 *   2. 更新 status 为 submitting
 *   3. 调用 deps.loginRequest
 *   4. 成功时更新 status 为 success,保存 token 和 user
 *   5. 调用 deps.saveToken 和 deps.navigate
 *   6. 失败时更新 status 为 error,记录错误信息
 * @throws {Error} 如果用户名或密码格式无效
 * @throws {Error} 如果登录请求失败
 *
 * @property {function(): void} reset - 重置登录状态
 * @description 将状态恢复到初始值(idle)
 *
 * @example
 * // 设置用户名
 * engine.commands.setUsername('user@example.com');
 *
 * // 设置密码
 * engine.commands.setPassword('password123');
 *
 * // 提交登录
 * await engine.commands.submit();
 *
 * // 重置状态
 * engine.commands.reset();
 */

/**
 * @typedef {Object} LoginRules
 * @description 登录业务规则接口
 *
 * @property {function(): boolean} canSubmit - 是否可以提交登录
 * @description 判断是否满足登录提交条件:
 *   - username 不为空且格式有效(邮箱)
 *   - password 不为空且长度 >= 6
 *   - 当前不在 submitting 状态
 * @returns {boolean} true 表示可以提交
 *
 * @property {function(): boolean} isSubmitting - 是否正在提交
 * @description 判断当前是否在提交中
 * @returns {boolean} true 表示正在提交
 *
 * @property {function(): boolean} hasError - 是否有错误
 * @description 判断当前是否有错误
 * @returns {boolean} true 表示有错误
 *
 * @property {function(): boolean} isAuthenticated - 是否已登录
 * @description 判断用户是否已成功登录
 * @returns {boolean} true 表示已登录
 *
 * @property {function(): string} getErrorMessage - 获取错误消息
 * @description 获取当前错误的可读消息
 * @returns {string} 错误消息,无错误时返回空字符串
 *
 * @example
 * if (engine.rules.canSubmit()) {
 *   await engine.commands.submit();
 * }
 *
 * if (engine.rules.isAuthenticated()) {
 *   console.log('User is logged in');
 * }
 */

/**
 * @typedef {Object} LoginDependencies
 * @description 登录引擎依赖注入接口
 *
 * @property {function(payload: LoginPayload): Promise<LoginResult>} loginRequest
 * @description 执行登录 API 请求
 * @param {LoginPayload} payload - 登录载荷(用户名和密码)
 * @returns {Promise<LoginResult>} 登录结果(token 和用户信息)
 * @throws {Error} 网络错误或认证失败
 *
 * @property {function(token: string): void} saveToken
 * @description 保存 token 到应用状态(如 Zustand store)
 * @param {string} token - 认证 token
 *
 * @property {function(): void} clearToken
 * @description 清除 token
 *
 * @property {function(path: string): void} navigate
 * @description 导航到指定路径
 * @param {string} path - 路由路径
 *
 * @example
 * const deps = {
 *   loginRequest: async (payload) => {
 *     const response = await fetch('/api/login', {
 *       method: 'POST',
 *       body: JSON.stringify(payload)
 *     });
 *     return response.json();
 *   },
 *   saveToken: (token) => {
 *     localStorage.setItem('token', token);
 *   },
 *   clearToken: () => {
 *     localStorage.removeItem('token');
 *   },
 *   navigate: (path) => {
 *     window.location.href = path;
 *   }
 * };
 */

/**
 * @typedef {Object} LoginPayload
 * @description 登录载荷
 * @property {string} username - 用户名(邮箱)
 * @property {string} password - 密码
 */

/**
 * @typedef {Object} LoginResult
 * @description 登录结果
 * @property {string} token - 认证 token
 * @property {User} user - 用户信息
 */

/**
 * @typedef {Object} User
 * @description 用户信息
 * @property {string} id - 用户 ID
 * @property {string} name - 用户名
 * @property {string} email - 用户邮箱
 * @property {string} avatar - 用户头像 URL(可选)
 */

/**
 * @typedef {Object} LoginEngine
 * @description 登录引擎实例,继承自通用 Engine 接口
 * @extends Engine
 *
 * @property {function(): LoginState} getState - 获取登录状态
 * @property {function(listener: function(LoginState): void): function(): void} subscribe - 订阅登录状态变化
 * @property {LoginCommands} commands - 登录动作
 * @property {LoginRules} rules - 登录规则
 *
 * @example
 * const engine = createLoginEngine(deps);
 *
 * // 获取状态
 * const state = engine.getState();
 * console.log(state.status); // 'idle'
 *
 * // 订阅变化
 * const unsubscribe = engine.subscribe((newState) => {
 *   console.log('Status:', newState.status);
 * });
 *
 * // 执行命令
 * engine.commands.setUsername('user@example.com');
 * engine.commands.setPassword('password123');
 *
 * if (engine.rules.canSubmit()) {
 *   await engine.commands.submit();
 * }
 *
 * // 取消订阅
 * unsubscribe();
 */

/**
 * @typedef {function(LoginDependencies): LoginEngine} CreateLoginEngine
 * @description 登录引擎工厂函数
 *
 * @param {LoginDependencies} deps - 依赖注入对象
 * @returns {LoginEngine} 登录引擎实例
 *
 * @example
 * const createLoginEngine = (deps) => {
 *   // 实现代码...
 *   return {
 *     getState: () => state,
 *     subscribe: (listener) => { ... },
 *     commands: {
 *       setUsername: (value) => { ... },
 *       setPassword: (value) => { ... },
 *       submit: async () => { ... },
 *       reset: () => { ... }
 *     },
 *     rules: {
 *       canSubmit: () => { ... },
 *       isSubmitting: () => { ... },
 *       hasError: () => { ... },
 *       isAuthenticated: () => { ... },
 *       getErrorMessage: () => { ... }
 *     }
 *   };
 * };
 */

// 导出类型定义供 JSDoc 使用
export {
  // State
  LoginState,

  // Commands
  LoginCommands,

  // Rules
  LoginRules,

  // Dependencies
  LoginDependencies,
  LoginPayload,
  LoginResult,

  // User
  User,

  // Engine
  LoginEngine,
  CreateLoginEngine
};
