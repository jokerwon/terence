# Core API Contract

**Feature**: 002-arch-compliant-init
**Date**: 2026-01-16
**Phase**: Phase 1 - Design

本文档定义 Core 包的 API 契约,包括 Engine、Guard、Service 的接口规范。

---

## 1. Engine API

### 1.1 createOrderEngine

创建订单引擎实例。

**Signature**:

```javascript
/**
 * @param {Object} options - 配置选项
 * @param {OrderEngineOptions['submitOrder']} options.submitOrder - 提交订单 API
 * @param {OrderEngineOptions['checkStock']} [options.checkStock] - 检查库存 API (可选)
 * @returns {OrderEngine} 引擎实例
 */
function createOrderEngine(options)
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `submitOrder` | `function(Object): Promise<{id: string}>` | ✅ | 提交订单的异步 API |
| `checkStock` | `function(string): Promise<{stock: number}>` | ❌ | 检查库存的异步 API |

**Returns**:

```javascript
/**
 * @typedef {Object} OrderEngine
 * @property {OrderState} state - 当前状态 (只读)
 * @property {OrderActions} actions - 可执行的操作
 * @property {function(function(OrderState): void): function()} subscribe - 订阅状态变化
 */
```

**Example**:

```javascript
const engine = createOrderEngine({
  submitOrder: async (payload) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('提交失败');
    return response.json();
  },
  checkStock: async (productId) => {
    const response = await fetch(`/api/products/${productId}/stock`);
    return response.json();
  }
});

console.log(engine.state); // { items: [], status: 'idle', canSubmit: false, ... }
```

---

### 1.2 OrderEngine.state

引擎的当前状态,只读属性。

**Type**: `OrderState`

```javascript
/**
 * @typedef {Object} OrderState
 * @property {OrderItem[]} items - 订单项列表
 * @property {'idle'|'editing'|'submitting'|'completed'|'failed'} status - 订单状态
 * @property {boolean} canSubmit - 是否可以提交
 * @property {number} totalAmount - 订单总金额
 * @property {Error|null} error - 错误信息
 * @property {string} orderId - 提交成功后的订单 ID
 */
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `items` | `OrderItem[]` | 订单项列表,初始为空数组 |
| `status` | `'idle' \| 'editing' \| 'submitting' \| 'completed' \| 'failed'` | 当前订单状态 |
| `canSubmit` | `boolean` | 是否可以提交,由 guard 计算 |
| `totalAmount` | `number` | 订单总金额,自动计算 |
| `error` | `Error \| null` | 提交失败时的错误信息 |
| `orderId` | `string` | 提交成功后的订单 ID |

**Invariants**:

- `items.length === 0` → `canSubmit === false`
- `status === 'submitting'` → `canSubmit === false`
- `totalAmount === sum(items.map(i => i.qty * i.price))`
- `status === 'completed'` → `orderId !== undefined`

---

### 1.3 OrderEngine.actions

可执行的操作集合,是修改状态的唯一入口。

**Type**: `OrderActions`

```javascript
/**
 * @typedef {Object} OrderActions
 * @property {function(string, string, number, number): void} addItem - 添加商品
 * @property {function(string): void} removeItem - 移除商品
 * @property {function(string, number): void} updateQty - 更新数量
 * @property {function(): Promise<void>} submit - 提交订单
 * @property {function(): void} reset - 重置订单
 */
```

---

#### addItem(id, name, qty, price)

添加新商品或更新现有商品的数量。

**Signature**:

```javascript
/**
 * @param {string} id - 商品 ID
 * @param {string} name - 商品名称
 * @param {number} qty - 数量,必须 > 0
 * @param {number} price - 单价,必须 >= 0
 * @throws {Error} 如果 qty <= 0
 * @throws {Error} 如果 price < 0
 * @returns {void}
 */
actions.addItem(id, name, qty, price)
```

**Side Effects**:

- 如果商品已存在,更新数量
- 触发状态转换: `idle` → `editing`, `editing` → `editing`
- 重新计算 `totalAmount`
- 如果 `items.length > 0`,设置 `canSubmit = true`

**Example**:

```javascript
engine.actions.addItem('p1', '商品A', 2, 100);
// state.items: [{ id: 'p1', name: '商品A', qty: 2, price: 100 }]
// state.status: 'editing'
// state.totalAmount: 200
// state.canSubmit: true

engine.actions.addItem('p1', '商品A', 3, 100);
// state.items: [{ id: 'p1', name: '商品A', qty: 5, price: 100 }]
```

---

#### removeItem(id)

移除指定商品。

**Signature**:

```javascript
/**
 * @param {string} id - 商品 ID
 * @returns {void}
 */
actions.removeItem(id)
```

**Side Effects**:

- 从 `items` 中移除指定商品
- 重新计算 `totalAmount`
- 如果 `items.length === 0`,设置 `canSubmit = false`

**Example**:

```javascript
engine.actions.removeItem('p1');
// state.items: []
// state.canSubmit: false
```

---

#### updateQty(id, qty)

更新商品数量。

**Signature**:

```javascript
/**
 * @param {string} id - 商品 ID
 * @param {number} qty - 新数量
 * @throws {Error} 如果 qty <= 0
 * @returns {void}
 */
actions.updateQty(id, qty)
```

**Side Effects**:

- 更新指定商品的数量
- 如果 `qty <= 0`,自动移除商品
- 重新计算 `totalAmount`

**Example**:

```javascript
engine.actions.updateQty('p1', 5);
// state.items: [{ id: 'p1', ..., qty: 5 }]

engine.actions.updateQty('p1', 0);
// state.items: [] (自动移除)
```

---

#### submit()

提交订单。

**Signature**:

```javascript
/**
 * @throws {Error} 如果订单为空 (guard 阻止)
 * @throws {Error} 如果状态不是 editing (guard 阻止)
 * @throws {Error} 如果 API 调用失败
 * @returns {Promise<void>}
 */
actions.submit()
```

**Preconditions** (Guard):

- `items.length > 0` (订单不能为空)
- `status === 'editing'` (只能在编辑状态提交)

**Side Effects**:

- 状态转换: `editing` → `submitting` → `completed` / `failed`
- 调用 `submitOrder` API
- 成功时设置 `orderId`,状态变为 `completed`
- 失败时设置 `error`,状态变为 `failed`

**Example**:

```javascript
try {
  await engine.actions.submit();
  // state.status: 'completed'
  // state.orderId: 'ORD-2024-001'
} catch (error) {
  // state.status: 'failed'
  // state.error: Error instance
}
```

---

#### reset()

重置订单到初始状态。

**Signature**:

```javascript
/**
 * @returns {void}
 */
actions.reset()
```

**Side Effects**:

- 重置所有状态字段到初始值
- 清空 `items`, `error`, `orderId`
- 状态变为 `idle`

**Example**:

```javascript
engine.actions.reset();
// state: { items: [], status: 'idle', canSubmit: false, ... }
```

---

### 1.4 OrderEngine.subscribe

订阅状态变化。

**Signature**:

```javascript
/**
 * @param {function(OrderState): void} listener - 状态变化监听器
 * @returns {function(): void} 取消订阅函数
 */
engine.subscribe(listener)
```

**Behavior**:

- 每次状态变化时调用监听器
- 返回取消订阅函数
- 支持多个监听器

**Example**:

```javascript
const unsubscribe = engine.subscribe((newState) => {
  console.log('State changed:', newState.status);
});

// 稍后取消订阅
unsubscribe();
```

---

## 2. Guard API

### 2.1 assertCanSubmit

校验是否可以提交订单。

**Signature**:

```javascript
/**
 * 校验是否可以提交订单
 * @param {OrderState} state - 当前状态
 * @throws {Error} 如果不能提交
 * @returns {void}
 */
function assertCanSubmit(state)
```

**Validation Rules**:

| Rule | Error Message |
|------|---------------|
| `items.length === 0` | `"不能提交空订单"` |
| `status !== 'editing'` | `"订单状态 ${state.status} 不允许提交"` |
| `items.some(i => i.qty <= 0)` | `"商品数量必须大于 0"` |

**Example**:

```javascript
import { assertCanSubmit } from '@terence/core/guards';

try {
  assertCanSubmit(engine.state);
  console.log('可以提交');
} catch (error) {
  console.error('不能提交:', error.message);
}
```

---

### 2.2 assertValidItem

校验订单项是否有效。

**Signature**:

```javascript
/**
 * 校验订单项是否有效
 * @param {OrderItem} item - 订单项
 * @throws {Error} 如果订单项无效
 * @returns {void}
 */
function assertValidItem(item)
```

**Validation Rules**:

| Field | Rule | Error Message |
|-------|------|---------------|
| `qty` | `qty > 0` | `"商品数量必须大于 0"` |
| `price` | `price >= 0` | `"单价不能为负数"` |
| `id` | `typeof id === 'string'` | `"商品 ID 必须是字符串"` |

---

## 3. Service API

### 3.1 PricingService

定价服务,计算订单折扣和总金额。

#### calculateTotal(items)

计算订单总金额。

**Signature**:

```javascript
/**
 * 计算订单总金额
 * @param {OrderItem[]} items - 订单项列表
 * @returns {number} 总金额
 */
function calculateTotal(items)
```

**Example**:

```javascript
import { calculateTotal } from '@terence/core/services/pricing';

const total = calculateTotal([
  { id: 'p1', name: 'A', qty: 2, price: 100 },
  { id: 'p2', name: 'B', qty: 1, price: 50 }
]);
// total: 250
```

---

#### calculateDiscount(items, rules)

计算订单折扣。

**Signature**:

```javascript
/**
 * 计算订单折扣
 * @param {OrderItem[]} items - 订单项列表
 * @param {PricingRule[]} rules - 定价规则
 * @returns {number} 折扣后的总金额
 */
function calculateDiscount(items, rules)
```

**Parameters**:

```javascript
/**
 * @typedef {Object} PricingRule
 * @property {string} id - 规则 ID
 * @property {'discount'|'bulk'|'coupon'} type - 规则类型
 * @property {number} value - 折扣值或百分比
 * @property {function(OrderItem[]): boolean} condition - 应用条件
 */
```

**Example**:

```javascript
const rules = [
  {
    id: 'bulk-10',
    type: 'bulk',
    value: 0.1,
    condition: (items) => items.length >= 3
  }
];

const discounted = calculateDiscount(items, rules);
```

---

## 4. Utils API

### 4.1 invariant

断言工具,用于运行时校验。

**Signature**:

```javascript
/**
 * 断言工具
 * @param {boolean} condition - 条件
 * @param {string} message - 错误消息
 * @throws {Error} 如果条件为 false
 * @returns {void}
 */
function invariant(condition, message)
```

**Example**:

```javascript
import { invariant } from '@terence/core/utils';

invariant(typeof id === 'string', 'ID must be a string');
invariant(qty > 0, 'Quantity must be positive');
```

---

## 5. 导出结构

### 5.1 公共 API

```javascript
// packages/core/index.js

// Engines
export { createOrderEngine } from './engines/order.js';

// Guards
export { assertCanSubmit, assertValidItem } from './guards/orderGuard.js';

// Services
export { calculateTotal, calculateDiscount } from './services/pricing.js';

// Utils
export { invariant } from './utils/invariant.js';

// Types (JSDoc)
export { OrderState, OrderItem, OrderEngine } from './types.js';
```

---

### 5.2 内部 API

```javascript
// packages/core/engines/internal.js (不导出)

/**
 * 内部辅助函数
 * @internal
 */
export function calculateItemTotal(item) {
  return item.qty * item.price;
}
```

---

## 6. 错误代码

| Code | Message | HTTP 类比 |
|------|---------|----------|
| `EMPTY_ORDER` | `"不能提交空订单"` | 400 |
| `INVALID_STATUS` | `"订单状态不允许提交"` | 409 |
| `INVALID_QTY` | `"商品数量必须大于 0"` | 400 |
| `INVALID_PRICE` | `"单价不能为负数"` | 400 |
| `SUBMIT_FAILED` | `"订单提交失败"` | 500 |

---

## 7. 版本兼容性

### 7.1 SemVer 策略

- **MAJOR**: 破坏性 API 变化 (如删除字段、改变签名)
- **MINOR**: 新增 API,向后兼容
- **PATCH**: Bug 修复,内部实现优化

### 7.2 弃用策略

```javascript
/**
 * @deprecated 使用 addItem 替代
 * @param {Object} item - 订单项
 */
function addOrderItem(item) {
  console.warn('addOrderItem is deprecated, use addItem instead');
  // redirect to addItem
}
```

---

## 8. 测试契约

### 8.1 单元测试要求

每个导出的 API 必须有单元测试:

- ✅ 正常路径
- ✅ 边界条件
- ✅ 错误路径
- ✅ 副作用验证

### 8.2 契约测试

```javascript
describe('OrderEngine API Contract', () => {
  it('should return { state, actions } structure', () => {
    const engine = createOrderEngine({ submitOrder: async () => {} });
    expect(engine).toHaveProperty('state');
    expect(engine).toHaveProperty('actions');
    expect(engine).toHaveProperty('subscribe');
  });

  it('should have readonly state', () => {
    const engine = createOrderEngine({ submitOrder: async () => {} });
    expect(() => {
      engine.state.items = [];
    }).toThrow();
  });
});
```

---

## 9. 性能要求

| 操作 | 最大耗时 | 备注 |
|------|---------|------|
| `createOrderEngine` | 10ms | 引擎初始化 |
| `actions.addItem` | 1ms | 单次操作 |
| `actions.submit` | 取决于 API | 异步操作 |
| `subscribe` | 1ms | 订阅注册 |
| 状态更新通知 | 5ms | 监听器调用 |

---

## 10. 总结

本 API 契约文档定义了:

1. **Engine API**: 创建、状态、操作、订阅
2. **Guard API**: 业务校验规则
3. **Service API**: 纯业务服务
4. **Utils API**: 通用工具函数
5. **导出结构**: 公共 API 和内部 API
6. **错误处理**: 错误代码和消息
7. **版本兼容性**: SemVer 策略和弃用机制
8. **测试契约**: 单元测试和契约测试要求
9. **性能要求**: 操作耗时限制

**下一步**: 创建 CLI 命令契约文档 (`contracts/cli-commands.md`)。
