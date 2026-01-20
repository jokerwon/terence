# Research: 重建 @terence/core 脚手架

**Feature**: 001-rebuild-core-scaffold
**Date**: 2026-01-20
**Phase**: Phase 0 - Outline & Research

---

## 研究目标

基于 `docs/architecture/core.md` 的双轨模型设计，研究并确定以下技术决策：

1. Stateless Core 与 Stateful Engine 的目录组织方式
2. Adapter 的实现位置和方式
3. 现有代码的迁移策略
4. ESLint 规则的实现方式
5. 示例代码的选择和实现

---

## 研究发现

### 1. 双轨模型的目录组织

**决策**: 采用显式分离的目录结构

```text
packages/core/src/
├── stateless/           # Track A: Stateless Core (默认轨道)
│   ├── login/
│   │   ├── rules.js     # 业务规则（纯函数）
│   │   ├── flows.js     # 业务流程（可 async）
│   │   └── contracts.js # 副作用接口定义
│   └── validation/      # 其他 stateless 模块
├── engines/             # Track B: Stateful Engine (受限轨道)
│   ├── order-engine/
│   │   ├── engine.js    # 核心状态机
│   │   ├── transitions.js # 状态迁移规则
│   │   └── contract.js  # 外部能力契约
│   └── approval-engine/
└── utils/               # 通用工具（状态容器、校验等）
```

**理由**:
- 架构文档明确要求"不允许混用轨道"
- 显式分离使得代码审查更直观
- `stateless/` 目录名强调"无状态"特性
- `engines/` 保留用于复杂的 Stateful Engine

**备选方案被拒绝**:
- ❌ 混合所有模块到 `modules/` 目录：违反"不允许混用轨道"原则
- ❌ 按业务领域分目录：无法直观区分轨道，增加审查成本

---

### 2. Adapter 的实现位置

**决策**: Adapter 属于 UI 层，不在 `@terence/core` 包中

**理由**:
- 架构文档 6.1 节明确："Adapter 属于 UI 层，Core 不包含 Adapter"
- 宪章原则 IV：Adapter 是 UI 与 Core 之间的桥梁，位于 ui 层
- Core 层只服务于 React 项目，但不被 React 污染

**实现位置**:
```
packages/ui/hooks/adapters/  # UI 层的 Adapter 实现
```

**现有代码处理**:
- 删除 `packages/core/src/adapters/` 目录
- 将 `createAdapter.js` 迁移到 `packages/ui/hooks/adapters/createReactAdapter.js`

**备选方案被拒绝**:
- ❌ 保留在 Core 包中：违反架构设计约束，导致 Core 被 React 污染

---

### 3. 现有代码的迁移策略

**决策**: 采用渐进式迁移，保留可复用的基础设施

**保留的代码**:
- ✅ `utils/StateContainer.js` - Engine 需要的状态容器
- ✅ `utils/invariant.js` - 运行时断言工具
- ✅ `utils/validation.js` - 依赖校验工具

**需要重构的代码**:
- 🔄 `engines/login/` - 从 Engine 模式改为 Stateless Core 模式
- 🔄 `adapters/react/` - 迁移到 ui 层

**迁移步骤**:
1. 创建新的 `stateless/login/` 目录
2. 实现 `rules.js`, `flows.js`, `contracts.js`
3. 保留 `engines/login/` 作为示例（展示 Engine 轨道）
4. 删除 `src/adapters/` 目录
5. 更新 `package.json` 的 exports 字段

**理由**:
- 登录业务适合 Stateless Core（简单流程，无复杂状态）
- 保留 login Engine 作为 Stateful Engine 的参考示例
- 工具函数可复用，避免重复开发

---

### 4. ESLint 规则的实现方式

**决策**: 使用 ESLint 的 `no-restricted-imports` 和 `no-restricted-syntax` 规则

**规则 1**: 禁止 Core 层引入 React
```javascript
// .eslintrc.js
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['react', 'react-dom'],
        message: 'Core 层不能引入 React。Adapter 属于 UI 层。'
      }]
    }]
  }
}
```

**规则 2**: 禁止 Core 层引入状态管理库
```javascript
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['zustand', 'redux', '@reduxjs/toolkit'],
        message: 'Core 层不能使用状态管理库。Stateless Core 无状态，Engine 使用内部状态容器。'
      }]
    }]
  }
}
```

**规则 3**: 禁止 UI 层直接调用 Engine.subscribe
```javascript
{
  rules: {
    'no-restricted-syntax': ['error', {
      selector: 'CallExpression[callee.property.name="subscribe"]',
      message: '请使用 Adapter Hook 订阅 Engine 状态，不要直接调用 subscribe。'
    }]
  }
}
```

**理由**:
- ESLint 是项目已有的工具，无需引入额外依赖
- `no-restricted-imports` 可以在编译时阻止违规导入
- `no-restricted-syntax` 可以检测特定的代码模式
- 规则清晰，错误信息直接指向架构文档

**备选方案被拒绝**:
- ❌ 使用 TypeScript 的类型系统限制：项目不使用 TypeScript
- ❌ 运行时检查：无法在开发阶段发现问题，效率低

---

### 5. 示例代码的选择和实现

**决策**: 提供两个完整的示例

**示例 1**: Stateless Core - 登录（默认轨道）
```javascript
// stateless/login/rules.js
export function canSubmit(form) {
  return Boolean(form.account && (form.password || form.otp))
}

// stateless/login/flows.js
import { canSubmit } from './rules'

export async function submitLogin(form, effects) {
  if (!canSubmit(form)) {
    throw new Error('LOGIN_INVALID')
  }
  return effects.login(form)
}

// stateless/login/contracts.js
export const loginEffectsContract = {
  login: async () => {},
}
```

**示例 2**: Stateful Engine - 订单流程（受限轨道）
```javascript
// engines/order-engine/engine.js
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

**理由**:
- 登录示例覆盖 80%+ 的使用场景（Stateless Core）
- 订单示例展示复杂场景的处理方式（Stateful Engine）
- 两个示例形成对比，帮助开发者理解何时使用哪个轨道

---

## 技术决策总结

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 目录组织 | `stateless/` + `engines/` 显式分离 | 架构文档要求，不允许混用轨道 |
| Adapter 位置 | 迁移到 UI 层 | 架构文档明确：Adapter 属于 UI 层 |
| 迁移策略 | 渐进式，保留可复用代码 | 避免重复开发，平滑过渡 |
| ESLint 规则 | `no-restricted-imports` + `no-restricted-syntax` | 利用现有工具，编译时检查 |
| 示例代码 | 登录（Stateless）+ 订单（Engine） | 覆盖双轨模型，形成对比 |

---

## 未解决的问题

无。所有技术决策已基于架构文档和项目宪章确定。

---

## 下一步

进入 Phase 1: Design & Contracts
- 生成 `data-model.md`
- 生成 API 契约到 `/contracts/`
- 生成 `quickstart.md`
- 更新 agent 上下文
