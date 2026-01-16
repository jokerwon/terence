# Implementation Plan: Architecture-Compliant Project Initialization

**Branch**: `002-arch-compliant-init` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-arch-compliant-init/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能旨在搭建完全符合 Terence 架构规范的 monorepo 项目基础,实现"业务确定性 + UI 可塑性 + 项目可生长性"的核心目标。

**核心需求**:
1. 搭建三层分离架构 (core → ui → seed),实现严格的单向依赖
2. 实现 core 包的 Engine-Guard-Service 架构,作为业务逻辑的唯一真理源
3. 开发 CLI 工具支持 UI 组件的源码交付模式
4. 建立 ESLint/JSDoc/测试等工程约束,确保 JavaScript 技术栈下的架构边界

**技术方法**:
- 使用 pnpm workspace 管理 monorepo 结构
- core 包作为独立 npm 包发布,使用 JSDoc 描述接口契约
- CLI 工具 (terence) 管理 ui 组件的 init/add/list/upgrade 生命周期
- ESLint 自定义规则强制执行架构边界约束
- 订单管理示例验证完整的业务流程

## Technical Context

**Language/Version**: JavaScript (ES2022+), 不使用 TypeScript
**Primary Dependencies**:
- **Monorepo**: pnpm workspace
- **Core**: 无外部 UI 依赖,纯 JavaScript
- **UI Layer**: antd@6, React@19
- **Seed**: Vite@7, React Router, Zustand, Tailwind CSS
- **CLI**: Commander.js, Inquirer, Chalk
- **Testing**: Vitest
- **Linting**: ESLint + eslint-plugin-import

**Storage**: N/A (示例使用内存状态,core 包不关心持久化)
**Testing**: Vitest for all packages,优先覆盖 core 包的 engines/services/guards
**Target Platform**: Node.js 18+ for CLI, 现代浏览器 for seed applications
**Project Type**: Monorepo (packages/core + ui + cli + examples/seed)
**Performance Goals**:
- CLI 命令执行 < 10 秒 (组件拷贝)
- Core 单元测试执行 < 30 秒
- 项目构建时间 < 2 分钟
- ESLint 检查实时响应

**Constraints**:
- Core 包禁止依赖任何 UI 技术 (antd、DOM、CSS、react)
- UI 层必须通过 adapter 与 core 交互,view 禁止直接访问 engine
- 所有架构边界违规必须能被 ESLint 自动检测
- Core 的状态必须是 JSON 可序列化、无循环引用的纯数据
- 生成的 UI 组件必须 100% 符合 adapter-view 分离

**Scale/Scope**:
- 4 个顶级包: core、ui、cli、examples/seed
- 示例业务场景: 订单管理 (添加/编辑/提交/查看状态)
- 至少 1 个示例 Engine (OrderEngine)
- 至少 1 个示例 UI 组件 (OrderForm)
- 6 个用户故事 (P1×3, P2×2, P3×1)
- 37 条功能需求

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Layered Architecture (NON-NEGOTIABLE)

✅ **PASS** - 本计划严格遵循三层分离架构:
- **Core 包** (packages/core): 业务内核层,只包含 engines/services/guards/adapters/utils
- **UI 层** (ui/): 业务组件源码模板,通过 CLI 按需拷贝
- **Seed 项目** (examples/seed): 示例应用,组合使用 core 和 ui
- **依赖关系**: seed → ui → core (单向依赖),seed → core (允许直接使用)
- **边界约束**: ESLint 规则检测 core 中的 UI 依赖,view 中的 engine 直接访问

### II. Source Code Delivery

✅ **PASS** - CLI 工具实现源码交付模式:
- **CLI 命令**: `terence init` (初始化)、`terence add` (添加组件)、`terence list` (列出组件)、`terence upgrade` (升级辅助)
- **源码拷贝**: ui 组件以源码形式拷贝到 seed/ui/ 目录,完全归 seed 项目所有
- **版本追踪**: meta.json 和 ui.config.json 追踪组件版本和 core 依赖
- **升级策略**: CLI 不自动覆盖,生成 diff 报告供开发者手动合并

### III. Business Logic Centricity

✅ **PASS** - Engine-Guard-Service 架构确保业务逻辑集中:
- **Engine**: 持有业务状态 (state: Readonly),暴露 actions 作为唯一修改入口
- **Guard**: 在 action 执行前校验参数和状态,失败时抛出明确错误且不修改状态
- **Service**: 纯业务服务,可被多个 engine 复用
- **显式状态**: 所有状态 JSON 可序列化,无循环引用,不依赖 UI 状态
- **单向数据流**: 状态只能通过 action 发生变化,action 内部可触发副作用但结果回到状态中

### IV. Adapter Pattern

✅ **PASS** - UI 组件严格实现 adapter-view 分离:
- **Adapter** (.adapter.js): UI 与 core 的唯一接缝点,负责调用 engine.actions、订阅 state、转换数据结构
- **View** (.view.jsx): 纯展示组件,只渲染 UI 和触发 adapter 方法,禁止直接访问 engine
- **Logic** (.logic.js): UI 内部状态 (可选),不包含业务逻辑
- **职责边界**: Adapter 禁止判断业务是否合法,View 禁止写业务 if/else

### V. Interface Constraints

✅ **PASS** - JavaScript 友好的工程约束:
- **JSDoc**: core 所有对外 API 必须使用 JSDoc 描述类型和契约
- **ESLint**: 自定义规则检测架构边界违规 (core 导入 antd、view 直接访问 engine)
- **运行时校验**: 关键边界进行参数与状态校验
- **结构约束**: 明确模块职责,固定代码组织方式

### VI. Testing Strategy

✅ **PASS** - 测试优先覆盖 core 层:
- **Core 测试**: 覆盖所有 engines/services/guards,优先于 ui 和 seed
- **测试原则**: 不 mock UI,不依赖浏览器环境
- **UI 测试**: Adapter 基本行为测试,View smoke test,不追求高覆盖率

### Gate Result

**所有宪法原则检查通过**,无违规需要论证。本计划完全符合 Terence 项目宪章和架构文档的要求。

## Project Structure

### Documentation (this feature)

```text
specs/002-arch-compliant-init/
├── spec.md              # 功能规格说明
├── plan.md              # 本文件 - 实施计划
├── research.md          # Phase 0 输出 - 技术调研
├── data-model.md        # Phase 1 输出 - 数据模型
├── quickstart.md        # Phase 1 输出 - 快速入门指南
├── contracts/           # Phase 1 输出 - API 契约
│   ├── core-api.md      # Core 包 API 契约
│   ├── cli-commands.md  # CLI 命令契约
│   └── ui-contract.md   # UI 组件契约
└── tasks.md             # Phase 2 输出 - 任务列表 (由 /speckit.tasks 生成)
```

### Source Code (repository root)

**Structure Decision**: 采用 Monorepo 结构,使用 pnpm workspace 管理。包含 4 个顶级包:packages/core (业务内核)、ui (UI 组件模板)、cli (CLI 工具)、examples/seed (示例应用)。删除了 Option 2 (Web 应用) 和 Option 3 (Mobile + API),因为本项目是前端业务组件体系,不是传统的全栈应用或移动应用。

```text
terence/
├── packages/
│   ├── core/                    # 业务内核层 (npm 包)
│   │   ├── engines/             # 业务引擎 (状态 + action)
│   │   │   ├── order.js         # 示例: 订单引擎
│   │   │   └── index.js
│   │   ├── services/            # 纯业务服务
│   │   │   ├── pricing.js       # 示例: 定价服务
│   │   │   └── index.js
│   │   ├── guards/              # 业务校验与断言
│   │   │   ├── orderGuard.js    # 示例: 订单校验
│   │   │   └── index.js
│   │   ├── adapters/            # 对外适配
│   │   │   ├── orderApi.js      # 示例: 订单 API 适配
│   │   │   └── index.js
│   │   ├── utils/               # 通用工具函数
│   │   │   ├── invariant.js     # 示例: 断言工具
│   │   │   └── index.js
│   │   ├── tests/               # Core 包单元测试
│   │   │   ├── engines/
│   │   │   ├── services/
│   │   │   └── guards/
│   │   ├── package.json
│   │   ├── README.md
│   │   └── index.js             # 对外出口
│   │
│   ├── ui/                      # UI 组件模板 (源码交付)
│   │   ├── components/
│   │   │   └── OrderForm/       # 示例: 订单表单组件
│   │   │       ├── OrderForm.view.jsx      # 纯 UI 视图
│   │   │       ├── OrderForm.adapter.js    # core 适配层
│   │   │       ├── OrderForm.logic.js      # UI 内部状态
│   │   │       ├── meta.json               # 组件元信息
│   │   │       └── index.js
│   │   ├── adapters/           # 通用 adapter
│   │   ├── hooks/              # UI 专用 hooks
│   │   ├── shared/             # UI 工具与常量
│   │   └── README.md
│   │
│   ├── cli/                    # CLI 工具
│   │   ├── src/
│   │   │   ├── commands/       # CLI 命令
│   │   │   │   ├── init.js     # 初始化命令
│   │   │   │   ├── add.js      # 添加组件命令
│   │   │   │   ├── list.js     # 列出组件命令
│   │   │   │   └── upgrade.js  # 升级命令
│   │   │   ├── utils/          # CLI 工具函数
│   │   │   │   ├── config.js   # 配置管理
│   │   │   │   ├── template.js # 模板处理
│   │   │   │   └── diff.js     # diff 生成
│   │   │   ├── index.js        # CLI 入口
│   │   │   └── cli.js          # terence 命令定义
│   │   ├── tests/              # CLI 测试
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── examples/
│       └── seed/               # 示例应用项目
│           ├── src/
│           │   ├── ui/         # CLI 生成的 UI 组件
│           │   │   └── OrderForm/
│           │   ├── pages/      # 页面组件
│           │   │   └── OrderPage.jsx
��           │   ├── App.jsx     # 应用入口
│           │   └── main.jsx    # React 入口
│           ├── public/
│           ├── index.html
│           ├── vite.config.js
│           ├── tailwind.config.js
│           ├── package.json
│           └── README.md
│
├── docs/                       # 项目文档
│   └── architecture/
│       ├── overall.md          # 总体架构设计
│       ├── core.md             # core 设计
│       ├── ui.md               # ui 设计
│       └── cli.md              # CLI 设计
│
├── .specify/                   # SpecKit 配置
│   ├── memory/
│   │   └── constitution.md     # 项目宪章
│   └── templates/
│
├── pnpm-workspace.yaml         # pnpm workspace 配置
├── package.json                # 根 package.json
├── .eslintrc.js                # ESLint 配置 (包含架构边界规则)
├── .eslintrc.core.js           # Core 包专用 ESLint 配置
├── vite.config.ts              # 统一构建配置
├── tsconfig.json               # JSDoc 类型检查配置
├── README.md                   # 项目 README
└── LICENSE
```

**结构说明**:
1. **packages/core**: 独立的 npm 包,包含所有业务逻辑,不依赖任何 UI 技术
2. **packages/ui**: UI 组件源码模板仓库,通过 CLI 按需拷贝到 seed 项目
3. **packages/cli**: CLI 工具,管理 UI 组件的生命周期 (init/add/list/upgrade)
4. **packages/examples/seed**: 示例应用,展示如何正确使用 core 和 ui
5. **docs/architecture**: 架构设计文档,所有开发必须遵循的最高约束
6. **.specify/memory/constitution.md**: 项目宪章,定义核心治理原则

## Complexity Tracking

> 本项目完全符合宪章要求,无复杂度违规需要论证。

| 原则 | 遵守情况 | 说明 |
|------|---------|------|
| I. Layered Architecture | ✅ 完全遵守 | 严格的三层分离,单向依赖,ESLint 强制边界 |
| II. Source Code Delivery | ✅ 完全遵守 | CLI 工具实现源码交付,非黑盒 npm 包 |
| III. Business Logic Centricity | ✅ 完全遵守 | Engine-Guard-Service 架构,业务逻辑集中在 core |
| IV. Adapter Pattern | ✅ 完全遵守 | Adapter-View 分离,adapter 是唯一接缝点 |
| V. Interface Constraints | ✅ 完全遵守 | JSDoc + ESLint + 运行时校验 |
| VI. Testing Strategy | ✅ 完全遵守 | 测试优先覆盖 core,不依赖浏览器环境 |

## Implementation Phases

### Phase 0: Research (技术调研)

**目标**: 解决 Technical Context 中的所有 NEEDS CLARIFICATION,确定技术选型和最佳实践。

**调研任务**:
1. **pnpm workspace 最佳实践**: 如何配置 monorepo,如何处理本地包依赖
2. **ESLint 架构边界检测**: 如何实现自定义规则检测 core 中的 UI 依赖
3. **JSDoc 类型检查**: 如何在不使用 TypeScript 的前提下实现完整的类型提示
4. **CLI 工具架构**: Commander.js + Inquirer 的最佳实践,如何实现源码拷贝和版本管理
5. **Vitest 配置**: 如何配置 monorepo 的测试,如何实现 core 包的独立测试
6. **React@19 + Vite@7**: 最新版本的最佳实践和已知问题

**输出**: `research.md` - 包含所有技术决策和理由

### Phase 1: Design (设计)

**目标**: 创建数据模型、API 契约和快速入门指南。

**设计任务**:
1. **数据模型** (`data-model.md`):
   - OrderEngine 的状态模型
   - OrderForm 的组件数据结构
   - meta.json 和 ui.config.json 的 schema

2. **API 契约** (`contracts/`):
   - Core 包 API: Engine、Guard、Service 的接口契约
   - CLI 命令契约: init/add/list/upgrade 的输入输出
   - UI 组件契约: Adapter-View 的接口规范

3. **快速入门** (`quickstart.md`):
   - 如何初始化项目
   - 如何创建新的 Engine
   - 如何创建新的 UI 组件
   - 如何在 seed 项目中使用

4. **Agent 上下文更新**: 运行 `update-agent-context.sh` 更新 AI 助手的上下文

**输出**: `data-model.md`, `contracts/*`, `quickstart.md`, agent-specific files

### Phase 2: Implementation (实施)

**目标**: 根据 Phase 1 的设计实现所有功能。

**说明**: 本阶段由 `/speckit.tasks` 命令生成详细的任务列表,本计划文档不包含具体实施任务。

**任务组织**: 将按用户故事组织任务,每个用户故事独立可测试、可交付。

## Next Steps

1. ✅ 完成 plan.md (本文件)
2. ⏭️ 执行 Phase 0: 创建 `research.md`
3. ⏭️ 执行 Phase 1: 创建 `data-model.md`, `contracts/`, `quickstart.md`
4. ⏭️ 运行 `/speckit.tasks` 生成详细任务列表
5. ⏭️ 开始实施 Phase 2

## References

- **功能规格**: [spec.md](./spec.md)
- **项目宪章**: [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md)
- **总体架构**: [`docs/architecture/overall.md`](../../docs/architecture/overall.md)
- **Core 设计**: [`docs/architecture/core.md`](../../docs/architecture/core.md)
- **UI 设计**: [`docs/architecture/ui.md`](../../docs/architecture/ui.md)
- **CLI 设计**: [`docs/architecture/cli.md`](../../docs/architecture/cli.md)
