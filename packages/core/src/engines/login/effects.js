/**
 * LoginEngine 副作用接口 (Dependencies)
 *
 * 定义登录引擎所需的所有副作用接口契约。
 */

/**
 * @typedef {Object} LoginDependencies
 * @property {function(payload: LoginPayload): Promise<LoginResult>} loginRequest - 登录 API 请求
 * @property {function(token: string): void} saveToken - 保存 token 到应用状态
 * @property {function(): void} clearToken - 清除 token
 * @property {function(path: string): void} navigate - 页面导航
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} username - 用户名
 * @property {string} password - 密码
 */

/**
 * @typedef {Object} LoginResult
 * @property {string} token - 认证 token
 * @property {User} user - 用户信息
 */

/**
 * @typedef {Object} User
 * @property {string} id - 用户 ID
 * @property {string} name - 用户名
 * @property {string} email - 用户邮箱
 * @property {string} [avatar] - 用户头像 URL (可选)
 */

/**
 * 创建开发时依赖 Mock
 *
 * 用于测试和开发环境,提供默认的 mock 实现。
 *
 * @param {Partial<LoginDependencies>} overrides - 覆盖的依赖
 * @returns {LoginDependencies} Mock 依赖对象
 *
 * @example
 * const mockDeps = createMockDeps({
 *   loginRequest: async () => ({ token: 'custom-token', user: { id: '1' } })
 * });
 */
export function createMockDeps(overrides = {}) {
  return {
    loginRequest: async () => ({
      token: 'mock-token',
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }
    }),
    saveToken: () => {},
    clearToken: () => {},
    navigate: () => {},
    ...overrides
  };
}
