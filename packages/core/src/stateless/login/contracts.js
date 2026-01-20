/**
 * Stateless Core: Login Effects Contract
 *
 * 定义登录业务所需的外部副作用接口。
 * 项目层需要实现这些接口，Core 层通过 contracts 调用。
 *
 * @module stateless/login/contracts
 */

/**
 * 登录副作用契约
 *
 * 项目层必须实现这些接口：
 * - login: 发起登录请求
 * - saveToken: 保存认证 Token
 * - navigate: 页面导航
 *
 * @type {Object}
 * @property {Function} login - 登录请求函数
 * @property {Function} saveToken - Token 保存函数
 * @property {Function} navigate - 导航函数
 *
 * @example
 * // 项目层实现
 * const effects = {
 *   login: async (form) => {
 *     const response = await fetch('/api/login', {
 *       method: 'POST',
 *       body: JSON.stringify(form)
 *     })
 *     return response.json()
 *   },
 *   saveToken: (token) => localStorage.setItem('token', token),
 *   navigate: (path) => window.location.href = path
 * }
 */
export const loginEffectsContract = {
  /**
   * 登录请求
   * @param {Object} _form - 表单数据
   * @returns {Promise<Object>} 登录结果
   */
  login: async (_form) => {},

  /**
   * 保存 Token
   * @param {string} _token - 认证 Token
   */
  saveToken: (_token) => {},

  /**
   * 导航
   * @param {string} _path - 目标路径
   */
  navigate: (_path) => {},
}
