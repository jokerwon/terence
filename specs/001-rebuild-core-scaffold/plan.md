# Implementation Plan: 重建 @terence/core 脚手架

**Branch**: `001-rebuild-core-scaffold` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rebuild-core-scaffold/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

根据 `docs/architecture/core.md` 的双轨模型设计，重建 `@terence/core` 包的脚手架。核心工作是：

1. **重构目录结构**: 明确区分 `stateless/` (Track A) 和 `engines/` (Track B) 两个轨道
2. **实现 Stateless Core**: 将登录业务从 Engine 模式重构为 Stateless Core 模式
3. **迁移 Adapter**: 将 Adapter 从 Core 包迁移到 UI 层
4. **添加架构约束**: 通过 ESLint 规则强制执行架构约束
5. **提供完整文档**: quickstart、API 契约、数据模型

**技术方法**:
- 采用显式分离的目录结构 (`stateless/` vs `engines/`)
- 使用 ESLint 的 `no-restricted-imports` 和 `no-restricted-syntax` 规则强制约束
- 保留可复用的工具函数 (StateContainer, invariant, validation)
- 渐进式迁移，避免破坏性变更

## Technical Context

**Language/Version**: JavaScript (ES2022+), Node.js >= 18.0.0
**Primary Dependencies**:
  - React ^19.0.0 (peer dependency, 仅 Adapter 需要)
  - Vitest ^2.0.0 (测试框架)
  - ESLint ^9.18.0 (代码质量检查)

**Storage**: N/A (Core 层不涉及持久化，由项目层通过 contracts 提供)
**Testing**: Vitest + @testing-library/react (Adapter 测试)
**Target Platform**: Node.js 18+ / Modern Browsers (通过 ESM)
**Project Type**: Monorepo (packages/core, packages/ui, packages/seed)
**Performance Goals**:
  - Stateless Core 函数调用 < 1ms
  - Engine 状态更新通知 < 10ms
  - 首次渲染 < 100ms

**Constraints**:
  - Core 层禁止引入 React
  - Core 层禁止使用状态管理库 (Zustand, Redux)
  - Stateless Core 必须是无状态的
  - Adapter 必须位于 UI 层
  - 必须通过 ESLint 规则强制约束

**Scale/Scope**:
  - 3-5 个 Stateless Core 模块 (login, validation, 等)
  - 2-3 个 Stateful Engine 示例 (login, order-engine)
  - 1 个 Adapter 工厂函数
  - 3-5 个工具函数
  - 测试覆盖率 > 80%

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 原则 I: 分层架构 (NON-NEGOTIABLE)

✅ **通过**
- Core 层不依赖 UI 技术 (React, antd)
- Adapter 将迁移到 UI 层
- 依赖方向: seed → ui → core

**证据**:
- `stateless/` 目录只包含纯函数和 flows
- `engines/` 目录只包含状态机和业务逻辑
- 无 JSX、无 DOM API、无 antd 依赖

### 原则 II: 源码交付

✅ **通过**
- 本 feature 只涉及 Core 层，不涉及 UI 层的源码交付
- Adapter 将迁移到 UI 层，符合 CLI 驱动的源码交付模式

### 原则 III: 业务逻辑中心性

✅ **通过**
- Core 层只关心"业务是什么"，不关心"如何展示"
- 所有业务状态可枚举、可序列化
- 使用 JSDoc 描述对外接口
- 关键边界进行运行时校验 (invariant, validateDeps)

**证据**:
- Stateless Core: 纯函数 + flows + contracts
- Stateful Engine: getState + subscribe + actions
- 清晰的状态迁移规则

### 原则 IV: Adapter 模式

✅ **通过**
- Adapter 从 Core 包迁移到 UI 层
- Adapter 只调用 engine.actions，不编写业务规则
- Adapter 使用 useSyncExternalStore 订阅状态

**证据**:
- `packages/ui/hooks/adapters/createReactAdapter.js`
- 无业务规则判断逻辑
- 纯粹的数据转换和状态订阅

### 原则 V: 接口约束

✅ **通过**
- 所有对外 API 使用 JSDoc 描述
- 关键边界进行参数与状态校验
- ESLint 规则强制架构约束

**证据**:
- `contracts/core-api.md` 完整的 API 文档
- `invariant(condition, message)` 运行时断言
- `validateDeps(deps, schema)` 依赖校验
- ESLint 规则禁止违规导入

### 原则 VI: 测试策略

✅ **通过**
- 优先覆盖 Core 层测试
- 不依赖浏览器环境 (使用 Vitest)
- Adapter 进行基本行为测试

**证据**:
- `tests/stateless/` 测试 rules 和 flows
- `tests/engines/` 测试状态迁移
- `tests/adapters/` 测试 Adapter 行为

### 架构合规性总结

| 原则 | 状态 | 说明 |
|------|------|------|
| I. 分层架构 | ✅ | Core 不依赖 UI，Adapter 迁移到 UI 层 |
| II. 源码交付 | ✅ | 本 feature 不涉及 UI 层 |
| III. 业务逻辑中心性 | ✅ | 清晰的状态模型和 action 入口 |
| IV. Adapter 模式 | ✅ | Adapter 位于 UI 层，职责单一 |
| V. 接口约束 | ✅ | JSDoc + 运行时校验 + ESLint |
| VI. 测试策略 | ✅ | 优先覆盖 Core 层 |

**无违规项，无需 justification**

## Project Structure

### Documentation (this feature)

```text
specs/001-rebuild-core-scaffold/
├── plan.md              # 本文件 - 实施计划
├── research.md          # Phase 0 输出 - 技术研究
├── data-model.md        # Phase 1 输出 - 数据模型
├── quickstart.md        # Phase 1 输出 - 快速开始
├── contracts/           # Phase 1 输出 - API 契约
│   └── core-api.md      # Core API 契约文档
├── spec.md              # Feature 规范
└── checklists/
    └── requirements.md  # 规范质量检查清单
```

### Source Code (repository root)

```text
packages/
├── core/                # Core 层 (本 feature 主体)
│   ├── src/
│   │   ├── index.js           # 主入口
│   │   ├── stateless/         # Track A: Stateless Core (新增)
│   │   │   ├── index.js
│   │   │   └── login/         # 登录业务 (重构)
│   │   │       ├── index.js
│   │   │       ├── rules.js
│   │   │       ├── flows.js
│   │   │       └── contracts.js
│   │   ├── engines/           # Track B: Stateful Engine (保留)
│   │   │   ├── index.js
│   │   │   ├── login/         # 示例：保留
│   │   │   │   ├── index.js
│   │   │   │   ├── engine.js
│   │   │   │   ├── commands.js
│   │   │   │   ├── rules.js
│   │   │   │   ├── state.js
│   │   │   │   └── effects.js
│   │   │   └── order-engine/   # 示例：新增
│   │   │       ├── index.js
│   │   │       ├── engine.js
│   │   │       ├── transitions.js
│   │   │       └── contract.js
│   │   └── utils/             # 工具函数 (保留)
│   │       ├── index.js
│   │       ├── StateContainer.js
│   │       ├── invariant.js
│   │       └── validation.js
│   ├── tests/
│   │   ├── stateless/         # 新增
│   │   │   └── login/
│   │   │       ├── rules.test.js
│   │   │       └── flows.test.js
│   │   ├── engines/           # 保留
│   │   │   └── login/
│   │   │       └── login.test.js
│   │   └── utils/             # 保留
│   │       ├── StateContainer.test.js
│   │       └── invariant.test.js
│   ├── examples/
│   │   └── LoginForm.jsx       # 示例组件
│   ├── package.json
│   ├── vitest.config.js
│   └── .eslintrc.js            # 新增：架构约束规则
│
└── ui/                  # UI 层
    └── hooks/
        └── adapters/           # 新增：从 core 迁移
            ├── index.js
            └── createReactAdapter.js
```

**Structure Decision**:
- 采用 **monorepo** 结构，`packages/core` 和 `packages/ui` 分离
- **显式分离** `stateless/` 和 `engines/` 目录，强制双轨模型
- **删除** `packages/core/src/adapters/`，迁移到 `packages/ui/hooks/adapters/`
- **保留** 可复用的工具函数 (`utils/`)
- **新增** ESLint 规则文件强制架构约束

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项，无需填写。

---

## Phase 0: 研究阶段 ✅

**Status**: 完成
**Output**: `research.md`

**研究成果**:

1. **目录组织**: 采用 `stateless/` + `engines/` 显式分离
2. **Adapter 位置**: 迁移到 UI 层 (`packages/ui/hooks/adapters/`)
3. **迁移策略**: 渐进式迁移，保留可复用代码
4. **ESLint 规则**: 使用 `no-restricted-imports` 和 `no-restricted-syntax`
5. **示例代码**: 登录 (Stateless) + 订单 (Engine)

**关键决策**:
- ✅ 删除 `packages/core/src/adapters/` 目录
- ✅ 将登录业务从 Engine 重构为 Stateless Core
- ✅ 保留 login Engine 作为 Stateful Engine 的参考示例
- ✅ 新增 order-engine 作为复杂流程示例

---

## Phase 1: 设计阶段 ✅

**Status**: 完成
**Output**: `data-model.md`, `contracts/core-api.md`, `quickstart.md`

### 1.1 数据模型 (`data-model.md`)

定义了四个核心实体：

1. **Stateless Core Module**
   - 文件结构: `rules.js`, `flows.js`, `contracts.js`
   - 导出接口: 业务规则、业务流程、副作用契约
   - 不变式: 无状态、纯函数、不能引入 React

2. **Stateful Engine**
   - 文件结构: `engine.js`, `transitions.js`, `contract.js`
   - 标准接口: `getState`, `subscribe`, `actions`
   - 不变式: 不能操作 UI、不能引入 React

3. **Effects Contract**
   - 副作用接口定义
   - 类型: API 请求、持久化、导航、外部系统调用

4. **Adapter (UI 层)**
   - 位置: `packages/ui/hooks/adapters/`
   - 接口: `createReactAdapter(engine) -> useEngine(selector)`
   - 不变式: 使用 `useSyncExternalStore`，不能修改 Engine 状态

### 1.2 API 契约 (`contracts/core-api.md`)

定义了完整的 API 契约：

- **Package Exports**: 主入口导出、Stateless Core 导出、Stateful Engine 导出
- **Stateless Core API**: `login` 模块的详细接口定义
- **Stateful Engine API**: `loginEngine` 的详细接口定义
- **Utils API**: `StateContainer`, `invariant`, `validateDeps`
- **JSDoc 类型定义**: 完整的类型注释

### 1.3 快速开始 (`quickstart.md`)

提供了完整的上手指南：

- **轨道选择指南**: 如何判断使用 Stateless Core 还是 Engine
- **Stateless Core 示例**: 登录业务的完整实现
- **Stateful Engine 示例**: 订单流程的完整实现
- **Adapter 模式**: 如何创建和使用 Adapter
- **最佳实践**: 4 个关键实践
- **常见问题**: 5 个 FAQ

### 1.4 Agent 上下文更新

✅ 已更新 Claude Code 上下文文件 (`CLAUDE.md`)

---

## Phase 2: 任务分解

**Status**: 待执行 (使用 `/speckit.tasks` 命令)

**下一步**: 运行 `/speckit.tasks` 生成可执行的任务列表 (`tasks.md`)

**预期任务**:
1. 重构目录结构
2. 实现 Stateless Core (login)
3. 实现 Stateful Engine (order-engine 示例)
4. 迁移 Adapter 到 UI 层
5. 添加 ESLint 架构约束规则
6. 编写测试
7. 更新文档

---

## 检查清单

### 实施前检查

- [x] Constitution Check 通过
- [x] 技术研究完成 (research.md)
- [x] 数据模型定义完成 (data-model.md)
- [x] API 契约定义完成 (contracts/core-api.md)
- [x] 快速开始文档完成 (quickstart.md)
- [x] Agent 上下文已更新

### 实施后检查 (待 `/speckit.tasks` 完成后验证)

- [ ] 目录结构符合双轨模型
- [ ] Stateless Core 实现完成
- [ ] Stateful Engine 示例完成
- [ ] Adapter 迁移到 UI 层
- [ ] ESLint 规则生效
- [ ] 测试覆盖率 > 80%
- [ ] 所有示例代码可运行
- [ ] 文档完整且准确

---

## 参考资料

- **架构文档**: `docs/architecture/core.md`
- **项目宪章**: `.specify/memory/constitution.md`
- **Feature 规范**: `specs/001-rebuild-core-scaffold/spec.md`
- **API 契约**: `specs/001-rebuild-core-scaffold/contracts/core-api.md`
- **快速开始**: `specs/001-rebuild-core-scaffold/quickstart.md`
