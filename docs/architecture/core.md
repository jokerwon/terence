# Core 业务内核详细设计文档（Engine + Adapter 落地版）

## 1. 文档目的

本文档是在《Core 业务内核详细设计文档（理念版）》基础上的**工程落地版本**。

目标不是再次阐述“为什么要这样设计”，而是回答三个更现实的问题：

- 开发时 **代码应该写在哪里**
- Review 时 **什么是对的 / 什么是错的**
- 项目演进中 **如何在不推翻架构的前提下扩展业务**

换句话说：

> 这是一份可以直接约束日常开发行为的设计文档，而不是概念说明书。

---

## 2. Core 的角色重新界定

### 2.1 Core 是什么

Core 是 **业务内核（Business Engine Layer）**，它的职责是：

- 定义业务状态
- 定义状态迁移规则
- 定义业务动作（Command）
- 协调副作用（通过注入）

Core 是系统中 **唯一允许回答以下问题的地方**：

- 现在业务处于什么阶段？
- 能不能执行某个操作？
- 执行后状态如何变化？

### 2.2 Core 明确不是什么

Core 不是：

- React 组件
- UI 状态管理层
- API 封装层
- Zustand store

Core **不关心如何展示，也不关心谁来保存结果**。

---

## 3. 总体架构：Engine + Adapter

```
[ UI (antd) ]
       ↑
[ React Adapter ]
       ↑
[ Business Engine (core) ]
       ↓
[ Side Effects (API / Storage / Router) ]
```

### 3.1 单向依赖原则

- UI → Adapter → Engine
- Engine **不依赖** Adapter / UI
- 副作用通过 deps 注入，Engine 不直接 import

这是一条不可逆的依赖链。

---

## 4. 目录结构（路径即约束）

```
core/
├── engines/
│   └── login/
│       ├── engine.js        # 业务状态机
│       ├── state.js         # 初始状态定义
│       ├── rules.js         # 业务判断规则
│       └── effects.js       # 副作用接口约定
├── adapters/
│   └── react/
│       ├── createAdapter.js # 通用 React Adapter
│       └── useLogin.js
├── contracts/
│   └── login.contract.js    # 对外能力声明
└── index.js
```

### 4.1 路径级硬规则

- `engines/**` 内禁止 import：react / zustand / antd
- `adapters/**` 内禁止编写业务规则
- `contracts/**` 不允许包含实现代码

路径本身即是架构纪律。

---

## 5. Engine 设计规范（核心）

### 5.1 Engine 的标准形态

每一个 Engine **必须**符合以下接口形态：

```js
createXxxEngine(deps) => {
  getState()
  subscribe(listener)
  commands: { ... }
  rules: { ... }
}
```

不符合该形态的实现，视为不合规。

---

### 5.2 状态定义（state）

状态是 **业务真实状态**，而不是 UI 投影。

示例（Login）：

```js
export function initialState() {
  return {
    username: '',
    password: '',
    status: 'idle', // idle | submitting | success | error
    error: null,
  }
}
```

状态必须满足：

- 可序列化
- 可完整描述业务当前所处阶段

---

### 5.3 Commands（业务动作）

Command 表示：

> “业务试图发生一次变化”

示例：

```js
commands: {
  inputUsername(value) {}
  inputPassword(value) {}
  submit() {}
}
```

规则：

- Command 内允许修改 state
- Command 内允许调用 deps
- Command **不允许返回 UI 信息**

---

### 5.4 Rules（业务判断）

Rules 用于回答业务层判断问题。

```js
rules: {
  canSubmit(state) {}
  isSubmitting(state) {}
}
```

Rules 必须：

- 纯函数
- 不产生副作用
- 只依赖 state

UI / Adapter / Zustand 不允许自行实现这些判断。

---

### 5.5 副作用（Effects）

Engine **不直接产生副作用**，而是通过 deps 调用。

```js
deps = {
  loginRequest(payload) {},
}
```

Engine 内只允许：

```js
await deps.loginRequest(data)
```

禁止：

- fetch
- axios
- localStorage
- router

---

## 6. React Adapter 设计规范

### 6.1 Adapter 的职责

React Adapter 只做三件事：

1. 订阅 Engine state
2. 暴露 commands
3. 暴露 rules

### 6.2 通用 Adapter 模板

```js
export function createReactAdapter(engine) {
  return function useEngine() {
    const state = useSyncExternalStore(engine.subscribe, engine.getState, engine.getState)

    return {
      state,
      commands: engine.commands,
      rules: engine.rules,
    }
  }
}
```

### 6.3 Adapter 禁止事项

- 不允许计算 canSubmit
- 不允许合并多个 Engine
- 不允许引入 zustand

---

## 7. 与 Zustand 的协作边界

### 7.1 Zustand 的定位

Zustand 是 **应用状态容器**，不是业务引擎。

### 7.2 允许进入 Zustand 的内容

- 登录成功的 user
- token
- orderId

### 7.3 禁止进入 Zustand 的内容

- status / step
- canSubmit / canNext
- 任何业务流程中间态

判断原则：

> 如果一个状态用于回答“现在能不能做某事”，它就不属于 Zustand。

---

## 8. 合规性检查（落地自检）

一个合格的 Core 实现应满足：

- core 可在 Node 环境单独运行
- 删除 UI 不影响业务运行
- Adapter 中无业务判断
- Zustand 中无业务中间态
- 新业务可按模板复制 Engine

若以上任一不满足，应视为架构违规。

---

## 9. 总结

本设计将《Core 业务内核详细设计文档》的理念，落实为：

- 可执行的目录结构
- 可复用的 Engine 模板
- 可 Review 的代码形态
- 可长期演进的业务内核

> Core 不依赖“大家都理解”，
> Core 依赖的是：**写错就不合规**。

这正是业务组件库能够长期稳定演进的前提。
