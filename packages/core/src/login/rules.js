/**
 * Stateless Core: Login Business Rules
 *
 * 纯函数集合，定义登录业务规则。
 * 无状态、无副作用、可测试。
 *
 * @module stateless/login/validate
 */

import { z } from 'zod'
import { otpSchema, passwordSchema } from './schemas'

export const validateSchema = (form, schema) => {
  const result = schema.safeParse(form)
  let error
  let data
  if (!result.success) {
    error = z.treeifyError(result.error)
  } else {
    data = result.data
  }
  return {
    success: result.success,
    error,
    data,
  }
}

export const createValidator = (schema) => (form) => validateSchema(form, schema)
export const validatePassword = createValidator(passwordSchema)
export const validateOTP = createValidator(otpSchema)
