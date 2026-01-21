# Core 业务内核详细设计文档（Engine + Adapter 落地版｜双轨模型）

> 本文档是 Core 层的**最终工程化设计说明**。
> 它不是理念草稿，而是：
>
> - 可以直接指导代码组织
> - 可以约束未来扩展方向
> - 可以作为 Code Review 的判断依据
>
> 本设计基于一个核心前提：**Core 只服务于 React 项目，但不被 React 污染。**
>
> 并基于以下技术与约束：
>
> - JavaScript
> - zod 作为数据校验工具

---

## 一、设计背景与问题澄清

在业务组件库场景下，Core 常见的失败原因有三类：

1. Core 变成“第二个状态管理器”
2. 简单业务被迫使用复杂抽象
3. 业务开发者需要理解过多架构概念

本设计的目标，是在**工程现实**与**架构纯度**之间取得平衡。

---

## 二、核心设计结论（先给结论）

Core 采用 **双轨模型（Dual-Track Core）**：

| 轨道    | 名称            | 是否持有状态 | 使用频率    | 适用场景                         |
| ------- | --------------- | ------------ | ----------- | -------------------------------- |
| Track A | Stateless Core  | 否           | 默认 / 80%+ | 登录、校验、提交、简单流程       |
| Track B | Stateful Engine | 是           | 谨慎 / 少数 | 下单、审批流、向导流程、复杂流程 |

> **不允许混用轨道。**

---

## 三、总体架构分层

```text
┌─────────────────────┐
│        UI 层        │  React / Antd / 组件
│   （通过 Adapter）  │
└─────────▲───────────┘
          │
┌─────────┴───────────┐
│       Adapter 层    │  React Hook
└─────────▲───────────┘
          │
┌─────────┴───────────┐
│        Core 层      │  业务规则 / Engine
└─────────────────────┘
```

Core **永远不直接被 UI 使用**，
所有有状态能力必须通过 Adapter 进入 React。

---

## 四、Track A：Stateless Core（默认轨道）

### 4.1 定位

Stateless Core 是：

> **业务规则与流程算法的集合**

它的职责只有三件事：

1. 定义业务流程允许的形态（flow）
2. 定义业务所需的数据契约（schema）
3. 提供规则判断或流程执行能力

它有以下特点：

- 不保存状态
- 无生命周期
- 通过纯函数暴露业务能力
- 典型形式：`flow + schema + rules`

适用于：

- 登录
- 表单
- CRUD
- 校验与业务判断

---

### 4.2 明确不做的事情

Stateless Core **严禁**：

- 保存任何业务状态
- 订阅状态变化
- 引入 Zustand / Redux / Rx
- 感知 React 生命周期

---

### 4.3 目录结构规范

```text
core/
 └─ src/
    ├─ index.js         // 入口
    ├─ utils/            // 工具函数
    └─ login/
       ├─ rules.js      // 业务规则（纯函数）
       ├─ flows.js      // 业务流程（可 async）
       ├─ schemas.js    // zod 数据契约
       └─ index.js
```

---

### 4.4 示例：登录（Stateless Core）

```js
// rules.js
import z from 'zod'
import { otpSchema, passwordSchema } from './schemas'

export const validateSchema = (form, schema) => {
  const result = schema.safeParse(form)
  let error
  let data
  if (!result.success) {
    error = z.treeifyError(result.error)
  } else {
    data = result.data
  }
  return {
    success: result.success,
    error,
    data,
  }
}
```

```js
// flows.js
import { validatePassword } from './rules.js'

export async function submitLogin(form, effects) {
  // 1. 业务规则验证
  if (!validatePassword(form)?.success) {
    throw new Error('LOGIN_INVALID')
  }
  // 2. 调用外部副作用
  const result = await effects.login(form)
  // 3. 返回结果
  return result
}
```

```js
// schemas.js
import z from 'zod'

export const accNbrSchema = z.string().length(10)
export const passwordSchema = z.object({
  number: accNbrSchema,
  password: z.string().nonempty(),
})
export const otpSchema = z.object({
  number: accNbrSchema,
  otp: z.string().length(6),
})
```

说明：

- schema 是业务模块对数据的最小约束
- 错误信息建议使用业务码，便于 i18n

---

### 4.5 与项目状态的关系

- 状态：项目负责（Zustand / useState）
- Core：被动消费状态

```js
submitLogin(store.form, effects)
```

Core **不需要也不应该被监听**。

---

## 五、Track B：Stateful Engine（受限轨道）

### 5.1 使用前置条件（必须全部满足）

仅当业务满足以下条件时，允许使用 Engine：

- 明确的多阶段流程
- 状态需要跨多次交互持续存在
- UI 严重依赖当前业务阶段

否则一律回退 Track A。

---

### 5.2 Engine 的职责边界

Engine 是：

> **一个可运行的业务流程实体**

它可以：

- 保存业务状态
- 执行状态迁移
- 暴露业务动作

它不能：

- 直接操作 UI
- 引入 React
- 自行管理副作用实现

---

### 5.3 Engine 结构规范

```text
core/
 └─ src/
    └─ order-engine/
        ├─ engine.js       // 核心状态机
        ├─ transitions.js  // 状态迁移规则
        └─ contract.js     // 外部能力契约
```

---

## 六、反模式清单（用于 Code Review）

❌ Core 内部使用 Zustand
❌ Stateless Core 保存状态
❌ 登录 / CRUD 使用 Engine
❌ UI 直接调用 Engine.subscribe
❌ Adapter 下沉到 Core

---

## 七、扩展与演进原则

1. 新业务一律从 Stateless Core 开始
2. 只有出现明确痛点才引入 Engine

---
