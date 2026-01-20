/**
 * Stateless Core: Login Business Flows
 *
 * 业务流程函数，编排业务规则和副作用调用。
 * 可包含 async 函数，但本身不保存状态。
 *
 * @module stateless/login/flows
 */

import { canSubmit } from './rules.js'

/**
 * 提交登录
 *
 * 业务流程:
 * 1. 验证表单是否可以提交
 * 2. 如果验证失败，抛出 LOGIN_INVALID 错误
 * 3. 如果验证成功，调用外部副作用发起登录请求
 * 4. 返回登录结果
 *
 * @param {Object} form - 登录表单数据
 * @param {string} form.account - 账号
 * @param {string} [form.password] - 密码
 * @param {string} [form.otp] - 验证码
 * @param {Object} effects - 副作用对象
 * @param {Function} effects.login - 登录请求函数
 * @returns {Promise<Object>} 登录结果
 * @throws {Error} LOGIN_INVALID - 表单验证失败
 *
 * @example
 * const effects = {
 *   login: async (form) => {
 *     const response = await fetch('/api/login', {
 *       method: 'POST',
 *       body: JSON.stringify(form)
 *     })
 *     return response.json()
 *   }
 * }
 *
 * try {
 *   const result = await submitLogin({ account: 'user', password: 'pass' }, effects)
 *   console.log('登���成功', result)
 * } catch (error) {
 *   if (error.message === 'LOGIN_INVALID') {
 *     console.log('请填写完整的登录信息')
 *   }
 * }
 */
export async function submitLogin(form, effects) {
  // 1. 业务规则验证
  if (!canSubmit(form)) {
    throw new Error('LOGIN_INVALID')
  }

  // 2. 调用外部副作用
  const result = await effects.login(form)

  // 3. 返回结果
  return result
}
