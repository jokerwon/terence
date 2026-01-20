# Tasks: 重建 @terence/core 脚手架

**Input**: Design documents from `/specs/001-rebuild-core-scaffold/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: 本 feature 包含测试任务。Core 层测试优先级高，UI 层测试优先级低。

**Organization**: 任务按用户故事分组，确保每个故事可以独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属的用户故事（US1, US2, US3, US4, US5）
- 包含精确的文件路径

## Path Conventions

- **Core 包**: `packages/core/src/`
- **UI 包**: `packages/ui/hooks/adapters/`
- **测试**: `packages/core/tests/`

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和基础结构搭建

- [X] T001 创建 `packages/core/src/stateless/` 目录结构
- [X] T002 创建 `packages/core/src/engines/` 目录结构
- [X] T003 创建 `packages/core/tests/stateless/` 测试目录
- [X] T004 创建 `packages/ui/hooks/adapters/` 目录（UI 层）
- [X] T005 [P] 更新 `packages/core/package.json` 的 exports 字段，导出 stateless 和 engines

**Checkpoint**: 目录结构准备完成

---

## Phase 2: Foundational (阻塞性前置条件)

**Purpose**: 所有用户故事依赖的核心基础设施

**⚠️ CRITICAL**: 在此阶段完成前，不能开始任何用户故事的实现

### 保留可复用工具

- [X] T006 [P] 验证 `packages/core/src/utils/StateContainer.js` 符合 Engine 需求
- [X] T007 [P] 验证 `packages/core/src/utils/invariant.js` 运行时断言功能
- [X] T008 [P] 验证 `packages/core/src/utils/validation.js` 依赖校验功能
- [X] T009 更新 `packages/core/src/utils/index.js`，确保所有工具函数正确导出

### 删除旧代码

- [X] T010 删除 `packages/core/src/adapters/` 目录（Adapter 将迁移到 UI 层）

### ESLint 架构约束

- [X] T011 创建 `packages/core/.eslintrc.js`，添加禁止引入 React 的规则
- [X] T012 在 `.eslintrc.js` 中添加禁止引入状态管理库的规则（Zustand, Redux）
- [X] T013 在 `.eslintrc.js` 中添加禁止 UI 层直接调用 Engine.subscribe 的规则

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - Stateless Core 开发登录业务 (Priority: P1) 🎯 MVP

**Goal**: 实现登录业务的 Stateless Core 模式，包含 rules.js、flows.js、contracts.js

**Independent Test**: 通过创建 `stateless/login/` 模块，测试业务规则和流程逻辑是否正确工作

### 测试 for User Story 1

> **NOTE: 先编写测试，确保测试失败后再实现功能**

- [X] T014 [P] [US1] 编写 `canSubmit` 规则测试 in `packages/core/tests/stateless/login/rules.test.js`
- [X] T015 [P] [US1] 编写 `submitLogin` 流程测试 in `packages/core/tests/stateless/login/flows.test.js`

### 实现 for User Story 1

- [X] T016 [P] [US1] 创建 `packages/core/src/stateless/login/rules.js`，实现 `canSubmit` 纯函数
- [X] T017 [P] [US1] 创建 `packages/core/src/stateless/login/contracts.js`，定义 `loginEffectsContract`
- [X] T018 [US1] 创建 `packages/core/src/stateless/login/flows.js`，实现 `submitLogin` 流程（依赖 T016, T017）
- [X] T019 [US1] 创建 `packages/core/src/stateless/login/index.js`，导出所有接口
- [X] T020 [US1] 更新 `packages/core/src/index.js`，导出 `stateless/login` 模块

**Checkpoint**: 此时 User Story 1 应该完全功能正常且可独立测试

---

## Phase 4: User Story 4 - 目录结构与代码组织 (Priority: P1)

**Goal**: 按照架构文档规范组织 Core 层的目录结构，确保双轨模型清晰分离

**Independent Test**: 通过检查 `packages/core/src/` 下的目录和文件组织，验证是否严格遵循架构文档

### 实现 for User Story 4

- [X] T021 [US4] 验证 `stateless/login/` 目录包含 rules.js、flows.js、contracts.js 三个文件
- [X] T022 [US4] 验证 `engines/login/` 目录保留作为 Engine 示例
- [X] T023 [US4] 验证顶层结构明确区分 `stateless/` 和 `engines/`，不包含 `adapter/`
- [X] T024 [US4] 创建 `packages/core/README.md`，说明双轨模型目录结构
- [X] T025 [US4] 在 README 中添加目录结构图和使用指南

**Checkpoint**: 目录结构检查通过率 100%

---

## Phase 5: User Story 3 - React Adapter 连接 Engine 和 UI (Priority: P1)

**Goal**: 将 Adapter 从 Core 包迁移到 UI 层，实现 React Hook 工厂函数

**Independent Test**: 通过创建 React Hook，测试组件能否正确响应 Engine 的状态更新

### 测试 for User Story 3

- [X] T026 [P] [US3] 编写 `createReactAdapter` 单元测试 in `packages/ui/tests/adapters/createReactAdapter.test.js`

### 实现 for User Story 3

- [X] T027 [US3] 创建 `packages/ui/hooks/adapters/createReactAdapter.js`，实现 Adapter 工厂函数
- [X] T028 [US3] 在 Adapter 中使用 `useSyncExternalStore` 订阅 Engine 状态
- [X] T029 [US3] 创建 `packages/ui/hooks/adapters/index.js`，导出 Adapter
- [X] T030 [US3] 更新 `packages/core/src/engines/login/index.js`，确保 Engine 接口符合 Adapter 要求
- [X] T031 [US3] 在 `packages/core/examples/LoginForm.jsx` 中演示 Adapter 使用方式

**Checkpoint**: Adapter 迁移完成，UI 层可通过 Hook 使用 Engine

---

## Phase 6: User Story 2 - Stateful Engine 管理复杂订单流程 (Priority: P2)

**Goal**: 创建订单流程 Engine 示例，展示 Stateful Engine 的完整实现

**Independent Test**: 通过创建订单 Engine，测试状态迁移是否按预期工作

### 测试 for User Story 2

- [X] T032 [P] [US2] 编写订单 Engine 状态迁移测试 in `packages/core/tests/engines/order-engine/order-engine.test.js`

### 实现 for User Story 2

- [X] T033 [P] [US2] 创建 `packages/core/src/engines/order-engine/transitions.js`，定义状态迁移规则
- [X] T034 [P] [US2] 创建 `packages/core/src/engines/order-engine/contract.js`，定义外部能力契约
- [X] T035 [US2] 创建 `packages/core/src/engines/order-engine/engine.js`，实现核心状态机（依赖 T033, T034）
- [X] T036 [US2] 创建 `packages/core/src/engines/order-engine/index.js`，导出 Engine
- [X] T037 [US2] 更新 `packages/core/src/engines/index.js`，导出 `order-engine`

**Checkpoint**: 订单 Engine 示例完成，展示 Stateful Engine 完整实现

---

## Phase 7: User Story 5 - 反模式检测与约束 (Priority: P2)

**Goal**: 通过 ESLint 规则确保代码不违反架构设计约束

**Independent Test**: 通过 ESLint 规则或 Code Review，检查代码是否包含禁止的模式

### 实现 for User Story 5

- [X] T038 [P] [US5] 验证 ESLint 规则能否检测 Core 层引入 React
- [X] T039 [P] [US5] 验证 ESLint 规则能否检测 Core 层引入状态管理库
- [X] T040 [US5] 验证 ESLint 规则能否检测 UI 层直接调用 Engine.subscribe
- [X] T041 [US5] 创建 `packages/core/examples/.eslintrc.js`，展示 ESLint 规则配置
- [X] T042 [US5] 在 `packages/core/CONTRIBUTING.md` 中添加架构约束说明和 ESLint 使用指南

**Checkpoint**: 反模式检测机制就绪，架构腐化可预防

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 跨多个用户故事的改进和文档完善

### 文档更新

- [X] T043 [P] 更新 `packages/core/README.md`，添加双轨模型说明
- [X] T044 [P] 更新 `packages/core/examples/README.md`，添加示例代码说明
- [X] T045 [P] 在 `packages/core/CHANGELOG.md` 中记录本次重构变更

### 代码清理

- [X] T046 运行 ESLint 检查所有 Core 层代码，修复警告
- [X] T047 运行 Vitest 测试套件，确保测试覆盖率 > 80%
- [X] T048 清理无用的导入和注释

### 示例完善

- [X] T049 [P] 创建 Stateless Core 使用示例 in `packages/core/examples/stateless-login-example.js`
- [X] T050 [P] 创建 Stateful Engine 使用示例 in `packages/core/examples/order-engine-example.js`
- [X] T051 创建 Adapter 使用示例 in `packages/ui/examples/useLogin-example.jsx`

### 验证

- [X] T052 运行 `quickstart.md` 中的所有示例代码，确保可执行
- [X] T053 验证所有导出接口与 `contracts/core-api.md` 一致
- [X] T054 执行架构合规性检查，确保所有 100% 遵循双轨模型

**Checkpoint**: 项目文档完整，示例可运行，架构约束生效

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-7)**: 都依赖 Foundational 完成
  - US1 (Stateless Core), US3 (Adapter), US4 (目录结构): 可并行执行
  - US2 (Stateful Engine), US5 (ESLint): 可并行执行
- **Polish (Phase 8)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1 - Stateless Core)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2 - Stateful Engine)**: Foundational 完成后可开始 - 独立可测试
- **User Story 3 (P1 - Adapter)**: Foundational 完成后可开始 - 依赖 login Engine 接口
- **User Story 4 (P1 - 目录结构)**: Foundational 完成后可开始 - 验证性任务
- **User Story 5 (P2 - ESLint)**: Foundational 完成后可开始 - 独立可测试

### Within Each User Story

- 测试必须先编写并失败，再实现功能
- 接口定义 (contracts) 先于实现
- 纯函数 (rules) 先于流程 (flows)
- 状态迁移 (transitions) 先于 Engine
- Adapter 实现先于示例

### Parallel Opportunities

- Setup 阶段所有标记 [P] 的任务可并行
- Foundational 阶段所有标记 [P] 的任务可并行
- Foundational 完成后，US1、US3、US4、US2、US5 可并行（如果团队资源允许）
- 每个用户故事内标记 [P] 的测试任务可并行
- 不同用户故事可由不同团队成员并行开发

---

## Parallel Example: User Story 1 (Stateless Core)

```bash
# 并行启动 User Story 1 的所有测试:
Task: "编写 canSubmit 规则测试 in packages/core/tests/stateless/login/rules.test.js"
Task: "编写 submitLogin 流程测试 in packages/core/tests/stateless/login/flows.test.js"

# 并行创建 User Story 1 的接口和规则:
Task: "创建 stateless/login/rules.js，实现 canSubmit 纯函数"
Task: "创建 stateless/login/contracts.js，定义 loginEffectsContract"
```

---

## Parallel Example: Multiple User Stories

```bash
# Foundational 完成后，并行启动多个用户故事:
# Developer A: User Story 1 (Stateless Core)
Task: "创建 stateless/login/rules.js"
Task: "创建 stateless/login/flows.js"

# Developer B: User Story 3 (Adapter)
Task: "创建 createReactAdapter.js"
Task: "更新 Engine 接口"

# Developer C: User Story 4 (目录结构)
Task: "验证目录结构"
Task: "创建 README 文档"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1 + User Story 4)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (CRITICAL - 阻塞所有故事)
3. 完成 Phase 3: User Story 1 (Stateless Core)
4. 完成 Phase 4: User Story 4 (目录结构验证)
5. **STOP and VALIDATE**: 独立测试 User Story 1
6. 如果就绪则部署/演示

### Incremental Delivery (按优先级渐进)

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 (Stateless Core) → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 4 (目录结构) → 独立验证 → 部署/演示
4. 添加 User Story 3 (Adapter) → 独立测试 → 部署/演示
5. 添加 User Story 2 (Stateful Engine) → 独立测试 → 部署/演示
6. 添加 User Story 5 (ESLint) → 验证 → 部署/演示
7. 完成 Polish → 最终版本
8. 每个故事都增加价值，不破坏已有功能

### Parallel Team Strategy

多个开发者时的策略:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后:
   - Developer A: User Story 1 (Stateless Core)
   - Developer B: User Story 3 (Adapter)
   - Developer C: User Story 4 (目录结构 + 文档)
3. 优先级 P1 完成后:
   - Developer A: User Story 2 (Stateful Engine)
   - Developer B: User Story 5 (ESLint 规则)
4. 所有人完成各自故事并独立集成

---

## Summary

- **Total Tasks**: 54 tasks
- **Setup (Phase 1)**: 5 tasks
- **Foundational (Phase 2)**: 8 tasks
- **User Story 1 (Phase 3)**: 7 tasks (MVP 核心功能)
- **User Story 4 (Phase 4)**: 5 tasks (目录结构验证)
- **User Story 3 (Phase 5)**: 6 tasks (Adapter 迁移)
- **User Story 2 (Phase 6)**: 6 tasks (Stateful Engine 示例)
- **User Story 5 (Phase 7)**: 5 tasks (ESLint 约束)
- **Polish (Phase 8)**: 12 tasks (文档和验证)

### Task Count by User Story

- **US1 (Stateless Core)**: 7 tasks
- **US2 (Stateful Engine)**: 6 tasks
- **US3 (Adapter)**: 6 tasks
- **US4 (目录结构)**: 5 tasks
- **US5 (ESLint)**: 5 tasks

### Parallel Opportunities

- **Setup**: 4 tasks 可并行 (T001-T004)
- **Foundational**: 3 tasks 可并行 (T006-T008)
- **US1**: 2 tests 可并行, 2 实现可并行
- **US2**: 2 tasks 可并行
- **US3**: 1 test 独立
- **US5**: 2 tasks 可并行
- **Polish**: 6 tasks 可并行

### MVP Scope

**建议 MVP**: Phase 1 + Phase 2 + Phase 3 (User Story 1) + Phase 4 (User Story 4)

包含任务:
- T001-T009: Setup + Foundational
- T014-T020: User Story 1 (Stateless Core - 登录业务)
- T021-T025: User Story 4 (目录结构验证)

**MVP 价值**: 提供完整的 Stateless Core 实现，覆盖 80%+ 的业务场景

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签将任务映射到特定用户故事，便于追踪
- 每个用户故事应可独立完成和测试
- 确保测试在实现前失败
- 每个任务或逻辑组后提交
- 在任何 checkpoint 停止以独立验证故事
- 避免: 模糊任务、同文件冲突、破坏独立性的跨故事依赖
