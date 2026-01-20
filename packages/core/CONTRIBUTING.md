# 贡献指南 - @terence/core

感谢你对 Terence Core 项目的贡献！本文档说明如何遵循架构规范进行开发。

## 架构原则

### 双轨模型

Core 层采用双轨模型：

- **Track A: Stateless Core** (默认轨道，80%+ 业务场景)
  - 业务规则与流程算法的集合
  - 无状态、纯函数、可测试
  - 目录: `src/stateless/`

- **Track B: Stateful Engine** (受限轨道，复杂多阶段流程)
  - 可运行的业务流程实体
  - 持有状态、状态迁移、动作暴露
  - 目录: `src/engines/`

### 分层架构

```
seed (项目应用层)
  ↓
ui (UI 组件层)
  ↓
core (业务内核层) ← 我们在这里
```

**依赖规则**:
- ✅ seed → ui → core (单向依赖)
- ✅ seed → core (允许直接使用)
- ❌ core → ui (禁止)
- ❌ core → seed (禁止)

## 开发指南

### 何时使用 Stateless Core

✅ **适用场景**:
- 登录、注册、密码重置
- 表单校验和提交
- 简单的 CRUD 操作
- 数据转换和计算

**实现方式**:
```
stateless/[module-name]/
├── rules.js      # 业务规则（纯函数）
├── flows.js      # 业务流程（可 async）
└── contracts.js  # 副作用接口定义
```

**示例**:
```javascript
// rules.js - 纯函数
export function canSubmit(form) {
  return Boolean(form.account && form.password)
}

// flows.js - 流程函数
export async function submitLogin(form, effects) {
  if (!canSubmit(form)) {
    throw new Error('LOGIN_INVALID')
  }
  return effects.login(form)
}

// contracts.js - 副作用契约
export const loginEffectsContract = {
  login: async (form) => {},
  saveToken: (token) => {},
  navigate: (path) => {},
}
```

### 何时使用 Stateful Engine

⚠️ **仅当满足所有条件时**:
- 明确的多阶段流程
- 状态需要跨多次交互持续存在
- UI 严重依赖当前业务阶段

**否则一律使用 Stateless Core**

**实现方式**:
```
engines/[engine-name]/
├── engine.js        # 核心状态机
├── transitions.js   # 状态迁移规则
└── contract.js      # 外部能力契约
```

**示例**:
```javascript
// engine.js
export function createOrderEngine(context) {
  let state = { step: 'draft' }
  const listeners = new Set()

  return {
    getState: () => state,
    subscribe: (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    actions: {
      transition: (action) => {
        state = transitions[state.step][action](state, context)
        listeners.forEach((l) => l(state))
      },
    },
  }
}
```

## 架构约束

### Core 层禁止

❌ **禁止引入 React**:
```javascript
// ❌ 错误
import { useState } from 'react'
import { createElement } from 'react'

// ✅ 正确：Core 层只导出纯函数和 Engine
export { canSubmit, submitLogin } from './login.js'
```

❌ **禁止使用状态管理库**:
```javascript
// ❌ 错误
import { create } from 'zustand'
import { useDispatch } from 'react-redux'

// ✅ 正确：使用内部 StateContainer 或纯函数
import { StateContainer } from '../../utils/StateContainer.js'
```

❌ **禁止使用 JSX**:
```javascript
// ❌ 错误
export function LoginForm() {
  return <form>Login</form>
}

// ✅ 正确：Core 层返回数据对象
export function canSubmit(form) {
  return { valid: true, errors: {} }
}
```

❌ **禁止操作 DOM**:
```javascript
// ❌ 错误
document.getElementById('app')
window.location.href = '/'

// ✅ 正确：通过 contracts 由项目层实现
export const effectsContract = {
  navigate: (path) => {}, // 项目层实现
}
```

### ESLint 强制约束

Core 层通过 ESLint 强制执行架构约束：

```bash
npm run lint
```

违规代码会导致 ESLint 错误：
- `[架构约束 Core] Core 层不能引入 React`
- `[架构约束 Core] Core 层不能使用状态管理库`
- `[架构约束 Core] Core 层不能使用 JSX`

## 代码规范

### 文件命名

- Stateless Core: `rules.js`, `flows.js`, `contracts.js`
- Stateful Engine: `engine.js`, `transitions.js`, `contract.js`
- 测试: `*.test.js`, `*.spec.js`

### 代码风格

- 使用 ES2022+ 语法
- 使用 JSDoc 注释导出接口
- 纯函数无副作用
- 流程函数可 async
- 清晰的错误消息

### 测试要求

- 优先覆盖 Core 层测试
- 测试覆盖率 > 80%
- 不依赖浏览器环境
- 使用 Vitest

## 提交代码

### 前置检查

在提交 PR 前，请确保：

1. ✅ 运行测试: `npm test`
2. ✅ 运行 ESLint: `npm run lint`
3. ✅ 新增代码有测试覆盖
4. ✅ 通过 ESLint 架构约束检查
5. ✅ 更新相关文档

### Pull Request 流程

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/my-feature`
3. 提交更改: `git commit -m 'feat: add xxx'`
4. 推送分支: `git push origin feature/my-feature`
5. 创建 Pull Request

### Commit 消息规范

使用语义化提交消息：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

示例:
```
feat(stateless): add validation module

- implement validateEmail rule
- implement validatePassword rule
- add unit tests

Closes #123
```

## 获取帮助

- 📖 架构文档: `docs/architecture/core.md`
- 📜 项目宪章: `.specify/memory/constitution.md`
- 💻 示例代码: `packages/core/examples/`
- ❓ 常见问题: 见下文

## 常见问题

### Q1: 我应该使用哪个轨道？

**A**: 优先使用 Stateless Core。只有当业务是复杂的多阶段流程时，才考虑使用 Engine。

判断流程:
```
1. 是多阶段流程吗？
   No → Stateless Core
   Yes ↓
2. 状态跨多次交互吗？
   No → Stateless Core
   Yes ↓
3. UI 严重依赖业务阶段吗？
   No → Stateless Core
   Yes → Stateful Engine
```

### Q2: 如何测试 Core 层代码？

**A**: 使用 Vitest，不需要浏览器环境。

```javascript
import { describe, it, expect } from 'vitest'
import { canSubmit } from '../rules'

describe('canSubmit', () => {
  it('should return true when form is valid', () => {
    expect(canSubmit({ account: 'user', password: 'pass' })).toBe(true)
  })
})
```

### Q3: Adapter 在哪里实现？

**A**: Adapter 属于 UI 层，位于 `packages/ui/hooks/adapters/`。

Core 层不包含 Adapter，只提供 Engine 接口。

### Q4: 如何处理副作用？

**A**: 通过 contracts 定义接口，由项目层实现。

```javascript
// Core 层：定义接口
export const effectsContract = {
  login: async (form) => {},
  saveToken: (token) => {},
}

// 项目层：实现接口
const effects = {
  login: async (form) => fetch('/api/login', { ... }),
  saveToken: (token) => localStorage.setItem('token', token),
}
```

## License

MIT

---

再次感谢你的贡献！让我们一起构建高质量的 Core 层。
