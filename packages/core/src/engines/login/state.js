/**
 * LoginEngine 状态定义
 *
 * 定义登录业务的所有可能状态。
 */

/**
 * 初始化登录状态
 * @returns {LoginState} 初始状态
 */
export function initialState() {
  return {
    username: '',
    password: '',
    status: 'idle', // idle | editing | submitting | success | error
    error: null,
    token: null,
    user: null
  };
}
