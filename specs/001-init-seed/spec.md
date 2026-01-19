# Feature Specification: @terence/seed 初始化脚手架搭建

**Feature Branch**: `001-init-seed`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "我要来根据已制定的架构来初始化 @terence/seed 了,搭建足够好用的脚手架。"

## Clarifications

### Session 2026-01-19

- Q: Zustand 状态管理的职责边界是什么? → A: Zustand store 只管理跨页面 UI 状态(如 modal/drawer 状态)、用户信息和权限,**不订阅或镜像** core 业务状态
- Q: seed 项目应该包含哪些目录? → A: 包含完整的目录结构:pages、components、stores、utils、styles、routes、assets、constants、services
- Q: 页面组件的职责与路由感知设计原则? → A: 页面负责 engine 实例生命周期和业务组合,ui 组件**完全不感知路由**,core **完全不感知页面**
- Q: 示例业务场景的范围应该是什么? → A: 暂时不用提供完整的业务场景示例

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 基础开发环境配置 (Priority: P1)

开发者需要启动一个功能完整的开发环境,包括 Vite 构建配置、React 19 集成、Ant Design 6 主题配置和开发服务器,以便快速开始开发和测试业务组件。

**Why this priority**: 这是所有后续工作的基础。没有正确的构建配置和开发环境,开发者无法运行和测试任何代码。

**Independent Test**: 可以通过运行 `pnpm dev` 命令来独立测试。验证开发服务器启动成功,浏览器能够访问应用,控制台没有��误。

**Acceptance Scenarios**:

1. **Given** 新创建的 seed 项目, **When** 运行 `pnpm dev`, **Then** Vite 开发服务器在 5 秒内启动,应用在浏览器中正常显示
2. **Given** 运行的开发环境, **When** 修改源码文件, **Then** 页面自动热更新,无需手动刷新
3. **Given** 配置的 Ant Design, **When** 在组件中使用 antd 组件, **Then** 组件样式正确显示,主题配置生效
4. **Given** 项目的 package.json, **When** 检查依赖, **Then** React 19、React DOM 19、Ant Design 6 已正确安装

---

### User Story 2 - 目录结构和文件组织 (Priority: P1)

开发者需要清晰的项目目录结构,包括页面、组件、状态管理、路由、工具函数、静态资源、常量、服务等标准目录,以便组织代码和维护项目。

**Why this priority**: 良好的目录结构是项目可维护性的基础。没有清晰的结构,代码会变得混乱,难以扩展和维护。

**Independent Test**: 可以通过检查目录结构和文件命名来独立测试。验证所有必需的目录存在,文件组织符合规范。

**Acceptance Scenarios**:

1. **Given** seed 项目根目录, **When** 查看目录结构, **Then** 存在 src/pages、src/components、src/stores、src/utils、src/styles、src/routes、src/assets、src/constants、src/services 目录
2. **Given** src 目录, **When** 检查入口文件, **Then** 存在 src/main.jsx 和 src/App.jsx
3. **Given** 项目根目录, **When** 检查配置文件, **Then** 存在 vite.config.js、.eslintrc.js、index.html
4. **Given** 目录结构, **When** 查看文件命名, **Then** 所有组件文件使用大驼峰命名,工具函数文件使用小驼峰命名

---

### User Story 3 - 状态管理和数据流集成 (Priority: P1)

开发者需要集成状态管理方案(Zustand)管理 UI 状态,同时页面组件直接使用 @terence/core 的引擎管理业务状态,确保职责清晰分离。

**Why this priority**: 状态管理是应用的核心。没有正确的状态管理,UI 无法与业务逻辑同步,数据流会混乱。明确的状态职责分离是架构规范的关键。

**Independent Test**: 可以通过创建一个示例 store 和页面组件来独立测试。验证 UI 状态和业务状态分别正确管理,互不干扰。

**Acceptance Scenarios**:

1. **Given** seed 项目, **When** 检查依赖, **Then** Zustand 已安装并配置
2. **Given** src/stores 目录, **When** 查看文件, **Then** 存在示例 store 文件(如 useUIStore.js),仅管理 UI 状态
3. **Given** 创建的 UI store, **When** 在组件中使用, **Then** UI 状态更新能够正确触发 UI 渲染
4. **Given** @terence/core 引擎, **When** 在页面组件中使用, **Then** 页面直接订阅 engine state 并调用 actions,**不通过** zustand

---

### User Story 4 - ESLint 和代码规范配置 (Priority: P2)

开发者需要配置 ESLint 规则和代码格式化工具,确保团队代码风格一致,并且能够检测架构边界违规(如在非 UI 层导入 UI 组件)。

**Why this priority**: 代码规范是团队协作和项目质量的基础。没有规范,代码质量会下降,维护成本增加。

**Independent Test**: 可以通过运行 `pnpm lint` 命令来独立测试。验证 ESLint 能够检测代码质量问题并给出提示。

**Acceptance Scenarios**:

1. **Given** 配置的 ESLint, **When** 运行 `pnpm lint`, **Then** 所有现有代码通过检查,无错误和警告
2. **Given** ESLint 配置, **When** 编写不符合规范的代码(如使用 var), **Then** ESLint 报错并提示修复建议
3. **Given** 架构边界规则, **When** 尝试违规导入, **Then** ESLint 检测并阻止违规行为
4. **Given** 项目配置, **When** 检查 package.json, **Then** lint 脚本已正确配置

---

### User Story 5 - 测试环境配置 (Priority: P2)

开发者需要配置测试框架和测试工具,以便编写和运行单元测试、集成测试,确保代码质量和功能正确性。

**Why this priority**: 测试是保证代码质量的重要手段。没有测试环境,开发者无法验证代码的正确性,重构风险高。

**Independent Test**: 可以通过创建一个示例测试文件并运行测试来独立测试。验证测试能够正常运行并给出正确结果。

**Acceptance Scenarios**:

1. **Given** seed 项目, **When** 运行 `pnpm test`, **Then** Vitest 测试运行器启动,所有测试通过
2. **Given** 测试配置, **When** 查看文件, **Then** 存在 vitest.config.js 和示例测试文件
3. **Given** 示例测试, **When** 修改代码导致功能失败, **Then** 测试能够检测失败并给出错误信息
4. **Given** 测试环境, **When** 编写组件测试, **Then** 可以使用 @testing-library/react 测试 UI 组件

---

### User Story 6 - 构建和部署配置 (Priority: P2)

开发者需要配置生产环境构建和优化,包括代码分割、压缩、资源优化等,以便应用能够高效部署和运行。

**Why this priority**: 生产构建是应用上线的关键。没有正确的构建配置,应用性能差,用户体验不好。

**Independent Test**: 可以通过运行 `pnpm build` 命令来独立测试。验证构建成功,产物能够正确部署和运行。

**Acceptance Scenarios**:

1. **Given** seed 项目, **When** 运行 `pnpm build`, **Then** 构建成功,生成 dist 目录
2. **Given** 构建产物, **When** 检查文件, **Then** JavaScript 和 CSS 文件已压缩优化,资源文件正确处理
3. **Given** 构建配置, **When** 检查 vite.config.js, **Then** 配置了代码分割、tree-shaking 等优化
4. **Given** 构建产物, **When** 运行 `pnpm preview`, **Then** 应用能够预览,功能正常

---

### User Story 7 - 示例页面和组件 (Priority: Deferred)

开发者需要一些示例页面和组件,展示如何使用 @terence/core 和 @terence/ui,以便快速理解架构和开始开发。

**Why this priority**: 示例是学习和理解架构的最佳方式。没有示例,新开发者难以理解如何正确使用架构。**注**: 此功能已推迟到后续迭代实现。

**Independent Test**: 可以通过查看示例页面和组件代码来独立测试。验证示例代码符合架构规范,能够正常运行。

**Acceptance Scenarios**:

1. **Given** seed 应用, **When** 在浏览器中打开, **Then** 显示示例页面,包含多个业务组件
2. **Given** 示例页面, **When** 检查代码, **Then** 正确使用 @terence/core 的引擎和 @terence/ui 的组件
3. **Given** 示例代码, **When** 查看文件结构, **Then** 遵循 adapter-view 分离,业务逻辑在 core,UI 层无业务规则
4. **Given** 示例应用, **When** 执行业务流程(如提交订单), **Then** 完整流程正常运行,状态正确更新

---

### Edge Cases

- 当开发者尝试在 seed 项目中直接修改 @terence/core 或 @terence/ui 的代码时,如何提示应该在对应包中修改?
- 当 @terence/core 或 @terence/ui 的 API 发生变化时,如何确保 seed 项目不会出现运行时错误?
- 当开发环境端口被占用时,Vite 应该自动选择其他可用端口
- 当构建失败时,应该给出清晰的错误信息和修复建议
- 当测试覆盖率低于阈值时,CI 应该警告或失败
- 当开发者尝试在 seed 中编写业务逻辑时,ESLint MUST 检测并阻止
- 当页面组件直接调用 engine.actions 时,ESLint MUST 报错并提示应通过 adapter
- 当使用 zustand 管理 core 业务状态时,ESLint MUST 警告违反架构原则
- 当 ui 组件尝试导入或使用路由 API 时,ESLint MUST 检测并阻止违反架构原则
- 当页面组件未正确管理 engine 实例生命周期时,可能导致内存泄漏或状态不一致

## Requirements *(mandatory)*

### Functional Requirements

**项目结构要求**:
- **FR-001**: seed 项目 MUST 采用标准的 React 项目结构,包含 src/pages、src/components、src/stores、src/utils、src/styles、src/routes、src/assets、src/constants、src/services 目录
- **FR-002**: seed 项目 MUST 配置 Vite 作为构建工具,支持热更新、快速构建和开发体验优化
- **FR-003**: seed 项目 MUST 使用 React 19 和 React DOM 19 作为 UI 框架
- **FR-004**: seed 项目 MUST 使用 Ant Design 6 作为 UI 组件库,并配置主题

**依赖管理要求**:
- **FR-005**: seed 项目 MUST 通过 pnpm workspace 依赖 @terence/core 和 @terence/ui
- **FR-006**: seed 项目 MUST 使用 Zustand 仅管理跨页面 UI 状态、用户信息和权限,**不**用于管理 core 业务状态
- **FR-007**: seed 项目 MUST 正确配置所有必需的依赖,包括 React、Ant Design、状态管理库等

**开发体验要求**:
- **FR-008**: 开发服务器 MUST 在 5 秒内启动,支持热更新和快速刷新
- **FR-009**: 构建产物 MUST 经过优化,包括代码分割、压缩、tree-shaking
- **FR-010**: ESLint MUST 配置完整的规则集,检测代码质量和架构边界
- **FR-011**: 测试框架 MUST 配置完整,支持单元测试、集成测试和 UI 组件测试

**代码规范要求**:
- **FR-012**: 所有组件文件 MUST 使用大驼峰命名(如 OrderForm.jsx)
- **FR-013**: 所有工具函数文件 MUST 使用小驼峰命名(如 formatUtils.js)
- **FR-014**: ESLint MUST 能够检测并阻止架构边界违规
- **FR-015**: 代码 MUST 通过 ESLint 检查才能提交

**状态管理要求**:
- **FR-016**: Zustand store MUST 仅用于管理跨页面 UI 状态(如 modal/drawer 状态)、用户信息、权限,**禁止**使用 zustand 管理业务流程状态或镜像 core state
- **FR-017**: 页面组件 MUST 直接使用 @terence/core 的 engine 实例和其 state/actions,**禁止**通过 zustand 间接访问 core 业务状态
- **FR-018**: store MAY 支持中间件,如日志、持久化等,但仅限于 UI 状态相关的中间件

**架构边界与禁止行为**:
- **FR-019**: 禁止在 seed 页面中编写业务 if/else 判断,所有业务规则必须在 @terence/core 的 guard 中实现
- **FR-020**: 禁止 UI 组件(包括页面)直接调用 engine.actions,必须通过 adapter 间接调用
- **FR-021**: 禁止 UI 与业务状态双向绑定,UI 只能单向订阅 engine state
- **FR-022**: 禁止在 seed 中复制或模拟 @terence/core 的业务逻辑

**页面与路由设计要求**:
- **FR-023**: 页面组件 MUST 负责 engine 实例的生命周期管理(创建、销毁)
- **FR-024**: 页面组件 MUST 负责业务模块的组合和布局,使用 @terence/ui 的组件
- **FR-025**: ui 组件 MUST 完全不感知路由,**禁止**在 ui 组件中导入或使用路由相关 API
- **FR-026**: core 包 MUST 完全不感知页面,**禁止**在 core 中包含页面或路由相关的逻辑
- **FR-027**: src/routes 目录 MUST 包含路由配置,由页面组件注册路由

**测试要求**:
- **FR-028**: 测试框架 MUST 使用 Vitest,与 Vite 集成
- **FR-029**: 测试 MUST 覆盖核心业务逻辑和关键 UI 组件
- **FR-030**: 测试 MUST 能够在 CI 环境中运行,生成覆盖率报告

**构建和部署要求**:
- **FR-031**: 构建命令 MUST 生成优化后的生产代码
- **FR-032**: 构建产物 MUST 包含所有必需的资源文件(HTML、CSS、JS、图片等)
- **FR-033**: 构建配置 MUST 支持环境变量,区分开发和生产环境

**文档和示例要求**:
- **FR-034**: seed 项目 SHOULD 包含至少一个完整的业务流程示例(可选,在后续迭代中实现)
- **FR-035**: 如果提供示例代码,MUST 遵循 Terence 架构规范,展示正确的用法
- **FR-036**: 如果提供示例代码,MUST 包含注释,解释关键概念和最佳实践

### Key Entities

- **@terence/seed**: 示例应用项目,展示 Terence 架构的实际应用
- **Vite**: 构建工具,提供快速的开发体验和优化的生产构建
- **React 19**: UI 框架,提供组件化和虚拟 DOM
- **Ant Design 6**: UI 组件库,提供丰富的企业级组件
- **Zustand**: 状态管理库,轻量级且易于使用
- **Vitest**: 测试框架,与 Vite 深度集成
- **ESLint**: 代码检查工具,确保代码质量和架构规范
- **Page**: 页面组件,代表应用中的完整页面(如订单页、商品页)
- **Component**: UI 组件,可复用的 UI 元素(如按钮、表单)
- **Store**: Zustand store,管理应用状态和与 core 引擎的交互

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 开发者可以在 2 分钟内启动开发环境,开始编写代码
- **SC-002**: 运行 `pnpm dev` 后,开发服务器在 5 秒内启动,应用在浏览器中正常显示
- **SC-003**: 运行 `pnpm build` 后,构建在 30 秒内完成,生成优化的生产代码
- **SC-004**: 运行 `pnpm lint` 后,所有代码通过检查,无错误和警告
- **SC-005**: 运行 `pnpm test` 后,所有测试通过,核心功能测试覆盖率不低于 80%
- **SC-006**: 新开发者可以在 30 分钟内理解项目结构和架构规范
- **SC-007**: 项目提供清晰的目录结构和配置,易于上手开发(完整示例在后续迭代提供)
- **SC-008**: 项目代码 100% 符合 ESLint 规则,无架构边界违规
- **SC-009**: 所有组件和页面都有清晰的命名和注释,易于理解和维护
- **SC-010**: 状态管理正确集成 @terence/core 的引擎,数据流清晰可追踪

## Assumptions

1. **技术栈假设**: seed 项目使用 React 19、Vite 7、Ant Design 6、Zustand
2. **包管理假设**: 使用 pnpm workspace 管理依赖,能够正确解析 workspace 协议
3. **开发环境假设**: 开发者使用 Node.js 18+ 和现代浏览器
4. **架构假设**: seed 项目遵循 Terence 三层架构,正确使用 @terence/core 和 @terence/ui
5. **示例假设**: 完整的业务场景示例将在后续迭代中提供
6. **测试假设**: 使用 Vitest 和 @testing-library/react 进行测试
7. **构建假设**: Vite 提供生产级构建优化,无需额外配置
8. **团队规模假设**: 项目面向小团队协作,代码规范和架构约束更重要
9. **文档假设**: 项目结构和注释足以让开发者理解架构规范
10. **CI/CD 假设**: CI 环境能够运行 lint 和 test 命令,确保代码质量

## Dependencies

- 依赖于 @terence/core 包的正确导出和 API 稳定性
- 依赖于 @terence/ui 包的正确导出和组件可用性
- 依赖于 pnpm workspace 的正常工作
- 依赖于 Vite、React、Ant Design 等工具的稳定性和功能完整性
- 不影响 CLI 工具的实现和行为
- 不影响其他项目的使用方式

## Out of Scope

- 复杂的业务逻辑实现(仅提供示例,不覆盖所有场景)
- 生产环境部署配置和服务器设置
- 性能优化、监控、日志分析
- 国际化(i18n)实现和多语言支持
- 复杂的路由和权限管理
- E2E 测试和视觉回归测试
- 数据持久化和后端 API 集成
- 多主题、多租户支持
- 文档站点和教程视频
