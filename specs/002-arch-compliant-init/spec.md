# Feature Specification: Architecture-Compliant Project Initialization

**Feature Branch**: `002-arch-compliant-init`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "请你自己根据 docs/architecture 下的文件理解规范"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 三层架构基���搭建 (Priority: P1)

开发者需要搭建符合 Terence 架构规范的 monorepo 项目结构,实现 core、ui、seed 三层严格分离和单向依赖。

**Why this priority**: 这是整个架构的基石。没有正确的三层分离和依赖约束,所有后续的业务逻辑都无法保证"业务确定性 + UI 可塑性 + 项目可生长性"的核心目标。

**Independent Test**: 可以通过验证目录结构、依赖方向和边界约束规则来独立测试。检查 core 不依赖 UI,ui 不依赖 seed,且 ESLint 能检测边界违规。

**Acceptance Scenarios**:

1. **Given** 空的仓库根目录, **When** 创建项目结构, **Then** 存在 packages/core、ui、cli 和示例 seed 四个顶级目录
2. **Given** 创建的项目结构, **When** 检查依赖关系, **Then** 只存在 seed→ui→core 和 seed→core 的单向依赖
3. **Given** 安装依赖的项目, **When** 运行 ESLint 检查, **Then** 能检测并阻止 core 导入 antd、DOM 或 JSX
4. **Given** core 包, **When** 检查其依赖, **Then** 不包含任何 UI 相关包(antd、react、@ui/*)

---

### User Story 2 - Core 包的 Engine-Guard-Service 架构实现 (Priority: P1)

开发者需要在 core 包中建立完整的 Engine-Guard-Service 架构,确保业务逻辑的唯一真理源。

**Why this priority**: core 是"业务是什么、如何流转、什么是合法状态"的唯一来源。没有正确的 Engine/Guard/Service 分离,业务逻辑会散落在各处,无法保证跨项目行为一致性。

**Independent Test**: 可以通过创建一个示例 Engine(如 OrderEngine)来独立测试。验证其 state、actions、guard 的正确性和独立性。

**Acceptance Scenarios**:

1. **Given** core 包结构, **When** 检查目录, **Then** 存在 engines/、services/、guards/、adapters/、utils/ ��个目录
2. **Given** 一个 Engine 文件, **When** 导入使用, **Then** 返回 { state: Readonly, actions: Object } 结构
3. **Given** Engine 的 action, **When** 执行非法操作, **Then** Guard 抛出明确的业务错误且状态未改变
4. **Given** core 包的 API, **When** 在 IDE 中查看, **Then** 所有对外方法都有完整的 JSDoc 类型定义

---

### User Story 3 - CLI 源码交付工具实现 (Priority: P1)

开发者需要一个 CLI 工具来管理 UI 组件的源码交付生命周期,实现"源码交付优于黑盒依赖"的架构原则。

**Why this priority**: CLI 是实现 UI 层可定制性的关键。没有 CLI,ui 层只能作为 npm 包交付,会导致"黑盒组件库"的不可控性和定制困难。

**Independent Test**: 可以通过执行 CLI 命令并验证生成的文件结构来独立测试。检查 init、add、list、upgrade 命令的正确性。

**Acceptance Scenarios**:

1. **Given** 安装的 CLI 工具, **When** 运行 `terence init`, **Then** 在项目根目录创建 ui.config.json 和 ui/ 目录
2. **Given** 初始化的项目, **When** 运行 `terence add OrderForm`, **Then** 从 ui 模板拷贝组件源码到 seed/ui/ 目录
3. **Given** 生成的组件, **When** 检查文件结构, **Then** 包含 .view.jsx、.adapter.js、.logic.js 和 meta.json
4. **Given** 生成的 meta.json, **When** 检查内容, **Then** 记录组件版本、core 依赖名称和最小版本要求
5. **Given** CLI 工具, **When** 运行 `terence list`, **Then** 显示已引入组件的名称、版本和 core 依赖

---

### User Story 4 - UI 层的 Adapter-View 分离实现 (Priority: P2)

开发者需要创建符合"Adapter 是唯一接缝点"规范的 UI 组件模板,确保 UI 不直接操作业务状态。

**Why this priority**: Adapter 模式是防止业务逻辑泄露到 UI 的关键。没有正确的 Adapter-View 分离,开发者会在 View 中写业务 if/else,破坏架构边界。

**Independent Test**: 可以通过生成一个示例组件并检查其文件职责来独立测试。验证 View 只渲染、Adapter 只对接、无业务逻辑泄露。

**Acceptance Scenarios**:

1. **Given** UI 组件模板, **When** 检查 .view.jsx, **Then** 只包含 JSX 和 antd 组件,不直接访问 core engine
2. **Given** UI 组件模板, **When** 检查 .adapter.js, **Then** 只调用 engine.actions、订阅 state、转换数据结构
3. **Given** UI 组件模板, **When** 检查代码, **Then** View 的所有判断都来自 adapter 传入的 state,无业务 if/else
4. **Given** UI 组件, **When** 检查 antd Form, **Then** 校验规则只有格式校验,无业务规则判断

---

### User Story 5 - JavaScript 工程约束配置 (Priority: P2)

开发者需要配置 ESLint、JSDoc、测试等工程工具,确保在 JavaScript 技术栈下仍然具备清晰的边界与约束。

**Why this priority**: 在不使用 TypeScript 的前提下,工程约束是保证架构边界的唯一方式。没有正确的 ESLint 规则和 JSDoc,架构约束会形同虚设。

**Independent Test**: 可以通过运行 lint、测试和构建命令来独立测试。验证边界检测、JSDoc 提示和 core 测试覆盖率。

**Acceptance Scenarios**:

1. **Given** 配置的 ESLint, **When** 在 core 中导入 antd, **Then** ESLint 报错并提示违反架构边界
2. **Given** 配置的 ESLint, **When** 在 ui view 中直接访问 engine, **Then** ESLint 报错并提示应通过 adapter
3. **Given** core 包的 JSDoc, **When** 在 IDE 中使用, **Then** 显示完整的参数类型、返回值和示例
4. **Given** 测试配置, **When** 运行测试, **Then** core 包的测试覆盖所有 engines/services/guards
5. **Given** 构建配置, **When** 运行构建, **Then** core 包生成包含 JSDoc 的 npm 包,所有包独立构建

---

### User Story 6 - 示例业务场景验证 (Priority: P3)

开发者需要一个完整的业务场景示例(如订单管理),验证三层架构在实际业务中的正确性和可用性。

**Why this priority**: 示例是架构可行性的最佳证明,也是其他项目的参考模板。没有真实场景的验证,架构设计可能存在理论完美但实践困难的问题。

**Independent Test**: 可以通过运行示例应用并执行完整的业务流程来独立测试。验证数据流、状态流转和错误处理。

**Acceptance Scenarios**:

1. **Given** 示例 seed 应用, **When** 运行开发服务器, **Then** 应用正常启动并显示订单管理界面
2. **Given** 运行的应用, **When** 添加订单项, **Then** core engine 的 state 更新,UI 正确反映变化
3. **Given** 有订单项的状态, **When** 提交订单, **Then** core guard 校验通过,action 触发副作用,状态更新为 completed
4. **Given** 提交失败的场景, **When** API 返回错误, **Then** core 捕获异常,状态更新为失败,UI 显示错误提示
5. **Given** 示例代码, **When** 检查导入关系, **Then** 严格遵循 seed→ui→core 单向依赖,无反向依赖

---

### Edge Cases

- 当用户尝试在 core 中导入 @ui/* 包时,ESLint 必须报错并提示违反架构原则
- 当用户在 ui view 中直接 `engine.actions.xxx()` 时,ESLint 必须警告应通过 adapter
- 当 core 包版本不满足 ui 组件的 meta.json 要求时,CLI 必须阻止添加并提示升级 core
- 当生成的组件文件已存在时,CLI 必须提示冲突并要求用户确认是否覆盖
- 当 monorepo 的 workspace 依赖解析失败时,必须给出清晰的错误信息和建议
- 当业务规则校验失败时,core 的 guard 必须抛出包含业务语义的错误,UI 决定如何展示

## Requirements *(mandatory)*

### Functional Requirements

**架构分层要求**:
- **FR-001**: 项目 MUST 采用三层分离架构:packages/core、ui、cli、examples/seed
- **FR-002**: 依赖关系 MUST 只允许 seed→ui→core 和 seed→core,严禁反向依赖
- **FR-003**: core 包 MUST 以独立 npm 包形式发布,使用语义化版本控制
- **FR-004**: ui 层 MUST 以源码模板形式存在,通过 CLI 按需拷贝到 seed 项目
- **FR-005**: 所有的架构边界违规 MUST 能被 ESLint 自动检测并阻止

**Core 包要求**:
- **FR-006**: core 包 MUST 包含 engines/、services/、guards/、adapters/、utils/ 五个目录
- **FR-007**: Engine MUST 返回 { state: Readonly, actions: Object } 结构,state 不可变
- **FR-008**: Engine 的 actions MUST 是唯一的状态修改入口
- **FR-009**: Guard MUST 在 action 执行前校验参数和状态,失败时抛出明确错误且不修改状态
- **FR-010**: core 的所有对外 API MUST 使用 JSDoc 描述类型和契约
- **FR-011**: core 包 MUST 不依赖任何 UI 技术(antd、DOM、CSS、react、@ui/*)
- **FR-012**: core 的状态 MUST 是 JSON 可序列化、无循环引用、不依赖 UI 状态的纯数据

**CLI 工具要求**:
- **FR-013**: CLI MUST 提供 init 命令,在项目中创建 ui.config.json 和 ui/ 目录
- **FR-014**: CLI MUST 提供 add 命令,从 ui 模板拷贝组件源码到 seed 项目
- **FR-015**: CLI MUST 提供 list 命令,显示已引入组件的名称、版本、core 依赖
- **FR-016**: CLI MUST 提供 upgrade 命令,对比模板版本并生成 diff 报告
- **FR-017**: 生成的每个组件 MUST 包含 meta.json,记录版本和 core 依赖
- **FR-018**: ui.config.json MUST 追踪所有已引入组件的元信息

**UI 层要求**:
- **FR-019**: ui 组件 MUST 分离为 .view.jsx、.adapter.js、.logic.js 三个文件
- **FR-020**: view 文件 MUST 只负责渲染,不直接访问 core engine,不写业务 if/else
- **FR-021**: adapter 文件 MUST 是唯一与 core 交互的接口,负责调用 actions、订阅 state、转换数据
- **FR-022**: view 的所有判断逻辑 MUST 来自 adapter 传入的 state,无隐式业务逻辑
- **FR-023**: antd Form 的校验规则 MUST 只包含格式校验,业务校验必须由 core 完成
- **FR-024**: ui 组件 MUST 基于 antd@6 实现

**工程约束要求**:
- **FR-025**: 项目 MUST 配置 ESLint,包含检测架构边界违规的自定义规则
- **FR-026**: ESLint MUST 检测 core 中的 UI 依赖(antd、DOM、JSX、@ui/*)
- **FR-027**: ESLint MUST 检测 ui view 中直接访问 engine 的行为
- **FR-028**: core 包的测试 MUST 覆盖所有 engines/services/guards,优先于 ui 和 seed
- **FR-029**: 测试 MUST 不依赖浏览器环境,不 mock UI
- **FR-030**: 项目 MUST 配置构建工具,支持所有包的独立构建

**依赖关系约束**:
- **FR-031**: 禁止 core 包依赖 ui 或 seed 的任何代码
- **FR-032**: 禁止 ui 层依赖 seed 项目的代码
- **FR-033**: seed 项目允许直接依赖 core 包和 ui 组件源码
- **FR-034**: ui 组件允许依赖 core 包

**错误处理要求**:
- **FR-035**: core 的业务非法操作 MUST 抛出包含业务语义的 Error
- **FR-036**: core 不吞异常,UI 决定如何展示错误
- **FR-037**: core 只负责"是否正确",不负责"如何提示"

### Key Entities

- **Core Package**: 业务内核 npm 包,包含 engines、services、guards、adapters、utils,是业务逻辑的唯一真理源
- **Engine**: core 中的核心抽象,持有业务状态、暴露 actions、管理副作用,返回 { state, actions } 结构
- **Guard**: 业务校验模块,校验 action 入参和状态合法性,失败时抛出明确错误
- **Service**: 纯业务服务,可被多个 engine 复用,如定价服务、计算服务
- **UI Component Template**: 源码模板,包含 .view.jsx、.adapter.js、.logic.js、meta.json、index.js
- **Adapter**: UI 与 core 的唯一接缝点,负责调用 engine.actions、订阅 state、转换数据结构
- **View**: 纯展示组件,只渲染 UI 和触发 adapter 方法,不直接访问 engine
- **CLI Tool**: 命令行工具 terence,管理 ui 组件的源码交付生命周期(init/add/list/upgrade)
- **ui.config.json**: seed 项目中的配置文件,追踪已引入的 ui 组件及其版本
- **meta.json**: 每个 ui 组件的元信息文件,记录组件名、版本、core 依赖名称和最小版本

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 开发者可以在 10 分钟内创建完全符合架构规范的项目结构,所有目录和配置就绪
- **SC-002**: 运行 `terence init` 后,seed 项目中获得完整的 ui 资产管理目录和配置文件
- **SC-003**: 运行 `terence add <ComponentName>` 后,组件源码在 10 秒内拷贝完成,包含完整的 adapter-view 分离
- **SC-004**: core 包可以成功构建并发布到 npm,包含完整的 JSDoc 文档,IDE 自动提示完整
- **SC-005**: 示例 seed 应用可以成功启动,展示完整的业务流程(添加→编辑→提交→完成)
- **SC-006**: ESLint 可以成功检测并阻止 100% 的架构边界违规(如 core 依赖 antd、view 直接访问 engine)
- **SC-007**: core 包的单元测试可以在 30 秒内完成执行,覆盖所有 engines/services/guards
- **SC-008**: 新开发者可以在 2 小时内理解架构规范,通过示例项目学会如何创建 Engine/Guard/Adapter
- **SC-009**: ui 组件添加后,开发者可以在 seed 项目中立即导入和使用,无需额外配置
- **SC-010**: 项目的所有包可以独立构建和测试,构建时间在 2 分钟以内
- **SC-011**: 业务逻辑集中在 core,ui 和 seed 中零业务规则判断,通过代码扫描验证
- **SC-012**: 生成的 ui 组件 100% 符合 adapter-view 分离,view 中无 engine 直接访问

## Assumptions

1. 开发者使用 Node.js 和现代包管理器(pnpm workspace 推荐)
2. 开发者熟悉 React 和前端开发基础
3. 项目采用 monorepo 结构,使用 pnpm workspace 管理
4. 示例 seed 项目使用 React@19、Vite@7、Zustand、Tailwind CSS、antd@6
5. core 包使用 JavaScript + JSDoc,不使用 TypeScript
6. CLI 工具名称为 `terence`,通过 npx 或本地安装使用
7. UI 模板存储在同一仓库的 ui/ 目录,每个组件是独立目录
8. 测试框架使用 Vitest,与 Vite 集成良好
9. ESLint 配置包含自定义规则,使用 no-restricted-imports 和 eslint-plugin-import
10. 项目遵循语义化版本控制,core 包独立版本,向后兼容优先
11. 示例业务场景为订单管理,包含添加商品、编辑数量、提交订单、查看状态
12. 开发者理解"业务逻辑必须集中在 core"的核心原则

## Out of Scope

- 具体的业务领域实现(仅提供订单管理示例,不覆盖所有业务场景)
- 生产环境部署配置和 CI/CD 流水线
- 性能优化、监控、日志分析
- 国际化(i18n)实现和文档站点
- 复杂的 ui 组件库(仅提供基础示例组件)
- 高级 CLI 功能(批量操作、远程模板仓库、插件系统)
- E2E 测试和视觉回归测试
- 业务数据的持久化存储(示例中使用内存状态)
- 多语言、多主题、多租户支持
- 与后端 API 的实际集成(示例中 mock API)

## Architecture Compliance

本功能规格说明严格遵循以下架构文档:

1. **总体架构** (`docs/architecture/overall.md`)
   - 三层分离 + 单向依赖
   - core: 业务内核(npm 包)
   - ui: 业务 UI 层(源码交付)
   - seed: 项目应用层

2. **Core 设计** (`docs/architecture/core.md`)
   - Engine-Guard-Service 架构
   - 显式状态原则
   - 单向数据流原则
   - JSDoc 接口契约

3. **项目宪章** (`.specify/memory/constitution.md`)
   - I. Layered Architecture (NON-NEGOTIABLE)
   - II. Source Code Delivery
   - III. Business Logic Centricity
   - IV. Adapter Pattern
   - V. Interface Constraints
   - VI. Testing Strategy

所有功能需求都直接映射到架构原则,确保实现与设计文档的一致性。
