# Quickstart Guide: @terence/core

**Version**: 1.0.0
**Last Updated**: 2026-01-20

---

## 概述

`@terence/core` 是 Terence 项目的业务内核层，采用**双轨模型**：

- **Track A (Stateless Core)**: 默认轨道，覆盖 80%+ 的业务场景
- **Track B (Stateful Engine)**: 受限轨道，用于复杂的多阶段流程

**核心原则**:

> **状态属于项目��规则属于 Core，流程复杂才用 Engine。**

---

## 5 分钟上手

### 选择你的轨道

```
┌─────────────────────────────────────────┐
│  你的业务需要哪种轨道？                  │
├─────────────────────────────────────────┤
│                                         │
│  ✅ 简单流程（登录、校验、提交）         │
│  → 使用 Stateless Core                  │
│                                         │
│  ❌ 多阶段流程（下单、审批流、向导）     │
│  → 使用 Stateful Engine                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## Track A: Stateless Core

### 什么时候使用？

- ✅ 登录、注册、密码重置
- ✅ 表单校验和提交
- ✅ 简单的 CRUD 操作
- ✅ 数据转换和计算

### 文件结构

```
stateless/[module-name]/
├── rules.js      # 业务规则（纯函数）
├── flows.js      # 业务流程（可 async）
└── contracts.js  # 副作用接口定义
```

### 示例：登录业务

#### Step 1: 定义业务规则 (`rules.js`)

```javascript
/**
 * 检查登录表单是否可以提交
 * @param {Object} form - 表单数据
 * @returns {boolean}
 */
export function canSubmit(form) {
  return Boolean(
    form.account &&
    (form.password || form.otp)
  )
}

/**
 * 校验表单数据
 * @param {Object} form - 表单数据
 * @returns {Object} 校验结果 { valid: boolean, errors: Object }
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
```

#### Step 2: 定义业务流程 (`flows.js`)

```javascript
import { canSubmit } from './rules'

/**
 * 提交登录
 * @param {Object} form - 表单数据
 * @param {Object} effects - 副作用
 * @returns {Promise<Object>} 登录结果
 * @throws {Error} LOGIN_INVALID - 表单验证失败
 */
export async function submitLogin(form, effects) {
  // 1. 业务规则验证
  if (!canSubmit(form)) {
    throw new Error('LOGIN_INVALID')
  }

  // 2. 调用外部副作用
  const result = await effects.login(form)

  // 3. 返回结果
  return result
}

/**
 * 重置密码
 * @param {Object} data - 重置数据
 * @param {Object} effects - 副作用
 * @returns {Promise<Object>}
 */
export async function resetPassword(data, effects) {
  if (!data.email || !data.code) {
    throw new Error('RESET_INVALID')
  }

  return effects.resetPassword(data)
}
```

#### Step 3: 定义副作用契约 (`contracts.js`)

```javascript
/**
 * 登录副作用契约
 * 项目层需要实现这些接口
 */
export const loginEffectsContract = {
  /**
   * 发起登录请求
   * @param {Object} form - 表单数据
   * @returns {Promise<Object>} 登录结果
   */
  login: async (form) => {},

  /**
   * 保存认证 Token
   * @param {string} token - Token
   */
  saveToken: (token) => {},

  /**
   * 导航到指定路径
   * @param {string} path - 路径
   */
  navigate: (path) => {},
}
```

#### Step 4: 创建模块入口 (`index.js`)

```javascript
export { canSubmit, validateForm } from './rules.js'
export { submitLogin, resetPassword } from './flows.js'
export { loginEffectsContract } from './contracts.js'
```

### 在项目中使用

```javascript
// import { submitLogin } from '@terence/core/stateless/login'

// 1. 项目层实现副作用
const effects = {
  login: async (form) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    return response.json()
  },
  saveToken: (token) => {
    localStorage.setItem('token', token)
  },
  navigate: (path) => {
    window.location.href = path
  },
}

// 2. 在 React 组件中使用
async function handleLogin(form) {
  try {
    const result = await submitLogin(form, effects)
    effects.saveToken(result.token)
    effects.navigate('/dashboard')
  } catch (error) {
    if (error.message === 'LOGIN_INVALID') {
      alert('请填写完整的登录信息')
    }
  }
}
```

---

## Track B: Stateful Engine

### 什么时候使用？

仅当业务满足以下**所有条件**时：

- ✅ 明确的多阶段流程（草稿 → 审核 → 发布）
- ✅ 状态需要跨多次交互持续存在
- ✅ UI 严重依赖当前业务阶段

否则一律回退到 Stateless Core。

### 文件结构

```
engines/[engine-name]/
├── engine.js        # 核心状态机
├── transitions.js   # 状态迁移规则
└── contract.js      # 外部能力契约
```

### 示例：订单流程 Engine

#### Step 1: 定义状态迁移 (`transitions.js`)

```javascript
/**
 * 订单状态迁移规则
 */
export const orderTransitions = {
  draft: {
    submit: (state, context) => ({
      ...state,
      step: 'validating',
    }),
    save: (state, context) => ({
      ...state,
      savedAt: Date.now(),
    }),
  },

  validating: {
    success: (state, context) => ({
      ...state,
      step: 'confirmed',
      orderId: context.orderId,
    }),
    fail: (state, context) => ({
      ...state,
      step: 'draft',
      error: context.error,
    }),
  },

  confirmed: {
    pay: (state, context) => ({
      ...state,
      step: 'paid',
    }),
    cancel: (state, context) => ({
      ...state,
      step: 'cancelled',
    }),
  },

  paid: {
    ship: (state, context) => ({
      ...state,
      step: 'shipped',
    }),
  },

  shipped: {
    complete: (state, context) => ({
      ...state,
      step: 'completed',
    }),
  },
}
```

#### Step 2: 创建 Engine (`engine.js`)

```javascript
import { orderTransitions } from './transitions'

/**
 * 创建订单流程 Engine
 * @param {Object} context - 外部能力
 * @returns {Object} Engine 实例
 */
export function createOrderEngine(context) {
  // 内部状态
  let state = {
    step: 'draft',
    items: [],
    total: 0,
    createdAt: Date.now(),
  }

  // 订阅者集合
  const listeners = new Set()

  // 获取状态快照
  function getState() {
    return state
  }

  // 订阅状态变化
  function subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  // 状态迁移
  function transition(action) {
    const transitions = orderTransitions[state.step]

    if (!transitions || !transitions[action]) {
      throw new Error(`Invalid action: ${action} for state: ${state.step}`)
    }

    state = transitions[action](state, context)

    // 通知所有订阅者
    listeners.forEach((listener) => listener(state))
  }

  // 返回 Engine 标准接口
  return {
    getState,
    subscribe,
    actions: {
      transition,
    },
  }
}
```

#### Step 3: 定义外部能力契约 (`contract.js`)

```javascript
/**
 * 订单 Engine 外部能力契约
 */
export const orderEngineContextContract = {
  /**
   * 创建订单
   * @param {Object} data - 订单数据
   * @returns {Promise<string>} 订单 ID
   */
  createOrder: async (data) => {},

  /**
   * 验证库存
   * @param {Array} items - 商品列表
   * @returns {Promise<boolean>} 是否有库存
   */
  validateInventory: async (items) => {},

  /**
   * 支付订单
   * @param {string} orderId - 订单 ID
   * @returns {Promise<boolean>} 是否支付成功
   */
  payOrder: async (orderId) => {},
}
```

### 在项目中使用

```javascript
// import { createOrderEngine } from '@terence/core/engines/order-engine'
// import { createReactAdapter } from '@terence/ui/hooks/adapters'

// 1. 项目层实现外部能力
const context = {
  createOrder: async (data) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    const result = await response.json()
    return result.id
  },
  validateInventory: async (items) => {
    // ...
  },
  payOrder: async (orderId) => {
    // ...
  },
}

// 2. 创建 Engine
const engine = createOrderEngine(context)

// 3. 创建 Adapter Hook (在 UI 层)
const useOrder = createReactAdapter(engine)

// 4. 在 React 组件中使用
function OrderForm() {
  const { state, actions } = useOrder()

  const handleSubmit = () => {
    actions.transition('submit')
  }

  return (
    <div>
      <p>当前阶段: {state.step}</p>
      {state.step === 'draft' && (
        <button onClick={handleSubmit}>提交订单</button>
      )}
      {state.step === 'confirmed' && (
        <button onClick={() => actions.transition('pay')}>
          支付
        </button>
      )}
    </div>
  )
}
```

---

## Adapter 模式 (UI 层)

Adapter 是 Engine 与 React 之间的唯一桥梁，**位于 UI 层**。

### 创建 Adapter

```javascript
// packages/ui/hooks/adapters/createReactAdapter.js
import { useSyncExternalStore } from 'react'

/**
 * 创建 React Adapter
 * @param {Object} engine - Engine 实例
 * @returns {Function} React Hook
 */
export function createReactAdapter(engine) {
  return function useEngine(selector = (state) => state) {
    const state = useSyncExternalStore(
      (callback) => engine.subscribe(callback),
      () => selector(engine.getState()),
      () => selector(engine.getState())
    )

    return {
      state,
      commands: engine.commands,
      actions: engine.actions,
      rules: engine.rules,
    }
  }
}
```

### 使用 Adapter

```javascript
import { createLoginEngine } from '@terence/core/engines/login'
import { createReactAdapter } from '@terence/ui/hooks/adapters'

// 创建 Engine
const engine = createLoginEngine(deps)

// 创建 Hook
const useLogin = createReactAdapter(engine)

// 在组件中使用
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

## 最佳实践

### 1. 优先使用 Stateless Core

```
┌──────────────────────────────────┐
│  判断流程                          │
├──────────────────────────────────┤
│  1. 是多阶段流程吗？               │
│     No → Stateless Core ✅        │
│     Yes ↓                         │
│  2. 状态跨多次交互吗？             │
│     No → Stateless Core ✅        │
│     Yes ↓                         │
│  3. UI 严重依赖业务阶段吗？        │
│     No → Stateless Core ✅        │
│     Yes → Stateful Engine ⚠️     │
└──────────────────────────────────┘
```

### 2. 状态管理职责

- **Engine**: 管理流程态（订单阶段、审批进度）
- **Zustand**: 管理页面态/UI 派生态（表单输入、加载状态、错误提示）

### 3. 副作用实现

- Core 层定义接口契约
- 项目层提供具体实现
- Core 不关心如何实现，只关心接口

### 4. 避免反模式

❌ **禁止**:
- Core 层引入 React
- Core 层使用 Zustand/Redux
- UI 直接调用 Engine.subscribe（必须通过 Adapter）
- Adapter 编写业务规则判断

✅ **正确**:
- Stateless Core 只包含纯函数和 flows
- Engine 只管理流程态
- Adapter 只做数据转换和状态订阅

---

## 常见问题

### Q1: 我应该使用哪个轨道？

**A**: 优先使用 Stateless Core。只有当你的业务是复杂的多阶段流程（如订单、审批流、向导）时，才考虑使用 Engine。

### Q2: Engine 和 Zustand 的区别？

**A**:
- **Engine**: 管理业务流程态（订单阶段、审批状态），由 Core 层定义
- **Zustand**: 管理页面态和 UI 派生态（表单输入、加载状态、错误提示），由项目层定义

### Q3: Adapter 为什么在 UI 层？

**A**: Adapter 属于 UI 层，因为：
1. 它依赖 React 的 `useSyncExternalStore` API
2. Core 层不能被 React 污染
3. 符合架构文档的明确约束

### Q4: 如何测试 Core 层？

**A**:
- **Stateless Core**: 测试纯函数和 flows，无需 React 环境
- **Stateful Engine**: 测试状态迁移和订阅机制，使用 Vitest

### Q5: 现有代码如何迁移？

**A**:
1. 简单业务：从 Engine 迁移到 Stateless Core
2. 复杂业务：保留 Engine，但迁移 Adapter 到 UI 层
3. 详见迁移指南

---

## 下一步

- 📖 阅读完整的 API 文档: `contracts/core-api.md`
- 🏗️ 了解数据模型: `data-model.md`
- 📋 查看实施计划: `plan.md`
- 🔧 查看研究决策: `research.md`

---

## 获取帮助

- 📖 架构文档: `docs/architecture/core.md`
- 📜 项目宪章: `.specify/memory/constitution.md`
- 💻 示例代码: `packages/core/examples/`
