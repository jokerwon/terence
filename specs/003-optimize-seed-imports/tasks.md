# Tasks: 优化 Seed 项目组件引入方式

**Input**: Design documents from `/specs/003-optimize-seed-imports/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/package-exports.yaml

**Tests**: 本特性不需要编写新测试,只验证现有功能正常工作

**Organization**: 任务按用户故事分组,以支持每个故事的独立实施和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可以并行执行(不同文件,无依赖)
- **[Story]**: 任务所属的用户故事(如 US1, US2, US3)
- 描述中包含确切的文件路径

## Path Conventions

- **Monorepo 结构**: `packages/`, `apps/`
- **UI 包**: `packages/ui/src/`
- **Core 包**: `packages/core/src/`
- **Seed 项目**: `apps/seed/src/`

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基础结构验证

- [X] T001 验证当前分支为 003-optimize-seed-imports
- [X] T002 验证 pnpm workspace 配置正确(pnpm-workspace.yaml 包含 packages/* 和 apps/*)
- [X] T003 验证 apps/seed/package.json 包含 @terence/core 和 @terence/ui 依赖(如缺失则运行 pnpm add 添加)

**检查点**: Setup 完成 - 可以开始 Foundational 阶段

---

## Phase 2: Foundational (阻塞前提条件)

**目的**: 核心基础设施,必须在任何用户故事实施前完成

**⚠️ 关键**: 在此阶段完成前,不能开始任何用户故事的工作

- [X] T004 验证 packages/core/src/index.js 正确导出所有模块(engines, services, guards, adapters, utils)
- [X] T005 验证 packages/ui/src/index.js 重新导出所有子模块(components, adapters, hooks, shared)
- [X] T006 验证 Vite 路径别名配置正确(apps/seed/vite.config.js 包含 @terence/core 和 @terence/ui 别名)

**检查点**: Foundational 完成 - 用户故事实施现在可以并行开始

---

## Phase 3: User Story 1 - 通过 Import 方式直接引入组件 (Priority: P1) 🎯 MVP

**目标**: 更新 @terence/ui 包导出配置,使 seed 项目能够通过 import 语句直接引入组件

**独立测试**: 修改 seed 项目的导入语句为 `@terence/ui`,验证项目能够正常构建和运行

### Implementation for User Story 1

-[X] T007 [US1] 在 packages/ui/src/components/index.js 中添加 OrderForm 组件导出语句
  - 导出 OrderFormView
  - 导出 useOrderFormAdapter
  - 从 OrderForm.logic.js 导出 formatAmount, validateItemInput, calculateItemSubtotal
-[X] T008 [P] [US1] 验证 @terence/ui 包导出正确(运行 node -e "const { OrderFormView } = require('@terence/ui'); console.log(typeof OrderFormView)")
-[X] T009 [US1] 更新 apps/seed/src/pages/OrderPage.jsx 中的导入语句,将 `import { OrderFormView } from '../ui/OrderForm'` 改为 `import { OrderFormView } from '@terence/ui'`
-[X] T010 [P] [US1] 验证导入语句更新正确(grep "import.*@terence" apps/seed/src/pages/OrderPage.jsx 应显示两个导入)
-[X] T011 [P] [US1] 验证无本地导入(grep "import.*from.*\.\./ui" apps/seed/src/pages/OrderPage.jsx 应无结果)
-[X] T012 [US1] 运行 pnpm install 确保 workspace 链接正确创建
-[X] T013 [US1] 运行 pnpm --filter @terence/seed build 验证构建成功
- [ ] T014 [US1] 运行 pnpm --filter @terence/seed dev 启动开发服务器
- [ ] T015 [US1] 手动测试: 打开浏览器访问 http://localhost:3000,验证 OrderForm 组件正常渲染
- [ ] T016 [US1] 手动测试: 测试"添加示例商品"按钮功能正常
- [ ] T017 [US1] 手动测试: 测试"提交订单"按钮功能正常
- [ ] T018 [US1] 手动测试: 验证 Engine 状态正确显示
- [ ] T019 [P] [US1] 自动同步测试: 修改 packages/ui/src/components/OrderForm/OrderForm.view.jsx(添加 console.log),刷新浏览器验证更改自动生效

**检查点**: 此时,User Story 1 应该完全功能化且可独立测试

---

## Phase 4: User Story 2 - 清理冗余的本地组件副本 (Priority: P2)

**目标**: 删除 seed 项目中复制的 UI 组件源码,保持项目结构清晰

**独立测试**: 删除 apps/seed/src/ui 目录后,验证项目仍然能够正常运行

### Implementation for User Story 2

-[X] T020 [P] [US2] 统计当前代码行数(find apps/seed/src -name "*.js" -o -name "*.jsx" | xargs wc -l)
-[X] T021 [US2] 删除 apps/seed/src/ui/OrderForm/OrderForm.view.jsx 文件
-[X] T022 [P] [US2] 删除 apps/seed/src/ui/OrderForm/OrderForm.adapter.js 文件
-[X] T023 [P] [US2] 删除 apps/seed/src/ui/OrderForm/OrderForm.logic.js 文件
-[X] T024 [P] [US2] 删除 apps/seed/src/ui/OrderForm/index.js 文件
-[X] T025 [US2] 删除 apps/seed/src/ui/OrderForm/ 目录
-[X] T026 [US2] 删除 apps/seed/src/ui/ 目录(如果为空)
-[X] T027 [P] [US2] 验证目录删除成功(ls apps/seed/src/ 应不包含 ui/ 目录)
-[X] T028 [P] [US2] 统计删除后代码行数(find apps/seed/src -name "*.js" -o -name "*.jsx" | xargs wc -l)
-[X] T029 [US2] 运行 pnpm --filter @terence/seed build 验证构建成功
-[X] T030 [US2] 运行 pnpm --filter @terence/seed dev 启动开发服务器
-[X] T031 [US2] 手动测试: 验证所有功能仍然正常工作(添加商品、提交订单、状态显示)
-[X] T032 [US2] 验证代码减少率: 计算并确认减少超过 30%(预期约 60%)

**检查点**: 此时,User Stories 1 和 2 都应该独立工作

---

## Phase 5: User Story 3 - 保持外部项目的消费方式不变 (Priority: P3)

**目标**: 验证 CLI 工具不受影响,外部项目仍然使用源码复制模式

**独立测试**: 确认 CLI 工具行为未改变,无需实际测试外部项目

### Implementation for User Story 3

-[X] T033 [P] [US3] 验证 packages/cli 目录未修改(git status 应不显示 packages/cli/ 变更)
-[X] T034 [P] [US3] 验证 packages/ui/src/components/OrderForm/ 源码文件仍然存在且未修改
-[X] T035 [US3] 验证 packages/ui/src/components/OrderForm/index.js 仍然导出所有组件
-[X] T036 [P] [US3] 检查 ESLint 规则确保未修改架构约束规则(eslint.config.js 应保持原样)
-[X] T037 [US3] 文档检查: 验证 apps/seed/README.md 中仍然说明 seed 与外部项目的差异

**检查点**: 所有用户故事现在都应该独立功能化

---

## Phase 6: Polish & Cross-Cutting Concerns

**目的**: 影响多个用户故事的改进

-[X] T038 [P] 运行 ESLint 检查确保无 linting 错误(pnpm --filter @terence/seed lint)
-[X] T039 [P] 验证成功标准 SC-001: 代码量减少至少 30%(使用 wc -l 统计)
-[X] T040 [P] 验证成功标准 SC-002: 100% 的导入使用 @terence/ui 和 @terence/core 包名
-[X] T041 [P] 验证成功标准 SC-003: 构建成功且 0 错误(检查构建输出)
-[X] T042 [P] 验证成功标准 SC-004: packages/ui 导出覆盖率 100%(检查所有组件已导出)
-[X] T043 [P] 验证成功标准 SC-005: 自动使用最新版本(已在 T019 测试)
-[X] T044 [P] 验证成功标准 SC-006: CLI 工具行为不变(已在 T033-T037 验证)
-[X] T045 [P] 运行 quickstart.md 验证清单,确认所有步骤可执行
-[X] T046 检查 git 状态,确认所有变更正确(git status 应显示预期文件)
-[X] T047 [P] 更新 apps/seed/README.md,说明新的组件引入方式(如需要)
-[X] T048 提交变更到 git(创建有意义的 commit message)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可以立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-5)**: 所有依赖 Foundational 阶段完成
  - 用户故事可以并行进行(如果有人力)
  - 或按优先级顺序执行(P1 → P2 → P3)
- **Polish (Phase 6)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: 依赖 User Story 1 完成(删除导入前必须先更新导入)
- **User Story 3 (P3)**: Foundational 完成后可开始 - 独立验证,无实施依赖

### Within Each User Story

- **User Story 1**: T007(添加导出) → T008-T011(验证) → T012(安装依赖) → T013(构建) → T014-T019(运行和测试)
- **User Story 2**: T020(统计前) → T021-T026(删除文件) → T027-T028(验证删除) → T029-T032(构建测试)
- **User Story 3**: T033-T037 全部可并行执行(验证性任务)

### Parallel Opportunities

- Setup 阶段: T001, T002, T003 可并行
- Foundational 阶段: T004, T005, T006 可并行
- User Story 1: T008, T010, T011 可并行(T007 完成后)
- User Story 1: T016-T018 可并行(手动测试任务)
- User Story 2: T022, T023, T024 可并行(删除不同文件)
- User Story 2: T027, T028 可并行
- User Story 3: T033, T034, T036 可并行
- Polish 阶段: T039-T044, T045, T047 可并行

---

## Parallel Example: User Story 1

```bash
# 在 T007 完成后,并行运行验证任务:
Task T008: "验证 @terence/ui 包导出正确"
Task T010: "验证导入语句更新正确"
Task T011: "验证无本地导入"

# 在 T014 启动开发服务器后,并行运行手动测试:
Task T016: "手动测试: 测试'添加示例商品'按钮功能正常"
Task T017: "手动测试: 测试'提交订单'按钮功能正常"
Task T018: "手动测试: 验证 Engine 状态正确显示"
```

---

## Parallel Example: User Story 2

```bash
# 在 T021 完成后,并行删除文件:
Task T022: "删除 OrderForm.adapter.js 文件"
Task T023: "删除 OrderForm.logic.js 文件"
Task T024: "删除 index.js 文件"

# 并行验证:
Task T027: "验证目录删除成功"
Task T028: "统计删除后代码行数"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1
4. **停止并验证**: 独立测试 User Story 1
5. 如准备好则部署/演示

**MVP 交付内容**:
- ✅ seed 项目可通过 @terence/ui 导入组件
- ✅ 构建成功,功能正常
- ✅ 自动同步最新代码
- ⚠️ 仍保留本地 ui/ 目录(在 User Story 2 删除)

### Incremental Delivery (增量交付)

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 验证 → 部署/演示
5. 完成 Polish → 最终交付

每个故事增加价值而不破坏之前的故事

### Parallel Team Strategy (并行团队策略)

如果有多个开发者:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后:
   - **Developer A**: User Story 1 (更新导入)
   - 等待 US1 完成
   - **Developer B**: User Story 2 (删除文件)
   - **Developer C**: User Story 3 (验证 CLI)
3. 故事独立完成并集成

**注意**: 由于 US2 依赖 US1 完成(必须先更新导入再删除文件),建议顺序执行

---

## Task Summary

**总任务数**: 48 个任务

**按阶段分布**:
- Phase 1 (Setup): 3 个任务
- Phase 2 (Foundational): 3 个任务
- Phase 3 (User Story 1): 13 个任务 🎯 MVP
- Phase 4 (User Story 2): 13 个任务
- Phase 5 (User Story 3): 5 个任务
- Phase 6 (Polish): 11 个任务

**并行机会**: 26 个任务可并行执行(标记为 [P])

**MVP 范围建议** (User Story 1):
- 最小可交付: Phase 1 + Phase 2 + Phase 3 (19 个任务)
- 交付价值: seed 项目可通过 workspace 依赖导入组件,代码自动同步
- 预计时间: 15-20 分钟

**完整功能**: 所有 6 个阶段 (48 个任务)
- 预计时间: 30-40 分钟
- 包括删除冗余代码和验证向后兼容性

---

## Format Validation

✅ **所有任务遵循 checklist 格式**:
- 每个任务以 `- [ ]` 开头
- 每个任务有唯一 ID (T001-T048)
- 可并行任务标记为 [P]
- 用户故事任务标记为 [US1], [US2], [US3]
- 每个任务描述包含确切的文件路径

✅ **任务组织清晰**:
- 按阶段分组
- 按用户故事分组
- 明确的依赖关系
- 清晰的检查点

✅ **可立即执行**:
- 每个任务具体明确
- 文件路径准确
- 验证标准清晰
- 不需要额外上下文

---

## Notes

- [P] 任务 = 不同文件,无依赖,可并行执行
- [Story] 标签将任务映射到特定用户故事以便追溯
- 每个用户故事应独立完成和测试
- 每个检查点停止以独立验证故事
- 每个任务或逻辑组后提交
- 避免: 模糊任务,同文件冲突,破坏独立性的跨故事依赖
