# core 业务内核详细设计文档

## 1. 设计目标与定位

core 模块是整个体系的**业务真理源（Single Source of Truth）**，用于承载所有可复用、可推演、可验证的业务逻辑。

在整体架构中，core 的职责不是“提供组件”，而是：

> **定义业务状态、业务规则、状态演进方式，以及什么是合法的业务行为。**

任何 UI 变化、交互差异、主题切换，都不应影响 core 的行为结果。

---

## 2. 设计原则

### 2.1 职责单一原则

- core 只关心“业务是什么”，不关心“如何展示”
- core 不感知 UI 框架、路由、样式、国际化

### 2.2 显式状态原则

- 所有业务状态必须是**可枚举、可序列化、可检查的**
- 禁止隐式状态（如通过闭包暗中改变语义）

### 2.3 单向数据流原则

- 状态只能通过 action 发生变化
- action 内部可以触发副作用，但结果必须回到状态中

### 2.4 JavaScript 友好原则

- 使用 JSDoc 描述对外接口
- 关键边界进行运行时校验
- 结构清晰优于类型炫技

---

## 3. 模块职责范围

### 3.1 core 负责的内容

- 业务状态模型定义
- 业务规则与校验逻辑
- 状态流转（流程）
- 业务能力抽象（engine / service）

### 3.2 core 不负责的内容

- UI 组件或 JSX
- 表单管理
- 路由控制
- 样式、主题、动效
- 文案与国际化

---

## 4. 代码组织结构

推荐的 core 目录结构如下：

```
core/
├── engines/        # 业务引擎（状态 + action）
│   └── order.js
├── services/       # 纯业务服务（可被多个 engine 复用）
│   └── pricing.js
├── guards/         # 业务校验与断言
│   └── orderGuard.js
├── adapters/       # 对外适配（可选，如 storage / api）
│   └── orderApi.js
├── utils/          # 通用工具函数
│   └── invariant.js
└── index.js        # 对外出口
```

---

## 5. 业务状态模型设计

### 5.1 状态的基本要求

业务状态必须满足：

- JSON 可序列化
- 无循环引用
- 不依赖 UI 状态

### 5.2 状态示例（Order Engine）

```js
/**
 * @typedef {Object} OrderState
 * @property {Array<{id: string, qty: number}>} items
 * @property {'idle'|'editing'|'submitting'|'completed'} status
 * @property {boolean} canSubmit
 */
```

状态字段应尽量表达“业务事实”，而不是 UI 表现。

---

## 6. Engine 设计模型

### 6.1 Engine 的定义

Engine 是 core 中最核心的抽象，用于：

- 持有业务状态
- 暴露可调用的业务动作（actions）
- 管理副作用与状态回流

### 6.2 Engine API 约定

```js
/**
 * @returns {{
 *   state: OrderState,
 *   actions: {
 *     addItem(id: string, qty?: number): void,
 *     submit(): Promise<void>
 *   }
 * }}
 */
export function createOrderEngine(options = {}) {}
```

**约束说明**：

- state 必须是只读语义（不对外暴露 setter）
- actions 是唯一的状态修改入口

---

## 7. Action 与状态流转

### 7.1 Action 设计原则

- action 名称必须是业务动词
- action 内部可组合多个 service
- action 结束后，状态必须自洽

### 7.2 状态流转示意

```
idle → editing → submitting → completed
```

非法流转必须被 guard 阻止。

---

## 8. Guard（业务校验）设计

### 8.1 Guard 的职责

- 校验 action 入参
- 校验当前状态是否允许该行为

### 8.2 Guard 示例

```js
export function assertCanSubmit(state) {
  if (state.items.length === 0) {
    throw new Error('Cannot submit empty order')
  }
}
```

Guard 失败应：

- 抛出明确错误
- 不修改任何状态

---

## 9. 副作用与外部交互

### 9.1 副作用处理原则

- 副作用必须发生在 action 内
- 副作用结果必须反映到状态中

### 9.2 外部依赖注入

```js
createOrderEngine({
  submitOrder: async (payload) => {},
})
```

core 不直接依赖具体 API 实现。

---

## 10. JSDoc 与接口契约

### 10.1 JSDoc 强制规范

- 所有对外方法必须有 JSDoc
- 所有 state 结构必须定义 typedef

### 10.2 JSDoc 的角色

- 接口说明
- IDE 自动提示
- 架构文档的一部分

---

## 11. 错误与异常策略

- 所有业务非法操作 → 抛出 Error
- 不吞异常
- UI 决定如何展示错误

core 只负责“是否正确”，不负责“如何提示”。

---

## 12. 测试策略（core 优先）

### 12.1 必测内容

- 状态初始化
- 每个 action 的状态变化
- guard 拦截行为

### 12.2 测试原则

- 不 mock UI
- 不依赖浏览器环境

---

## 13. 设计总结

core 并不是一个“工具集合”，而是一个：

> **可推理、可验证、可复用的业务系统内核。**

在 JavaScript 技术栈下，core 的稳定性来自于：

- 明确的职责边界
- 显式的状态模型
- 严格的 action 入口
- 工程与测试约束

该设计是整个业务组件体系长期演进的基石。
