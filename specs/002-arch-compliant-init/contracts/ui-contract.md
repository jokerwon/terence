# UI Component Contract

**Feature**: 002-arch-compliant-init
**Date**: 2026-01-16
**Phase**: Phase 1 - Design

本文档定义 UI 组件的契约,包括 Adapter-View 分离规范、文件结构、接口定义和最佳实践。

---

## 1. 组件结构契约

### 1.1 文件结构

每个 UI 组件必须包含以下文件:

```
<ComponentName>/
├── <ComponentName>.view.jsx      # 纯 UI 视图 (必需)
├── <ComponentName>.adapter.js    # Core 适配层 (必需)
├── <ComponentName>.logic.js      # UI 内部状态 (可选)
├── meta.json                     # 组件元信息 (必需)
└── index.js                      # 导出入口 (必需)
```

### 1.2 文件职责

| 文件 | 职责 | 依赖 |
|------|------|------|
| `.view.jsx` | 渲染 UI,处理用户交互 | React, antd, adapter |
| `.adapter.js` | 连接 core 和 view,转换数据 | @terence/core |
| `.logic.js` | 管理 UI 内部状态 (可选) | 无 |
| `meta.json` | 组件元信息和版本 | 无 |
| `index.js` | 导出组件 | view, adapter, logic |

---

## 2. View 契约

### 2.1 职责定义

**View MUST 只做**:
- ✅ 渲染 JSX 和 antd 组件
- ✅ 触发 adapter 提供的方法
- ✅ 根据 adapter 传入的状态渲染 UI

**View MUST NOT**:
- ❌ 直接访问 core engine
- ❌ 编写业务规则判断 (if/else based on business logic)
- ❌ 维护业务状态
- ❌ 直接调用 API

### 2.2 Props 契约

```javascript
/**
 * @typedef {Object} OrderFormViewProps
 * @property {OrderFormAdapterState} state - Adapter 状态
 * @property {OrderFormAdapterActions} actions - Adapter 操作
 * @property {Object} [styles] - 自定义样式 (可选)
 * @property {Object} [className] - 自定义类名 (可选)
 */
```

### 2.3 实现示例

```jsx
// OrderForm.view.jsx
import { Form, Button, Table, InputNumber } from 'antd';

/**
 * 订单表单视图组件
 * @param {OrderFormViewProps} props
 */
export function OrderFormView({ state, actions, styles }) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await actions.submit();
    } catch (error) {
      // Form validation error
    }
  };

  return (
    <div style={styles}>
      <Form form={form}>
        {/* 商品列表 */}
        <Table
          dataSource={state.orderState.items}
          columns={[
            {
              title: '商品名称',
              dataIndex: 'name',
              key: 'name'
            },
            {
              title: '数量',
              render: (_, record) => (
                <InputNumber
                  min={1}
                  value={record.qty}
                  onChange={(qty) => actions.updateQty(record.id, qty)}
                />
              )
            },
            {
              title: '操作',
              render: (_, record) => (
                <Button onClick={() => actions.removeItem(record.id)}>
                  删除
                </Button>
              )
            }
          ]}
        />

        {/* 提交按钮 */}
        <Button
          type="primary"
          disabled={!state.orderState.canSubmit}
          onClick={handleSubmit}
          loading={state.isSubmitting}
        >
          提交订单
        </Button>
      </Form>

      {/* 状态提示 */}
      {state.orderState.status === 'completed' && (
        <div>订单提交成功! ID: {state.orderState.orderId}</div>
      )}

      {state.orderState.error && (
        <div>错误: {state.orderState.error.message}</div>
      )}
    </div>
  );
}
```

### 2.4 View 规范

**规则**:

1. **Props 来源**: 只接收 adapter 提供的 `state` 和 `actions`
2. **判断逻辑**: 所有判断基于 `state.*`,无业务 if/else
3. **事件处理**: 只调用 `actions.*`,不直接操作业务
4. **样式**: 使用内联样式或 Tailwind CSS,避免 CSS modules

**验证清单**:

- [ ] View 不导入 `@terence/core/engines/*`
- [ ] View 不导入 `@terence/core/services/*`
- [ ] View 只通过 adapter 与 core 交互
- [ ] View 的所有判断基于 `state.*`

---

## 3. Adapter 契约

### 3.1 职责定义

**Adapter MUST 只做**:
- ✅ 调用 `engine.actions.*`
- ✅ 订阅 `engine.state`
- ✅ 转换数据结构 (如表单值 ↔ 业务结构)
- ✅ 捕获并转换错误

**Adapter MUST NOT**:
- ❌ 判断业务是否合法
- ❌ 推断业务流程
- ❌ 修改业务状态结构
- ❌ 包含 UI 渲染逻辑

### 3.2 API 契约

```javascript
/**
 * 创建 OrderForm adapter
 * @param {OrderEngine} engine - Core engine 实例
 * @returns {{ state: OrderFormAdapterState, actions: OrderFormAdapterActions }}
 */
export function useOrderFormAdapter(engine) {
  // implementation
}
```

### 3.3 状态转换

```javascript
/**
 * @typedef {Object} OrderFormAdapterState
 * @property {OrderState} orderState - Core engine 的状态 (直接透传)
 * @property {boolean} isSubmitting - UI 提交中状态
 * @property {string[]} touchedFields - 已触摸的字段
 * @property {Map<string, string>} fieldErrors - 字段错误信息
 */
```

**转换规则**:

| Core State | Adapter State | 转换逻辑 |
|------------|---------------|----------|
| `state.status === 'submitting'` | `isSubmitting: true` | 直接映射 |
| `state.error` | `fieldErrors: Map` | 转换为表单错误 |

### 3.4 操作适配

```javascript
/**
 * @typedef {Object} OrderFormAdapterActions
 * @property {function(string, string, number, number): void} addItem - 包装 engine.actions.addItem
 * @property {function(string): void} removeItem - 包装 engine.actions.removeItem
 * @property {function(string, number): void} updateQty - 包装 engine.actions.updateQty
 * @property {function(): Promise<void>} submit - 包装 engine.actions.submit,添加错误处理
 * @property {function(): void} reset - 包装 engine.actions.reset
 */
```

### 3.5 实现示例

```javascript
// OrderForm.adapter.js
import { useState, useEffect } from 'react';

/**
 * 创建 OrderForm adapter
 * @param {OrderEngine} engine - Core engine 实例
 */
export function useOrderFormAdapter(engine) {
  // UI 特有状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState(new Set());
  const [fieldErrors, setFieldErrors] = useState(new Map());

  // 订阅 engine 状态变化
  useEffect(() => {
    const unsubscribe = engine.subscribe((newState) => {
      // 更新 UI 状态
      if (newState.status === 'submitting') {
        setIsSubmitting(true);
      } else {
        setIsSubmitting(false);
      }

      // 转换错误信息
      if (newState.error) {
        setFieldErrors(new Map([['submit', newState.error.message]]));
      } else {
        setFieldErrors(new Map());
      }
    });

    return unsubscribe;
  }, [engine]);

  // 包装 engine actions,添加错误处理
  const actions = {
    addItem: (id, name, qty, price) => {
      engine.actions.addItem(id, name, qty, price);
      setTouchedFields(prev => new Set([...prev, `item-${id}`]));
    },

    removeItem: (id) => {
      engine.actions.removeItem(id);
      setTouchedFields(prev => {
        const next = new Set(prev);
        next.delete(`item-${id}`);
        return next;
      });
    },

    updateQty: (id, qty) => {
      engine.actions.updateQty(id, qty);
    },

    submit: async () => {
      try {
        await engine.actions.submit();
      } catch (error) {
        // Engine 会更新 state.error,这里只需确保 UI 状态正确
        setIsSubmitting(false);
        throw error;
      }
    },

    reset: () => {
      engine.actions.reset();
      setIsSubmitting(false);
      setTouchedFields(new Set());
      setFieldErrors(new Map());
    }
  };

  return {
    state: {
      orderState: engine.state,
      isSubmitting,
      touchedFields,
      fieldErrors
    },
    actions
  };
}
```

### 3.6 Adapter 规范

**规则**:

1. **状态订阅**: 使用 `useEffect` + `engine.subscribe` 订阅状态变化
2. **错误处理**: 捕获 engine 错误,转换为 UI 友好的格式
3. **数据转换**: 将 antd Form 的值转换为 engine 参数
4. **UI 状态**: 只管理 UI 特有的状态,不包含业务逻辑

**验证清单**:

- [ ] Adapter 导入 `@terence/core/engines/*`
- [ ] Adapter 不包含 JSX
- [ ] Adapter 的所有业务操作通过 `engine.actions.*`
- [ ] Adapter 不判断业务是否合法

---

## 4. Logic 契约 (可选)

### 4.1 职责定义

**Logic MUST 只管理**:
- ✅ UI 内部状态 (如模态框可见性)
- ✅ UI 特有的交互逻辑 (如拖拽排序)
- ✅ 无业务含义的临时状态

**Logic MUST NOT**:
- ❌ 包含业务逻辑
- ❌ 直接访问 core engine
- ❌ 包含 API 调用

### 4.2 实现示例

```javascript
// OrderForm.logic.js
import { useState } from 'react';

/**
 * 创建 OrderForm logic
 * @returns {{ state: OrderFormLogicState, actions: OrderFormLogicActions }}
 */
export function createOrderFormLogic() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const actions = {
    openModal: () => setIsModalVisible(true),
    closeModal: () => setIsModalVisible(false),
    selectItem: (id) => setSelectedItemId(id),
    toggleSummary: () => setShowSummary(prev => !prev)
  };

  return {
    state: {
      isModalVisible,
      selectedItemId,
      showSummary
    },
    actions
  };
}
```

---

## 5. 组件导出契约

### 5.1 index.js

```javascript
// index.js
export { OrderFormView } from './OrderForm.view.jsx';
export { useOrderFormAdapter } from './OrderForm.adapter.js';
export { createOrderFormLogic } from './OrderForm.logic.js';

// 默认导出:组合后的组件
import { OrderFormView } from './OrderForm.view.jsx';
import { useOrderFormAdapter } from './OrderForm.adapter.js';
import { createOrderFormLogic } from './OrderForm.logic.js';

export default function OrderForm({ engine, ...props }) {
  const adapter = useOrderFormAdapter(engine);
  const logic = createOrderFormLogic();

  return (
    <OrderFormView
      {...props}
      state={{ ...adapter.state, ...logic.state }}
      actions={{ ...adapter.actions, ...logic.actions }}
    />
  );
}
```

### 5.2 使用示例

```javascript
// 在 seed 项目中使用
import { createOrderEngine } from '@terence/core';
import OrderForm from './ui/OrderForm';

function App() {
  const engine = createOrderEngine({
    submitOrder: async (payload) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return response.json();
    }
  });

  return (
    <OrderForm engine={engine} />
  );
}
```

---

## 6. antd 使用规范

### 6.1 Form 使用

**Form 职责**:
- ✅ 收集用户输入
- ✅ 格式校验 (如 `required`, `type: 'email'`)
- ✅ 显示字段错误

**Form 不负责**:
- ❌ 业务校验 (如"库存是否足够")
- ❌ 业务流程控制

```jsx
<Form form={form}>
  <Form.Item
    name="qty"
    rules={[
      { required: true, message: '请输入数量' },
      { type: 'number', min: 1, message: '数量必须大于 0' }
    ]}
  >
    <InputNumber />
  </Form.Item>
</Form>
```

### 6.2 Table 使用

```jsx
<Table
  dataSource={state.orderState.items}
  columns={[
    {
      title: '商品名称',
      dataIndex: 'name'
    },
    {
      title: '数量',
      render: (_, record) => (
        <InputNumber
          value={record.qty}
          onChange={(qty) => actions.updateQty(record.id, qty)}
        />
      )
    }
  ]}
/>
```

### 6.3 Button 使用

```jsx
<Button
  type="primary"
  disabled={!state.orderState.canSubmit}  // 基于 core state
  onClick={actions.submit}                 // 调用 adapter action
  loading={state.isSubmitting}             // 基于 adapter state
>
  提交订单
</Button>
```

---

## 7. 数据流契约

### 7.1 单向数据流

```
User Input
    ↓
View (antd Form)
    ↓ onChange/onSubmit
Adapter (useOrderFormAdapter)
    ↓ 转换数据格式
Engine (createOrderEngine)
    ↓ 执行业务逻辑
State (OrderState)
    ↑ 订阅更新
Adapter (重新计算)
    ↑ 转换为 view 格式
View (重新渲染)
```

### 7.2 数据转换示例

**Form → Engine**:

```javascript
// antd Form values
const formValues = {
  productId: 'p1',
  productName: '商品A',
  quantity: 2,
  price: 100
};

// Adapter 转换
actions.addItem(
  formValues.productId,
  formValues.productName,
  formValues.quantity,
  formValues.price
);
```

**Engine → View**:

```javascript
// Engine state
const engineState = {
  items: [
    { id: 'p1', name: '商品A', qty: 2, price: 100 }
  ],
  status: 'editing',
  canSubmit: true
};

// Adapter 透传
const adapterState = {
  orderState: engineState  // 直接透传
};

// View 使用
<Table dataSource={adapterState.orderState.items} />
```

---

## 8. 错误处理契约

### 8.1 Core 错误

```javascript
// Engine 抛出错误
try {
  await engine.actions.submit();
} catch (error) {
  // error.message: "库存不足"
  // state.error: Error instance
}
```

### 8.2 Adapter 错误转换

```javascript
// Adapter 捕获并转换
const submit = async () => {
  try {
    await engine.actions.submit();
  } catch (error) {
    setFieldError('submit', error.message);
    setIsSubmitting(false);
  }
};
```

### 8.3 View 错误展示

```jsx
{state.fieldErrors.has('submit') && (
  <div className="error">
    {state.fieldErrors.get('submit')}
  </div>
)}
```

---

## 9. 测试契约

### 9.1 Adapter 测试

```javascript
import { renderHook } from '@testing-library/react';
import { useOrderFormAdapter } from './OrderForm.adapter';

describe('useOrderFormAdapter', () => {
  it('should subscribe to engine state', () => {
    const engine = createOrderEngine({ submitOrder: async () => {} });
    const { result } = renderHook(() => useOrderFormAdapter(engine));

    expect(result.current.state.orderState.status).toBe('idle');
  });

  it('should call engine actions', () => {
    const engine = createOrderEngine({ submitOrder: async () => {} });
    const { result } = renderHook(() => useOrderFormAdapter(engine));

    act(() => {
      result.current.actions.addItem('p1', 'A', 1, 100);
    });

    expect(engine.state.items).toHaveLength(1);
  });
});
```

### 9.2 View 测试 (Smoke Test)

```javascript
import { render } from '@testing-library/react';
import { OrderFormView } from './OrderForm.view.jsx';

describe('OrderFormView', () => {
  it('should render without crashing', () => {
    const mockState = {
      orderState: { items: [], status: 'idle', canSubmit: false },
      isSubmitting: false
    };
    const mockActions = {
      addItem: vi.fn(),
      removeItem: vi.fn(),
      submit: vi.fn()
    };

    render(<OrderFormView state={mockState} actions={mockActions} />);
    // Smoke test: no errors thrown
  });
});
```

---

## 10. 性能要求

| 指标 | 要求 | 备注 |
|------|------|------|
| 首次渲染 | < 100ms | View 组件 |
| 状态更新 | < 16ms (60fps) | Adapter 订阅 |
| 交互响应 | < 100ms | Button 点击等 |

---

## 11. 可访问性

### 11.1 ARIA 属性

```jsx
<Button
  aria-label="提交订单"
  disabled={!state.orderState.canSubmit}
  onClick={actions.submit}
>
  提交订单
</Button>
```

### 11.2 键盘导航

- ✅ Table 支持键盘选择
- ✅ Form 支持键盘导航
- ✅ Button 支持快捷键

---

## 12. 总结

本 UI 组件契约文档定义了:

1. **文件结构**: view/adapter/logic/meta/index
2. **职责分离**: View 只渲染,Adapter 只对接,Logic 只管 UI 状态
3. **接口定义**: Props、State、Actions 的类型契约
4. **数据流**: 单向数据流,Engine → Adapter → View
5. **错误处理**: Core → Adapter → View 的错误转换
6. **测试契约**: Adapter 单元测试,View smoke test
7. **性能要求**: 渲染和响应时间限制
8. **可访问性**: ARIA 属性和键盘导航

**下一步**: 创建快速入门指南 (`quickstart.md`)。
