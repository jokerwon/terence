# Feature Specification: 重建 @terence/core 脚手架

**Feature Branch**: `001-rebuild-core-scaffold`
**Created**: 2026-01-20
**Status**: Draft
**Input**: User description: "我更新了 @docs/architecture/core.md 。请根据该设计文档，重新搭建 @terence/core 的脚手架"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Stateless Core 开发登录业务 (Priority: P1)

作为业务开发者，我需要使用 Stateless Core 来实现简单的登录业务逻辑，以便能够通过纯函数和流程函数处理登录���证，而无需引入复杂的状态管理。

**Why this priority**: 这是架构文档中的 Track A（默认轨道），覆盖 80%+ 的业务场景，是整个 Core 层的基础。

**Independent Test**: 可以通过创建一个登录业务的 Stateless Core 实现，包含 rules.js、flows.js 和 contracts.js 三个文件，独立测试业务规则和流程逻辑是否正确工作。

**Acceptance Scenarios**:

1. **Given** 一个新的登录业务模块，**When** 开发者创建 `core/login/rules.js`，**Then** 该文件包含纯函数验证规则（如 `canSubmit`）
2. **Given** 登录表单数据和副作用接口，**When** 调用 `flows.js` 中的 `submitLogin` 函数，**Then** 函数先执行规则验证，再调用外部副作用
3. **Given** `contracts.js` 定义了副作用接口，**When** 项目层提供具体实现，**Then** Core 层可以正常调用这些副作用而无需了解实现细节

---

### User Story 2 - Stateful Engine 管理复杂订单流程 (Priority: P2)

作为业务开发者，我需要使用 Stateful Engine 来实现复杂的多阶段订单流程，以便能够管理跨多次交互的持久化业务状态。

**Why this priority**: 这是架构文档中的 Track B（受限轨道），虽然使用频率较低，但对于复杂业务流程至关重要，需要确保正确实现。

**Independent Test**: 可以通过创建一个订单 Engine，包含状态机、状态迁移规则和订阅机制，独立测试状态迁移是否按预期工作。

**Acceptance Scenarios**:

1. **Given** 一个订单流程 Engine，**When** 创建时提供初始状态和上下文，**Then** Engine 返回标准接口（getState、subscribe、actions）
2. **Given** 订单处于草稿状态，**When** 调用 `actions.transition` 提交订单，**Then** Engine 执行状态迁移并通知所有订阅者
3. **Given** Engine 持有业务状态，**When** 外部通过 `getState` 查询，**Then** 返回当前完整状态快照

---

### User Story 3 - React Adapter 连接 Engine 和 UI (Priority: P1)

作为 UI 开发者，我需要通过 React Adapter 将 Engine 集成到 React 组件中，以便能够在 UI 层响应式地使用业务状态和动作。

**Why this priority**: Adapter 是 Core 与 UI 之间的唯一桥梁，是架构设计的关键约束，必须确保实现正确。

**Independent Test**: 可以通过创建一个 React Hook，使用 `useSyncExternalStore` 订阅 Engine 状态变化，独立测试 React 组件能否正确响应 Engine 的状态更新。

**Acceptance Scenarios**:

1. **Given** 一个 Engine 实例，**When** 通过 `createReactAdapter` 创建 Hook，**Then** 返回的 Hook 可以在 React 组件中使用
2. **Given** 组件使用了 Adapter Hook，**When** Engine 内部状态发生变化，**Then** 组件自动重新渲染以反映最新状态
3. **Given** Adapter Hook 返回了 state、commands 和 rules，**When** 组件调用 commands 或 rules，**Then** 正确触发 Engine 的动作或规则判断

---

### User Story 4 - 目录结构与代码组织 (Priority: P1)

作为项目维护者，我需要按照架构文档规范组织 Core 层的目录结构，以便代码可维护、可扩展，并符合设计约束。

**Why this priority**: 目录结构是架构落地的物理基础，必须在代码实现之前确定，确保后续开发不偏离设计。

**Independent Test**: 可以通过检查 `packages/core/src` 下的目录和文件组织，验证是否严格遵循架构文档的结构规范。

**Acceptance Scenarios**:

1. **Given** Stateless Core 模块（如 login），**When** 查看其目录结构，**Then** 包含 rules.js、flows.js、contracts.js 三个文件
2. **Given** Stateful Engine 模块（如 order-engine），**When** 查看其目录结构，**Then** 包含 engine.js、transitions.js、contract.js 三个文件
3. **Given** 整个 Core 包，**When** 查看顶层结构，**Then** 明确区分 stateless/ 和 engines/ 两个目录，不包含 adapter/（Adapter 属于 UI 层）

---

### User Story 5 - 反模式检测与约束 (Priority: P2)

作为项目维护者，我需要确保代码不违反架构设计约束，以便避免常见的架构腐化问题（如 Core 内部使用状态管理库）。

**Why this priority**: 这是保证架构长期健康的关键机制，虽然不影响功能实现，但对代码质量和可维护性至关重要。

**Independent Test**: 可以通过 ESLint 规则或人工 Code Review，检查代码是否包含禁止的模式（如 Core 内引入 Zustand）。

**Acceptance Scenarios**:

1. **Given** Core 层代码，**When** 尝试引入 Zustand/Redux 等状态管理库，**Then** 构建工具或 ESLint 报错
2. **Given** Stateless Core 代码，**When** 尝试保存状态或订阅变化，**Then** 代码审查工具标记为反模式
3. **Given** UI 层代码，**When** 直接调用 Engine.subscribe（不通过 Adapter），**Then** ESLint 规则发出警告

---

### Edge Cases

- 当项目需要同时使用 Stateless Core 和 Stateful Engine 时，如何避免混用轨道？
- 当 Engine 的副作用执行失败时，如何保证状态不发生脏写？
- 当 Adapter 在 SSR 环境下使用时，如何处理初始快照？
- 当多个组件订阅同一个 Engine 时，如何避免内存泄漏？
- 当业务规则过于复杂时，如何判断应该升级为 Engine 还是保持 Stateless Core？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Core 层 MUST 明确分为两个轨道：Track A (Stateless Core) 和 Track B (Stateful Engine)，不允许混用
- **FR-002**: Stateless Core MUST 只包含三类文件：rules.js（业务规则纯函数）、flows.js（业务流程函数）、contracts.js（副作用接口定义）
- **FR-003**: Stateless Core MUST NOT 保存任何业务状态、订阅状态变化、引入状态管理库或感知 React 生命周期
- **FR-004**: Stateful Engine MUST 只在满足三个条件时使用：明确的多阶段流程、状态跨多次交互持续存在、UI 严重依赖当前业务阶段
- **FR-005**: Stateful Engine MUST 提供标准接口：getState、subscribe、actions，不得直接操作 UI 或引入 React
- **FR-006**: Adapter MUST 属于 UI 层，不得下沉到 Core 包中
- **FR-007**: Adapter MUST 使用 React 的 useSyncExternalStore API 实现 Engine 状态订阅
- **FR-008**: Core 层 MUST 通过 contracts.js 定义副作用接口，由项目层提供具体实现
- **FR-009**: 所有业务模块 MUST 优先使用 Stateless Core，只有在明确痛点时才引入 Engine
- **FR-010**: 目录结构 MUST 区分 stateless/ 和 engines/，不得混淆
- **FR-011**: Engine 管理流程态，Zustand 管理页面态/UI 派生态，两者不得相互直接修改内部状态
- **FR-012**: 新业务一律从 Stateless Core 开始，只有出现明确痛点才引入 Engine

### Key Entities

- **Stateless Core**: 业务规则与流程算法的集合，无状态，通过参数接收数据，通过 contracts 调用副作用
- **Stateful Engine**: 可运行的业务流程实体，持有状态，执行状态迁移，暴露业务动作，通过订阅机制通知变化
- **Adapter**: Engine 与 React 之间的桥梁，将 Engine 的状态订阅机制适配到 React 的响应式系统
- **Contract**: 副作用接口定义，描述 Core 需要的外部能力（如登录请求、导航、Token 持久化），由项目层实现

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 所有 Core 模块 100% 遵循双轨模型，不存在混用轨道的情况
- **SC-002**: Stateless Core 模块 0% 包含状态管理代码（通过静态分析工具验证）
- **SC-003**: 每个 Stateful Engine 配套一个 React Adapter，覆盖率 100%
- **SC-004**: 代码审查中反模式检出率为 0%（无违反架构约束的代码）
- **SC-005**: 业务开发者可以在 10 分钟内通过文档和示例创建一个新的 Stateless Core 模块
- **SC-006**: 目录结构检查通过率 100%（符合架构文档规范）
- **SC-007**: 新业务默认使用 Stateless Core 的比例 > 80%

## Assumptions

- Core 层只服务于 React 项目，但不被 React 污染（Core 代码本身不包含 React 依赖）
- 项目层已经使用 Zustand 作为全局状态管理方案
- 使用 Vite 作为构建工具，Vitest 作为测试框架
- 使用 ESLint 进行代码质量检查
- 开发者熟悉函数式编程和副作用分离概念

## Open Questions

目前没有需要澄清的问题。架构设计文档已经提供了明确的规范和约束。

## Out of Scope

- 具体的业务逻辑实现（如具体的登录算法、订单状态机逻辑）
- 性能优化（如大规模并发场景下的状态订阅优化）
- 多框架支持（Core 仅服务于 React）
- 状态迁移的版本管理和迁移策略
- 开发工具（如 CLI 工具自动生成 Core 模块脚手架）
