# Data Model: 重建 @terence/core 脚手架

**Feature**: 001-rebuild-core-scaffold
**Date**: 2026-01-20
**Phase**: Phase 1 - Design & Contracts

---

## 概述

本文档定义 `@terence/core` 包的数据模型和实体结构。Core 层采用双轨模型：

- **Track A (Stateless Core)**: 业务规则与流程算法的集合，无状态
- **Track B (Stateful Engine)**: 可运行的业务流程实体，持有状态

---

## 核心实体

### 1. Stateless Core Module

**描述**: 业务规则与流程算法的集合，通过参数接收数据，通过 contracts 调用副作用

**文件结构**:
```text
stateless/[module-name]/
├── rules.js      # 业务规则（纯函数）
├── flows.js      # 业务流程（可 async）
└── contracts.js  # 副作用接口定义
```

**导出接口**:
```javascript
export {
  // rules.js - 业务规则
  canSubmit,
  validateForm,
  // ...其他规则

  // flows.js - 业务流程
  submitLogin,
  resetPassword,
  // ...其他流程

  // contracts.js - 副作用契约
  effectsContract
}
```

**不变式**:
- ✅ 所有函数必须是纯函数（除了 flows 中的 async 函数）
- ✅ 不能保存状态
- ✅ 不能订阅变化
- ✅ 不能引入状态管理库
- ✅ 不能感知 React 生命周期

**示例**:
```javascript
// rules.js
export function canSubmit(form) {
  return Boolean(form.account && (form.password || form.otp))
}

// flows.js
import { canSubmit } from './rules'

export async function submitLogin(form, effects) {
  if (!canSubmit(form)) {
    throw new Error('LOGIN_INVALID')
  }
  return effects.login(form)
}

// contracts.js
export const loginEffectsContract = {
  login: async () => {},
}
```

---

### 2. Stateful Engine

**描述**: 可运行的业务流程实体，持有状态，执行状态迁移，暴露业务动作

**文件结构**:
```text
engines/[engine-name]/
├── engine.js        # 核心状态机
├── transitions.js   # 状态迁移规则
└── contract.js      # 外部能力契约
```

**标准接口**:
```javascript
{
  getState: () => State,
  subscribe: (listener: (State) => void) => () => void,
  actions: {
    [actionName]: (...args) => void
  }
}
```

**状态结构**:
```javascript
{
  step: string,           // 当前业务阶段
  data: Record<string, any>,  // 业务数据
  error: Error | null,    // 错误信息
  // ...其他业务字段
}
```

**不变式**:
- ✅ 必须提供 `getState` 方法
- ✅ 必须提供 `subscribe` 方法，返回取消订阅函数
- ✅ 必须通过 `actions` 暴露所有业务动作
- ✅ 不能直接操作 UI
- ✅ 不能引入 React
- ✅ 不能自行管理副作用实现（通过 contract 注入）

**示例**:
```javascript
// engine.js
export function createOrderEngine(context) {
  let state = { step: 'draft' }
  const listeners = new Set()

  function getState() {
    return state
  }

  function transition(action) {
    state = transitions[state.step][action](state, context)
    listeners.forEach((l) => l(state))
  }

  return {
    getState,
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    actions: { transition },
  }
}
```

---

### 3. Effects Contract

**描述**: 副作用接口定义，描述 Core 需要的外部能力

**结构**:
```javascript
export const effectsContract = {
  [effectName]: FunctionSignature
}
```

**类型**:
- ✅ API 请求（`login`, `fetchData`）
- ✅ 持久化（`saveToken`, `loadSettings`）
- ✅ 导航（`navigate`, `goBack`）
- ✅ 外部系统调用（`log`, `track`）

**示例**:
```javascript
// Stateless Core 的 effects contract
export const loginEffectsContract = {
  login: async (form) => {},
  saveToken: (token) => {},
  navigate: (path) => {},
}

// Stateful Engine 的 context contract
export const orderEngineContextContract = {
  createOrder: async (data) => {},
  updateOrder: async (id, data) => {},
  validateInventory: async (items) => {},
}
```

---

### 4. Adapter (UI 层)

**描述**: Engine 与 React 之间的桥梁，将 Engine 的状态订阅机制适配到 React 的响应式系统

**位置**: `packages/ui/hooks/adapters/`

**接口**:
```javascript
function createReactAdapter(engine) {
  return function useEngine(selector = (state) => state) {
    return {
      state: SelectedState,
      commands: engine.commands,  // 或 engine.actions
      rules: engine.rules         // 仅 Engine 有 rules
    }
  }
}
```

**不变式**:
- ✅ 必须使用 `useSyncExternalStore` 订阅 Engine 状态
- ✅ 只能调用 `engine.actions` 或 `engine.commands`
- ✅ 不能修改 Engine 内部状态
- ✅ 不能在 Adapter 中编写业务规则判断

**示例**:
```javascript
import { useSyncExternalStore } from 'react'

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
      rules: engine.rules,
    }
  }
}
```

---

## 数据流图

### Stateless Core 数据流

```text
┌─────────────┐
│  UI Layer   │
│  (React)    │
└──────┬──────┘
       │ 1. 调用 flow(form, effects)
       │
┌──────▼──────┐
│ Stateless   │
│ Core Flow   │
└──────┬──────┘
       │ 2. 调用 rules 验证
┌──────▼──────┐
│ Rules       │
│ (纯函数)    │
└──────┬──────┘
       │ 3. 返回验证结果
┌──────▼──────┐
│ Effects     │
│ (项目层)    │
└─────────────┘
```

### Stateful Engine 数据流

```text
┌─────────────┐
│  UI Layer   │
│ (React)     │
└──────┬──────┘
       │ 1. 通过 Adapter Hook 订阅
┌──────▼──────┐
│  Adapter    │
│ (useEngine) │
└──────┬──────┘
       │ 2. 调用 engine.actions.xxx()
┌──────▼──────┐
│   Engine    │
│ (getState)  │
└──────┬──────┘
       │ 3. 状态变化通知订阅者
┌──────▼──────┐
│  Adapter    │
│  (subscribe)│
└──────┬──────┘
       │ 4. 触发 React 重新渲染
┌──────▼──────┘
│  UI Layer   │
└─────────────┘
```

---

## 状态迁移规则

### Engine 状态迁移

**模式**: 当前状态 + 动作 → 新状态

```javascript
// transitions.js
export const stateTransitions = {
  draft: {
    submit: (state, context) => ({
      ...state,
      step: 'validating',
    }),
  },
  validating: {
    success: (state, context) => ({
      ...state,
      step: 'confirmed',
    }),
    fail: (state, context) => ({
      ...state,
      step: 'draft',
      error: context.error,
    }),
  },
  confirmed: {
    ship: (state, context) => ({
      ...state,
      step: 'shipped',
    }),
  },
}
```

**约束**:
- ✅ 每个状态必须明确定义可接受的动作
- ✅ 状态迁移必须是幂等的
- ✅ 状态迁移不能有副作用（副作用在 Engine 层处理）

---

## 工具类型

### StateContainer

**用途**: Engine 的内部状态管理

**接口**:
```javascript
class StateContainer {
  constructor(initialState)
  getState() -> State
  setState(updater: State | (State) => State)
  subscribe(listener: (State) => void) -> () => void
}
```

### invariant

**用途**: 运行时断言

**接口**:
```javascript
function invariant(condition, message)
```

### validation

**用途**: 依赖校验

**接口**:
```javascript
function validateDeps(deps, schema)
```

---

## 文件组织

### packages/core/src/

```text
src/
├── index.js              # 主入口，导出所有模块
├── stateless/            # Track A: Stateless Core
│   ├── index.js
│   ├── login/
│   │   ├── index.js
│   │   ├── rules.js
│   │   ├── flows.js
│   │   └── contracts.js
│   └── validation/       # 其他 stateless 模块
├── engines/              # Track B: Stateful Engine
│   ├── index.js
│   ├── login/            # 示例：保留作为 Engine 示例
│   │   ├── index.js
│   │   ├── engine.js
│   │   ├── commands.js
│   │   ├── rules.js
│   │   ├── state.js
│   │   └── effects.js
│   └── order-engine/     # 示例：订单流程 Engine
└── utils/                # 通用工具
    ├── index.js
    ├── StateContainer.js
    ├── invariant.js
    └── validation.js
```

---

## 约束总结

### Stateless Core 约束

- ✅ 无状态
- ✅ 纯函数（除了 flows 的 async 函数）
- ✅ 通过参数接收数据
- ✅ 通过 contracts 调用副作用
- ❌ 不能保存状态
- ❌ 不能订阅变化
- ❌ 不能引入状态管理库
- ❌ 不能感知 React

### Stateful Engine 约束

- ✅ 持有状态
- ✅ 提供标准接口（getState, subscribe, actions）
- ✅ 通过 contract 注入外部能力
- ❌ 不能直接操作 UI
- ❌ 不能引入 React
- ❌ 不能自行管理副作用实现

### Adapter 约束

- ✅ 使用 useSyncExternalStore
- ✅ 调用 engine.actions
- ✅ 订阅 engine.state
- ❌ 不能修改 Engine 内部状态
- ❌ 不能编写业务规则判断
- ❌ 不能推断业务流程
