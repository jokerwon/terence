# Feature Specification: Core 业务内核初始化

**Feature Branch**: `001-init-core`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "我更新了 core 的设计理念和落地原则。请根据最新的文档 @docs/architecture/core.md 重新初始化 core"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 开发者创建业务引擎 (Priority: P1)

开发者需要创建一个新的业务��能(如登录流程),按照 Engine + Adapter 架构在 core 目录下实现业务逻辑。

**Why this priority**: 这是整个架构的核心基础,没有业务引擎就无法实现任何业务功能,是其他所有用户故事的前提。

**Independent Test**: 可以通过创建一个简单的登录业务引擎来独立测试,验证目录结构、Engine 接口形态、状态定义和命令执行是否符合设计规范。

**Acceptance Scenarios**:

1. **Given** 开发者需要在 core/engines 下创建新的业务功能, **When** 按照目录结构创建 engines/xxx/ 目录及必需文件, **Then** 系统应能识别该引擎并符合路径级硬规则
2. **Given** 开发者创建了 Engine 实例, **When** 调用 createXxxEngine(deps) 方法, **Then** 应返回包含 getState、subscribe、commands、rules 的标准形态对象
3. **Given** Engine 处于初始状态, **When** 执行 command 修改状态, **Then** getState() 应返回更新后的业务状态
4. **Given** Engine 状态发生变化, **When** 订阅了 state 变化, **Then** 订阅者应收到通知

---

### User Story 2 - 前端应用集成业务引擎 (Priority: P2)

前端开发者需要通过 React Adapter 将业务引擎集成到 React 组件中,实现 UI 与业务逻辑的分离。

**Why this priority**: 这是连接业务引擎和 UI 的桥梁,让 React 组件能够使用业务逻辑而不关心实现细节。

**Independent Test**: 可以通过创建一个 React 组件使用 useLogin hook 来独立测试,验证组件能否正确订阅状态、调用命令和获取规则判断。

**Acceptance Scenarios**:

1. **Given** React 组件需要使用业务引擎, **When** 使用 createAdapter 创建的 hook, **Then** 组件应能获取 state、commands、rules
2. **Given** 用户在 UI 中执行操作, **When** 调用 engine.commands 中的方法, **Then** 业务状态应正确更新
3. **Given** 业务状态发生变化, **When** Engine 触发状态更新, **Then** React 组件应重新渲染以反映最新状态
4. **Given** UI 需要判断是否允许某操作, **When** 调用 engine.rules 中的方法, **Then** 应获得基于当前业务状态的判断结果

---

### User Story 3 - 业务引擎执行副作用操作 (Priority: P3)

业务引擎需要通过依赖注入执行 API 请求、存储操作等副作用,而不直接依赖具体实现。

**Why this priority**: 这是业务引擎与外部世界交互的关键机制,保证了业务逻辑的可测试性和可移植性。

**Independent Test**: 可以通过 mock deps 对象来独立测试,验证 Engine 能正确调用注入的副作用方法并处理返回结果。

**Acceptance Scenarios**:

1. **Given** Engine 需要执行登录请求, **When** 调用 deps.loginRequest(data), **Then** 应发起实际的 API 请求而不在 Engine 内部直接使用 fetch
2. **Given** 副作用操作执行成功, **When** 返回结果, **Then** Engine 应根据结果更新业务状态
3. **Given** 副作用操作执行失败, **When** 返回错误, **Then** Engine 应更新错误状态
4. **Given** 需要测试 Engine 逻辑, **When** 注入 mock deps, **Then** 应能在不依赖真实 API 的情况下测试业务逻辑

---

### User Story 4 - 应用状态管理与业务内核协作 (Priority: P4)

Zustand 应用状态容器需要与业务引擎协作,存储业务完成后的最终结果(如 user token),但不存储业务流程中间态。

**Why this priority**: 这定义了应用级状态和业务级状态的边界,防止架构混乱。

**Independent Test**: 可以通过登录完成后将 token 存入 Zustand 来独立测试,验证只存储最终结果而非中间状态。

**Acceptance Scenarios**:

1. **Given** 业务流程完成(如登录成功), **When** Engine 获得最终结果(token), **Then** 应通过 deps 将结果存入 Zustand
2. **Given** 业务流程进行中(如提交中), **When** 状态变化(idle → submitting → success), **Then** 这些中间态应保留在 Engine 中而非 Zustand
3. **Given** UI 需要判断能否执行操作, **When** 查询 canSubmit 等业务判断, **Then** 应从 Engine.rules 获取而非 Zustand

---

### Edge Cases

- 当 Engine 的 deps 注入不完整时,系统应如何处理?
- 当 Command 执行过程中抛出异常时,状态应该如何处理?
- 当多个 React 组件同时订阅同一个 Engine 时,应该如何管理订阅?
- 当业务规则(rules)需要访问外部数据时,应该如何设计?
- 当需要撤销某个 Command 的效果时,应该如何实现?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST 提供标准化的 createXxxEngine(deps) 工厂函数,返回包含 getState、subscribe、commands、rules 的对象
- **FR-002**: System MUST 强制执行目录结构约束:engines/** 内禁止 import react/zustand/antd
- **FR-003**: System MUST 确保 Engine 状态是可序列化的业务真实状态,而非 UI 投影
- **FR-004**: System MUST 提供通用的 createReactAdapter(engine) 方法,生成符合 React hooks 规范的 Adapter
- **FR-005**: System MUST 通过依赖注入模式支持副作用操作,Engine 内禁止直接使用 fetch/axios/localStorage/router
- **FR-006**: System MUST 确保所有业务规则(rules)是纯函数,不产生副作用且只依赖 state
- **FR-007**: System MUST 支持 Engine 在 Node 环境中独立运行,不依赖 UI 框架
- **FR-008**: System MUST 在 contracts/** 目录下声明对外能力,但不包含实现代码
- **FR-009**: System MUST 区分业务流程中间态(status/step)和最终结果(user/token),前者存 Engine 后者存 Zustand
- **FR-010**: System MUST 提供合规性检查机制,验证 Engine、Adapter、Zustand 的边界是否清晰

### Key Entities

- **Business Engine (业务引擎)**: 核心业务逻辑的封装,包含状态、命令、规则和副作用接口,是系统中唯一回答"现在业务处于什么阶段"、"能不能执行某个操作"的地方
- **React Adapter (适配器)**: 连接 Business Engine 和 React 组件的桥梁,负责订阅 Engine 状态并暴露 commands 和 rules
- **Contract (契约)**: 声明业务能力接口,定义 Engine 对外提供的服务而不包含实现细节
- **Dependencies (依赖注入)**: 副作用操作的接口约定(如 loginRequest),Engine 通过 deps 调用而非直接 import
- **Application State (应用状态)**: Zustand 管理的应用级状态,存储业务完成后的最终结果(user、token、orderId 等)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 开发者能够在 30 分钟内按照模板创建一个新的业务 Engine,包含完整的 state、commands、rules、effects 定义
- **SC-002**: 所有 Engine 实现都能通过"在 Node 环境独立运行"的合规性检查,不依赖任何 UI 框架
- **SC-003**: 代码审查时能够明确判断任何违反"路径级硬规则"的代码(如 engines/** 内 import react)
- **SC-004**: 新开发者能够在阅读架构文档后 2 小时内理解并正确实现第一个业务功能
- **SC-005**: 业务逻辑变更(如修改登录流程)只需修改 Engine 而不影响 React 组件和 Zustand store
- **SC-006**: Adapter 代码量不超过 20 行,且不包含任何业务判断逻辑
- **SC-007**: 所有业务规则(canSubmit、isSubmitting 等)都能从 Engine.rules 获取,Zustand 中无业务中间态

## Assumptions

1. 项目使用 React 19 作为 UI 框架,Zustand 作为应用状态管理
2. 副作用操作主要是 HTTP 请求(通过 API)和本地存储
3. 每个业务功能对应一个独立的 Engine,不需要跨 Engine 的状态共享
4. 代码审查流程能够强制执行架构规范
5. 开发团队具备基本的函数式编程概念(纯函数、依赖注入)
6. 目标构建环境支持 ES2022+ 语法特性

## Dependencies

- React 19 和 useSyncExternalStore API
- Zustand 作为应用状态容器
- 现有的 API 接口和数据存储方案
- 文档中定义的目录结构和命名约定

## Out of Scope

- UI 组件库的具体实现(Ant Design 组件的使用)
- 性能优化(如状态订阅的细粒度控制)
- 服务端渲染(SSR)支持
- 多个 Engine 之间的协调机制
- 状态持久化和恢复机制
