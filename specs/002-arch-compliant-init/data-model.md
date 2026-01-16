# Data Model: Architecture-Compliant Project Initialization

**Feature**: 002-arch-compliant-init
**Date**: 2026-01-16
**Phase**: Phase 1 - Design

本文档定义系统的数据模型、实体关系和状态转换,涵盖 Core 包的状态模型、UI 组件的数据结构和配置文件的 schema。

---

## 1. Core 包数据模型

### 1.1 OrderEngine 状态模型

**Entity**: OrderState

订单引擎的状态,包含订单项、状态、错误信息等。

```javascript
/**
 * @typedef {Object} OrderItem
 * @property {string} id - 商品 ID
 * @property {string} name - 商品名称
 * @property {number} qty - 数量,必须 > 0
 * @property {number} price - 单价,必须 >= 0
 * @property {string} [image] - 商品图片 URL (可选)
 */

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

**状态字段说明**:

| 字段 | 类型 | 说明 | 示例值 |
|------|------|------|--------|
| `items` | OrderItem[] | 订单项列表,初始为空数组 | `[{ id: 'p1', name: '商品A', qty: 2, price: 100 }]` |
| `status` | enum | 订单状态,单向流转 | `'idle'` → `'editing'` → `'submitting'` → `'completed'` |
| `canSubmit` | boolean | 是否可以提交,由 guard 计算 | `items.length > 0` |
| `totalAmount` | number | 订单总金额,自动计算 | `sum(item.qty * item.price)` |
| `error` | Error \| null | 错误信息,提交失败时设置 | `new Error('库存不足')` |
| `orderId` | string | 提交成功后的订单 ID | `'ORD-2024-001'` |

**状态转换图**:

```
idle (初始状态)
  ↓ addItem
editing (编辑中)
  ↓ addItem / removeItem / updateQty
editing (继续编辑)
  ↓ submit + guard 通过
submitting (提交中)
  ↓ API 成功
completed (完成)
  ↓ API 失败
failed (失败)
  ↓ addItem (重新编辑)
editing (返回编辑)
```

**非法转换** (Guard 阻止):
- ❌ `idle` → `submitting` (无订单项)
- ❌ `submitting` → `editing` (提交中不能编辑)
- ❌ `completed` → `completed` (已完成不能再次提交)

**验证规则**:

| 字段 | 规则 | 错误消息 |
|------|------|----------|
| `items.qty` | `qty > 0` | `"数量必须大于 0"` |
| `items.price` | `price >= 0` | `"单价不能为负数"` |
| `items` | `items.length > 0` (提交时) | `"不能提交空订单"` |

---

### 1.2 Engine API 契约

```javascript
/**
 * 创建订单引擎
 * @param {Object} options - 配置选项
 * @param {function(Object): Promise<{id: string}>} options.submitOrder - 提交订单 API
 * @param {function(string): Promise<{stock: number}>} [options.checkStock] - 检查库存 API (可选)
 * @returns {OrderEngine} 订单引擎实例
 *
 * @example
 * const engine = createOrderEngine({
 *   submitOrder: async (payload) => {
 *     const response = await fetch('/api/orders', {
 *       method: 'POST',
 *       body: JSON.stringify(payload)
 *     });
 *     return response.json();
 *   }
 * });
 */
export function createOrderEngine(options) {
  // implementation
}

/**
 * @typedef {Object} OrderEngine
 * @property {OrderState} state - 当前状态 (只读)
 * @property {OrderActions} actions - 可执行的操作
 * @property {function(function(OrderState): void): function()} subscribe - 订阅状态变化
 */
```

**Actions API**:

```javascript
/**
 * @typedef {Object} OrderActions
 * @property {function(string, string, number, number): void} addItem - 添加商品
 * @property {function(string): void} removeItem - 移除商品
 * @property {function(string, number): void} updateQty - 更新数量
 * @property {function(): Promise<void>} submit - 提交订单
 * @property {function(): void} reset - 重置订单
 */

// addItem(id, name, qty, price)
// - 添加新商品或更新现有商品的数量
// - 触发状态转换: idle → editing, editing → editing
// - 自动计算 totalAmount

// removeItem(id)
// - 移除指定商品
// - 如果 items 为空,canSubmit 变为 false

// updateQty(id, qty)
// - 更新商品数量
// - 如果 qty <= 0,自动移除商品

// submit()
// - 提交订单
// - 状态转换: editing → submitting → completed/failed
// - 调用 submitOrder API
// - 失败时设置 error 字段

// reset()
// - 重置到初始状态 (idle)
// - 清空 items, error, orderId
```

---

### 1.3 Service 数据模型

**PricingService** (定价服务):

```javascript
/**
 * @typedef {Object} PricingRule
 * @property {string} id - 规则 ID
 * @property {string} type - 规则类型: 'discount' | 'bulk' | 'coupon'
 * @property {number} value - 折扣值或百分比
 * @property {function(OrderItem[]): boolean} condition - 应用条件
 * @property {function(number): number} calculate - 计算折扣
 */

/**
 * 计算订单折扣
 * @param {OrderItem[]} items - 订单项
 * @param {PricingRule[]} rules - 定价规则
 * @returns {number} 折扣后的总金额
 */
export function calculateDiscount(items, rules) {
  // implementation
}
```

---

## 2. UI 组件数据模型

### 2.1 OrderForm 组件结构

**Entity**: OrderFormComponent

订单表单组件,包含 view、adapter、logic 三个文件。

**文件结构**:

```
OrderForm/
├── OrderForm.view.jsx      # 纯 UI 视图
├── OrderForm.adapter.js    # Core 适配层
├── OrderForm.logic.js      # UI 内部状态 (可选)
├── meta.json               # 组件元信息
└── index.js                # 导出入口
```

---

### 2.2 Adapter 数据模型

```javascript
/**
 * @typedef {Object} OrderFormAdapterState
 * @property {OrderState} orderState - Core engine 的状态
 * @property {boolean} isSubmitting - UI 提交中状态
 * @property {string[]} touchedFields - 已触摸的字段 (用于表单验证)
 * @property {Map<string, string>} fieldErrors - 字段错误信息
 */

/**
 * @typedef {Object} OrderFormAdapterActions
 * @property {function(string, string, number, number): void} addItem - 添加商品
 * @property {function(string): void} removeItem - 移除商品
 * @property {function(string, number): void} updateQty - 更新数量
 * @property {function(): Promise<void>} submit - 提交订单
 * @property {function(): void} reset - 重置表单
 */

/**
 * 创建 OrderForm adapter
 * @param {OrderEngine} engine - Core engine 实例
 * @returns {{ state: OrderFormAdapterState, actions: OrderFormAdapterActions }}
 */
export function useOrderFormAdapter(engine) {
  // implementation
}
```

**Adapter 职责**:

1. **状态转换**: 将 `engine.state` 转换为 view 可消费的格式
2. **数据映射**: 将 antd Form 的值转换为 engine.actions 的参数
3. **错误处理**: 捕获 engine 的错误,转换为 view 的错误提示
4. **UI 状态**: 管理 UI 特有的状态 (如 `isSubmitting`, `touchedFields`)

**数据流示例**:

```
View (antd Form)
  ↓ onChange / onSubmit
Adapter (useOrderFormAdapter)
  ↓ 转换数据格式
Engine (OrderEngine)
  ↓ 执行业务逻辑
State (OrderState)
  ↑ 订阅更新
Adapter (重新计算)
  ↑ 转换为 view 格式
View (重新渲染)
```

---

### 2.3 View Props 模型

```javascript
/**
 * @typedef {Object} OrderFormViewProps
 * @property {OrderFormAdapterState} state - Adapter 状态
 * @property {OrderFormAdapterActions} actions - Adapter 操作
 * @property {Object} formProps - antd Form 的 props
 * @property {Object} styles - 样式对象 (可选)
 */
```

**View 不依赖的内容**:
- ❌ Engine 实例
- ❌ Core 包的任何内容
- ❌ 业务规则判断

**View 只做的事情**:
- ✅ 渲染 JSX
- ✅ 调用 `actions.*` 方法
- ✅ 根据 `state.*` 渲染 UI
- ✅ 处理 antd 组件的事件

---

### 2.4 Logic 数据模型 (可选)

```javascript
/**
 * UI 内部状态管理
 * 用于管理 UI 特定的状态,不包含业务逻辑
 */

/**
 * @typedef {Object} OrderFormLogicState
 * @property {boolean} isItemModalVisible - 商品选择模态框是否可见
 * @property {string} selectedItemId - 当前选中的商品 ID
 * @property {boolean} showSummary - 是否显示订单汇总
 */

/**
 * 创建 OrderForm logic
 * @returns {{ state: OrderFormLogicState, actions: Object }}
 */
export function createOrderFormLogic() {
  // 仅管理 UI 状态,不涉及业务逻辑
}
```

---

## 3. 配置文件 Schema

### 3.1 meta.json Schema

每个 UI 组件必须包含 `meta.json`,记录组件的元信息。

```json
{
  "$schema": "https://terence.dev/meta.schema.json",
  "name": "OrderForm",
  "version": "1.0.0",
  "description": "订单表单组件",
  "core": {
    "engine": "order",
    "minVersion": "1.0.0",
    "maxVersion": "2.0.0"
  },
  "ui": {
    "dependencies": ["antd@6"],
    "peerDependencies": ["react@19"]
  },
  "files": [
    "OrderForm.view.jsx",
    "OrderForm.adapter.js",
    "OrderForm.logic.js",
    "meta.json",
    "index.js"
  ],
  "author": "Terence Team",
  "license": "MIT"
}
```

**Schema 字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 组件名称,必须与目录名一致 |
| `version` | string | ✅ | 组件版本,遵循语义化版本 |
| `description` | string | ❌ | 组件描述 |
| `core.engine` | string | ✅ | 依赖的 core engine 名称 |
| `core.minVersion` | string | ✅ | 最低兼容的 core 版本 |
| `core.maxVersion` | string | ❌ | 最高兼容的 core 版本 |
| `ui.dependencies` | string[] | ✅ | UI 依赖的库 |
| `ui.peerDependencies` | string[] | ❌ | 对等依赖 (如 react) |
| `files` | string[] | ��� | 组件包含的文件列表 |
| `author` | string | ❌ | 作者 |
| `license` | string | ❌ | 许可证 |

**版本兼容性检查**:

```javascript
/**
 * 检查 core 版本是否满足组件要求
 * @param {string} coreVersion - 当前 core 版本
 * @param {Object} requirement - meta.json 中的 core 要求
 * @returns {boolean} 是否兼容
 */
export function checkCoreVersion(coreVersion, requirement) {
  const min = semver.minVersion(requirement.minVersion);
  const max = requirement.maxVersion
    ? semver.maxVersion(requirement.maxVersion)
    : null;

  const current = semver.coerce(coreVersion);

  if (semver.lt(current, min)) return false;
  if (max && semver.gt(current, max)) return false;

  return true;
}
```

---

### 3.2 ui.config.json Schema

seed 项目根目录的 `ui.config.json`,追踪已引入的 UI 组件。

```json
{
  "$schema": "https://terence.dev/ui-config.schema.json",
  "version": "1.0.0",
  "uiDir": "src/ui",
  "components": {
    "OrderForm": {
      "version": "1.0.0",
      "source": "@ui/order-form",
      "core": {
        "engine": "order",
        "version": "1.0.0"
      },
      "addedAt": "2024-01-16T10:00:00Z",
      "modified": false
    }
  }
}
```

**Schema 字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | string | ✅ | 配置文件版本 |
| `uiDir` | string | ✅ | UI 组件目标目录 |
| `components` | Object | ✅ | 已引入的组件映射 |
| `components.<name>` | Object | ✅ | 组件信息 |
| `.version` | string | ✅ | 组件版本 |
| `.source` | string | ✅ | 组件来源 (本地或远程) |
| `.core` | Object | ✅ | 依赖的 core 信息 |
| `.addedAt` | string | ✅ | 添加时间 (ISO 8601) |
| `.modified` | boolean | ✅ | 是否被修改过 |

**操作 API**:

```javascript
// 读取配置
const config = await readUiConfig();

// 添加组件
config.components['OrderForm'] = {
  version: '1.0.0',
  source: '@ui/order-form',
  core: { engine: 'order', version: '1.0.0' },
  addedAt: new Date().toISOString(),
  modified: false
};
await writeUiConfig(config);

// 列出组件
const components = Object.keys(config.components);
// → ['OrderForm']

// 检查组件是否存在
const exists = 'OrderForm' in config.components;

// 标记为已修改
config.components['OrderForm'].modified = true;
```

---

## 4. CLI 命令数据模型

### 4.1 init 命令

**输入**:

```javascript
{
  uiDir: string,      // UI 目录名称,默认 'ui'
  force: boolean      // 是否覆盖已存在的配置
}
```

**输出**:

```
创建文件:
  - ui.config.json
  - <uiDir>/.gitkeep

返回:
  - { success: true, configPath: string }
```

---

### 4.2 add 命令

**输入**:

```javascript
{
  componentName: string,  // 组件名称
  targetDir?: string      // 目标目录,默认从 ui.config.json 读取
}
```

**输出**:

```
成功:
  - {
      success: true,
      component: {
        name: string,
        version: string,
        path: string,
        core: { engine: string, version: string }
      }
    }

失败:
  - {
      success: false,
      error: string,
      code: 'COMPONENT_NOT_FOUND' | 'VERSION_MISMATCH' | 'ALREADY_EXISTS'
    }
```

**错误代码**:

| Code | 说明 | HTTP 类比 |
|------|------|----------|
| `COMPONENT_NOT_FOUND` | 组件模板不存在 | 404 |
| `VERSION_MISMATCH` | Core 版本不满足要求 | 400 |
| `ALREADY_EXISTS` | 组件已存在 | 409 |
| `COPY_FAILED` | 拷贝文件失败 | 500 |

---

### 4.3 list 命令

**输入**: 无

**输出**:

```javascript
{
  components: [
    {
      name: string,
      version: string,
      source: string,
      core: { engine: string, version: string },
      addedAt: string,
      modified: boolean
    }
  ],
  total: number
}
```

**示例输出**:

```
已引入的 UI 组件 (1):

┌────────────┬─────────┬──────────┬──────────────┐
│ 组件名称    │ 版本    │ 来源     │ Core 依赖    │
├────────────┼─────────┼──────────┼──────────────┤
│ OrderForm  │ 1.0.0   │ local    │ order@1.0.0  │
└────────────┴─────────┴──────────┴──────────────┘
```

---

### 4.4 upgrade 命令

**输入**:

```javascript
{
  componentName: string,  // 组件名称
  dryRun?: boolean       // 是否仅预览 (不实际修改)
}
```

**输出**:

```javascript
{
  hasUpdate: boolean,
  currentVersion: string,
  latestVersion: string,
  diff: {
    added: string[],      // 新增文件
    modified: string[],   // 修改文件
    deleted: string[]     // 删除文件
  },
  conflicts: string[]     // 有冲突的文件
}
```

**Diff 生成策略**:

1. 对比 `meta.json` 版本号
2. 递归对比文件差异
3. 检测本地修改 (通过 git diff 或文件 hash)
4. 生成三路合并建议

---

## 5. 实体关系图 (ERD)

```
┌─────────────────┐
│  OrderEngine    │
│  (Core Package) │
└────────┬────────┘
         │ 1
         │
         │ 1
┌────────▼────────┐
│   OrderState    │
│  (纯数据结构)    │
└─────────────────┘
         │ 1
         │ has many
         │
         │ *
┌────────▼────────┐
│   OrderItem     │
│  (值对象)        │
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│  OrderForm      │────────>│  OrderEngine    │
│  (UI Component) │  uses   │  (Core Package) │
└────────┬────────┘         └─────────────────┘
         │
         │ contains
         │
┌────────▼────────┐
│ OrderFormAdapter│
│  (适配层)        │
└─────────────────┘
         │
         │ subscribes
         │
         ▼
┌─────────────────┐
│  OrderState     │
└─────────────────┘
```

---

## 6. 状态管理策略

### 6.1 Core 状态管理

**原则**: Engine 是状态的唯一持有者和修改者。

```javascript
// ❌ 错误: 直接修改 state
engine.state.items.push({ id: 'p1', qty: 1 });

// ✅ 正确: 通过 action 修改
engine.actions.addItem('p1', 'Product 1', 1, 100);
```

**订阅机制**:

```javascript
// 订阅状态变化
const unsubscribe = engine.subscribe((newState) => {
  console.log('State changed:', newState);
});

// 取消订阅
unsubscribe();
```

---

### 6.2 UI 状态管理

**原则**: UI 状态与业务状态分离。

```javascript
// 业务状态 (Core)
const orderState = engine.state;

// UI 状态 (UI Component)
const uiState = {
  isModalVisible: false,
  touchedFields: new Set(),
  fieldErrors: new Map()
};
```

**状态分类**:

| 类型 | 位置 | 示例 | 修改方式 |
|------|------|------|----------|
| 业务状态 | Core Engine | `items`, `status`, `canSubmit` | `engine.actions.*` |
| UI 状态 | Component State | `isModalVisible`, `touchedFields` | `setState` |
| 表单状态 | antd Form | `form.values`, `form.errors` | `form.setFieldsValue` |

---

## 7. 数据验证

### 7.1 Core 层验证 (Guard)

```javascript
// packages/core/guards/orderGuard.js

/**
 * 校验是否可以提交订单
 * @param {OrderState} state - 当前状态
 * @throws {Error} 如果不能提交
 */
export function assertCanSubmit(state) {
  if (state.items.length === 0) {
    throw new Error('不能提交空订单');
  }

  if (state.status !== 'editing') {
    throw new Error(`订单状态 ${state.status} 不允许提交`);
  }

  if (state.items.some(item => item.qty <= 0)) {
    throw new Error('商品数量必须大于 0');
  }
}
```

---

### 7.2 UI 层验证 (Form)

```javascript
// OrderForm.view.jsx (antd Form)

const rules = {
  qty: [
    { required: true, message: '请输入数量' },
    { type: 'number', min: 1, message: '数量必须大于 0' }
  ]
};

// 注意: 这里只有格式校验,业务校验由 Core 完成
```

---

## 8. 错误处理

### 8.1 Core 错误

```javascript
// Engine 抛出业务错误
try {
  await engine.actions.submit();
} catch (error) {
  // error.message: "库存不足"
  // error.code: "INSUFFICIENT_STOCK"
  // state.error: Error instance
  // state.status: "failed"
}
```

---

### 8.2 UI 错误展示

```javascript
// Adapter 捕获错误并转换
const submit = async () => {
  try {
    await engine.actions.submit();
  } catch (error) {
    // 转换为 UI 友好的错误消息
    const uiError = {
      message: error.message,
      type: 'error',
      field: error.field
    };
    setFieldError(uiError);
  }
};
```

---

## 9. 数据持久化

### 9.1 Core 层 (不关心)

Core Engine 不负责数据持久化,由 Adapter 注入的 API 处理。

```javascript
// 示例: 通过 adapter 注入持久化 API
const engine = createOrderEngine({
  submitOrder: async (payload) => {
    // 持久化到后端
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.json();
  }
});
```

---

### 9.2 UI 层 (可选)

UI 组件可以选择使用 localStorage 缓存草稿。

```javascript
// OrderForm.logic.js (可选)
const saveDraft = (state) => {
  localStorage.setItem('order-draft', JSON.stringify(state.items));
};

const loadDraft = () => {
  const draft = localStorage.getItem('order-draft');
  return draft ? JSON.parse(draft) : null;
};
```

---

## 10. 总结

本数据模型文档定义了:

1. **Core 包**: OrderEngine 的状态模型、API 契约、Service 结构
2. **UI 组件**: Adapter-View-Logic 三层结构的数据流和职责
3. **配置文件**: meta.json 和 ui.config.json 的 schema
4. **CLI 命令**: init/add/list/upgrade 的输入输出模型
5. **状态管理**: 业务状态与 UI 状态的分离策略
6. **数据验证**: Core 层 (Guard) 和 UI 层 (Form) 的验证分工

**下一步**: 创建 API 契约文档 (`contracts/`)。
