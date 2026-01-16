# Tasks: 移动 @terence/seed 到 apps/seed

**Input**: Design documents from `/specs/001-move-seed/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 本功能不需要测试任务 - 通过验证现有的构建、测试和 lint 命令来确保功能正常

**Organization**: 任务按用户故事分组,以实现每个故事的独立实施和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可以并行运行(不同文件,无依赖)
- **[Story]**: 此任务属于哪个用户故事(如 US1, US2)
- 在描述中包含确切的文件路径

## Path Conventions

- **Monorepo Root**: 所有配置文件在仓库根目录
- **Apps Directory**: `apps/seed/` (新位置)
- **Packages Directory**: `packages/` (库代码)
- **Documentation**: `docs/` (项目文档)

---

## Phase 1: Setup (验证环境)

**目的**: 确保工作环境准备好执行移动操作

- [ ] T001 验证当前分支为 001-move-seed
- [ ] T002 确认 Git 工作区干净(无未提交更改)
- [ ] T003 验证 @terence/seed 包当前位于 packages/examples/seed/
- [ ] T004 备份当前 workspace 配置(pnpm-workspace.yaml)

**Checkpoint**: 环境验证完成 - 可以安全开始移动操作

---

## Phase 2: Foundational (执行移动操作)

**目的**: 核心基础设施变更 - 必须在任何配置更新之前完成

**⚠️ CRITICAL**: 此阶段必须在任何用户故事工作之前完成

- [ ] T005 创建 apps 目录结构(mkdir -p apps)
- [ ] T006 使用 git mv 移动 packages/examples/seed 到 apps/seed
- [ ] T007 删除空的 packages/examples 目录
- [ ] T008 验证 Git 正确识别移动为 renamed 操作
- [ ] T009 验证 apps/seed 目录包含所有原文件

**Checkpoint**: 移动操作完成 - 文件已在新位置,Git 历史保留

---

## Phase 3: User Story 1 - 重构项目结构以提升可维护性 (Priority: P1) 🎯 MVP

**目标**: 将 @terence/seed 示例应用从 `packages/examples/seed` 移动到 `apps/seed`,符合 monorepo 最佳实践

**独立测试**: 验证新位置 `apps/seed` 包含所有原有文件和功能,所有依赖关系和引用正常工作

### Implementation for User Story 1

- [ ] T010 [P] [US1] 更新 pnpm-workspace.yaml,添加 `apps/*` 模式,移除 `packages/examples/*` 模式
- [ ] T011 [US1] 运行 pnpm install 重新建立 workspace 链接
- [ ] T012 [US1] 验证 pnpm list 显示 @terence/seed 在新位置
- [ ] T013 [US1] 验证 pnpm why @terence/seed 正确解析到 apps/seed
- [ ] T014 [US1] 运行 pnpm dev 验证开发服务器正常启动
- [ ] T015 [US1] 运行 pnpm build 验证构建成功
- [ ] T016 [US1] 运行 pnpm test 验证所有测试通过
- [ ] T017 [US1] 运行 pnpm lint 验证代码检查通过
- [ ] T018 [US1] 使用 git log --follow apps/seed/package.json 验证 Git 历史完整

**Checkpoint**: User Story 1 完成 - seed 应用已在新位置正常运行,所有脚本工作正常

---

## Phase 4: User Story 2 - 更新项目配置和文档 (Priority: P2)

**目标**: 更新所有相关配置文件和文档以反映新的目录结构

**独立测试**: 检查所有配置文件中的路径引用已更新,文档准确反映新结构

### Implementation for User Story 2

- [ ] T019 [P] [US2] 搜索并更新 README.md 中的 packages/examples/seed 引用
- [ ] T020 [P] [US2] 搜索并更新 docs/architecture/ 中的路径引用
- [ ] T021 [P] [US2] 搜索并更新 docs/ 目录下所有 .md 文件的路径引用
- [ ] T022 [P] [US2] 检查 eslint.config.js 是否需要更新路径引用
- [ ] T023 [P] [US2] 检查 vite.config.js 是否需要更新路径引用
- [ ] T024 [P] [US2] 检查 packages/cli/ 文档是否需要更新示例路径
- [ ] T025 [P] [US2] 更新 apps/seed/README.md(如果存在)中的相对路径引用
- [ ] T026 [US2] 验证所有文档更新完成(grep 搜索确保无遗留引用)
- [ ] T027 [US2] 运行完整验证清单(参考 quickstart.md Verification Checklist)

**Checkpoint**: User Story 2 完成 - 所有配置和文档已更新,无遗留旧路径引用

---

## Phase 5: Polish & Cross-Cutting Concerns

**目的**: 最终验证和清理

- [ ] T028 [P] 检查并清理 node_modules 和 pnpm-lock.yaml(如需要)
- [ ] T029 运行完整的 quickstart.md 验证流程
- [ ] T030 对比移动前后构建时间,确保差异 < 5%
- [ ] T031 提交所有更改到 Git(包括移动、配置更新、文档更新)
- [ ] T032 创建清晰的 commit message 说明移动操作和影响

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可以立即开始
- **Foundational (Phase 2)**: 依赖于 Setup 完成 - 阻塞所有用户故事
- **User Story 1 (Phase 3)**: 依赖于 Foundational 完成 - 文件必须先移动
- **User Story 2 (Phase 4)**: 依赖于 User Story 1 完成 - 配置和文档更新在移动后
- **Polish (Phase 5)**: 依赖于所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 在 Foundational (Phase 2) 完成后可以开始 - 无其他故事依赖
- **User Story 2 (P2)**: 必须在 User Story 1 完成后开始 - 需要文件已在正确位置

### Within Each User Story

**User Story 1**:
- T010 必须先完成(workspace 配置更新)
- T011-T013 顺序执行(安装 → 验证列表 → 验证解析)
- T014-T017 可以并行执行(不同验证命令)

**User Story 2**:
- T019-T025 可以并行执行(不同文档/配置文件)
- T026 必须在所有文档更新后完成
- T027 必须在最后(完整验证)

### Parallel Opportunities

- Setup 阶段: 无并行机会(顺序验证)
- Foundational 阶段: 无并行机会(顺序操作)
- User Story 1: T014-T017 可以并行运行(不同验证命令)
- User Story 2: T019-T025 可以并行运行(不同文档文件)
- Polish 阶段: T028 可以与其他任务并行

---

## Parallel Example: User Story 1

```bash
# 验证阶段可以并行运行(在不同终端或后台):
# Terminal 1:
pnpm dev

# Terminal 2:
pnpm build

# Terminal 3:
pnpm test

# Terminal 4:
pnpm lint
```

---

## Parallel Example: User Story 2

```bash
# 并行更新所有文档(使用不同的编辑器或终端):
# 终端 1: 搜索并更新 README
grep -r "packages/examples/seed" README.md

# 终端 2: 搜索并更新架构文档
grep -r "packages/examples/seed" docs/architecture/

# 终端 3: 搜索并更新其他文档
grep -r "packages/examples/seed" docs/
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - 推荐)

1. 完成 Phase 1: Setup (验证环境)
2. 完成 Phase 2: Foundational (执行移动) - ⚠️ CRITICAL
3. 完成 Phase 3: User Story 1 (更新配置并验证)
4. **STOP and VALIDATE**: 所有脚本正常,构建测试通过
5. 可以提交并合并 MVP

### Incremental Delivery

1. 完成 Setup + Foundational → 文件已移动
2. 添加 User Story 1 → 配置更新,功能验证 → MVP 完成!
3. 添加 User Story 2 → 文档更新,完整交付
4. 添加 Polish → 最终验证和清理
5. 每个阶段都可以独立提交和验证

### Sequential Strategy (推荐单人开发)

由于此功能的特殊性(必须先移动再更新),建议顺序执行:

1. Phase 1 → Phase 2 → Phase 3 → 验证 MVP
2. 如果 MVP 满足需求,可以在此停止
3. 继续执行 Phase 4 → Phase 5 完成完整交付

---

## Notes

- [P] 任务 = 不同文件,无依赖,可以并行
- [Story] 标签将任务映射到特定用户故事以便追溯
- User Story 1 是 MVP,可以独立交付
- User Story 2 在 User Story 1 基础上完善文档
- 每个阶段后都应该运行验证确保无回归
- 遇到问题参考 quickstart.md 的 Troubleshooting 部分
- 如果需要回滚,参考 quickstart.md 的 Rollback Procedure
- Git 历史保留是硬性要求,必须使用 git mv 而非文件系统操作

---

## Task Summary

- **Total Tasks**: 32
- **Setup Phase**: 4 tasks
- **Foundational Phase**: 5 tasks
- **User Story 1**: 9 tasks (MVP)
- **User Story 2**: 9 tasks
- **Polish Phase**: 5 tasks
- **Parallelizable Tasks**: 12 (标记为 [P])

**Estimated Time**: 15-30 分钟(按 quickstart.md)

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (Tasks T001-T018)
**Full Scope**: 所有 Phases (Tasks T001-T032)

---

## Format Validation

✅ **ALL tasks follow checklist format**:
- All tasks start with `- [ ]` (checkbox)
- All tasks have sequential ID (T001-T032)
- Parallel tasks marked with `[P]`
- User story tasks marked with `[US1]` or `[US2]`
- All descriptions include file paths or specific actions
