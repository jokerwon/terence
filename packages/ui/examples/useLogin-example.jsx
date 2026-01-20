/**
 * Adapter 使用示例
 *
 * 演示如何使用 createReactAdapter 将 Engine 集成到 React 组件。
 *
 * @file useLogin-example.jsx
 */

import { createLoginEngine } from '@terence/core/engines/login/index.js'
import { createReactAdapter } from '@terence/ui/hooks/adapters/index.js'

/**
 * 示例 1: 创建 Adapter Hook
 */

// 步骤 1: 创建 Engine
const loginEngine = createLoginEngine({
  loginRequest: async (payload) => {
    console.log('发起登录请求:', payload)
    // 模拟 API 调用
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error('登录失败')
    }
    return response.json()
  },
  saveToken: (token) => {
    console.log('保存 Token:', token)
    localStorage.setItem('token', token)
  },
  clearToken: () => {
    console.log('清除 Token')
    localStorage.removeItem('token')
  },
  navigate: (path) => {
    console.log('导航到:', path)
    window.location.href = path
  },
})

// 步骤 2: 创建 Adapter Hook
const useLogin = createReactAdapter(loginEngine)

/**
 * 示例 2: 基础用法
 */
function BasicLoginForm() {
  const { state, commands, rules } = useLogin()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        commands.submit()
      }}
    >
      <input
        type="text"
        value={state.username}
        onChange={(e) => commands.setUsername(e.target.value)}
        placeholder="用户名"
      />
      <input
        type="password"
        value={state.password}
        onChange={(e) => commands.setPassword(e.target.value)}
        placeholder="密码"
      />
      <button type="submit" disabled={!rules.canSubmit()}>
        登录
      </button>
    </form>
  )
}

/**
 * 示例 3: 使用 Selector 选择部分状态
 */
function StatusIndicator() {
  // 只选择 status 字段，减少不必要的重渲染
  const { state } = useLogin((state) => ({ status: state.status }))

  if (state.status === 'loading') {
    return <div>登录中...</div>
  }

  if (state.status === 'success') {
    return <div>登录成功！</div>
  }

  if (state.status === 'error') {
    return <div>登录失败</div>
  }

  return null
}

/**
 * 示例 4: 组合多个 Hook
 */
function LoginFormWithStatus() {
  const { state, commands, rules } = useLogin()
  const status = useLogin((s) => ({ status: s.status, error: s.error }))

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          commands.submit()
        }}
      >
        <input
          type="text"
          value={state.username}
          onChange={(e) => commands.setUsername(e.target.value)}
        />
        <input
          type="password"
          value={state.password}
          onChange={(e) => commands.setPassword(e.target.value)}
        />
        <button type="submit" disabled={!rules.canSubmit() || status.state.status === 'loading'}>
          {status.state.status === 'loading' ? '登录中...' : '登录'}
        </button>
      </form>

      {status.state.status === 'success' && (
        <div style={{ color: 'green' }}>登录成功！Token: {state.token}</div>
      )}

      {status.state.status === 'error' && (
        <div style={{ color: 'red' }}>错误: {status.state.error?.message}</div>
      )}

      <button onClick={() => commands.reset()}>重置</button>
    </div>
  )
}

/**
 * 示例 5: 条件渲染
 */
function SmartLoginForm() {
  const { state, commands, rules } = useLogin()

  // 根据状态决定渲染内容
  if (state.status === 'success') {
    return (
      <div>
        <h2>欢迎, {state.user?.name}!</h2>
        <button onClick={() => commands.reset()}>退出登录</button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => e.preventDefault() || commands.submit()}>
      <div>
        <label>用户名</label>
        <input
          type="text"
          value={state.username}
          onChange={(e) => commands.setUsername(e.target.value)}
        />
        {!rules.canSubmit() && !state.username && (
          <span style={{ color: 'red' }}>请输入用户名</span>
        )}
      </div>

      <div>
        <label>密码</label>
        <input
          type="password"
          value={state.password}
          onChange={(e) => commands.setPassword(e.target.value)}
        />
        {!rules.canSubmit() && !state.password && (
          <span style={{ color: 'red' }}>请输入密码</span>
        )}
      </div>

      <button type="submit" disabled={!rules.canSubmit()}>
        登录
      </button>

      {state.status === 'error' && (
        <div style={{ color: 'red' }}>
          {state.error?.message || '登录失败'}
        </div>
      )}
    </form>
  )
}

/**
 * 示例 6: 性能优化 - 使用 Selector
 */
function OptimizedStatus() {
  // 这个组件只会在 status 变化时重渲染
  const { state } = useLogin((s) => ({ status: s.status }))

  return <div>当前状态: {state.status}</div>
}

function OptimizedUsername() {
  // 这个组件只会在 username 变化时重渲染
  const { state } = useLogin((s) => ({ username: s.username }))

  return <div>用户名: {state.username}</div>
}

function OptimizedLoginForm() {
  const { commands, rules } = useLogin()

  return (
    <form onSubmit={(e) => e.preventDefault() || commands.submit()}>
      <OptimizedUsername />
      <input
        type="password"
        onChange={(e) => commands.setPassword(e.target.value)}
        placeholder="密码"
      />
      <button disabled={!rules.canSubmit()}>登录</button>
      <OptimizedStatus />
    </form>
  )
}

/**
 * 示例 7: 订单 Engine + Adapter
 */
import { createOrderEngine } from '@terence/core/engines/order-engine/index.js'

const orderEngine = createOrderEngine({
  createOrder: async (data) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    const result = await response.json()
    return result.id
  },
  validateInventory: async (items) => {
    const response = await fetch('/api/inventory/check', {
      method: 'POST',
      body: JSON.stringify({ items }),
    })
    return response.ok
  },
  payOrder: async (orderId) => {
    const response = await fetch(`/api/orders/${orderId}/pay`, {
      method: 'POST',
    })
    return response.ok
  },
})

const useOrder = createReactAdapter(orderEngine)

function OrderForm() {
  const { state, actions } = useOrder()

  const handleAction = (action) => {
    try {
      actions.transition(action)
    } catch (error) {
      console.error('无效的操作:', error.message)
    }
  }

  return (
    <div>
      <h2>订单状态: {state.step}</h2>

      {state.step === 'draft' && (
        <button onClick={() => handleAction('submit')}>提交订单</button>
      )}

      {state.step === 'confirmed' && (
        <button onClick={() => handleAction('pay')}>支付</button>
      )}

      {state.step === 'paid' && (
        <button onClick={() => handleAction('ship', { trackingNumber: 'SF123' })}>
          发货
        </button>
      )}

      {state.step === 'shipped' && (
        <button onClick={() => handleAction('complete')}>完成订单</button>
      )}

      {state.step === 'completed' && (
        <div>订单已完成！</div>
      )}
    </div>
  )
}

/**
 * 导出所有示例
 */
export {
  useLogin,
  BasicLoginForm,
  StatusIndicator,
  LoginFormWithStatus,
  SmartLoginForm,
  OptimizedLoginForm,
  OrderForm,
}
