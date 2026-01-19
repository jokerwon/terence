# Tasks: @terence/seed 初始化脚手架搭建

**Input**: Design documents from `/specs/001-init-seed/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: 测试任务已包含在用户故事中,因为 spec.md SC-005 要求测试覆盖率 >= 80%

**Organization**: 任务按用户故事组织,以实现每个故事的独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可以并行运行(不同文件,无依赖)
- **[Story]**: 任务所属的用户故事(例如 US1, US2, US3)
- 包含精确的文件路径

## Path Conventions

基于 plan.md,项目结构为:
- **Web app**: `apps/seed/src/`

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和基本结构

- [ ] T001 创建缺失的目录结构 apps/seed/src/{assets,components,pages,routes,stores,hooks,utils,constants,services,styles}
- [ ] T002 验证 workspace 依赖 @terence/core 和 @terence/ui 正确配置在 apps/seed/package.json
- [ ] T003 [P] 安装 React Router v6: pnpm add react-router-dom@6 in apps/seed/
- [ ] T004 [P] 安装 Zustand: pnpm add zustand in apps/seed/
- [ ] T005 [P] 安装 Tailwind CSS: pnpm add -D tailwindcss postcss autoprefixer in apps/seed/
- [ ] T006 [P] 安装 @testing-library/react: pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event in apps/seed/

---

## Phase 2: Foundational (阻塞性前置条件)

**Purpose**: 核心基础设施,必须完成后才能开始任何用户故事的实现

**⚠️ CRITICAL**: 在此阶段完成前,不能开始任何用户故事工作

- [ ] T007 创建 Vite 配置文件 apps/seed/vite.config.js,配置路径别名(@ -> src/, @terence/core, @terence/ui)和代码分割
- [ ] T008 创建 ESLint 配置文件 apps/seed/.eslintrc.js,实现架构边界检测规则(no-restricted-imports)
- [ ] T009 创建 Vitest 配置文件 apps/seed/vitest.config.js,配置 jsdom 环境和测试设置
- [ ] T010 创建 Tailwind CSS 配置文件 apps/seed/tailwind.config.js,禁用 preflight,集成 Ant Design token
- [ ] T011 创建测试设置文件 apps/seed/src/test/setup.js,配置 Testing Library 和全局 mocks
- [ ] T012 [P] 创建 Ant Design 主题配置 apps/seed/src/styles/theme.js,定义 lightTheme 和 darkTheme
- [ ] T013 [P] 创建全局样式文件 apps/seed/src/styles/index.css,集成 Tailwind 指令
- [ ] T014 创建 Zustand store apps/seed/src/stores/useUIStore.js,实现 modal、drawer、user、loading、theme 状态管理

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 基础开发环境配置 (Priority: P1) 🎯 MVP

**Goal**: 启动功能完整的开发环境,包括 Vite 构建、React 19 集成、Ant Design 6 主题配置和开发服务器

**Independent Test**: 运行 `pnpm dev`,验证 Vite 开发服务器在 5 秒内启动,应用在浏览器中正常显示,控制台无错误

### Tests for User Story 1

- [ ] T015 [P] [US1] 创建构建测试 apps/seed/src/__tests__/build.test.jsx,验证 Vite 配置正确且路径别名工作
- [ ] T016 [P] [US1] 创建主题测试 apps/seed/src/__tests__/theme.test.jsx,验证 Ant Design 主题正确应用

### Implementation for User Story 1

- [ ] T017 [P] [US1] 更新 apps/seed/src/main.jsx,集成 React 19 createRoot 和 Ant Design ConfigProvider
- [ ] T018 [P] [US1] 更新 apps/seed/src/App.jsx,实现主题切换逻辑和路由容器
- [ ] T019 [P] [US1] 更新 apps/seed/index.html,确保正确的 HTML 结构和 meta 标签
- [ ] T020 [US1] 运行开发服务器并验证热更新功能,修改源码文件后页面自动刷新
- [ ] T021 [US1] 验证 Ant Design 组件样式正确显示,主题配置生效

**Checkpoint**: 此时,User Story 1 应该完全功能正常且可独立测试

---

## Phase 4: User Story 2 - 目录结构和文件组织 (Priority: P1)

**Goal**: 清晰的项目目录结构,包括页面、组件、状态管理、路由、工具函数等标准目录

**Independent Test**: 检查目录结构,验证所有必需目录存在,文件命名符合规范(组件大驼峰,工具小驼峰)

### Tests for User Story 2

- [ ] T022 [P] [US2] 创建目录结构测试 apps/seed/src/__tests__/structure.test.jsx,验证所有必需目录存在

### Implementation for User Story 2

- [ ] T023 [P] [US2] 创建示例页面组件 apps/seed/src/pages/HomePage/index.jsx,使用正确的页面结构
- [ ] T024 [P] [US2] 创建示例页面 hook apps/seed/src/pages/HomePage/useHomePage.js
- [ ] T025 [P] [US2] 创建示例项目级组件 apps/seed/src/components/Header/index.jsx
- [ ] T026 [P] [US2] 创建示例项目级 hook apps/seed/src/hooks/useWindowSize.js
- [ ] T027 [P] [US2] 创建示例工具函数 apps/seed/src/utils/formatUtils.js
- [ ] T028 [P] [US2] 创建示例常量文件 apps/seed/src/constants/appConstants.js
- [ ] T029 [US2] 创建路由配置 apps/seed/src/routes/index.jsx,使用 React Router v6,注册 HomePage
- [ ] T030 [US2] 更新 apps/seed/src/App.jsx,集成路由配置并使用 RouterProvider
- [ ] T031 [US2] 验证文件命名规范:组件文件使用大驼峰,工具函数文件使用小驼峰

**Checkpoint**: 此时,User Story 1 AND User Story 2 都应该独立工作正常

---

## Phase 5: User Story 3 - 状态管理和数据流集成 (Priority: P1)

**Goal**: 集成状态管理方案(Zustand)管理 UI 状态,页面组件直接使用 @terence/core 的引擎管理业务状态,确保职责清晰分离

**Independent Test**: 创建一个示例 store 和页面组件,验证 UI 状态和业务状态分别正确管理,互不干扰

### Tests for User Story 3

- [ ] T032 [P] [US3] 创建 useUIStore 测试 apps/seed/src/stores/__tests__/useUIStore.test.js,验证状态管理和 actions
- [ ] T033 [P] [US3] 创建数据流测试 apps/seed/src/__tests__/dataFlow.test.jsx,验证 UI 状态不与 core 业务状态混合

### Implementation for User Story 3

- [ ] T034 [P] [US3] 创建 Modal 组件 apps/seed/src/components/Modal/index.jsx,使用 useUIStore 管理状态
- [ ] T035 [P] [US3] 创建 Drawer 组件 apps/seed/src/components/Drawer/index.jsx,使用 useUIStore 管理状态
- [ ] T036 [P] [US3] 创建示例页面 apps/seed/src/pages/StateExample/index.jsx,演示如何正确使用 Engine(如果有示例 Engine)
- [ ] T037 [US3] 在示例页面中实现 Engine 生命周期管理(创建、订阅、清理)
- [ ] T038 [US3] 验证状态更新能够正确触发 UI 渲染
- [ ] T039 [US3] 验证页面直接订阅 engine state 并调用 actions,不通过 zustand

**Checkpoint**: 所有用户故事现在应该独立功能正常

---

## Phase 6: User Story 4 - ESLint 和代码规范配置 (Priority: P2)

**Goal**: 配置 ESLint 规则和代码格式化工具,确保团队代码风格一致,能够检测架构边界违规

**Independent Test**: 运行 `pnpm lint`,验证所有现有代码通过检查,无错误和警告

### Tests for User Story 4

- [ ] T040 [P] [US4] 创建 ESLint 规则测试 apps/seed/src/__tests__/eslintRules.test.jsx,验证架构边界违规被检测
- [ ] T041 [P] [US4] 创建导入违规测试,验证 core 中的 UI 依赖被检测
- [ ] T042 [P] [US4] 创建直接调用测试,验证 UI 组件直接调用 engine.actions 被检测

### Implementation for User Story 4

- [ ] T043 [US4] 在 ESLint 配置中实现 core 包边界检测,禁止导入 antd、React、DOM API
- [ ] T044 [US4] 在 ESLint 配置中实现 ui 组件边界检测,禁止直接访问 engine 和路由
- [ ] T045 [US4] 配置代码格式化规则(prettier 或 eslint 格式化),确保团队代码风格一致
- [ ] T046 [US4] 添加 lint 脚本到 package.json,配置自动修复选项
- [ ] T047 [US4] 运行 lint 并验证所有代码通过检查
- [ ] T048 [US4] 验证 ESLint 能够检测并阻止架构边界违规

**Checkpoint**: User Stories 1-4 都应该独立工作正常

---

## Phase 7: User Story 5 - 测试环境配置 (Priority: P2)

**Goal**: 配置测试框架和测试工具,能够编写和运行单元测试、集成测试

**Independent Test**: 运行 `pnpm test`,验证 Vitest 测试运行器启动,所有测试通过

### Tests for User Story 5

- [ ] T049 [P] [US5] 创建测试环境测试 apps/seed/src/__tests__/testEnv.test.jsx,验证 Vitest 和 Testing Library 正确配置
- [ ] T050 [P] [US5] 创建覆盖率测试,验证测试覆盖率配置正确

### Implementation for User Story 5

- [ ] T051 [US5] 创建示例测试文件 apps/seed/src/components/__tests__/Header.test.jsx,演示组件测试
- [ ] T052 [US5] 创建示例测试文件 apps/seed/src/pages/__tests__/HomePage.test.jsx,演示页面测试
- [ ] T053 [US5] 配置测试覆盖率报告,生成 html 和 json 格式
- [ ] T054 [US5] 添加测试脚本到 package.json,配置 coverage 选项
- [ ] T055 [US5] 运行测试并验证核心功能测试覆盖率 >= 80%
- [ ] T056 [US5] 验证测试能够在 CI 环境中运行

**Checkpoint**: User Stories 1-5 都应该独立工作正常

---

## Phase 8: User Story 6 - 构建和部署配置 (Priority: P2)

**Goal**: 配置生产环境构建和优化,包括代码分割、压缩、资源优化

**Independent Test**: 运行 `pnpm build`,验证构建成功,生成优化的生产代码

### Tests for User Story 6

- [ ] T057 [P] [US6] 创建构建测试,验证构建产物包含优化的 JS 和 CSS 文件
- [ ] T058 [P] [US6] 创建预览测试,运行 pnpm preview 并验证应用功能正常

### Implementation for User Story 6

- [ ] T059 [US6] 配置 Vite 生产构建优化,包括代码分割(Redact vendor、Ant Design vendor)
- [ ] T060 [US6] 配置环境变量支持,区分开发和生产环境
- [ ] T061 [US6] 运行构建并验证在 30 秒内完成
- [ ] T062 [US6] 验证构建产物包含所有必需资源文件(HTML、CSS、JS、图片)
- [ ] T063 [US6] 运行 pnpm preview 并验证应用能够预览,功能正常

**Checkpoint**: User Stories 1-6 都应该独立工作正常

---

## Phase 9: Polish & 跨领域关注点

**Purpose**: 影响多个用户故事的改进

- [ ] T064 [P] 更新 README.md apps/seed/README.md,包含项目介绍、安装说明、开发指南
- [ ] T065 [P] 创建 .gitignore 文件 apps/seed/.gitignore,忽略 node_modules、dist、.env 等
- [ ] T066 [P] 添加环境变量示例文件 apps/seed/.env.example
- [ ] T067 代码清理和重构,移除未使用的导入和变量
- [ ] T068 运行完整的 lint 和 test 套件,验证所有检查通过
- [ ] T069 验证 quickstart.md 中的所有命令都能正常工作
- [ ] T070 验证所有成功标准(SC-001 到 SC-010)都已满足
- [ ] T071 [P] 创建 Git 提交,包含所有更改和描述性提交信息

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可以立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-8)**: 所有依赖 Foundational 阶段完成
  - User stories 可以并行进行(如果有人力)
  - 或按优先级顺序进行(P1 → P2 → P3)
- **Polish (Phase 9)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1 - 基础开发环境)**: Foundational 后可开始 - 无其他故事依赖
- **User Story 2 (P1 - 目录结构)**: Foundational 后可开始 - 无其他故事依赖
- **User Story 3 (P1 - 状态管理)**: Foundational 后可开始 - 可与 US1、US2 集成但应独立可测
- **User Story 4 (P2 - ESLint)**: Foundational 后可开始 - 验证所有之前的代码
- **User Story 5 (P2 - 测试环境)**: Foundational 后可开始 - 测试所有之前的功能
- **User Story 6 (P2 - 构建部署)**: Foundational 后可开始 - 构建所有之前的功能
- **User Story 7 (P3 - 示例页面)**: 已推迟到后续迭代

### Within Each User Story

- 测试必须先编写并在实现前失败
- 配置文件创建在功能实现之前
- 基础组件在复杂组件之前
- 故事完成后再进入下一个优先级

### Parallel Opportunities

- Setup 阶段所有标记 [P] 的任务可以并行运行
- Foundational 阶段所有标记 [P] 的任务可以并行运行(Phase 2 内)
- Foundational 完成后,所有用户故事可以并行开始(如果团队容量允许)
- 每个用户故事中所有标记 [P] 的测试可以并行运行
- 每个用户故事中所有标记 [P] 的实现任务可以并行运行
- 不同用户故事可以由不同团队成员并行工作

---

## Parallel Example: User Story 1

```bash
# 并行启动 User Story 1 的所有测试:
Task: "创建构建测试 apps/seed/src/__tests__/build.test.jsx"
Task: "创建主题测试 apps/seed/src/__tests__/theme.test.jsx"

# 并行启动 User Story 1 的所有实现任务:
Task: "更新 apps/seed/src/main.jsx"
Task: "更新 apps/seed/src/App.jsx"
Task: "更新 apps/seed/index.html"
```

---

## Parallel Example: User Story 2

```bash
# 并行启动所有目录结构任务:
Task: "创建示例页面组件 apps/seed/src/pages/HomePage/index.jsx"
Task: "创建示例项目级组件 apps/seed/src/components/Header/index.jsx"
Task: "创建示例工具函数 apps/seed/src/utils/formatUtils.js"
Task: "创建示例常量文件 apps/seed/src/constants/appConstants.js"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (CRITICAL - 阻塞所有故事)
3. 完成 Phase 3: User Story 1
4. **停止并验证**: 独立测试 User Story 1
5. 如果准备就绪,部署/演示

### Incremental Delivery (递增交付)

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 添加 User Story 4-6 → 独立测试 → 部署/演示
6. 每个故事都增加价值而不破坏之前的故事

### Parallel Team Strategy

有多个开发者时:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后:
   - Developer A: User Story 1 (基础开发环境)
   - Developer B: User Story 2 (目录结构)
   - Developer C: User Story 3 (状态管理)
3. 故事独立完成并集成
4. Developer D: User Story 4 (ESLint)
5. Developer E: User Story 5 (测试环境)
6. Developer F: User Story 6 (构建部署)

---

## Notes

- [P] 任务 = 不同文件,无依赖
- [Story] 标签将任务映射到特定用户故事以实现可追溯性
- 每个用户故事应该独立可完成和测试
- 实现前验证测试失败
- 每个任务或逻辑组后提交
- 在任何检查点停止以独立验证故事
- 避免: 模糊的任务、同一文件冲突、破坏独立性的跨故事依赖

---

## Summary

**Total Tasks**: 71
**Task Count by User Story**:
- User Story 1 (P1): 7 tasks
- User Story 2 (P1): 10 tasks
- User Story 3 (P1): 8 tasks
- User Story 4 (P2): 9 tasks
- User Story 5 (P2): 8 tasks
- User Story 6 (P2): 7 tasks
- Polish: 8 tasks
- Setup: 6 tasks
- Foundational: 8 tasks

**Parallel Opportunities**: 35 tasks marked [P] 可以并行执行

**Independent Test Criteria**:
- US1: `pnpm dev` 在 5 秒内启动,浏览器正常显示
- US2: 目录结构检查,文件命名验证
- US3: UI 状态和业务状态分离验证
- US4: `pnpm lint` 无错误和警告
- US5: `pnpm test` 所有测试通过,覆盖率 >= 80%
- US6: `pnpm build` 在 30 秒内完成,preview 正常

**Suggested MVP Scope**: User Stories 1-3 (P1 stories) - 提供完整的基础开发环境、项目结构和状态管理

**Format Validation**: ✅ ALL 71 tasks follow checklist format with checkbox, ID, and file paths
