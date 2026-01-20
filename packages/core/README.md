# @terence/core

Terence 项目的业务内核层，采用**双轨模型**架构。

## 架构概述

Core 层分为两个轨道：

- **Track A: Stateless Core** (默认轨道，80%+ 业务场景)
  - 业务规则与流程算法的集合
  - 无状态、纯函数、可测试
  - 目录: `src/stateless/`

- **Track B: Stateful Engine** (受限轨道，复杂多阶段流程)
  - 可运行的业务流程实体
  - 持有状态、状态迁移、动作暴露
  - 目录: `src/engines/`

## 目录结构

\`\`\`text
src/
├── index.js              # 主入口
├── stateless/            # Track A: Stateless Core (默认轨道)
│   ├── login/
│   │   ├── rules.js      # 业务规则（纯函数）
│   │   ├── flows.js      # 业务流程（可 async）
│   │   ├── contracts.js  # 副作用接口定义
│   │   └── index.js
│   └── validation/       # 其他 stateless 模块
├── engines/              # Track B: Stateful Engine (受限轨道)
│   ├── login/            # 示例：登录 Engine
│   │   ├── engine.js
│   │   ├── commands.js
│   │   ├── rules.js
│   │   ├── state.js
│   │   ├── effects.js
│   │   └── index.js
│   └── order-engine/     # 示例：订单流程 Engine
└── utils/                # 通用工具
    ├── StateContainer.js
    ├── invariant.js
    ├── validation.js
    └── index.js
\`\`\`

## 使用方式

### Stateless Core (推荐)

适用于简单业务流程（登录、校验、提交等）。

\`\`\`javascript
import { submitLogin, loginEffectsContract } from '@terence/core/stateless/login'

// 项目层实现副作用
const effects = {
  login: async (form) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(form),
    })
    return response.json()
  },
  saveToken: (token) => localStorage.setItem('token', token),
  navigate: (path) => (window.location.href = path),
}

// 在组件中使用
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
\`\`\`

### Stateful Engine (受限)

仅用于复杂的多阶段流程（订单、审批流、向导等）。

\`\`\`javascript
import { createLoginEngine } from '@terence/core/engines/login'

// 创建 Engine
const engine = createLoginEngine({
  loginRequest: async (payload) => { /* ... */ },
  saveToken: (token) => { /* ... */ },
  clearToken: () => { /* ... */ },
  navigate: (path) => { /* ... */ },
})

// 使用 Engine（需要通过 Adapter）
// 见 packages/ui/hooks/adapters/
\`\`\`

## 架构约束

### Core 层禁止

- ❌ 引入 React 或任何 UI 库
- ❌ 使用状态管理库（Zustand, Redux）
- ❌ 编写 JSX 或 DOM 操作
- ❌ 直接操作 UI

### ESLint 规则强制约束

通过 `.eslintrc.js` 强制执行架构约束：

- 禁止引入 React
- 禁止引入状态管理库
- 禁止使用 JSX

## 开发指南

### 何时使用 Stateless Core

✅ 登录、注册、密码重置
✅ 表单校验和提交
✅ 简单的 CRUD 操作
✅ 数据转换和计算

### 何时使用 Stateful Engine

⚠️ 仅当满足**所有**条件时：
- 明确的多阶段流程
- 状态需要跨多次交互持续存在
- UI 严重依赖当前业务阶段

否则一律使用 Stateless Core。

## 文档

- 架构设计: `docs/architecture/core.md`
- API 文档: `specs/001-rebuild-core-scaffold/contracts/core-api.md`
- 快速开始: `specs/001-rebuild-core-scaffold/quickstart.md`

## License

MIT
