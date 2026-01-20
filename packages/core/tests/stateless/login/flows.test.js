/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest'
import { submitLogin } from '../../../src/stateless/login/flows.js'
import { loginEffectsContract } from '../../../src/stateless/login/contracts.js'

describe('stateless/login/flows', () => {
  describe('submitLogin', () => {
    it('should throw LOGIN_INVALID when form is invalid', async () => {
      const invalidForm = { account: '' }
      const effects = {
        login: vi.fn()
      }

      await expect(submitLogin(invalidForm, effects)).rejects.toThrow('LOGIN_INVALID')
      expect(effects.login).not.toHaveBeenCalled()
    })

    it('should call effects.login with form data when form is valid (password)', async () => {
      const form = { account: 'user@example.com', password: 'pass123' }
      const mockResult = { token: 'abc123', user: { id: 1 } }
      const effects = {
        login: vi.fn().mockResolvedValue(mockResult)
      }

      const result = await submitLogin(form, effects)

      expect(effects.login).toHaveBeenCalledWith(form)
      expect(result).toEqual(mockResult)
    })

    it('should call effects.login with form data when form is valid (otp)', async () => {
      const form = { account: 'user@example.com', otp: '123456' }
      const mockResult = { token: 'xyz789', user: { id: 2 } }
      const effects = {
        login: vi.fn().mockResolvedValue(mockResult)
      }

      const result = await submitLogin(form, effects)

      expect(effects.login).toHaveBeenCalledWith(form)
      expect(result).toEqual(mockResult)
    })

    it('should propagate login errors', async () => {
      const form = { account: 'user@example.com', password: 'pass123' }
      const effects = {
        login: vi.fn().mockRejectedValue(new Error('Network error'))
      }

      await expect(submitLogin(form, effects)).rejects.toThrow('Network error')
    })
  })

  describe('loginEffectsContract', () => {
    it('should define login as async function', () => {
      expect(loginEffectsContract.login).toBeInstanceOf(Function)
      expect(loginEffectsContract.login.constructor.name).toBe('AsyncFunction')
    })
  })
})
