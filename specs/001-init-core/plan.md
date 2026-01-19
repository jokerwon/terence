# Implementation Plan: Core 业务内核初始化

**Branch**: `001-init-core` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-init-core/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本特性旨在初始化 @terence/core 包,建立 Engine + Adapter 架构的业务内核层。核心需求包括:

1. **建立标准化的 Engine 模型**: 提供 createXxxEngine(deps) 工厂函数,返回包含 getState、subscribe、commands、rules 的标准接口
2. **实现 React Adapter 模式**: 提供 createReactAdapter(engine) 通用适配器,连接业务引擎与 React 组件
3. **强制执行架构边界**: 通过目录结构和 ESLint 规则确保 core 层不依赖 UI 框架
4. **建立依赖注入机制**: Engine 通过 deps 接口执行副作用,不直接使用 fetch/axios/localStorage

技术方法: 基于 docs/architecture/core.md 的设计理念,在 packages/core 目录下建立 engines/、adapters/、contracts/ 子目录,以登录功能为示例实现首个完整的 Engine。

## Technical Context

**Language/Version**: JavaScript (ES2022+)
**Primary Dependencies**: React 19 (用于 Adapter,非 Engine), Zustand (应用状态,非业务状态)
**Storage**: N/A (Engine 通过依赖注入访问存储)
**Testing**: Vitest (与现有构建工具 Vite 集成)
**Target Platform**: Node.js (Engine 独立运行) + Browser (React Adapter)
**Project Type**: 单项目 - packages/core 作为独立 npm 包
**Performance Goals**: Engine 状态更新 < 1ms, Adapter 订阅延迟 < 5ms
**Constraints**: 核心 Engine 必须可在 Node 环境独立运行,不依赖浏览器 API
**Scale/Scope**: 预期支持 50+ 业务 Engine,每个 Engine 平均 5-10 个 commands 和 3-5 个 rules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Layered Architecture (NON-NEGOTIABLE)

✅ **PASS**: 本特性专门实现 core 层的业务内核,符合三层分离架构:
- core 层职责: 定义业务状态、规则和流转
- 不依赖 UI 技术 (antd、DOM、CSS)
- 单向依赖: seed → core (本特性不涉及反向依赖)

**实现证据**:
- 目录结构: packages/core/engines/ 禁止 import react/zustand/antd
- Engine 标准形态: 不包含任何 UI 相关代码
- ESLint 规则: 将添加边界检测

### II. Source Code Delivery

✅ **PASS**: 本特性不涉及 ui 层,仅实现 core 层作为 npm 包交付。

### III. Business Logic Centricity

✅ **PASS**: Engine 模型完全符合业务逻辑中心原则:
- 职责单一: 只关心"业务是什么",不关心"如何展示"
- 显式状态: 所有业务状态可枚举、可序列化
- 单向数据流: 状态只能通过 command (action) 变化
- JavaScript 友好: 使用 JSDoc 描述接口

**实现证据**:
- FR-001: 标准 Engine 接口包含 getState、commands、rules
- FR-003: 状态是可序列化的业务真实状态
- FR-006: 所有 rules 是纯函数

### IV. Adapter Pattern

✅ **PASS**: 将实现 Adapter 模式连接 ui 与 core:
- Adapter 职责: 调用 engine.commands、订阅 engine.state、转换数据
- Adapter 禁止: 判断业务合法性、推断业务流程、修改业务状态
- View 规范: 只接收 adapter 提供的数据,渲染 antd 组件

**实现证据**:
- FR-004: 提供通用的 createReactAdapter(engine)
- User Story 2: React 组件通过 Adapter 集成 Engine

### V. Interface Constraints

✅ **PASS**: 在 JavaScript 技术栈下通过以下方式保证稳定性:
- **结构约束**: 明确的模块职责和代码组织方式 (engines/、adapters/、contracts/)
- **接口约束**: 所有对外 API 使用 JSDoc 描述
- **运行时约束**: 关键边界进行参数与状态校验
- **工程约束**: ESLint 规则 + 单元测试覆盖 core

**实现证据**:
- FR-010: 提供合规性检查机制
- Success Criteria SC-003: 代码审查能明确判断违规代码

### VI. Testing Strategy

✅ **PASS**: 测试优先覆盖 core 层:
- Engine 必测内容: 状态初始化、每个 command 的状态变化、rules 验证
- 测试原则: 不 mock UI、不依赖浏览器环境
- ui 层测试: Adapter 基本行为测试,View Smoke test

**实现证据**:
- FR-007: Engine 可在 Node 环境独立运行(便于测试)
- User Story 1: 可通过创建简单 Engine 独立测试

### 总体评估

✅ **ALL GATES PASSED**: 本特性完全符合 Terence Project Constitution 的所有核心原则。

**无需 Complexity Tracking**: 没有违反任何架构约束,所有设计都是实现原则所必需的。

## Project Structure

### Documentation (this feature)

```text
specs/001-init-core/
├── plan.md              # 本文件 (/speckit.plan command output)
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
├── contracts/           # Phase 1 输出 (Engine 能力声明)
└── tasks.md             # Phase 2 输出 (/speckit.tasks command - 非本阶段创建)
```

### Source Code (repository root)

```text
packages/core/
├── engines/
│   └── login/           # 示例: 登录业务引擎
│       ├── engine.js    # createLoginEngine 工厂函数
│       ├── state.js     # 初始状态定义
│       ├── commands.js  # 业务动作实现
│       ├── rules.js     # 业务判断规则
│       └── effects.js   # 副作用接口约定 (JSDoc)
├── adapters/
│   └── react/
│       ├── createAdapter.js  # 通用 React Adapter 工厂
│       └── useLogin.js       # 登录引擎的 React hook (可选,示例用)
├── contracts/
│   └── login.contract.js     # 登录引擎对外能力声明
├── utils/
│   └── validation.js    # 运行时参数校验工具
├── .eslintrc.js         # Core 层专用 ESLint 配置
└── index.js             # 对外出口

tests/
├── unit/
│   └── engines/
│       └── login.test.js    # Engine 单元测试
└── integration/
    └── adapter.test.js      # Adapter 集成测试

docs/
└── architecture/
    └── core.md             # 已存在,作为设计指导
```

**Structure Decision**: 选择"单项目"结构,因为 @terence/core 是独立的 npm 包,专注于业务内核层,不包含前端或后端应用。

### 与现有项目的关系

```
terence/
├── packages/
│   ├── core/              # 本特性创建
│   └── ui/                # 未来特性 (非本阶段)
└── apps/
    └── seed/              # 已存在 (001-init-seed 特性)
```

依赖关系: `apps/seed → packages/core` (单向依赖)

## Complexity Tracking

> 本特性无需填写,因为没有违反任何 Constitution 原则。

## Phase 0: Research & Technical Decisions

本阶段需要解决的技术问题:

1. **Engine 状态管理实现**: 选择何种状态容器模式实现 getState/subscribe?
   - 选项: 自定义发布订阅 / Observable / 其他
   - 约束: 必须在 Node 环境运行,不依赖浏览器 API

2. **React Adapter 集成模式**: 如何最优地集成 useSyncExternalStore?
   - 订阅管理: 单例 vs 多实例
   - 性能优化: 选择性订阅策略

3. **依赖注入接口设计**: deps 接口的标准形态和运行时校验
   - 接口契约: JSDoc vs Schema 校验
   - 错误处理: 缺失依赖的检测机制

4. **ESLint 边界规则**: 如何检测 engines/** 内是否 import 了禁止的模块?
   - 自定义 ESLint rule
   - 或使用现有 no-restricted-imports

5. **测试策略**: Engine 单元测试的 Mock 策略
   - deps mock 方案
   - 副作用测试模式

## Phase 1: Design Artifacts (待生成)

### 1.1 Data Model

将生成 `data-model.md`,包含:
- Engine 实体模型 (state 结构、commands 接口、rules 签名)
- Adapter 实体模型 (React hooks 接口)
- 依赖注入契约 (deps 接口规范)

### 1.2 API Contracts

将生成 `contracts/` 目录下的文件:
- `login.contract.js`: 登录引擎的能力声明 (使用 JSDoc)
- 通用 Engine 接口定义

### 1.3 Quickstart Guide

将生成 `quickstart.md`,包含:
- 如何创建新的 Engine
- 如何使用 React Adapter
- 如何编写测试
- 常见问题和最佳实践

## Phase 2: Implementation Tasks (待 /speckit.tasks 生成)

本阶段不生成 tasks.md,留待 `/speckit.tasks` 命令处理。

## Next Steps

1. ✅ Constitution Check - 已通过所有原则检查
2. 🔄 Phase 0: 执行研究,解决 Technical Context 中的 NEEDS CLARIFICATION
3. ⏳ Phase 1: 生成设计工件 (data-model.md, contracts/, quickstart.md)
4. ⏳ Phase 2: 执行 `/speckit.tasks` 生成实施任务清单
