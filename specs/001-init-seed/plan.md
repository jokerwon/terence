# Implementation Plan: @terence/seed 初始化脚手架搭建

**Branch**: `001-init-seed` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-init-seed/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

初始化 @terence/seed 项目脚手架,搭建符合 Terence 三层架构规范的 React 应用基础环境。核心目标是创建一个完整可用的开发环境,包括 Vite 构建配置、React 19 集成、Ant Design 6 主题、Zustand 状态管理、ESLint 规则、测试框架等,同时严格遵循架构边界:seed 只负责"用业务"而不是"定义业务"。

## Technical Context

**Language/Version**: JavaScript (ES2022+), 不使用 TypeScript
**Primary Dependencies**: React 19、React DOM 19、Vite 7、Ant Design 6、Zustand、@terence/core、@terence/ui
**Storage**: N/A (示例应用使用内存状态)
**Testing**: Vitest、@testing-library/react
**Target Platform**: Web (现代浏览器: Chrome、Firefox、Safari、Edge 最新版本)
**Project Type**: web (React SPA)
**Performance Goals**:
  - 开发服务器启动时间: < 5 秒
  - 生产构建时间: < 30 秒
  - 热更新响应时间: < 200ms
**Constraints**:
  - 必须遵循 Terence 三层架构 (seed → ui → core 单向依赖)
  - 必须通过 ESLint 检测并阻止架构边界违规
  - Zustand 只能管理 UI 状态,禁止管理 core 业务状态
  - 页面负责 engine 生命周期,ui 组件不感知路由
  - 代码必须通过 lint 检查才能提交
**Scale/Scope**:
  - 项目类型: 示例应用 (seed)
  - 预期页面数: 初始 1-3 个示例页面
  - 预期组件数: 初始基础组件集合
  - 测试覆盖率目标: 核心功能 >= 80%

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Layered Architecture (NON-NEGOTIABLE) ✅ PASS

**Requirement**: 严格的三层分离架构,依赖关系 seed → ui → core,禁止反向依赖

**Compliance**:
- ✅ FR-005: seed 通过 pnpm workspace 依赖 @terence/core 和 @terence/ui
- ✅ FR-016: Zustand 仅管理 UI 状态,禁止管理 core 业务状态
- ✅ FR-017: 页面组件直接使用 engine,禁止通过 zustand 间接访问
- ✅ FR-025: ui 组件完全不感知路由
- ✅ FR-026: core 完全不感知页面
- ✅ FR-019 ~ FR-022: 禁止在 seed 中编写业务逻辑,禁止 UI 直接调用 engine.actions

**Verification**: ESLint 规则必须检测并阻止所有架构边界违规

---

### II. Source Code Delivery ✅ PASS

**Requirement**: ui 层采用源码交付模式,通过 CLI 工具按需生成

**Compliance**:
- ✅ FR-001: 项目结构包含完整目录,支持 ui 组件源码管理
- ✅ 本项目 (seed) 作为 monorepo 内的示例应用,直接通过 import 使用 @terence/ui
- ✅ 其他项目仍通过 CLI 工具引入 ui 组件源码 (在 Out of Scope 中明确说明)

**Verification**: 不违反此原则,seed 项目特殊处理已明确说明

---

### III. Business Logic Centricity ✅ PASS

**Requirement**: 所有业务逻辑集中在 core 层

**Compliance**:
- ✅ FR-019: 禁止在 seed 页面中编写业务 if/else 判断
- ✅ FR-022: 禁止在 seed 中复制或模拟 core 业务逻辑
- ✅ 页面组件只负责 engine 实例生命周期和业务组合

**Verification**: ESLint 规则必须检测业务逻辑泄露到 seed

---

### IV. Adapter Pattern ✅ PASS

**Requirement**: 所有 ui 与 core 的交互必须通过 adapter 层

**Compliance**:
- ✅ FR-020: 禁止 UI 组件直接调用 engine.actions,必须通过 adapter
- ✅ FR-021: 禁止 UI 与业务状态双向绑定,只能单向订阅
- ✅ UI 组件只负责渲染,不直接访问 engine

**Verification**: ESLint 规则必须检测并阻止直接调用 engine.actions

---

### V. Interface Constraints ✅ PASS

**Requirement**: 在 JavaScript 技术栈下通过 JSDoc、ESLint、测试保证稳定性

**Compliance**:
- ✅ FR-010: ESLint 配置完整的规则集,检测架构边界违规
- ✅ FR-011: 测试框架配置完整,支持单元测试和集成测试
- ✅ FR-014: ESLint 能够检测并阻止架构边界违规
- ✅ Assumptions: 使用 JavaScript (ES2022+), 不使用 TypeScript

**Verification**: ESLint 配置和测试配置必须完整实现

---

### VI. Testing Strategy ✅ PASS

**Requirement**: 测试优先覆盖 core 层

**Compliance**:
- ✅ FR-020 ~ FR-021: 测试覆盖核心业务逻辑和关键 UI 组件
- ✅ SC-005: 测试覆盖率不低于 80%
- ✅ 本项目为 seed 层,测试重点是验证架构边界和集成

**Verification**: 测试配置和测试用例必须覆盖架构边界检测

---

### Gate Summary

| 原则 | 状态 | 说明 |
|------|------|------|
| I. Layered Architecture | ✅ PASS | 所有依赖关系和边界约束已明确 |
| II. Source Code Delivery | ✅ PASS | seed 项目直接使用 @terence/ui,已说明特殊处理 |
| III. Business Logic Centricity | ✅ PASS | 业务逻辑集中在 core,seed 只负责组合 |
| IV. Adapter Pattern | ✅ PASS | 明确要求通过 adapter 交互 |
| V. Interface Constraints | ✅ PASS | ESLint 和测试配置要求明确 |
| VI. Testing Strategy | ✅ PASS | 测试覆盖率目标明确 |

**Conclusion**: ✅ **ALL GATES PASSED** - 可以继续 Phase 0 研究

## Project Structure

### Documentation (this feature)

```text
specs/001-init-seed/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (TO BE CREATED)
├── data-model.md        # Phase 1 output (TO BE CREATED)
├── quickstart.md        # Phase 1 output (TO BE CREATED)
├── contracts/           # Phase 1 output (TO BE CREATED - if needed)
├── checklists/          # Quality checklists
│   └── requirements.md  # Specification quality checklist
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
apps/seed/                    # Seed 应用根目录 (目标结构)
├── src/
│   ├── assets/              # 静态资源 (图片、字体等)
│   ├── components/          # 项目级组件 (非业务组件)
│   ├── pages/               # 页面级组件 (负责 engine 生命周期)
│   │   └── [PageName]/
│   │       ├── index.jsx    # 页面入口
│   │       └── use[PageName].js  # 页面自定义 hooks
│   ├── routes/              # 路由配置
│   │   └── index.jsx
│   ├── stores/              # Zustand stores (仅 UI 状态)
│   │   └── useUIStore.js    # 示例: 跨页面 UI 状态
│   ├── hooks/               # 项目级 hooks
│   ├── utils/               # 项目级工具函数
│   ├── constants/           # 项目级常量
│   ├── services/            # 项目级服务 (API、auth 等)
│   ├── styles/              # 样式文件 (Tailwind、主题)
│   ├── main.jsx             # 应用入口
│   └── App.jsx              # 应用根组件
├── public/                  # 公共静态资源
├── index.html               # HTML 入口
├── vite.config.js           # Vite 配置
├── .eslintrc.js             # ESLint 配置
├── vitest.config.js         # Vitest 配置
├── package.json             # 依赖管理
└── README.md                # 项目文档
```

**Structure Decision**: 选择 **Web application** 结构,因为:
1. 这是一个 React 单页应用 (SPA)
2. 使用 Vite 作为构建工具
3. 需要明确的 pages、routes、stores 分离
4. 符合架构文档 `docs/architecture/seed.md` 第 3 节的推荐结构

**现有状态**: `apps/seed/` 目录已存在,包含基础文件 (App.jsx、main.jsx、package.json 等)

**实施策略**:
- 保留现有文件,补充缺失的目录结构
- 更新配置文件 (vite、eslint、vitest)
- 添加示例页面和 stores
- 实现架构边界检测的 ESLint 规则

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违反项 - 所有宪章原则均已通过

---

## Phase 0: Research & Technology Decisions

**Status**: ✅ COMPLETE

**Goal**: 解决技术选型和最佳实践问题,为 Phase 1 设计提供依据

**Research Tasks**:
1. ✅ Vite 7 最佳实践 - React 19 集成、插件配置、路径别名
2. ✅ Ant Design 6 主题定制 - token 配置、样式覆盖、暗色模式支持
3. ✅ Zustand 最佳实践 - store 组织、持久化中间件、devtools 集成
4. ✅ ESLint 架构边界检测 - no-restricted-imports、自定义规则实现
5. ✅ Vitest 配置 - 与 Vite 集成、@testing-library/react 配置
6. ✅ React 19 新特性 - 并发渲染、自动批处理、use()、useTransition()
7. ✅ 路由方案选择 - React Router v6 vs 其他方案
8. ✅ 样式方案 - Tailwind CSS 集成、CSS Modules、styled-components 选择

**Output**: ✅ [research.md](./research.md) - 所有技术决策和依据已记录

**关键决策**:
- 使用 Vite 7 + React 19 + Ant Design 6 + Zustand + React Router v6 + Tailwind CSS
- ESLint 使用 no-restricted-imports 检测架构边界违规
- Vitest + @testing-library/react 用于测试
- 所有技术选型无 NEEDS CLARIFICATION,可以直接进入 Phase 1

---

## Phase 1: Design & Contracts

**Status**: ✅ COMPLETE

**Prerequisites**: `research.md` 完成 ✅

**Deliverables**:
**Deliverables**:
1. ✅ [data-model.md](./data-model.md) - UI 状态模型和数据流架构
2. ❌ contracts/** - 本项目不涉及外部 API 契约,无需生成
3. ✅ [quickstart.md](./quickstart.md) - 快速开始指南

**Phase 1 成果**:
- ✅ 定义了 useUIStore 的数据结构和 Actions
- ✅ 明确了业务状态、UI 状态、本地状态的边界
- ✅ 提供了完整的数据流架构图
- ✅ 编写了快速开始指南,包含开发工作流和常见问题
- ✅ 更新了 Claude Code agent 上下文文件

---

## Phase 2: Task Breakdown

**Status**: ⏳ PENDING (通过 `/speckit.tasks` 命令生成)

**Note**: 本阶段不包含在此 plan.md 中,需要单独运行 `/speckit.tasks` 命令生成 `tasks.md`

---

## Dependencies

### External Dependencies (已明确)
- React 19、React DOM 19
- Vite 7
- Ant Design 6
- Zustand
- Vitest
- @testing-library/react

### Internal Dependencies (monorepo)
- @terence/core (workspace:*)
- @terence/ui (workspace:*)

### Critical Dependencies
- pnpm workspace 正常工作
- Vite 正确解析路径别名
- ESLint 能够检测架构边界违规

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| React 19 生态兼容性 | 中 | 使用成熟插件,避免实验性特性 |
| Ant Design 6 迁移成本 | 低 | 从零开始,无历史包袱 |
| ESLint 规则复杂度 | 中 | 分阶段实现,先实现核心规则 |
| Zustand 滥用风险 | 中 | 通过文档、示例、ESLint 规则约束 |
| 跨层边界检测困难 | 高 | 重点实现,no-restricted-imports + 自定义规则 |

---

## Success Criteria

来自 `spec.md` 的成功标准:

- SC-001: 开发者可以在 2 分钟内启动开发环境
- SC-002: 开发服务器在 5 秒内启动
- SC-003: 构建在 30 秒内完成
- SC-004: 代码 100% 通过 ESLint 检查
- SC-005: 测试覆盖率 >= 80%
- SC-006: 新开发者 30 分钟内理解项目结构
- SC-007: 项目提供清晰的目录结构和配置
- SC-008: 项目代码 100% 符合架构规范
- SC-009: 所有组件和页面都有清晰命名和注释
- SC-010: 状态管理正确集成 core 引擎

---

**Next Steps**:
1. ✅ Constitution Check 已通过
2. ⏳ 开始 Phase 0 研究,生成 `research.md`
3. ⏳ 完成 Phase 1 设计,生成数据模型和契约
4. ⏳ 运行 `/speckit.tasks` 生成任务分解
