/**
 * Login Engine - 登录业务逻辑引擎
 *
 * 职责：
 * - 定义登录状态
 * - 定义登录状态迁移规则
 * - 定义登录业务动作（Command）
 * - 协调副作用（通过 deps 注入）
 */

// 状态定义
function initialState() {
  return {
    username: '',
    password: '',
    status: 'idle', // idle | submitting | success | error
    error: null,
  }
}

// 创建 Engine
export function createLoginEngine(deps) {
  let state = initialState();

  // 获取当前状态
  function getState() {
    return { ...state }
  }

  // 订阅状态变化
  function subscribe(listener) {
    // 实现订阅逻辑
    return () => {}
  }

  // Commands（业务动作）
  const commands = {
    setUsername(username) {
      state.username = username
    },

    setPassword(password) {
      state.password = password
    },

    async submit() {
      if (!deps.loginRequest) {
        throw new Error('deps.loginRequest is required')
      }

      state.status = 'submitting'
      state.error = null

      try {
        await deps.loginRequest({
          username: state.username,
          password: state.password
        })
        state.status = 'success'
      } catch (error) {
        state.status = 'error'
        state.error = error.message
      }
    },

    reset() {
      state = initialState()
    }
  }

  // Rules（业务判断）
  const rules = {
    canSubmit(state) {
      return state.username && state.password && state.status === 'idle'
    },

    isSubmitting(state) {
      return state.status === 'submitting'
    },

    isSuccess(state) {
      return state.status === 'success'
    },

    hasError(state) {
      return state.status === 'error'
    }
  }

  return {
    getState,
    subscribe,
    commands,
    rules
  }
}