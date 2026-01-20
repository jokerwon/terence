/**
 * Stateless Core 使用示例
 *
 * 演示如何使用 Stateless Core 实现登录业务。
 *
 * @file stateless-login-example.js
 */

/**
 * 示例 1: 使用业务规则 (Rules)
 */
import { canSubmit, validateForm } from '@terence/core/stateless/login/rules.js'

// 检查表单是否可以提交
const form1 = {
  account: 'user@example.com',
  password: 'pass123'
}

if (canSubmit(form1)) {
  console.log('表单可以提交')
} else {
  console.log('表单不完整')
}

// 获取详细的校验结果
const form2 = {
  account: '',
  password: ''
}

const result = validateForm(form2)
if (!result.valid) {
  console.log('校验失败:', result.errors)
  // 输出: { account: '请输入账号', password: '请输入密码或验证码' }
}

/**
 * 示例 2: 使用业务流程 (Flows)
 */
import { submitLogin } from '@terence/core/stateless/login/flows.js'

// 项目层实现副作用
const effects = {
  login: async (form) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!response.ok) {
      throw new Error('登录失败')
    }
    return response.json()
  },
  saveToken: (token) => {
    localStorage.setItem('token', token)
    console.log('Token 已保存:', token)
  },
  navigate: (path) => {
    console.log('导航到:', path)
    // window.location.href = path
  }
}

// 在组件中使用
async function handleLogin(form) {
  try {
    const result = await submitLogin(form, effects)
    console.log('登录成功:', result)
    effects.saveToken(result.token)
    effects.navigate('/dashboard')
  } catch (error) {
    if (error.message === 'LOGIN_INVALID') {
      console.error('请填写完整的登录信息')
    } else {
      console.error('登录失败:', error.message)
    }
  }
}

// 示例调用
handleLogin({
  account: 'user@example.com',
  password: 'pass123'
})

/**
 * 示例 4: 组合多个规则
 */
function validateAndSubmit(form) {
  // 先用快速规则检查
  if (!canSubmit(form)) {
    return { valid: false, reason: 'incomplete' }
  }

  // 再用详细规则检查
  const validation = validateForm(form)
  if (!validation.valid) {
    return { valid: false, reason: 'invalid', errors: validation.errors }
  }

  return { valid: true }
}

// 使用
const form = { account: 'user', password: 'pass' }
const check = validateAndSubmit(form)

if (check.valid) {
  console.log('表单有效，可以提交')
} else {
  console.log('表单无效:', check.reason)
}

/**
 * 导出示例
 */
export {
  handleLogin,
  validateAndSubmit
}
