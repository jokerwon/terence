/**
 * Stateless Core: Login Business Rules
 *
 * 纯函数集合，定义登录业务规则。
 * 无状态、无副作用、可测试。
 *
 * @module stateless/login/rules
 */

/**
 * 检查登录表单是否可以提交
 *
 * 业务规则:
 * - 必须提供账号 (account)
 * - 必须提供密码 (password) 或 验证码 (otp) 之一
 *
 * @param {Object} form - 登录表单数据
 * @param {string} form.account - 账号
 * @param {string} [form.password] - 密码
 * @param {string} [form.otp] - 验证码
 * @returns {boolean} 是否可以提交
 *
 * @example
 * canSubmit({ account: 'user@example.com', password: 'pass123' }) // true
 * canSubmit({ account: 'user@example.com', otp: '123456' }) // true
 * canSubmit({ account: 'user@example.com' }) // false
 */
export function canSubmit(form) {
  return Boolean(
    form.account && (form.password || form.otp)
  )
}

/**
 * 校验登录表单数据
 *
 * 返回详细的校验结果，包括错误信息。
 *
 * @param {Object} form - 登录表单数据
 * @returns {Object} 校验结果
 * @returns {boolean} result.valid - 是否通过校验
 * @returns {Object} result.errors - 错误信息对象
 *
 * @example
 * validateForm({ account: '', password: '' })
 * // { valid: false, errors: { account: '请输入账号', password: '请输入密码或验证码' } }
 *
 * validateForm({ account: 'user@example.com', password: 'pass123' })
 * // { valid: true, errors: {} }
 */
export function validateForm(form) {
  const errors = {}

  if (!form.account) {
    errors.account = '请输入账号'
  }

  if (!form.password && !form.otp) {
    errors.password = '请输入密码或验证码'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
