---

description: "Task list for Architecture-Compliant Project Initialization"
---

# Tasks: Architecture-Compliant Project Initialization

**Input**: Design documents from `/specs/002-arch-compliant-init/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 本项目规格说明要求测试优先覆盖 core 包,因此包含 core 包的测试任务。

**Organization**: 任务按用户故事组织,每个用户故事可独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行运行(不同文件,无依赖)
- **[Story]**: 任务所属的用户故事(如 US1, US2, US3)
- 包含精确的文件路径

## Path Conventions

本项目采用 Monorepo 结构:
- Root: `/` (仓库根目录)
- Core 包: `packages/core/`
- UI 模板: `packages/ui/`
- CLI 工具: `packages/cli/`
- Seed 项目: `packages/examples/seed/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化和基础结构搭建

- [ ] T001 在根目录创建 pnpm-workspace.yaml 文件,定义 packages/* 和 packages/examples/* workspace
- [ ] T002 在根目录创建 package.json,配置 monorepo 根脚本(dev/build/test/lint)
- [ ] T003 [P] 在根目录创建 .eslintrc.js,配置全局 ESLint 基础规则
- [ ] T004 [P] 在根目录创建 jsconfig.json,启用 JSDoc 类型检查(checkJs: true)
- [ ] T005 [P] 在根目录创建 vite.config.ts,配置统一的构建配置
- [ ] T006 创建 packages/core/ 目录及子目录(engines/services/guards/adapters/utils/tests/)
- [ ] T007 创建 packages/ui/ 目录及子目录(components/adapters/hooks/shared/)
- [ ] T008 创建 packages/cli/ 目录及子目录(src/commands/src/utils/tests/)
- [ ] T009 创建 packages/examples/seed/ 目录及子目录(src/ui/src/pages/public/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 核心基础��施,必须在所有用户故事之前完成

**⚠️ CRITICAL**: 本阶段完成前,不能开始任何用户故事的实现

### 核心包基础设施

- [ ] T010 在 packages/core/ 创建 package.json,配置包名为 @terence/core,设置 type: module 和 exports
- [ ] T011 [P] 在 packages/core/ 创建 vite.config.js,配置 Vitest 测试环境(environment: 'node')
- [ ] T012 [P] 在 packages/core/ 创建 .eslintrc.core.js,配置 Core 包专用 ESLint 规则
- [ ] T013 [P] 在 packages/core/tests/ 创建 Vitest 配置和 setup 文件

### CLI 工具基础设施

- [ ] T014 在 packages/cli/ 创建 package.json,配置包名为 @terence/cli,添加 type: module 和 bin 字段
- [ ] T015 [P] 在 packages/cli/ 安装依赖(commander、inquirer、chalk、fs-extra)
- [ ] T016 [P] 在 packages/cli/src/ 创建 cli.js 入口文件,定义 terence 命令基础结构

### Seed 项目基础设施

- [ ] T017 在 packages/examples/seed/ 创建 package.json,配置包名为 @terence/seed
- [ ] T018 [P] 在 packages/examples/seed/ 安装依赖(React@19、Vite@7、Zustand、Tailwind CSS、antd@6)
- [ ] T019 [P] 在 packages/examples/seed/ 创建 vite.config.js,配置 React 插件和路径别名
- [ ] T020 [P] 在 packages/examples/seed/ 创建 tailwind.config.js,配置 Tailwind CSS
- [ ] T021 [P] 在 packages/examples/seed/ 创建 index.html 入口 HTML 文件

### 工程配置

- [ ] T022 [P] 在根目录 .eslintrc.js 添加架构边界检测规则(no-restricted-imports 禁止 core 导入 antd/react/DOM)
- [ ] T023 [P] 在根目录 .eslintrc.js 添加 overrides,为 core 包配置专门的 UI 依赖禁用规则
- [ ] T024 [P] 在根目录 .eslintrc.js 添加 overrides,为 ui view 文件配置禁止直接访问 engine 的规则

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 三层架构基础搭建 (Priority: P1) 🎯 MVP

**Goal**: 搭建符合 Terence 架构规范的 monorepo 项目结构,实现 core、ui、seed 三层严格分离和单向依赖

**Independent Test**: 验证目录结构、依赖方向和边界约束规则。检查 core 不依赖 UI,ui 不依赖 seed,ESLint 能检测边界违规

### Core 包基础实现

- [ ] T025 [P] [US1] 在 packages/core/utils/ 创建 invariant.js,实现断言工具函数
- [ ] T026 [P] [US1] 在 packages/core/utils/ 创建 index.js,导出 invariant 工具
- [ ] T027 [P] [US1] 在 packages/core/index.js 创建主入口文件,导出公共 API

### Core 包测试

- [ ] T028 [P] [US1] 在 packages/core/tests/utils/ 创建 invariant.test.js,测试断言工具功能
- [ ] T029 [US1] 在 packages/core/tests/ 运行测试,确保 utils 测试通过且覆盖率 > 80%

### 架构验证

- [ ] T030 [US1] 在根目录运行 pnpm install,验证所有 workspace 依赖正确解析
- [ ] T031 [US1] 检查 packages/core/package.json,确保无 antd、react、DOM 等 UI 依赖
- [ ] T032 [US1] 在 packages/core/ 创建测试文件导入 antd,运行 ESLint 验证能检测并报错
- [ ] T033 [US1] 运行 pnpm lint,验证 ESLint 架构边界检测规则生效

**Checkpoint**: 此时三层架构基础就绪,目录结构和依赖约束符合架构规范

---

## Phase 4: User Story 2 - Core 包的 Engine-Guard-Service 架构实现 (Priority: P1)

**Goal**: 在 core 包中建立完整的 Engine-Guard-Service 架构,确保业务逻辑的唯一真理源

**Independent Test**: 创建 OrderEngine 示例,验证其 state、actions、guard 的正确性和独立性

### OrderEngine 实现

- [ ] T034 [P] [US2] 在 packages/core/engines/ 创建 order.js,实现 createOrderEngine 函数
- [ ] T035 [P] [US2] 在 packages/core/engines/order.js 定义 OrderState JSDoc 类型(items/status/canSubmit/totalAmount/error/orderId)
- [ ] T036 [P] [US2] 在 packages/core/engines/order.js 实现 Engine 内部状态(只读导出 getter)
- [ ] T037 [P] [US2] 在 packages/core/engines/order.js 实现 actions(addItem/removeItem/updateQty/submit/reset)
- [ ] T038 [P] [US2] 在 packages/core/engines/order.js 实现 subscribe 方法,支持状态变化监听
- [ ] T039 [US2] 在 packages/core/engines/order.js 添加完整 JSDoc 注释(@param/@returns/@typedef)

### Guard 实现

- [ ] T040 [P] [US2] 在 packages/core/guards/ 创建 orderGuard.js,实现 assertCanSubmit 函数
- [ ] T041 [P] [US2] 在 packages/core/guards/orderGuard.js 实现 assertValidItem 函数,校验订单项合法性
- [ ] T042 [P] [US2] 在 packages/core/guards/ 创建 index.js,导出所有 guard 函数

### Service 实现

- [ ] T043 [P] [US2] 在 packages/core/services/ 创建 pricing.js,实现 calculateTotal 函数
- [ ] T044 [P] [US2] 在 packages/core/services/pricing.js 实现 calculateDiscount 函数
- [ ] T045 [P] [US2] 在 packages/core/services/ 创建 index.js,导出所有 service 函数

### 导出和集成

- [ ] T046 [US2] 在 packages/core/engines/ 创建 index.js,导出 createOrderEngine
- [ ] T047 [US2] 在 packages/core/index.js 导出 createOrderEngine、所有 guards、所有 services
- [ ] T048 [US2] 在 packages/core/ 创建 types.js,定义所有 JSDoc typedef(OrderState/OrderItem/OrderEngine)

### Core 包测试

- [ ] T049 [P] [US2] 在 packages/core/tests/engines/ 创建 order.test.js,测试 OrderEngine 初始化状态
- [ ] T050 [P] [US2] 在 packages/core/tests/engines/order.test.js 测试 addItem/removeItem/updateQty actions
- [ ] T051 [P] [US2] 在 packages/core/tests/engines/order.test.js 测试 submit action 的成功和失败场景
- [ ] T052 [P] [US2] 在 packages/core/tests/engines/order.test.js 测试 subscribe 方法的状态通知机制
- [ ] T053 [P] [US2] 在 packages/core/tests/guards/ 创建 orderGuard.test.js,测试 assertCanSubmit 校验逻辑
- [ ] T054 [P] [US2] 在 packages/core/tests/guards/orderGuard.test.js 测试 assertValidItem 校验逻辑
- [ ] T055 [P] [US2] 在 packages/core/tests/services/ 创建 pricing.test.js,测试 calculateTotal 函数
- [ ] T056 [P] [US2] 在 packages/core/tests/services/pricing.test.js 测试 calculateDiscount 函数
- [ ] T057 [US2] 在 packages/core/ 运行 pnpm test,确保所有测试通过且覆盖率 > 80%
- [ ] T058 [US2] 在 IDE 中验证 packages/core/index.js 导出的 API 有完整的 JSDoc 类型提示

**Checkpoint**: 此时 Core 包的 Engine-Guard-Service 架构完整实现,可作为业务逻辑的唯一真理源

---

## Phase 5: User Story 3 - CLI 源码交付工具实现 (Priority: P1)

**Goal**: 开发 CLI 工具管理 UI 组件的源码交付生命周期,实现"源码交付优于黑盒依赖"

**Independent Test**: 执行 CLI 命令并验证生成的文件结构。检查 init、add、list、upgrade 命令的正确性

### CLI 工具核心

- [ ] T059 [P] [US3] 在 packages/cli/src/utils/ 创建 logger.js,封装 chalk 实现彩色日志输出
- [ ] T060 [P] [US3] 在 packages/cli/src/utils/ 创建 config.js,实现 readUiConfig 和 writeUiConfig 函数
- [ ] T061 [P] [US3] 在 packages/cli/src/utils/config.js 添加 validateSchema 函数,验证 ui.config.json 格式
- [ ] T062 [P] [US3] 在 packages/cli/src/utils/ 创建 template.js,实现 copyComponent 递归拷贝函数
- [ ] T063 [P] [US3] 在 packages/cli/src/utils/template.js 实现检查源模板是否存在和目标目录是否已存在
- [ ] T064 [P] [US3] 在 packages/cli/src/utils/ 创建 diff.js,实现 generateDiff 函数(用于 upgrade 命令)

### init 命令

- [ ] T065 [P] [US3] 在 packages/cli/src/commands/ 创建 init.js,实现 init 命令
- [ ] T066 [US3] 在 packages/cli/src/commands/init.js 检查是否是有效项目(package.json 存在)
- [ ] T067 [US3] 在 packages/cli/src/commands/init.js 检查是否已初始化,如果已初始化且未指定 --force 则提示用户确认
- [ ] T068 [US3] 在 packages/cli/src/commands/init.js 创建 ui.config.json 文件(包含 version/uiDir/components 字段)
- [ ] T069 [US3] 在 packages/cli/src/commands/init.js 创建 ui/ 目录和 .gitkeep 文件

### add 命令

- [ ] T070 [P] [US3] 在 packages/cli/src/commands/ 创建 add.js,实现 add 命令
- [ ] T071 [US3] 在 packages/cli/src/commands/add.js 检查项目是否已初始化(ui.config.json 存在)
- [ ] T072 [US3] 在 packages/cli/src/commands/add.js 检查组件模板是否存在(ui/components/<ComponentName>/)
- [ ] T073 [US3] 在 packages/cli/src/commands/add.js 读取组件的 meta.json,检查 core 版本兼容性
- [ ] T074 [US3] 在 packages/cli/src/commands/add.js 调用 template.js 的 copyComponent 函数拷贝组件源码
- [ ] T075 [US3] 在 packages/cli/src/commands/add.js 更新 ui.config.json,添加组件到 components 字段

### list 命令

- [ ] T076 [P] [US3] 在 packages/cli/src/commands/ 创建 list.js,实现 list 命令
- [ ] T077 [US3] 在 packages/cli/src/commands/list.js 读取 ui.config.json,获取已引入的组件列表
- [ ] T078 [US3] 在 packages/cli/src/commands/list.js 以表格形式输出组件名称、版本、core 依赖
- [ ] T079 [US3] 在 packages/cli/src/commands/list.js 实现 --json 选项,支持 JSON 格式输出

### upgrade 命令

- [ ] T080 [P] [US3] 在 packages/cli/src/commands/ 创建 upgrade.js,实现 upgrade 命令
- [ ] T081 [US3] 在 packages/cli/src/commands/upgrade.js 对比当前组件和模板的 meta.json 版本
- [ ] T082 [US3] 在 packages/cli/src/commands/upgrade.js 调用 diff.js 生成变更报告(added/modified/deleted/conflicts)
- [ ] T083 [US3] 在 packages/cli/src/commands/upgrade.js 实现 --dry-run 选项,仅预览不实际修改
- [ ] T084 [US3] 在 packages/cli/src/commands/upgrade.js 检测本地修改(通过 git diff 或文件 hash)

### CLI 集成和测试

- [ ] T085 [US3] 在 packages/cli/src/ 更新 cli.js,注册 init/add/list/upgrade 命令
- [ ] T086 [P] [US3] 在 packages/cli/tests/commands/ 创建 init.test.js,测试 init 命令的文件创建逻辑
- [ ] T087 [P] [US3] 在 packages/cli/tests/commands/ 创建 add.test.js,测试 add 命令的组件拷贝逻辑
- [ ] T088 [P] [US3] 在 packages/cli/tests/commands/ 测试 add 命令的错误处理(组件不存在/版本不匹配/已存在)
- [ ] T089 [P] [US3] 在 packages/cli/tests/commands/ 创建 list.test.js,测试 list 命令的输出格式
- [ ] T090 [US3] 在 packages/cli/ 运行 pnpm test,确保所有 CLI 测试通过
- [ ] T091 [US3] 手动测试 CLI 工具:运行 terence init/add/list 命令,验证输出和文件生成正确

**Checkpoint**: 此时 CLI 工具可管理 UI 组件的完整生命周期,实现源码交付模式

---

## Phase 6: User Story 4 - UI 层的 Adapter-View 分离实现 (Priority: P2)

**Goal**: 创建符合"Adapter 是唯一接缝点"规范的 UI 组件模板,确保 UI 不直接操作业务状态

**Independent Test**: 生成 OrderForm 示例组件并检查其文件职责,验证 View 只渲染、Adapter 只对接、无业务逻辑泄露

### UI 组件模板 - OrderForm

- [ ] T092 [P] [US4] 在 packages/ui/components/ 创建 OrderForm/ 目录
- [ ] T093 [P] [US4] 在 packages/ui/components/OrderForm/ 创建 OrderForm.view.jsx,实现纯 UI 视图组件
- [ ] T094 [P] [US4] 在 OrderForm.view.jsx 使用 antd 组件(Table/InputNumber/Button),渲染订单表单
- [ ] T095 [P] [US4] 在 OrderForm.view.jsx 确保只通过 adapter 传入的 state 和 actions 与 core 交互
- [ ] T096 [P] [US4] 在 packages/ui/components/OrderForm/ 创建 OrderForm.adapter.js,实现 useOrderFormAdapter hook
- [ ] T097 [P] [US4] 在 OrderForm.adapter.js 使用 useEffect + engine.subscribe 订阅状态变化
- [ ] T098 [P] [US4] 在 OrderForm.adapter.js 包装 engine.actions,添加错误处理和 UI 状态管理
- [ ] T099 [P] [US4] 在 packages/ui/components/OrderForm/ 创建 OrderForm.logic.js,实现 UI 内部状态管理(可选)
- [ ] T100 [P] [US4] 在 packages/ui/components/OrderForm/ 创建 meta.json,记录组件版本和 core 依赖
- [ ] T101 [P] [US4] 在 OrderForm.meta.json 定义 name/version/core.engine/core.minVersion/ui.dependencies 字段
- [ ] T102 [US4] 在 packages/ui/components/OrderForm/ 创建 index.js,导出 OrderFormView、useOrderFormAdapter、默认组件

### UI 组件验证

- [ ] T103 [US4] 检查 OrderForm.view.jsx,确保不直接导入 @terence/core/engines/* 或 @terence/core/services/*
- [ ] T104 [US4] 检查 OrderForm.view.jsx,确保所有判断基于 adapter 传入的 state,无业务 if/else
- [ ] T105 [US4] 检查 OrderForm.adapter.js,确保只调用 engine.actions,不包含业务规则判断
- [ ] T106 [US4] 检查 OrderForm.adapter.js,确保订阅 engine.state 并转换为 view 可消费的格式
- [ ] T107 [US4] 运行 ESLint,确保 view 文件不违反架构边界规则

**Checkpoint**: 此时 UI 组件模板符合 Adapter-View 分离规范,可作为标准模板使用

---

## Phase 7: User Story 5 - JavaScript 工程约束配置 (Priority: P2)

**Goal**: 配置 ESLint、JSDoc、测试等工程工具,确保 JavaScript 技术栈下有清晰的边界与约束

**Independent Test**: 运行 lint、测试和构建命令,验证边界检测、JSDoc 提示和 core 测试覆盖率

### ESLint 架构边界规则

- [ ] T108 [P] [US5] 在根目录 .eslintrc.js 的 core 包 overrides 中配置 no-restricted-imports
- [ ] T109 [P] [US5] 在 .eslintrc.js 禁止 core 导入 antd、react、react-dom、@react、../ui、../seed
- [ ] T110 [P] [US5] 在 .eslintrc.js 禁止 core 包使用 JSX(no-restricted-syntax: JSXElement)
- [ ] T111 [P] [US5] 在 .eslintrc.js 的 ui view overrides 中配置禁止直接导入 core engines/services
- [ ] T112 [US5] 在 .eslintrc.js 添加清晰的错误消息,引用宪章中的具体原则

### JSDoc 类型检查

- [ ] T113 [P] [US5] 在根目录 jsconfig.json 中配置 checkJs: true、strict: true
- [ ] T114 [P] [US5] 在 jsconfig.json 中配置 baseUrl 和 paths,支持 @terence/core 别名
- [ ] T115 [US5] 在 packages/core/index.js 中为所有导出添加完整的 JSDoc 注释
- [ ] T116 [US5] 在 packages/core/engines/order.js 中为 createOrderEngine 添加完整的 JSDoc(@param/@returns)
- [ ] T117 [US5] 在 packages/core/engines/order.js 中定义 OrderState 和 OrderItem 的 @typedef
- [ ] T118 [US5] 在 IDE 中验证 core 包的 API 有完整的类型提示和自动补全

### Vitest 测试配置

- [ ] T119 [P] [US5] 在根目录 vite.config.ts 中配置 Vitest(globals: true、environment: node)
- [ ] T120 [P] [US5] 在 packages/core/vite.config.js 中配置测试覆盖率目标(statements/branches/functions/lines: 80)
- [ ] T121 [US5] 在 packages/core/vite.config.js 中配置 coverage provider 为 v8
- [ ] T122 [US5] 在根目录 package.json 中添加 test 脚本,运行 pnpm -r test
- [ ] T123 [US5] 在 packages/core/ 运行 pnpm test,确保测试在 30 秒内完成
- [ ] T124 [US5] 在 packages/core/ 检查测试覆盖率报告,确保覆盖所有 engines/services/guards

### 构建配置

- [ ] T125 [P] [US5] 在根目录 vite.config.ts 中配置所有包的独立构建
- [ ] T126 [US5] 在 packages/core/package.json 中添加 build 脚本
- [ ] T127 [US5] 在 packages/core/ 运行 pnpm build,确保生成包含 JSDoc 的 npm 包
- [ ] T128 [US5] 验证构建时间在 2 分钟以内

### 工程验证

- [ ] T129 [US5] 在 packages/core/engines/order.js 中创建测试文件,故意导入 antd,运行 ESLint 验证报错
- [ ] T130 [US5] 在 packages/ui/components/OrderForm.view.jsx 中创建测试代码,故意直接访问 engine,运行 ESLint 验证报错
- [ ] T131 [US5] 运行 pnpm lint,验证所有包的 ESLint 检查通过(除故意违规的测试代码)
- [ ] T132 [US5] 删除测试代码,运行 pnpm lint 确保无错误

**Checkpoint**: 此时工程约束完整配置,ESLint/JSDoc/测试/构建全部就绪

---

## Phase 8: User Story 6 - 示例业务场景验证 (Priority: P3)

**Goal**: 创建完整的订单管理示例,验证三层架构在实际业务中的正确性和可用性

**Independent Test**: 运行示例应用并执行完整的业务流程,验证数据流、状态流转和错误处理

### Seed 项目 - 主应用

- [ ] T133 [P] [US6] 在 packages/examples/seed/src/ 创建 main.jsx,React 应用入口
- [ ] T134 [P] [US6] 在 packages/examples/seed/src/ 创建 App.jsx,主应用组件
- [ ] T135 [P] [US6] 在 App.jsx 中使用 createOrderEngine 创建 engine 实例
- [ ] T136 [P] [US6] 在 App.jsx 中为 engine 注入 mock 的 submitOrder API(模拟后端调用)
- [ ] T137 [P] [US6] 在 packages/examples/seed/src/pages/ 创建 OrderPage.jsx,订单管理页面
- [ ] T138 [P] [US6] 在 OrderPage.jsx 中导入并使用 OrderForm 组件,传入 engine 实例
- [ ] T139 [P] [US6] 在 OrderPage.jsx 中显示 engine.state 的实时状态(items/status/totalAmount)
- [ ] T140 [P] [US6] 在 OrderPage.jsx 中处理错误状态(state.error),显示错误提示
- [ ] T141 [P] [US6] 在 packages/examples/seed/ 添加"添加商品"、"提交订单"等交互按钮

### UI 组件集成

- [ ] T142 [P] [US6] 在 packages/examples/seed/src/ui/ 创建 OrderForm/ 目录
- [ ] T143 [P] [US6] 运行 terence add OrderForm,从 ui 模板拷贝 OrderForm 组件到 seed/ui/
- [ ] T144 [P] [US6] 验证生成的 OrderForm 组件包含 .view.jsx、.adapter.js、.logic.js、meta.json、index.js
- [ ] T145 [P] [US6] 检查生成的 ui.config.json,确认 OrderForm 组件已记录
- [ ] T146 [US6] 在 OrderPage.jsx 中导入 OrderForm 组件,验证组件可正常使用

### Seed 项目配置

- [ ] T147 [P] [US6] 在 packages/examples/seed/package.json 的 dependencies 中添加 @terence/core: workspace:*
- [ ] T148 [P] [US6] 在 packages/examples/seed/vite.config.js 中配置 @terence/core 路径别名
- [ ] T149 [P] [US6] 在 packages/examples/seed/index.html 中配置 #root 元素
- [ ] T150 [US6] 在 packages/examples/seed/src/ 添加样式文件(Tailwind CSS 或内联样式)

### 端到端测试

- [ ] T151 [US6] 在 packages/examples/seed/ 运行 pnpm dev,启动开发服务器
- [ ] T152 [US6] 访问 http://localhost:3000,验证应用正常启动并显示订单管理界面
- [ ] T153 [US6] 在应用中点击"添加商品",验证 engine.state 更新,UI 正确反映变化
- [ ] T154 [US6] 在应用中添加订单项,验证 core engine 的 state.items 正确添加
- [ ] T155 [US6] 在应用中点击"提交订单",验证 core guard 校验通过
- [ ] T156 [US6] 验证提交成功后,engine.state.status 变为 completed,UI 显示订单 ID
- [ ] T157 [US6] 在应用中模拟 API 失败场景,验证 core 捕获异常,state.status 变为 failed
- [ ] T158 [US6] 验证 UI 显示错误提示,用户可重新编辑订单
- [ ] T159 [US6] 检查 packages/examples/seed/ 的导入关系,验证严格遵循 seed→ui→core 单向依赖

### Seed 项目文档

- [ ] T160 [P] [US6] 在 packages/examples/seed/ 创建 README.md,说明如何运行和使用示例应用
- [ ] T161 [US6] 在 README.md 中添加订单管理功能的截图或演示说明

**Checkpoint**: 此时示例应用完整验证了三层架构,可作为其他项目的参考模板

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的改进和收尾工作

### 文档更新

- [ ] T162 [P] 在根目录 README.md 中添加 Terence 项目介绍和快速开始链接
- [ ] T163 [P] 在根目录 README.md 中添加架构概览和核心原则说明
- [ ] T164 [P] 更新 docs/architecture/ 目录下的文档,确保与实现一致
- [ ] T165 [P] 在 packages/core/README.md 中添加 core 包使用说明和 API 文档
- [ ] T166 [P] 在 packages/cli/README.md 中添加 CLI 工具使用说明
- [ ] T167 [P] 在 packages/ui/README.md 中添加 UI 组件模板说明

### 代码清理和优化

- [ ] T168 [P] 运行 pnpm lint,修复所有 lint 警告
- [ ] T169 [P] 运行 pnpm test,确保所有测试通过
- [ ] T170 [P] 运行 pnpm build,确保所有包构建成功
- [ ] T171 优化 core 包的测试覆盖率,确保 > 80%
- [ ] T172 优化 CLI 工具的错误消息,确保用户友好

### 最终验证

- [ ] T173 验证 quickstart.md 中的所有步骤可执行
- [ ] T174 运行完整的端到端测试,验证所有用户故事可独立工作
- [ ] T175 检查所有包的依赖关系,确保无循环依赖
- [ ] T176 运行 ESLint,验证所有架构边界违规可被检测
- [ ] T177 验证 core 包可成功发布到 npm(模拟发布)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-8)**: 全部依赖 Foundational 完成
  - 用户故事可并行推进(如果有多人)
  - 或按优先级顺序(P1 → P2 → P3)逐个完成
- **Polish (Phase 9)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 无其他用户故事依赖
- **User Story 2 (P1)**: Foundational 完成后可开始 - 无其他用户故事依赖
- **User Story 3 (P1)**: Foundational 完成后可开始 - 无其他用户故事依赖
- **User Story 4 (P2)**: Foundational 完成后可开始 - 可独立测试,不依赖其他故事
- **User Story 5 (P2)**: Foundational 完成后可开始 - 可独立配置,不依赖其他故事
- **User Story 6 (P3)**: 依赖 User Story 2(有 core)和 User Story 4(有 UI 模板)完成

### Within Each User Story

- Core 测试: 必须在 Core 实现之后
- CLI 测试: 必须在 CLI 实现之后
- UI 组件: 必须在 Core 包完成之后
- Seed 应用: 必须在 Core 包和 UI 模板完成之后
- 故事完成前验证独立测试标准

---

## Parallel Opportunities

### Phase 1 (Setup)

```bash
# 可并行执行的任务:
T003: 配置全局 ESLint
T004: 配置 jsconfig.json
T005: 配置 vite.config.ts
```

### Phase 2 (Foundational)

```bash
# 可并行执行的任务:
T011: Core 包 Vitest 配置
T012: Core 包专用 ESLint 配置
T013: Core 包测试 setup
T015: CLI 依赖安装
T016: CLI 入口文件
T018: Seed 项目依赖安装
T019: Seed 项目 Vite 配置
T020: Seed 项目 Tailwind 配置
T021: Seed 项目 HTML 入口
```

### Phase 3 (User Story 1)

```bash
# 可并行执行的任务:
T025: 创建 invariant.js
T026: 创建 utils/index.js
T027: 创建 core 主入口
```

### Phase 4 (User Story 2)

```bash
# 可并行执行的任务:
T034-T038: OrderEngine 各部分实现
T040-T042: Guard 各部分实现
T043-T045: Service 各部分实现
T049-T057: 所有测试文件创建
```

### Phase 5 (User Story 3)

```bash
# 可并行执行的任务:
T059-T064: CLI 工具核心各部分
T065-T069: init 命令各部分
T070-T075: add 命令各部分
T076-T079: list 命令各部分
T080-T084: upgrade 命令各部分
T086-T090: 所有测试文件
```

### Phase 6 (User Story 4)

```bash
# 可并行执行的任务:
T092-T101: UI 组件所有文件
```

### Phase 8 (User Story 6)

```bash
# 可并行执行的任务:
T133-T141: Seed 应用所有文件
T147-T150: Seed 项目配置所有文件
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (CRITICAL - 阻塞所有故事)
3. 完成 Phase 3: User Story 1 (三层架构基础)
4. 完成 Phase 4: User Story 2 (Core 包架构)
5. 完成 Phase 5: User Story 3 (CLI 工具)
6. **STOP and VALIDATE**: 验证三层架构、Core 包、CLI 工具独立工作
7. 如果 MVP 满足需求,可暂停或继续 P2 故事

### Incremental Delivery (按优先级逐步交付)

1. 完成 Setup + Foundational → 基础设施就绪
2. 完成 User Story 1 (P1) → 独立测试 → 验证架构基础
3. 完成 User Story 2 (P1) → 独立测试 → 验证 Core 包可用性
4. 完成 User Story 3 (P1) → 独立测试 → 验证 CLI 工具可用性
5. 完成 User Story 4 (P2) → 独立测试 → 验证 UI 模板可用性
6. 完成 User Story 5 (P2) → 独立测试 → 验证工程约束完整
7. 完成 User Story 6 (P3) → 独立测试 → 验证端到端流程
8. 每个 P1/P2/P3 故事都添加价值,不破坏之前的故事

### Parallel Team Strategy (多人协作)

如果有多个开发者:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后,并行开始:
   - 开发者 A: User Story 2 (Core 包)
   - 开发者 B: User Story 3 (CLI 工具)
   - 开发者 C: User Story 4 (UI 模板)
3. Story 2/3/4 完成后:
   - 开发者 A: User Story 5 (工程配置)
   - 开发者 B: User Story 6 (示例应用)
4. 故事独立完成和集成,互不阻塞

---

## Notes

- **[P]** 任务 = 不同文件,无依赖,可并行
- **[Story]** 标签 = 任务映射到特定用户故事,便于追溯
- 每个用户故事应独立可完成和测试
- Core 测试优先,必须覆盖所有 engines/services/guards
- 验证架构边界违规使用 ESLint,不依赖人工审查
- 提交每个任务或逻辑组
- 在任何检查点停止以独立验证故事
- 避免: 模糊任务、同一文件冲突、破坏独立性的跨故事依赖
