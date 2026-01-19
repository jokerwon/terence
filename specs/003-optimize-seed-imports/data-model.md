# Data Model: Package Export Structure

**Feature**: 003-optimize-seed-imports
**Date**: 2026-01-19
**Status**: Final

## Overview

本文档描述 Terence monorepo 中包的导出结构,重点关注 @terence/ui 包的导出设计,以支持 seed 项目通过 import 语句直接引用组件。

---

## Entity: PackageExport

**描述**: 包的导出单元,定义了从包中导出的内容和使用方式

**属性**:
- **packageName**: string - 包名(如 `@terence/core`, `@terence/ui`)
- **exportPath**: string - 导出路径(如 `/src/index.js`, `/src/components/index.js`)
- **exports**: ExportItem[] - 导出的项目列表
- **reExport**: boolean - 是否为重新导出(从其他模块导入后导出)

**关系**:
- 一个 Package 包含多个 PackageExport
- PackageExport 包含多个 ExportItem

---

## Entity: ExportItem

**描述**: 单个导出项,可以是一个函数、组件、类或变量

**属性**:
- **name**: string - 导出名称(如 `OrderFormView`, `createOrderEngine`)
- **type**: enum - 导出类型: `function` | `component` | `class` | `constant` | `type`
- **sourceModule**: string - 来源模块路径(相对于包根目录)
- **isDefault**: boolean - 是否为默认导出
- **jsdoc**: string - JSDoc 文档注释

**关系**:
- 属于一个 PackageExport

---

## @terence/core Package Exports

**当前状态**: ✅ 已完整实现

### Top-Level Export (`/src/index.js`)

```javascript
/**
 * @terence/core - Business logic engines and services
 *
 * This package contains ONLY business logic with NO UI dependencies.
 */

// Re-exports organized by module type
export * from './engines/index.js';
export * from './services/index.js';
export * from './guards/index.js';
export * from './adapters/index.js';
export * from './utils/index.js';
```

### Module Exports

#### Engines (`/src/engines/index.js`)
```javascript
export * from './OrderEngine.js';
// 未来可能的导出:
// export * from './ProductEngine.js';
// export * from './CustomerEngine.js';
```

**当前导出项**:
- `createOrderEngine(config): Engine` - 创建订单引擎实例
- `OrderEngineDefaults` - OrderEngine 默认配置

#### Services (`/src/services/index.js`)
```javascript
export * from './PriceCalculator.js';
// 未来可能的导出:
// export * from './InventoryService.js';
```

**当前导出项**:
- `calculatePrice(items): PriceResult` - 价格计算服务
- `PriceCalculator` - 价格计算器类

#### Guards (`/src/guards/index.js`)
```javascript
export * from './OrderGuards.js';
// 未来可能的导出:
// export * from './InventoryGuards.js';
```

**当前导出项**:
- `validateOrderItem(item): boolean` - 订单项验证
- `validateOrderState(state, action): boolean` - 订单状态验证

#### Adapters (`/src/adapters/index.js`)
```javascript
// 当前为空,未来可能添加:
// export * from './StorageAdapter.js';
// export * from './ApiAdapter.js';
```

#### Utils (`/src/utils/index.js`)
```javascript
export * from './Money.js';
export * from './IdGenerator.js';
```

**当前导出项**:
- `formatMoney(cents): string` - 金额格式化
- `generateId(prefix): string` - ID 生成器

---

## @terence/ui Package Exports

**当前状态**: ⚠️ 需要补充实现

### Target State (实施后)

#### Top-Level Export (`/src/index.js`)

```javascript
/**
 * @terence/ui - UI component adapters and views
 *
 * This package contains UI components with Adapter-View separation:
 * - Adapters: Integration with core engines (can import from @terence/core)
 * - Views: Pure presentation components (NO core imports)
 * - Components: Reusable UI elements
 * - Hooks: Custom React hooks
 * - Shared: Shared utilities and types
 *
 * Architecture constraints:
 * - CAN depend on @terence/core (in adapters only)
 * - MUST NOT depend on @terence/seed
 * - Views MUST be pure presentational (no core imports)
 */

// Re-exports organized by module type
export * from './components/index.js';
export * from './adapters/index.js';
export * from './hooks/index.js';
export * from './shared/index.js';
```

#### Components (`/src/components/index.js`)

**实施目标**:
```javascript
/**
 * UI Components - Reusable presentational components
 */

// OrderForm 组件
export {
  OrderFormView,
  useOrderFormAdapter
} from './OrderForm/index.js';

export {
  formatAmount,
  validateItemInput,
  calculateItemSubtotal
} from './OrderForm/OrderForm.logic.js';

// 未来可能的组件:
// export * from './ProductList/index.js';
// export * from './CustomerForm/index.js';
```

**导出项列表**:

| Name | Type | Source | Description |
|------|------|--------|-------------|
| `OrderFormView` | component | `./OrderForm/OrderForm.view.jsx` | 订单表单视图组件 |
| `useOrderFormAdapter` | function | `./OrderForm/OrderForm.adapter.js` | OrderForm Adapter Hook |
| `formatAmount` | function | `./OrderForm/OrderForm.logic.js` | 格式化金额显示 |
| `validateItemInput` | function | `./OrderForm/OrderForm.logic.js` | 验证订单项输入 |
| `calculateItemSubtotal` | function | `./OrderForm/OrderForm.logic.js` | 计算订单项小计 |

#### Adapters (`/src/adapters/index.js`)

**当前状态**: 占位,未来可能添加通用适配器

```javascript
// Placeholder for future shared adapters
// 例如: useEngineAdapter(engine) - 通用 engine 适配器
```

#### Hooks (`/src/hooks/index.js`)

**当前状态**: 占位,未来可能添加 UI 专用 hooks

```javascript
// Placeholder for future UI-specific hooks
// 例如: useCurrency(), useDecimalInput()
```

#### Shared (`/src/shared/index.js`)

**当前状态**: 占位,未来可能添加共享工具

```javascript
// Placeholder for future shared utilities
// 例如: 常量、类型定义、工具函数
```

---

## @terence/seed Package Usage

**当前状态**: ⚠️ 需要修改导入语句

### Before (复制模式)

```javascript
// apps/seed/src/pages/OrderPage.jsx
import { createOrderEngine } from '@terence/core';
import { OrderFormView } from '../ui/OrderForm';  // ❌ 本地文件

// apps/seed/src/ui/OrderForm/index.js
export { OrderFormView } from './OrderForm.view.jsx';
export { useOrderFormAdapter } from './OrderForm.adapter.js';
```

### After (workspace 依赖模式)

```javascript
// apps/seed/src/pages/OrderPage.jsx
import { createOrderEngine } from '@terence/core';
import { OrderFormView } from '@terence/ui';  // ✅ workspace 包

// apps/seed/src/ui/ 目录删除
```

---

## Import Path Patterns

### Pattern 1: 直接从包根导入 ✅ 推荐

```javascript
// 简洁,易于维护
import { OrderFormView, useOrderFormAdapter } from '@terence/ui';
import { createOrderEngine } from '@terence/core';
```

### Pattern 2: 从子模块导入 ⚠️ 不推荐

```javascript
// 路径较长,不推荐
import { OrderFormView } from '@terence/ui/components';
import { createOrderEngine } from '@terence/core/engines';
```

**推荐理由**:
- Pattern 1 更简洁
- 包内部的模块结构变化不影响使用方
- 与 standard npm 包的最佳实践一致

---

## Validation Rules

### Rule 1: Export Completeness

**规则**: `packages/ui/src/components/index.js` 必须导出所有组件

**验证**:
```bash
# 检查 components/ 下的所有组件
ls packages/ui/src/components/

# 确认每个组件都在 index.js 中导出
grep "export.*from" packages/ui/src/components/index.js
```

### Rule 2: Re-Export Consistency

**规则**: `packages/ui/src/index.js` 必须重新导出所有子模块

**验证**:
```bash
# 确认顶层 index.js 导出了所有模块
grep "export.*from" packages/ui/src/index.js

# 应该包含:
# export * from './components/index.js';
# export * from './adapters/index.js';
# export * from './hooks/index.js';
# export * from './shared/index.js';
```

### Rule 3: Import Path Resolution

**规则**: seed 项目必须能够解析 `@terence/ui` 和 `@terence/core`

**验证**:
```bash
# 在 seed 项目中测试导入
cd apps/seed
node -e "try { require('@terence/ui'); console.log('✅ Import OK'); } catch(e) { console.log('❌ Import Failed'); }"
```

### Rule 4: No Circular Dependencies

**规则**: 导出结构不能造成循环依赖

**验证**:
```bash
# 使用 madge 检测循环依赖
npx madge --circular --extensions js,jsx packages/ui/src/
npx madge --circular --extensions js,jsx packages/core/src/
```

---

## Migration Impact

### Files to Modify

| File | Current | Target | Change Type |
|------|---------|--------|-------------|
| `packages/ui/src/components/index.js` | Empty | Export OrderForm | ✏️ Add exports |
| `apps/seed/src/pages/OrderPage.jsx` | `from '../ui/OrderForm'` | `from '@terence/ui'` | ✏️ Update import |
| `apps/seed/src/ui/OrderForm/*` | Exists | Deleted | ❌ Remove |

### Files Unchanged

| File | Reason |
|------|--------|
| `packages/ui/src/components/OrderForm/*` | 组件源码保持不变 |
| `packages/ui/src/index.js` | 已正确重新导出子模块 |
| `packages/core/src/index.js` | 已正确导出所有模块 |
| `apps/seed/vite.config.js` | 路径别名配置保持不变 |

---

## Visual Representation

```
┌─────────────────────────────────────────────────────────────┐
│                    @terence/core Package                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ src/index.js                                          │  │
│  │  ├─ export * from './engines/index.js'               │  │
│  │  ├─ export * from './services/index.js'              │  │
│  │  ├─ export * from './guards/index.js'                │  │
│  │  ├─ export * from './adapters/index.js'              │  │
│  │  └─ export * from './utils/index.js'                 │  │
│  └───────────────────────────────────────────────────────┘  │
│            │                                                 │
│            │ exports: createOrderEngine, calculatePrice...  │
└────────────┼─────────────────────────────────────────────────┘
             │
             │ ┌───────────────────────────────────────────┐
             └─│ seed imports: import {} from '@terence/core'│
               └───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     @terence/ui Package                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ src/index.js                                          │  │
│  │  ├─ export * from './components/index.js'  ◄──┐      │  │
│  │  ├─ export * from './adapters/index.js'        │      │  │
│  │  ├─ export * from './hooks/index.js'           │      │  │
│  │  └─ export * from './shared/index.js'          │      │  │
│  └────────────────────────────────────────────────┼───────┘  │
│                                                     │         │
│  ┌─────────────────────────────────────────────────┼───────┐ │
│  │ src/components/index.js                          │       │ │
│  │  ├─ export { OrderFormView }                     │       │ │
│  │  │     from './OrderForm/index.js'        ───────┘       │ │
│  │  └─ (future components)                          │         │ │
│  └──────────────────────────────────────────────────┘         │
│            │                                                 │
│            │ exports: OrderFormView, useOrderFormAdapter... │
└────────────┼─────────────────────────────────────────────────┘
             │
             │ ┌───────────────────────────────────────────┐
             └─│ seed imports: import {} from '@terence/ui'  │
               └───────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ Data model defined
2. ⏭️ Generate `contracts/package-exports.yaml`
3. ⏭️ Generate `quickstart.md`
4. ⏭️ Update agent context
