# Quick Start Guide: Terence Project

**Feature**: 002-arch-compliant-init
**Date**: 2026-01-16
**Phase**: Phase 1 - Design

本指南帮助开发者快速上手 Terence 项目,包括初始化、创建 Engine、创建 UI 组件、在 seed 项目中使用。

---

## 目录

1. [项目初始化](#1-项目初始化)
2. [创建 Core Engine](#2-创建-core-engine)
3. [创建 UI 组件](#3-创建-ui-组件)
4. [在 Seed 项目中使用](#4-在-seed-项目中使用)
5. [常见问题](#5-常见问题)
6. [最佳实践](#6-最佳实践)

---

## 1. 项目初始化

### 1.1 创建 Monorepo 结构

```bash
# 创建项目目录
mkdir terence-demo && cd terence-demo

# 初始化 pnpm workspace
pnpm init

# 创建 pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
  - 'packages/examples/*'
EOF

# 创建目录结构
mkdir -p packages/{core,ui,cli,examples/seed}
```

### 1.2 配置 Root package.json

```json
{
  "name": "terence-demo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @terence/seed dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "@vitest/ui": "^1.0.0",
    "eslint": "^9.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 1.3 初始化 Core 包

```bash
cd packages/core

# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "@terence/core",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./index.js"
  },
  "files": [
    "engines",
    "services",
    "guards",
    "adapters",
    "utils",
    "index.js"
  ]
}
EOF

# 创建目录结构
mkdir -p {engines,services,guards,adapters,utils,tests}
```

---

## 2. 创建 Core Engine

### 2.1 创建 OrderEngine

创建文件 `packages/core/engines/order.js`:

```javascript
/**
 * @typedef {Object} OrderItem
 * @property {string} id - 商品 ID
 * @property {string} name - 商品名称
 * @property {number} qty - 数量
 * @property {number} price - 单价
 */

/**
 * @typedef {Object} OrderState
 * @property {OrderItem[]} items - 订单项列表
 * @property {'idle'|'editing'|'submitting'|'completed'|'failed'} status - 订单状态
 * @property {boolean} canSubmit - 是否可以提交
 * @property {number} totalAmount - 订单总金额
 * @property {Error|null} error - 错误信息
 * @property {string} orderId - 订单 ID
 */

/**
 * 创建订单引擎
 * @param {Object} options - 配置选项
 * @param {function(Object): Promise<{id: string}>} options.submitOrder - 提交订单 API
 * @returns {OrderEngine} 引擎实例
 */
export function createOrderEngine(options) {
  // 内部状态 (不可变导出)
  let state = {
    items: [],
    status: 'idle',
    canSubmit: false,
    totalAmount: 0,
    error: null,
    orderId: null
  };

  // 监听器列表
  const listeners = new Set();

  // 通知监听器
  const notify = () => {
    listeners.forEach(listener => listener({ ...state }));
  };

  // 计算总金额
  const calculateTotal = () => {
    return state.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  };

  // Actions
  const actions = {
    /**
     * 添加商品
     * @param {string} id - 商品 ID
     * @param {string} name - 商品名称
     * @param {number} qty - 数量
     * @param {number} price - 单价
     */
    addItem(id, name, qty, price) {
      if (qty <= 0) throw new Error('数量必须大于 0');
      if (price < 0) throw new Error('单价不能为负数');

      const existing = state.items.find(item => item.id === id);

      if (existing) {
        existing.qty += qty;
      } else {
        state.items.push({ id, name, qty, price });
      }

      state.status = 'editing';
      state.totalAmount = calculateTotal();
      state.canSubmit = state.items.length > 0;
      notify();
    },

    /**
     * 移除商品
     * @param {string} id - 商品 ID
     */
    removeItem(id) {
      state.items = state.items.filter(item => item.id !== id);
      state.totalAmount = calculateTotal();
      state.canSubmit = state.items.length > 0;
      notify();
    },

    /**
     * 更新数量
     * @param {string} id - 商品 ID
     * @param {number} qty - 新数量
     */
    updateQty(id, qty) {
      if (qty <= 0) {
        actions.removeItem(id);
        return;
      }

      const item = state.items.find(item => item.id === id);
      if (item) {
        item.qty = qty;
        state.totalAmount = calculateTotal();
        notify();
      }
    },

    /**
     * 提交订单
     */
    async submit() {
      // Guard 校验
      if (state.items.length === 0) {
        throw new Error('不能提交空订单');
      }

      if (state.status !== 'editing') {
        throw new Error(`订单状态 ${state.status} 不允许提交`);
      }

      state.status = 'submitting';
      notify();

      try {
        const result = await options.submitOrder({
          items: state.items,
          totalAmount: state.totalAmount
        });

        state.status = 'completed';
        state.orderId = result.id;
        notify();
      } catch (error) {
        state.status = 'failed';
        state.error = error;
        notify();
        throw error;
      }
    },

    /**
     * 重置订单
     */
    reset() {
      state = {
        items: [],
        status: 'idle',
        canSubmit: false,
        totalAmount: 0,
        error: null,
        orderId: null
      };
      notify();
    }
  };

  // 返回引擎实例
  return {
    get state() {
      return { ...state }; // 只读
    },
    actions,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
```

### 2.2 导出 Engine

创建文件 `packages/core/index.js`:

```javascript
export { createOrderEngine } from './engines/order.js';
```

### 2.3 测试 Engine

创建文件 `packages/core/engines/order.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { createOrderEngine } from './order.js';

describe('OrderEngine', () => {
  it('should create engine with initial state', () => {
    const engine = createOrderEngine({
      submitOrder: async () => ({ id: 'o1' })
    });

    expect(engine.state.items).toEqual([]);
    expect(engine.state.status).toBe('idle');
    expect(engine.state.canSubmit).toBe(false);
  });

  it('should add item', () => {
    const engine = createOrderEngine({
      submitOrder: async () => ({ id: 'o1' })
    });

    engine.actions.addItem('p1', '商品A', 2, 100);

    expect(engine.state.items).toHaveLength(1);
    expect(engine.state.status).toBe('editing');
    expect(engine.state.canSubmit).toBe(true);
  });

  it('should submit order', async () => {
    const mockSubmit = vi.fn().mockResolvedValue({ id: 'ORD-001' });
    const engine = createOrderEngine({
      submitOrder: mockSubmit
    });

    engine.actions.addItem('p1', 'A', 1, 100);
    await engine.actions.submit();

    expect(engine.state.status).toBe('completed');
    expect(engine.state.orderId).toBe('ORD-001');
  });
});
```

---

## 3. 创建 UI 组件

### 3.1 使用 CLI 添加组件

```bash
# 在 seed 项目中
cd packages/examples/seed

# 初始化 UI 环境
terence init

# 添加 OrderForm 组件
terence add OrderForm
```

### 3.2 手动创建 UI 组件

创建文件 `packages/ui/components/OrderForm/OrderForm.view.jsx`:

```jsx
import { Form, Button, Table, InputNumber } from 'antd';

/**
 * 订单表单视图
 * @param {Object} props
 * @property {Object} props.state
 * @property {Object} props.actions
 */
export function OrderFormView({ state, actions }) {
  return (
    <div>
      <Table
        dataSource={state.orderState.items}
        rowKey="id"
        columns={[
          { title: '商品名称', dataIndex: 'name' },
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

      <Button
        type="primary"
        disabled={!state.orderState.canSubmit}
        onClick={actions.submit}
        loading={state.isSubmitting}
      >
        提交订单
      </Button>
    </div>
  );
}
```

创建文件 `packages/ui/components/OrderForm/OrderForm.adapter.js`:

```javascript
import { useState, useEffect } from 'react';

/**
 * 创建 OrderForm adapter
 * @param {Object} engine - Core engine
 */
export function useOrderFormAdapter(engine) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = engine.subscribe((newState) => {
      if (newState.status === 'submitting') {
        setIsSubmitting(true);
      } else {
        setIsSubmitting(false);
      }
    });

    return unsubscribe;
  }, [engine]);

  const actions = {
    addItem: (id, name, qty, price) => {
      engine.actions.addItem(id, name, qty, price);
    },

    removeItem: (id) => {
      engine.actions.removeItem(id);
    },

    updateQty: (id, qty) => {
      engine.actions.updateQty(id, qty);
    },

    submit: async () => {
      try {
        await engine.actions.submit();
      } catch (error) {
        setIsSubmitting(false);
        throw error;
      }
    }
  };

  return {
    state: {
      orderState: engine.state,
      isSubmitting
    },
    actions
  };
}
```

创建文件 `packages/ui/components/OrderForm/index.js`:

```javascript
import { OrderFormView } from './OrderForm.view.jsx';
import { useOrderFormAdapter } from './OrderForm.adapter.js';

export default function OrderForm({ engine }) {
  const adapter = useOrderFormAdapter(engine);

  return <OrderFormView {...adapter} />;
}
```

---

## 4. 在 Seed 项目中使用

### 4.1 配置 Seed 项目

创建文件 `packages/examples/seed/package.json`:

```json
{
  "name": "@terence/seed",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@terence/core": "workspace:*",
    "antd": "^6.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^7.0.0"
  }
}
```

### 4.2 创建 App 组件

创建文件 `packages/examples/seed/src/App.jsx`:

```jsx
import { createOrderEngine } from '@terence/core';
import OrderForm from './ui/OrderForm';

function App() {
  // 创建 engine 实例
  const engine = createOrderEngine({
    submitOrder: async (payload) => {
      console.log('Submitting order:', payload);
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: 'ORD-' + Date.now() };
    }
  });

  return (
    <div style={{ padding: 24 }}>
      <h1>订单管理</h1>
      <OrderForm engine={engine} />
    </div>
  );
}

export default App;
```

### 4.3 运行项目

```bash
cd packages/examples/seed

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 `http://localhost:3000` 查看效果。

---

## 5. 常见问题

### 5.1 如何添加新的 Engine?

1. 在 `packages/core/engines/` 创建新文件
2. 实现 `createXxxEngine` 函数
3. 在 `packages/core/index.js` 导出
4. 编写单元测试

### 5.2 如何添加新的 UI 组件?

1. 在 `packages/ui/components/` 创建组件目录
2. 创建 `.view.jsx`, `.adapter.js`, `.meta.json`
3. 使用 `terence add <ComponentName>` 添加到项目

### 5.3 如何调试架构边界违规?

1. 运行 `pnpm lint` 查看 ESLint 报告
2. 检查错误消息中引用的宪章原则
3. 修复违规并重新运行 lint

### 5.4 Core 包如何发布到 npm?

```bash
cd packages/core
pnpm publish --access public
```

---

## 6. 最佳实践

### 6.1 Engine 开发

- ✅ **状态不可变**: 返回 `{ ...state }` 的副本
- ✅ **单一职责**: Engine 只管理业务状态,不包含 UI 逻辑
- ✅ **完整 JSDoc**: 所有 API 都有类型定义
- ✅ **Guard 校验**: 在 action 执行前校验参数

### 6.2 Adapter 开发

- ✅ **订阅状态**: 使用 `useEffect` + `engine.subscribe`
- ✅ **错误处理**: 捕获 engine 错误并转换
- ✅ **数据转换**: 将 UI 数据转换为 engine 参数
- ✅ **UI 状态**: 只管理 UI 特有的状态

### 6.3 View 开发

- ✅ **纯渲染**: 只包含 JSX 和事件处理
- ✅ **Props 传递**: 只接收 adapter 的 `state` 和 `actions`
- ✅ **antd 组件**: 使用 antd 的 Form, Table, Button 等
- ✅ **样式隔离**: 使用内联样式或 Tailwind CSS

### 6.4 测试

- ✅ **Core 测试优先**: 单元测试覆盖所有 engines/services/guards
- ✅ **Adapter 测试**: 测试状态订阅和 action 调用
- ✅ **View 测试**: Smoke test 确保组件可以渲染
- ✅ **集成测试**: 测试完整的业务流程

---

## 7. 下一步

- 📖 阅读 [`docs/architecture/overall.md`](../../docs/architecture/overall.md) 了解总体架构
- 📖 阅读 [`docs/architecture/core.md`](../../docs/architecture/core.md) 了解 core 设计
- 📖 阅读 [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) 了解项目宪章
- 🔧 运行 `/speckit.tasks` 生成详细任务列表

---

**Happy Coding! 🚀**
