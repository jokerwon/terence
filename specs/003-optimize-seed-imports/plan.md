# Implementation Plan: 优化 Seed 项目组件引入方式

**Branch**: `003-optimize-seed-imports` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-optimize-seed-imports/spec.md`

## Summary

将 seed 项目引入 UI 组件的方式从"源码复制"改为"直接通过 import 从 @terence/ui 包导入",以减少代码冗余,简化维护,并自动使用最新的组件库代码。同时保持外部项目通过 CLI 工具的消费方式不变。

## Technical Context

**Language/Version**: JavaScript (ES2022+)
**Primary Dependencies**:
- @terence/core (workspace dependency)
- @terence/ui (workspace dependency)
- pnpm (workspace management)
- Vite (build tool with path aliases)

**Storage**: N/A (不涉及数据存储)

**Testing**: Vitest (已在项目中配置)

**Target Platform**: Web (浏览器环境)

**Project Type**: Monorepo (pnpm workspace with packages/ and apps/)

**Performance Goals**:
- seed 项目构建时间不增加
- 运行时性能无影响

**Constraints**:
- 必须符合 Terence 三层架构原则 (core → ui → seed)
- 必须保持外部项目的 CLI 工具消费方式不变
- 不能破坏现有的 workspace 依赖解析

**Scale/Scope**:
- 影响 1 个 seed 项目 (apps/seed)
- 涉及 2 个包的导出配置 (@terence/core, @terence/ui)
- 需要更新约 5-10 个 import 语句
- 删除约 4-5 个文件 (apps/seed/src/ui 目录)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Pre-Phase 0 Evaluation: ALL PASS
*See detailed evaluation below*

### ✅ Post-Phase 1 Re-evaluation: ALL PASS

**Phase 1 设计决策**:
1. ✅ 使用 pnpm workspace 依赖 (标准 monorepo 实践)
2. ✅ 通过顶层 index.js 统一导出 (符合最佳实践)
3. ✅ 保留 Vite 路径别名配置 (提供确定性)
4. ✅ 不修改 CLI 工具 (保持向后兼容)

**验证结果**:
- ✅ 所有架构原则仍然符合
- ✅ 无新增风险或违规
- ✅ 导出契约明确且可验证
- ✅ 实施步骤清晰且安全

**最终判定**: **PROCEED WITH IMPLEMENTATION**

---

### ✅ I. Layered Architecture - PASS

**当前状态**:
- seed → ui: 通过本地文件 `../ui/OrderForm` 引入
- seed → core: 通过 `@terence/core` 引入 ✅

**修改后状态**:
- seed → ui: 通过 `@terence/ui` 包名引入 ✅
- seed → core: 通过 `@terence/core` 包名引入 ✅ (无变化)

**依赖方向**:
- ✅ seed 依赖 ui 和 core (单向)
- ✅ ui 依赖 core (单向)
- ❌ 无反向依赖

**边界约束**:
- ✅ core 包仍然不含 UI 代码
- ✅ ui 包仍然不含 seed 引用
- ✅ seed 通过 workspace 包名引用,符合架构原则

**判定**: **PASS** - 修改强化了架构原则,使用标准的包导入而非文件复制

---

### ⚠️ II. Source Code Delivery - CONTEXTUAL

**宪章要求**:
> ui 层采用 **CLI 驱动的源码交付模式**,而非 npm 黑盒依赖。

**本特性的处理**:
- **seed 项目** (内部仓库): 改为通过 `@terence/ui` 包导入 ✅ 合理
  - 理由: seed 和组件库在同一仓库,可以直接使用 workspace 依赖
  - 好处: 自动使用最新代码,减少冗余,简化维护

- **外部项目** (其他仓库): 保持 CLI 源码复制模式 ✅ 符合宪章
  - 理由: 外部项目需要可定制性,源码交付确保灵活性
  - FR-008 明确要求保持不变

**判定**: **PASS WITH CONTEXT** - seed 项目使用包导入是合理的优化,外部项目仍遵循源码交付模式

---

### ✅ III. Business Logic Centricity - PASS

**检查点**:
- ✅ core 层只包含业务逻辑,无 UI 依赖
- ✅ Engine 模型保持不变 (createOrderEngine 从 @terence/core 导入)
- ✅ UI 组件的 Adapter 模式保持不变

**判定**: **PASS** - 本特性只改变导入方式,不影响业务逻辑结构

---

### ✅ IV. Adapter Pattern - PASS

**检查点**:
- ✅ OrderForm.adapter.js 仍然存在于 @terence/ui 包中
- ✅ View 层不直接访问 Engine (通过 Adapter)
- ✅ OrderPage.jsx 的组装模式保持不变

**判定**: **PASS** - Adapter 模式不受影响

---

### ✅ V. Interface Constraints - PASS

**检查点**:
- ✅ @terence/core 的导出通过 index.js (已实现)
- ✅ @terence/ui 的导出通过 index.js (需要补充 OrderForm 导出)
- ✅ JSDoc 文档保持完整

**判定**: **PASS** - 需要在实施中补充 @terence/ui 的导出

---

### ✅ VI. Testing Strategy - PASS

**检查点**:
- ✅ core 层测试不受影响
- ✅ UI 组件测试不受影响 (测试仍然引用组件,只是导入路径变化)

**判定**: **PASS** - 测试策略不需要改变

---

### 📋 Gate Summary

| 原则 | 状态 | 说明 |
|------|------|------|
| I. Layered Architecture | ✅ PASS | 强化架构原则,使用标准包导入 |
| II. Source Code Delivery | ⚠️ CONTEXTUAL | seed 使用包导入(合理),外部项目保持源码交付 |
| III. Business Logic Centricity | ✅ PASS | 只改变导入方式,不影响业务逻辑 |
| IV. Adapter Pattern | ✅ PASS | Adapter 模式不受影响 |
| V. Interface Constraints | ✅ PASS | 需补充 @terence/ui 导出 |
| VI. Testing Strategy | ✅ PASS | 测试策略不变 |

**总体判定**: **PASS** - 本特性符合架构原则,可以继续实施

## Project Structure

### Documentation (this feature)

```text
specs/003-optimize-seed-imports/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Research decisions
├── data-model.md        # Phase 1: Package export structure
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: Export contracts (if needed)
│   └── package-exports.yaml  # Expected exports from @terence/ui
└── tasks.md             # Phase 2: Task list (created by /speckit.tasks)
```

### Source Code (repository root)

**当前结构**:
```text
apps/seed/
├── src/
│   ├── ui/                      # ❌ 删除 - 复制的 UI 组件
│   │   └── OrderForm/           # ❌ 删除
│   │       ├── OrderForm.view.jsx
│   │       ├── OrderForm.adapter.js
│   │       ├── OrderForm.logic.js
│   │       └── index.js
│   ├── pages/
│   │   └── OrderPage.jsx        # ✏️ 修改 - 更新导入语句
│   ├── App.jsx
│   └── main.jsx
└── package.json

packages/ui/src/
├── components/
│   ├── OrderForm/               # ✅ 存在于 packages/ui 中
│   │   ├── OrderForm.view.jsx
│   │   ├── OrderForm.adapter.js
│   │   ├── OrderForm.logic.js
│   │   └── index.js
│   └── index.js                 # ✏️ 修改 - 添加 OrderForm 导出
├── adapters/
├── hooks/
├── shared/
└── index.js                     # ✅ 自动导出 components/*

packages/core/src/
├── engines/
├── services/
├── guards/
├── adapters/
├── utils/
└── index.js                     # ✅ 已正确导出所有模块
```

**目标结构**:
```text
apps/seed/
├── src/
│   ├── pages/
│   │   └── OrderPage.jsx        # ✅ 从 @terence/ui 导入组件
│   ├── App.jsx
│   └── main.jsx
└── package.json

packages/ui/src/
├── components/
│   ├── OrderForm/               # ✅ seed 通过 @terence/ui 引用
│   │   ├── OrderForm.view.jsx
│   │   ├── OrderForm.adapter.js
│   │   ├── OrderForm.logic.js
│   │   └── index.js
│   └── index.js                 # ✅ 导出 OrderForm 组件
├── adapters/
├── hooks/
├── shared/
└── index.js                     # ✅ 重新导出 components/*

packages/core/src/
└── (无变化)
```

**Structure Decision**:
- 采用 **Monorepo with workspace dependencies** 模式
- seed 项目通过 pnpm workspace 协议引用本地包
- 优势:
  - 代码复用,无冗余
  - 自动使用最新版本
  - 简化维护
  - 符合 monorepo 最佳实践

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | 所有架构原则都通过检查,无需违反 |

**Note**: 本特性强化了架构原则,而不是违反。seed 项目使用 workspace 依赖是 monorepo 的标准做法。
