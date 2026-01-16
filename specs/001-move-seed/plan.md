# Implementation Plan: 移动 @terence/seed �� apps/seed

**Branch**: `001-move-seed` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-move-seed/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

将 @terence/seed 示例应用从 `packages/examples/seed` 移动到 `apps/seed` 目录,以符合 monorepo 最佳实践,将可部署应用与库代码分离。技术方法包括使用 Git mv 保留历史记录、更新 workspace 配置、修改相关文档和脚本引用。

## Technical Context

**Language/Version**: JavaScript (ES2022+), 不使用 TypeScript
**Primary Dependencies**: pnpm (包管理器), Git (版本控制), Vite (构建工具)
**Storage**: N/A (文件系统操作)
**Testing**: Vitest (现有测试框架)
**Target Platform**: Node.js >=18.0.0, 现代浏览器
**Project Type**: Monorepo (packages + apps 结构)
**Performance Goals**: 构建时间差异不超过 5%,所有脚本正常运行
**Constraints**:
  - 必须保留 Git 历史记录
  - 包名 @terence/seed 保持不变
  - 不影响其他包的依赖关系
**Scale/Scope**: 单个应用移动,涉及配置文件和文档更新

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Layered Architecture (NON-NEGOTIABLE)

**Status**: **PASS** - 此重构不影响架构分层

**评估**:
- 移动操作仅改变物理位置,不改变包的依赖关系
- @terence/seed 仍位于 seed 层(应用层)
- 依赖关系保持不变: seed → ui → core
- 不引入新的依赖或违反单向依赖原则

**行动**: 无需特殊处理,标准文件移动即可

### ✅ II. Source Code Delivery

**Status**: **PASS** - 不涉及 UI 源码交付逻辑

**评估**:
- 移动操作不改变 CLI 工具的工作方式
- seed 应用仍可正常使用 CLI 引入 ui 组件
- 不影响资产的生成和追踪机制

**行动**: 无需特殊处理

### ✅ III. Business Logic Centricity

**Status**: **PASS** - 不涉及业务逻辑

**评估**:
- 纯目录重构操作
- 不修改 core 层的任何业务逻辑
- 不影响状态管理和 action 设计

**行动**: 无需特殊处理

### ✅ IV. Adapter Pattern

**Status**: **PASS** - 不涉及 adapter 层

**评估**:
- 移动操作不改变 UI 与 core 的交互方式
- 不引入新的 adapter 或修改现有 adapter
- 保持 View → Adapter → Engine 的调用链

**行动**: 无需特殊处理

### ✅ V. Interface Constraints

**Status**: **PASS** - 保持接口约束

**评估**:
- 包名 @terence/seed 不变,对外的 JSDoc 接口不变
- 运行时校验逻辑不受影响
- ESLint 规则和测试覆盖策略保持一致

**行动**: 无需特殊处理

### ✅ VI. Testing Strategy

**Status**: **PASS** - 测试策略不受影响

**评估**:
- 现有测试可继续运行
- 测试覆盖策略不变(core 优先)
- 移动后需要验证测试仍能通过

**行动**: 在验证阶段运行所有测试确保无回归

### Constitution Check Summary

**结果**: ✅ **ALL GATES PASSED (Pre-Phase 1)**
**重新评估 (Phase 1 后)**: ✅ **ALL GATES PASSED (Post-Phase 1)**

此重构完全符合 Terence 项目宪章的所有原则,是纯粹的目录结构优化,不引入任何架构复杂度或违反治理原则的变更。

**Phase 1 后确认**:
- ✅ 数据模型不引入新的业务实体
- ✅ 契约定义符合 workspace 最佳实践
- ✅ 快速开始指南完整且可执行
- ✅ Agent 上下文已更新,反映当前技术栈

## Project Structure

### Documentation (this feature)

```text
specs/001-move-seed/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── workspace-structure.yaml  # Workspace 配置契约
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**当前结构**:
```text
terence/
├── packages/
│   ├── cli/             # CLI 工具
│   ├── core/            # 业务内核层
│   ├── ui/              # 业务组件 UI 层
│   └── examples/
│       └── seed/        # [当前] 示例应用
├── docs/                # 项目文档
├── package.json         # 根 package.json
└── pnpm-workspace.yaml  # Workspace 配置
```

**目标结构**:
```text
terence/
├── packages/
│   ├── cli/             # CLI 工具
│   ├── core/            # 业务内核层
│   └── ui/              # 业务组件 UI 层
├── apps/
│   └── seed/            # [新位置] 示例应用
├── docs/                # 项目文档
├── package.json         # 根 package.json (需更新)
└── pnpm-workspace.yaml  # Workspace 配置 (需更新)
```

**Structure Decision**: 采用标准的 monorepo "packages + apps" 结构,将可部署的应用从库代码中分离出来。这符合业界最佳实践(如 Nx、Turborepo 的推荐结构),使得项目意图更加清晰:
- `packages/` 目录存放可复用的库代码(cli, core, ui)
- `apps/` 目录存放可部署的应用(seed)
- 更容易为新开发者理解项目架构
- 为未来可能添加更多应用预留清晰的位置

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - 无宪法原则违反,此表无需填写。

此重构是纯粹的结构优化,不增加任何技术复杂度,反而通过更清晰的目录组织降低了认知负担。
