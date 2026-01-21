/**
 * Stateless Core: Login Business Flows
 *
 * 业务流程函数，编排业务规则和副作用调用。
 * 可包含 async 函数，但本身不保存状态。
 *
 * @module stateless/login/flows
 */

import { validateSchema } from './rules.js'

export async function submitLogin({ data, schema, effects }) {
  // 1. 业务规则验证
  const validationResult = validateSchema(data, schema)
  if (!validationResult?.success) {
    throw new Error('LOGIN_INVALID')
  }

  // 2. 调用外部副作用
  const result = await effects.login(validationResult.data)

  // 3. 返回结果
  return result
}
