/**
 * LoginForm - 登录表单组件
 *
 * 演示如何使用 React Adapter 集成业务引擎。
 *
 * 注意: Adapter 已从 Core 层迁移到 UI 层
 * - 旧路径: @terence/core/adapters/react
 * - 新路径: @terence/ui/hooks/adapters
 */
import { createReactAdapter } from '@terence/ui/hooks/adapters'
import { createLoginEngine } from '@terence/core/engines/login/index.js'

// 创建登录引擎实例
const loginEngine = createLoginEngine({
  loginRequest: async (payload) => {
    // Mock 实现
    return {
      token: 'demo-token',
      user: { id: '123', name: 'User' },
    }
  },
  saveToken: (token) => {
    console.log('Token saved:', token)
  },
  clearToken: () => {
    console.log('Token cleared')
  },
  navigate: (path) => {
    console.log('Navigating to:', path)
  },
})

// 创建 Adapter Hook
const useLogin = createReactAdapter(loginEngine)

/**
 * LoginForm 组件
 */
export function LoginForm() {
  const { state, commands, rules } = useLogin()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await commands.submit()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleReset = () => {
    commands.reset()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2>登录</h2>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="username">用户名</label>
          <input
            id="username"
            type="text"
            value={state.username}
            onChange={(e) => commands.setUsername(e.target.value)}
            placeholder="请输入用户名"
            style={{ display: 'block', width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            value={state.password}
            onChange={(e) => commands.setPassword(e.target.value)}
            placeholder="请输入密码(至少 6 位)"
            style={{ display: 'block', width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {rules.hasError() && <div style={{ color: 'red', marginBottom: '16px' }}>{rules.getErrorMessage()}</div>}

        <div style={{ marginBottom: '16px' }}>
          <button
            type="submit"
            disabled={!rules.canSubmit() || rules.isSubmitting()}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: rules.canSubmit() ? '#1890ff' : '#d9d9d9',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: rules.canSubmit() ? 'pointer' : 'not-allowed',
            }}
          >
            {rules.isSubmitting() ? '登录中...' : '登录'}
          </button>
        </div>

        {state.status === 'success' && <div style={{ color: 'green', marginTop: '16px' }}>登录成功! Token: {state.token}</div>}

        <div style={{ marginTop: '16px' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            重置
          </button>
        </div>
      </div>
    </form>
  )
}
