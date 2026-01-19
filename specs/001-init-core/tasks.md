# Tasks: Core 业务内核初始化

**Input**: Design documents from `/specs/001-init-core/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: 本特性包含测试任务,遵循架构原则 VI (Testing Strategy)。

**Organization**: 任务按用户故事分组,每个故事可独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行运行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事(US1, US2, US3, US4)
- 包含精确的文件路径

## Path Conventions

基于 plan.md 的单项目结构:
- **Core 包**: `packages/core/src/`, `packages/core/tests/`
- **全局测试**: `tests/` (仓库根目录)

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和基本结构搭建

- [ ] T001 创建 packages/core 目录结构: src/{engines,adapters,utils,contracts}/, tests/{unit,integration}/
- [ ] T002 初始化 package.json 配置依赖: React 19, Vitest, ESLint
- [ ] T003 [P] 配置 packages/core/.eslintrc.js 使用 Flat Config 和 no-restricted-imports 规则
- [ ] T004 [P] 配置 vitest.config.js 设置 Node 环境、coverage 和测试 globals
- [ ] T005 [P] 创建 .npmrc 配置包的 workspace 依赖关系
- [ ] T006 [P] 添加 .gitignore 忽略 node_modules/, dist/, coverage/

---

## Phase 2: Foundational (阻塞性前置任务)

**Purpose**: 核心基础设施,必须在任何用户故事开始前完成

**⚠️ CRITICAL**: 此阶段完成前,不能开始任何用户故事的开发

- [ ] T007 实现 StateContainer 类在 packages/core/src/utils/StateContainer.js (增强型发布订阅模式,支持 getState/subscribe/setState/batch)
- [ ] T008 [P] 实现 invariant 工具函数在 packages/core/src/utils/invariant.js (运行时参数校验)
- [ ] T009 [P] 实现 validateDeps 工具函数在 packages/core/src/utils/validation.js (依赖注入校验)
- [ ] T010 [P] 创建测试 setup 文件在 packages/core/tests/setup.js (Vitest 全局配置)
- [ ] T011 [P] 编写 StateContainer 单元测试在 packages/core/tests/utils/StateContainer.test.js (测试状态更新、订阅、批处理)
- [ ] T012 在根目录 eslint.config.js 中添加 packages/core/engines/** 的架构约束规则(禁止 react/zustand/antd)

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 开发者创建业务引擎 (Priority: P1) 🎯 MVP

**Goal**: 实现可工作的登录业务引擎,验证目录结构、Engine 接口形态、状态管理和命令执行

**Independent Test**: 创建登录引擎实例,验证标准接口(getState/subscribe/commands/rules)、状态转换和订阅通知机制

### Tests for User Story 1

> **NOTE: TDD 方法 - 先编写测试,确保测试失败后再实现功能**

- [ ] T013 [P] [US1] 编写 LoginEngine 初始化测试在 packages/core/tests/engines/login.test.js (验证初始状态值)
- [ ] T014 [P] [US1] 编写 Commands 测试在 packages/core/tests/engines/login.test.js (setUsername/setPassword/submit/reset)
- [ ] T015 [P] [US1] 编写 Rules 测试在 packages/core/tests/engines/login.test.js (canSubmit/isSubmitting/hasError/isAuthenticated)
- [ ] T016 [P] [US1] 编写订阅机制测试在 packages/core/tests/engines/login.test.js (验证状态变化通知)
- [ ] T017 [P] [US1] 编写错误处理测试在 packages/core/tests/engines/login.test.js (参数校验、业务规则错误、副作用错误)

### Implementation for User Story 1

- [ ] T018 [P] [US1] 创建 initialState 函数在 packages/core/src/engines/login/state.js (定义 LoginState 结构)
- [ ] T019 [P] [US1] 创建 LoginDependencies JSDoc 契约在 packages/core/src/engines/login/effects.js (声明副作用接口)
- [ ] T020 [P] [US1] 实现 createMockDeps 工厂在 packages/core/src/engines/login/effects.js (开发模式 Mock)
- [ ] T021 [US1] 实现 createCommands 函数在 packages/core/src/engines/login/commands.js (setUsername/setPassword/submit/reset,依赖 T007,T008)
- [ ] T022 [US1] 实现 createRules 函数在 packages/core/src/engines/login/rules.js (canSubmit/isSubmitting/hasError/isAuthenticated)
- [ ] T023 [US1] 实现 createLoginEngine 工厂在 packages/core/src/engines/login/engine.js (组装 StateContainer、Commands、Rules,依赖 T018,T021,T022)
- [ ] T024 [US1] 创建导出文件在 packages/core/src/engines/login/index.js (导出 createLoginEngine/initialState/createMockDeps)
- [ ] T025 [US1] 在 packages/core/src/index.js 添加对外出口 (导出所有 engines 和 utils)

**Checkpoint**: 此时,User Story 1 应该完全可独立运行和测试 - Engine 可在 Node 环境独立运行,无 UI 依赖

**Parallel Example for US1**:
```bash
# 并行运行所有测试任务:
Task: T013 [P] [US1] 编写 LoginEngine 初始化测试
Task: T014 [P] [US1] 编写 Commands 测试
Task: T015 [P] [US1] 编写 Rules 测试
Task: T016 [P] [US1] 编写订阅机制测试
Task: T017 [P] [US1] 编写错误处理测试

# 并行创建所有状态和契约文件:
Task: T018 [P] [US1] 创建 initialState 函数
Task: T019 [P] [US1] 创建 LoginDependencies JSDoc 契约
Task: T020 [P] [US1] 实现 createMockDeps 工厂
```

---

## Phase 4: User Story 2 - 前端应用集成业务引擎 (Priority: P2)

**Goal**: 实现 React Adapter,让 React 组件能使用登录引擎,实现 UI 与业务逻辑分离

**Independent Test**: 创建 React 组件使用 useLogin hook,验证组件能正确订阅状态、调用命令和获取规则判断

### Tests for User Story 2

- [ ] T026 [P] [US2] 编写 createReactAdapter 单元测试在 packages/core/tests/adapters/createAdapter.test.js (验证 useSyncExternalStore 集成)
- [ ] T027 [P] [US2] 编写 Adapter 订阅机制测试在 packages/core/tests/adapters/createAdapter.test.js (验证状态变化通知到 React)
- [ ] T028 [P] [US2] 编写 Adapter 选择性订阅测试在 packages/core/tests/adapters/createAdapter.test.js (验证 selector 参数)

### Implementation for User Story 2

- [ ] T029 [US2] 实现 createReactAdapter 工厂在 packages/core/src/adapters/react/createAdapter.js (使用 useSyncExternalStore,依赖 T007)
- [ ] T030 [US2] 创建 useLogin hook 在 packages/core/src/adapters/react/useLogin.js (使用 createReactAdapter 包装 loginEngine,依赖 T023,T029)
- [ ] T031 [US2] 在 packages/core/src/adapters/react/index.js 添加导出 (导出 createReactAdapter 和所有 hooks)
- [ ] T032 [US2] 创建示例组件 LoginForm 在 packages/core/examples/LoginForm.jsx (演示 useLogin 使用,依赖 T030)

**Checkpoint**: 此时,User Story 1 和 User Story 2 都应该独立可运行 - React 组件能通过 Adapter 使用 Engine

**Parallel Example for US2**:
```bash
# 并行运行所有测试:
Task: T026 [P] [US2] 编写 createReactAdapter 单元测试
Task: T027 [P] [US2] 编写 Adapter 订阅机制测试
Task: T028 [P] [US2] 编写 Adapter 选择性订阅测试
```

---

## Phase 5: User Story 3 - 业务引擎执行副作用操作 (Priority: P3)

**Goal**: 实现 Engine 通过依赖注入执行 API 请求和存储操作,不直接使用 fetch/axios/localStorage

**Independent Test**: 使用 mock deps 对象测试 Engine,验证 Engine 能正确调用注入的副作用方法并处理返回结果

### Tests for User Story 3

- [ ] T033 [P] [US3] 编写副作用调用测试在 packages/core/tests/engines/login.effects.test.js (验证 deps.loginRequest 调用)
- [ ] T034 [P] [US3] 编写副作用成功场景测试在 packages/core/tests/engines/login.effects.test.js (验证状态更新为 success)
- [ ] T035 [P] [US3] 编写副作用失败场景测试在 packages/core/tests/engines/login.effects.test.js (验证状态更新为 error)
- [ ] T036 [P] [US3] 编写依赖校验测试在 packages/core/tests/engines/login.effects.test.js (验证缺失依赖时抛出错误)

### Implementation for User Story 3

- [ ] T037 [US3] 在 LoginEngine Commands 中实现完整的副作用处理 (在 submit command 中调用 deps.loginRequest,依赖 T021,T009)
- [ ] T038 [US3] 实现副作用成功后的状态更新 (更新 status/token/user,依赖 T037)
- [ ] T039 [US3] 实现副作用失败后的错误处理 (更新 status/error,依赖 T037)
- [ ] T040 [US3] 实现 validateDeps 调用 (在 createLoginEngine 中校验依赖完整性,依赖 T009,T023)
- [ ] T041 [US3] 增强 createMockDeps 支持多场景 Mock (成功/失败/超时,依赖 T020)

**Checkpoint**: 此时,所有三个用户故事都应该独立可运行 - Engine 能通过依赖注入执行副作用并处理结果

**Parallel Example for US3**:
```bash
# 并行运行所有副作用测试:
Task: T033 [P] [US3] 编写副作用调用测试
Task: T034 [P] [US3] 编写副作用成功场景测试
Task: T035 [P] [US3] 编写副作用失败场景测试
Task: T036 [P] [US3] 编写依赖校验测试
```

---

## Phase 6: User Story 4 - 应用状态管理与业务内核协作 (Priority: P4)

**Goal**: Zustand 应用状态容器与业务引擎协作,存储业务完成后的最终结果(user/token),不存储业务流程中间态

**Independent Test**: 登录完成后将 token 存入 Zustand,验证只存储最终结果而非中间状态(status/step)

### Tests for User Story 4

- [ ] T042 [P] [US4] 编写应用状态集成测试在 tests/integration/app-state.test.js (验证 token 保存到 Zustand)
- [ ] T043 [P] [US4] 编写状态边界测试在 tests/integration/app-state.test.js (验证中间态保留在 Engine 而非 Zustand)

### Implementation for User Story 4

- [ ] T044 [US4] 实现 deps.saveToken 在 apps/seed/src/store/useAuthStore.js (将 token 保存到 Zustand)
- [ ] T045 [US4] 实现 deps.clearToken 在 apps/seed/src/store/useAuthStore.js (从 Zustand 清除 token)
- [ ] T046 [US4] 实现 deps.navigate 在 apps/seed/src/router.js (使用路由导航)
- [ ] T047 [US4] 创建真实的 deps 实现 (整合 useAuthStore 和 router,依赖 T044,T045,T046)
- [ ] T048 [US4] 在 seed 应用中集成 loginEngine (使用真实 deps 替换 mock,依赖 T023,T047)

**Checkpoint**: 此时,所有四个用户故事都应该独立可运行 - 业务流程中间态在 Engine,最终结果在 Zustand

**Parallel Example for US4**:
```bash
# 并行运行所有集成测试:
Task: T042 [P] [US4] 编写应用状态集成测试
Task: T043 [P] [US4] 编写状态边界测试

# 并行实现所有 deps:
Task: T044 [P] [US4] 实现 deps.saveToken
Task: T045 [P] [US4] 实现 deps.clearToken
Task: T046 [P] [US4] 实现 deps.navigate
```

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事的改进和优化

- [ ] T049 [P] 完善 packages/core/README.md (添加快速开始、API 文档、示例)
- [ ] T050 [P] 创建 Architecture Decision Record 在 docs/adr/001-core-engine-architecture.md (记录 Engine 架构决策)
- [ ] T051 [P] 优化 StateContainer 性能在 packages/core/src/utils/StateContainer.js (添加选择性深度拷贝优化)
- [ ] T052 [P] 增强 ESLint 规则在 eslint.config.js (添加 packages/ui/** 的架构约束)
- [ ] T053 [P] 添加性能监控在 packages/core/src/utils/StateContainer.js (记录状态更新时间,性能目标 < 1ms)
- [ ] T054 [P] 编写 Adapter 最佳实践文档在 packages/core/docs/adapter-best-practices.md (订阅管理、性能优化)
- [ ] T055 [P] 运行 quickstart.md 验证 (确保文档示例可运行)
- [ ] T056 添加 CI/CD 检查 (架构合规性检查、测试覆盖率 > 80%)
- [ ] T057 代码重构和优化 (基于测试结果和性能分析)
- [ ] T058 安全加固 (参数校验、依赖校验、错误消息)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-6)**: 都依赖 Foundational 完成
  - 用户故事可以并行进行(如果有人力)
  - 或按优先级顺序执行(P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 不依赖其他故事
- **User Story 2 (P2)**: Foundational 完成后可开始 - 集成 US1 但应独立可测试
- **User Story 3 (P3)**: Foundational 完成后可开始 - 扩展 US1 副作用处理,应独立可测试
- **User Story 4 (P4)**: Foundational 完成后可开始 - 集成 US1/US3,应独立可测试

### Within Each User Story

- Tests MUST 先编写并 FAIL,再实现功能 (TDD 方法)
- State/Effects 在 Commands 前
- Commands 在 Rules 前
- Engine 在 Adapter 前
- 核心实现在集成前
- 故事完成后才能进入下一优先级

### Parallel Opportunities

- 所有标记 [P] 的 Setup 任务可并行
- 所有标记 [P] 的 Foundational 任务可在 Phase 2 内并行
- Foundational 完成后,所有用户故事可并行开始(如果团队人力允许)
- 所有标记 [P] 的用户故事测试可并行
- 所有标记 [P] 的用户故事实现任务可并行
- 不同用户故事可由不同团队成员并行工作

---

## Parallel Example: All User Stories

```bash
# Phase 1: Setup (并行启动所有)
Task: T003 [P] 配置 packages/core/.eslintrc.js
Task: T004 [P] 配置 vitest.config.js
Task: T005 [P] 创建 .npmrc
Task: T006 [P] 添加 .gitignore

# Phase 2: Foundational (并行启动所有)
Task: T008 [P] 实现 invariant 工具函数
Task: T009 [P] 实现 validateDeps 工具函数
Task: T010 [P] 创建测试 setup 文件

# Phase 2 完成后,并行启动所有用户故事:

# User Story 1 (并行启动所有测试)
Task: T013 [P] [US1] 编写 LoginEngine 初始化测试
Task: T014 [P] [US1] 编写 Commands 测试
Task: T015 [P] [US1] 编写 Rules 测试
Task: T016 [P] [US1] 编写订阅机制测试
Task: T017 [P] [US1] 编写错误处理测试

# User Story 2 (并行启动所有测试)
Task: T026 [P] [US2] 编写 createReactAdapter 单元测试
Task: T027 [P] [US2] 编写 Adapter 订阅机制测试
Task: T028 [P] [US2] 编写 Adapter 选择性订阅测试

# User Story 3 (并行启动所有测试)
Task: T033 [P] [US3] 编写副作用调用测试
Task: T034 [P] [US3] 编写副作用成功场景测试
Task: T035 [P] [US3] 编写副作用失败场景测试
Task: T036 [P] [US3] 编写依赖校验测试

# User Story 4 (并行启动所有测试)
Task: T042 [P] [US4] 编写应用状态集成测试
Task: T043 [P] [US4] 编写状态边界测试
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup (T001-T006)
2. 完成 Phase 2: Foundational (T007-T012) **CRITICAL - 阻塞所有故事**
3. 完成 Phase 3: User Story 1 (T013-T025)
4. **STOP and VALIDATE**: 独立测试 User Story 1
5. 如果就绪,部署/演示

**MVP 交付物**: 可工作的登录业务引擎,可在 Node 环境独立运行,符合所有架构原则

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 添加 User Story 4 → 独立测试 → 部署/演示
6. 每个故事都增加价值而不破坏之前的故事

### Parallel Team Strategy

多开发者场景:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后:
   - 开发者 A: User Story 1 (T013-T025)
   - 开发者 B: User Story 2 (T026-T032)
   - 开发者 C: User Story 3 (T033-T041)
   - 开发者 D: User Story 4 (T042-T048)
3. 故事独立完成和集成

---

## Task Summary

- **Total Tasks**: 58
- **Setup Tasks**: 6 (T001-T006)
- **Foundational Tasks**: 6 (T007-T012)
- **User Story 1 Tasks**: 13 (T013-T025, 包含 5 个测试任务)
- **User Story 2 Tasks**: 7 (T026-T032, 包含 3 个测试任务)
- **User Story 3 Tasks**: 9 (T033-T041, 包含 4 个测试任务)
- **User Story 4 Tasks**: 7 (T042-T048, 包含 2 个测试任务)
- **Polish Tasks**: 10 (T049-T058)

### Parallel Opportunities

- **Setup Phase**: 4 个并行任务 (T003-T006)
- **Foundational Phase**: 3 个并行任务 (T008-T010)
- **User Story 1**: 10 个并行任务 (5 个测试 T013-T017, 3 个状态/契约 T018-T020, T024-T025)
- **User Story 2**: 4 个并行任务 (3 个测试 T026-T028, T031-T032)
- **User Story 3**: 8 个并行任务 (4 个测试 T033-T036, T041)
- **User Story 4**: 6 个并行任务 (2 个测试 T042-T043, 3 个 deps T044-T046)
- **Polish Phase**: 7 个并行任务 (T049-T055)

### Independent Test Criteria

- **User Story 1**: 创建 loginEngine,调用 createLoginEngine(mockDeps),验证标准接口和状态转换
- **User Story 2**: 创建 React 组件使用 useLogin,验证组件能订阅状态、调用命令、获取规则
- **User Story 3**: 使用 mock deps 测试 Engine,验证副作用调用和错误处理
- **User Story 4**: 登录完成后检查 Zustand store,验证 token 保存但 status 等中间态不在 Zustand

### Suggested MVP Scope

**推荐 MVP**: User Story 1 (开发者创建业务引擎) - 13 个任务

**理由**:
- 提供完整的、可独立运行的 Engine 实现
- 验证核心架构原则(Engine 标准接口、状态管理、依赖注入)
- 可在 Node 环境测试,无需 React
- 为后续故事提供坚实基础

**MVP 验证**:
- ✅ Engine 实现标准接口 (FR-001)
- ✅ 强制执行目录结构约束 (FR-002)
- ✅ 状态可序列化且不可变 (FR-003)
- ✅ 通过依赖注入支持副作用 (FR-005)
- ✅ 规则是纯函数 (FR-006)
- ✅ 可在 Node 环境独立运行 (FR-007)
- ✅ 对外能力声明 (FR-008)

---

## Format Validation

✅ **ALL tasks follow checklist format**:
- ✅ Checkbox: `- [ ]` prefix
- ✅ Task ID: T001-T058 sequential numbering
- ✅ [P] marker: Present for parallelizable tasks
- ✅ [Story] label: [US1], [US2], [US3], [US4] for user story phases
- ✅ File paths: Included in all implementation tasks
- ✅ Test tasks: 14 test tasks across all user stories
- ✅ Dependencies: Clearly documented within each story

---

## Notes

- [P] 任务 = 不同文件,无依赖关系
- [Story] 标签 = 任务映射到特定用户故事,便于追踪
- 每个用户故事应独立可完成和测试
- 验证测试在实现前失败(TDD 方法)
- 每个任务或逻辑组后提交代码
- 在任何 checkpoint 停止以独立验证故事
- 避免:模糊任务、同文件冲突、破坏独立性的跨故事依赖
