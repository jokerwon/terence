/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest'
import { canSubmit, validateForm } from '../../../src/stateless/login/rules.js'

describe('stateless/login/rules', () => {
  describe('canSubmit', () => {
    it('should return false when account is missing', () => {
      const form = { password: 'pass123' }
      expect(canSubmit(form)).toBe(false)
    })

    it('should return false when both password and otp are missing', () => {
      const form = { account: 'user@example.com' }
      expect(canSubmit(form)).toBe(false)
    })

    it('should return true when account and password are present', () => {
      const form = { account: 'user@example.com', password: 'pass123' }
      expect(canSubmit(form)).toBe(true)
    })

    it('should return true when account and otp are present', () => {
      const form = { account: 'user@example.com', otp: '123456' }
      expect(canSubmit(form)).toBe(true)
    })

    it('should return true when account, password, and otp are all present', () => {
      const form = { account: 'user@example.com', password: 'pass123', otp: '123456' }
      expect(canSubmit(form)).toBe(true)
    })
  })

  describe('validateForm', () => {
    it('should return error when account is missing', () => {
      const form = { password: 'pass123' }
      const result = validateForm(form)

      expect(result.valid).toBe(false)
      expect(result.errors.account).toBe('请输入账号')
    })

    it('should return error when password and otp are missing', () => {
      const form = { account: 'user@example.com' }
      const result = validateForm(form)

      expect(result.valid).toBe(false)
      expect(result.errors.password).toBe('请输入密码或验证码')
    })

    it('should return valid when form is complete with password', () => {
      const form = { account: 'user@example.com', password: 'pass123' }
      const result = validateForm(form)

      expect(result.valid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should return valid when form is complete with otp', () => {
      const form = { account: 'user@example.com', otp: '123456' }
      const result = validateForm(form)

      expect(result.valid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })
  })
})
