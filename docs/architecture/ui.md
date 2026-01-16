# ui 层详细设计文档

## 1. 设计目标与定位

ui 层是 **业务内核（core）与最终项目（seed）之间的桥梁**，负责将 core 中抽象、稳定的业务能力，转化为**可直接使用、可交互、可定制的业务组件**。

ui 层的目标不是封装业务，而是：

> **忠实地表达业务内核，同时允许项目对“表达方式”进行重塑。**

因此，ui 层既不是纯 UI 组件库，也不是业务逻辑层，而是一个**可被拆解、可被修改的业务 UI 资产集合**。

---

## 2. ui 层在整体架构中的位置

```
seed（项目）
  ▲
  │  结构 / 样式 / 交互定制
  │
ui（业务 UI 层）
  ▲
  │  adapter / 绑定
  │
core（业务内核）
```

ui 层：

- 向下 **依赖 core**
- 向上 **被 seed 使用或改造**
- 不依赖 seed

---

## 3. ui 层的核心职责

ui 层负责：

- 将 core 的 engine/state/action 转换为 UI 可消费的数据结构
- 基于 antd@6 实现业务组件
- 提供清晰的定制入口（而不是隐藏逻辑）

ui 层**不负责**：

- 业务规则判断
- 业务流程控制
- 项目级状态管理

---

## 4. 源码交付模型（非 npm 包）

### 4.1 设计动机

ui 层不以黑盒 npm 包形式交付，而是采用 **CLI 驱动的源码交付**，原因包括：

- 业务组件天然存在“最后 20% 定制”
- 避免二次封装与 hack
- 降低心智负担（代码即真相）

### 4.2 交付方式

- ui 组件以源码模板形式存在于仓库
- 通过 CLI 按需生成到 seed 项目中
- 生成后的代码完全归 seed 所有

---

## 5. ui 内部结构设计

推荐 ui 层组件目录结构如下：

```
ui/
├── components/
│   └── OrderForm/
│       ├── OrderForm.view.jsx      # 纯 UI 视图
│       ├── OrderForm.adapter.js    # core 适配层
│       ├── OrderForm.logic.js      # UI 内部状态（可选）
│       └── index.js
├── adapters/                       # 通用 adapter
├── hooks/                          # UI 专用 hooks
└── shared/                         # UI 工具与常量
```

---

## 6. Adapter 设计（核心）

### 6.1 Adapter 的角色

Adapter 是 ui 层最关键的抽象，用于：

- 解耦 antd 表单 / 组件 与 core engine
- 防止 UI 直接操作业务状态

> **所有 ui 与 core 的交互，必须通过 adapter。**

---

### 6.2 Adapter 的职责边界

Adapter 允许做的事情：

- 调用 engine.actions
- 订阅 engine.state
- 转换数据结构（如表单值 ↔ 业务结构）

Adapter 禁止做的事情：

- 判断业务是否合法
- 推断业务流程
- 修改业务状态结构

---

### 6.3 Adapter 示例

```js
export function useOrderFormAdapter(engine) {
  const [form] = Form.useForm()

  const submit = async () => {
    const values = await form.validateFields()
    await engine.actions.submit(values)
  }

  return {
    form,
    state: engine.state,
    submit,
  }
}
```

Adapter 是 **UI 与业务的唯一接缝点**。

---

## 7. View 层设计规范

### 7.1 View 的职责

View 是纯展示组件：

- 接收 adapter 提供的数据
- 渲染 antd 组件
- 触发 adapter 方法

### 7.2 View 禁止行为

- 不直接访问 engine
- 不写业务 if/else
- 不维护业务状态

### 7.3 View 示例

```jsx
export function OrderFormView({ form, state, submit }) {
  return (
    <Form form={form}>
      <Button disabled={!state.canSubmit} onClick={submit}>
        Submit
      </Button>
    </Form>
  )
}
```

View 的判断依据 **只能来自 state**。

---

## 8. antd@6 使用规范

### 8.1 封装原则

- antd 只存在于 ui 层
- 不在 core 或 seed 中二次封装业务组件

### 8.2 Form 使用约束

- Form 只负责输入收集
- 校验规则仅限“格式校验”
- 业务校验必须由 core 完成

---

## 9. 定制与扩展策略

### 9.1 推荐定制方式

- 修改 View 结构
- 替换样式与布局
- 扩展 adapter（不修改 core）

### 9.2 不推荐定制方式

- Fork core 逻辑
- 在 UI 中复制业务规则

---

## 10. ui 与 seed 的协作边界

seed 可以：

- 组合多个 ui 组件
- 包裹 ui 组件实现主题与布局

seed 不可以：

- 直接调用 engine action 绕过 adapter
- 在 seed 中模拟业务状态

---

## 11. 测试策略

- Adapter：

  - 基本行为测试

- View：

  - Smoke test

- 不追求 UI 层高覆盖率

---

## 12. 设计总结

ui 层的本质不是“组件封装”，而是：

> **业务内核的可视化表达层。**

通过 adapter 模式与源码交付策略，ui 层在保证业务一致性的同时，最大化了项目的自由度与可维护性。

ui 的成功标准只有一个：

> **UI 可以被随意修改，但业务行为永远不被意外改变。**
