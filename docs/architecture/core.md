# Core 业务内核详细设计文档（Engine + Adapter 落地版｜双轨模型）

> 本文档是 Core 层的**最终工程化设计说明**。
> 它不是理念草稿，而是：
>
> - 可以直接指导代码组织
> - 可以约束未来扩展方向
> - 可以作为 Code Review 的判断依据
>
> 本设计基于一个核心前提：**Core 只服务于 React 项目，但不被 React 污染。**

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

1. 定义“什么是合法业务”
2. 定义“业务流程如何执行”
3. 通过参数调用外部副作用

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
 └─ login/
     ├─ rules.js      // 业务规则（纯函数）
     ├─ flows.js      // 业务流程（可 async）
     └─ contracts.js  // 副作用接口定义
```

---

### 4.4 示例：登录（Stateless Core）

```js
// rules.js
export function canSubmit(form) {
  return Boolean(form.account && (form.password || form.otp))
}
```

```js
// flows.js
import { canSubmit } from './rules'

export async function submitLogin(form, effects) {
  if (!canSubmit(form)) {
    throw new Error('LOGIN_INVALID')
  }
  return effects.login(form)
}
```

```js
// contracts.js
export const loginEffectsContract = {
  login: async () => {},
}
```

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
 └─ order-engine/
     ├─ engine.js        // 核心状态机
     ├─ transitions.js  // 状态迁移规则
     └─ contract.js     // 外部能力契约
```

---

### 5.4 Engine 示例（简化）

```js
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

## 六、Adapter 层（必须存在）

### 6.1 Adapter 的定位

Adapter 是 **Engine 与 React 之间的唯一桥梁**。

- Adapter 属于 UI 层
- Core 不包含 Adapter

---

### 6.2 标准 Adapter 形态

```js
export function useOrderEngine(engine) {
  const [state, setState] = useState(engine.getState())

  useEffect(() => engine.subscribe(setState), [engine])

  return [state, engine.actions]
}
```

---

### 6.3 与 Zustand 的协作原则

- Engine 管理流程态
- Zustand 管理页面态 / UI 派生态

禁止：

- Zustand 直接修改 Engine 内部状态

---

## 七、反模式清单（用于 Code Review）

❌ Core 内部使用 Zustand
❌ Stateless Core 保存状态
❌ 登录 / CRUD 使用 Engine
❌ UI 直接调用 Engine.subscribe
❌ Adapter 下沉到 Core

---

## 八、扩展与演进原则

1. 新业务一律从 Stateless Core 开始
2. 只有出现明确痛点才引入 Engine
3. Engine 一旦引入，必须配套 Adapter

---

## 九、总结（工程判断口诀）

> **状态属于项目，规则属于 Core，流程复杂才用 Engine。**

这不是折中方案，
而是前端业务组件库在真实环境中的最优解。

---

## 十、结语

双轨模型的意义不在于“支持复杂场景”，
而在于：

> **让简单业务永远保持简单。**

Engine 是能力，而不是默认选项。

请谨慎使用。
