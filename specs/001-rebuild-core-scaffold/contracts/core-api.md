# Core API Contracts

**Feature**: 001-rebuild-core-scaffold
**Version**: 1.0.0
**Date**: 2026-01-20

---

## 概述

本文档定义 `@terence/core` 包的对外 API 契约。所有导出的接口必须遵循这些契约。

---

## Package Exports

### 主入口

```javascript
export {
  // Stateless Core 模块
  login,
  validation,

  // Stateful Engine
  loginEngine,

  // 工具函数
  StateContainer,
  invariant,
  validateDeps,
}
```

### Stateless Core 导出

```javascript
export {
  login,
} from './stateless/login/index.js'
```

### Stateful Engine 导出

```javascript
export {
  loginEngine,
} from './engines/login/index.js'
```

---

## Stateless Core API

### login (Stateless Core)

**模块路径**: `@terence/core/login`

**导出接口**:
```javascript
export {
  // Rules
  canSubmit,
  validateForm,

  // Flows
  submitLogin,
  resetPassword,

  // Contract
  loginEffectsContract,
}
```

#### canSubmit(form: object): boolean

**参数**:
- `form.account`: string - 账号
- `form.password`: string - 密码
- `form.otp`: string - 验证码

**返回**: `boolean` - 是否可以提交

**行为**:
- 检查表单是否包含账号和（密码或验证码）
- 纯函数，无副作用

#### submitLogin(form: object, effects: object): Promise<object>

**参数**:
- `form`: object - 表单数据
- `effects.login`: async (form) => object - 登录请求副作用

**返回**: `Promise<object>` - 登录结果

**行为**:
- 先调用 `canSubmit` 验证表单
- 验证失败抛出 `Error('LOGIN_INVALID')`
- 验证成功调用 `effects.login(form)`
- 返回登录结果

**异常**:
- `LOGIN_INVALID`: 表单验证失败

#### loginEffectsContract

**副作用契约**:
```javascript
{
  login: async (form) => ({
    token: string,
    user: object,
  }),
}
```

---

## Stateful Engine API

### loginEngine (Stateful Engine)

**模块路径**: `@terence/core/engines/login`

**工厂函数**: `createLoginEngine(deps: object): object`

#### createLoginEngine(deps): Engine

**参数**:
- `deps.loginRequest`: async (payload) => object - 登录请求
- `deps.saveToken`: (token) => void - 保存 Token
- `deps.clearToken`: () => void - 清除 Token
- `deps.navigate`: (path) => void - 导航

**返回**: Engine 实例

#### Engine 接口

```javascript
{
  // 获取当前状态
  getState: () => {
    username: string,
    password: string,
    status: 'idle' | 'loading' | 'success' | 'error',
    error: Error | null,
  },

  // 订阅状态变化
  subscribe: (listener: (state) => void) => () => void,

  // 业务命令
  commands: {
    setUsername: (username: string) => void,
    setPassword: (password: string) => void,
    submit: () => Promise<void>,
    reset: () => void,
  },

  // 业务规则
  rules: {
    canSubmit: () => boolean,
    isAuthenticated: () => boolean,
  },
}
```

---

## Utils API

### StateContainer

**类**: `StateContainer`

#### constructor(initialState: object)

创建状态容器实例

#### getState(): object

获取当前状态快照

#### setState(updater: object | function): void

更新状态

- `updater`: 新状态或状态更新函数

#### subscribe(listener: function): unsubscribe

订阅状态变化

- `listener`: `(state) => void` 状态变化监听器
- 返回取消订阅函数

---

### invariant

**函数**: `invariant(condition: boolean, message: string): void`

运行时断言

- `condition`: 断言条件
- `message`: 失败时的错误消息
- 条件为 false 时抛出 Error

---

### validateDeps

**函数**: `validateDeps(deps: object, schema: object): void`

校验依赖对象

- `deps`: 依赖对象
- `schema`: 依赖 schema `{ [key]: type }`
- 类型不匹配时抛出 Error

---

## TypeScript 定义 (JSDoc)

### Stateless Core Module

```javascript
/**
 * @typedef {Object} LoginForm
 * @property {string} account - 账号
 * @property {string} [password] - 密码
 * @property {string} [otp] - 验证码
 */

/**
 * @typedef {Object} LoginResult
 * @property {string} token - 认证令牌
 * @property {Object} user - 用户信息
 */

/**
 * @typedef {Object} LoginEffects
 * @property {(form: LoginForm) => Promise<LoginResult>} login - 登录请求
 */

/**
 * 检查登录表单是否可以提交
 * @param {LoginForm} form - 表单数据
 * @returns {boolean} 是否可以提交
 */
export function canSubmit(form)

/**
 * 提交登录
 * @param {LoginForm} form - 表单数据
 * @param {LoginEffects} effects - 副作用
 * @returns {Promise<LoginResult>} 登录结果
 * @throws {Error} LOGIN_INVALID - 表单验证失败
 */
export async function submitLogin(form, effects)
```

### Stateful Engine

```javascript
/**
 * @typedef {Object} LoginEngineState
 * @property {string} username - 用户名
 * @property {string} password - 密码
 * @property {'idle'|'loading'|'success'|'error'} status - 状态
 * @property {Error|null} error - 错误信息
 */

/**
 * @typedef {Object} LoginEngineCommands
 * @property {(username: string) => void} setUsername - 设置用户名
 * @property {(password: string) => void} setPassword - 设置密码
 * @property {() => Promise<void>} submit - 提交登录
 * @property {() => void} reset - 重置状态
 */

/**
 * @typedef {Object} LoginEngineRules
 * @property {() => boolean} canSubmit - 是否可以提交
 * @property {() => boolean} isAuthenticated - 是否已认证
 */

/**
 * @typedef {Object} LoginEngine
 * @property {() => LoginEngineState} getState - 获取状态
 * @property {(listener: (state: LoginEngineState) => void) => () => void} subscribe - 订阅变化
 * @property {LoginEngineCommands} commands - 命令
 * @property {LoginEngineRules} rules - 规则
 */

/**
 * 创建登录引擎
 * @param {Object} deps - 依赖
 * @param {(payload: object) => Promise<object>} deps.loginRequest - 登录请求
 * @param {(token: string) => void} deps.saveToken - 保存 Token
 * @param {() => void} deps.clearToken - 清除 Token
 * @param {(path: string) => void} deps.navigate - 导航
 * @returns {LoginEngine} 登录引擎实例
 */
export function createLoginEngine(deps)
```

---

## 使用示例

### 使用 Stateless Core

```javascript
import { submitLogin, loginEffectsContract } from '@terence/core/login'

// 项目层实现副作用
const effects = {
  login: async (form) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(form),
    })
    return response.json()
  },
}

// 在 React 组件中使用
async function handleLogin(form) {
  try {
    const result = await submitLogin(form, effects)
    console.log('登录成功', result)
  } catch (error) {
    console.error('登录失败', error)
  }
}
```

### 使用 Stateful Engine

```javascript
import { createLoginEngine } from '@terence/core/engines/login'
import { createReactAdapter } from '@terence/ui/hooks/adapters'

// 创建 Engine
const engine = createLoginEngine({
  loginRequest: async (payload) => { /* ... */ },
  saveToken: (token) => { /* ... */ },
  clearToken: () => { /* ... */ },
  navigate: (path) => { /* ... */ },
})

// 创建 Adapter Hook
const useLogin = createReactAdapter(engine)

// 在 React 组件中使用
function LoginForm() {
  const { state, commands, rules } = useLogin()

  return (
    <form onSubmit={(e) => { e.preventDefault(); commands.submit() }}>
      <input
        value={state.username}
        onChange={(e) => commands.setUsername(e.target.value)}
      />
      <button disabled={!rules.canSubmit()}>
        登录
      </button>
    </form>
  )
}
```

---

## 版本兼容性

- **Node.js**: >= 18.0.0
- **React**: ^19.0.0 (peer dependency, 仅 Adapter 需要)
- **ESM**: 仅支持 ES Module

---

## 迁移指南

### 从旧版本迁移

如果你之前使用了 `@terence/core` 的旧版本（Engine 模式），现在需要：

1. **对于简单业务（如登录）**：
   - 从 `createLoginEngine` 迁移到 `submitLogin` (Stateless Core)
   - 状态管理改用项目层的 Zustand

2. **对于复杂业务（如订单流程）**：
   - 继续使用 Engine 模式
   - 确保 Adapter 迁移到 UI 层

详见 `quickstart.md`。
