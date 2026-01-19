# Feature Specification: 优化 Seed 项目组件引入方式

**Feature Branch**: `003-optimize-seed-imports`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "考虑到 seed 和组件库在同一个仓库，每次引入组件都会增长不必要的代码增长。因此，修改 seed 引入组件库的方式为直接通过 import 的方式引入业务组件，即 packages/core 和 packages/ui 暴露的内容。其他仓库的项目消费组件的方式保持不变。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 通过 Import 方式直接引入组件 (Priority: P1)

作为开发者,我希望在 seed 项目中能够直接通过 import 语句引入 @terence/core 和 @terence/ui 包暴露的组件和功能,而不是复制源码文件,以减少代码冗余并简化维护。

**Why this priority**: 这是核心需求,解决了当前 seed 项目中代码重复增长的问题,通过直接使用 monorepo 的 workspace 依赖,可以让 seed 项目自动使用最新的组件库代码,无需手动复制和同步。

**Independent Test**: 可以通过修改 seed 项目的导入语句,从本地的 `./ui/OrderForm` 改为 `@terence/ui`,然后验证项目能够正常构建和运行。

**Acceptance Scenarios**:

1. **Given** seed 项目当前使用本地复制的 UI 组件,**When** 将导入语句改为从 `@terence/ui` 导入,**Then** 项目能够成功编译且没有错误
2. **Given** seed 项目需要使用 Core 引擎,**When** 通过 `import { createOrderEngine } from '@terence/core'` 导入,**Then** 引擎能够正常工作且所有测试通过
3. **Given** 开发者修改了 packages/ui 中的组件代码,**When** 在 seed 项目中使用该组件,**Then** seed 项目自动使用最新版本而无需手动更新

---

### User Story 2 - 清理冗余的本地组件副本 (Priority: P2)

作为开发者,我希望删除 seed 项目中复制的 UI 组件源码,因为现在直接从 @terence/ui 导入,以保持项目结构清晰。

**Why this priority**: 这是一个清理任务,在功能实现后执行,确保没有遗留的冗余代码。

**Independent Test**: 删除 apps/seed/src/ui 目录后,验证项目仍然能够正常运行。

**Acceptance Scenarios**:

1. **Given** seed 项目已经改为通过 import 引入组件,**When** 删除 apps/seed/src/ui 目录,**Then** 项目构建成功且所有功能正常
2. **Given** 其他项目可能使用 CLI 工具,**When** CLI 工具生成组件时,**Then** 仍然保持源码复制的方式(不改变)

---

### User Story 3 - 保持外部项目的消费方式不变 (Priority: P3)

作为外部项目的使用者,我希望通过 CLI 工具引入 Terence 组件时,仍然采用源码复制的方式,以确保我的项目可以自由修改组件代码。

**Why this priority**: 这是向后兼容性需求,确保不影响外部用户的使用方式。由于用户明确说明"其他仓库的项目消费组件的方式保持不变",因此优先级较低但需要明确。

**Independent Test**: 在一个外部项目中使用 CLI 工具添加组件,验证组件以源码形式复制到项目中。

**Acceptance Scenarios**:

1. **Given** 外部项目需要使用 Terence 组件,**When** 使用 CLI 工具(如 `terence add OrderForm`),**Then** 组件源码被复制到项目中(而非通过 npm 依赖)
2. **Given** 外部项目通过 import 引入复制的组件,**When** 修改组件代码,**Then** 修改只影响该项目,不影响其他项目

---

### Edge Cases

- 当 packages/ui 或 packages/core 的导出 API 发生变化时,如何确保 seed 项目不会出现运行时错误?
- 如果 seed 项目需要修改组件的某些行为(比如样式或逻辑),应该如何处理?(可能需要 Fork 或继承)
- 当 packages/ui 和 packages/core 的版本更新时,如何确保 seed 项目的兼容性?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: seed 项目 MUST 能够通过 `@terence/core` 包名直接导入所有 Core 层的引擎、服务、守卫和工具函数
- **FR-002**: seed 项目 MUST 能够通过 `@terence/ui` 包名直接导入所有 UI 层的组件、适配器、钩子和共享工具
- **FR-003**: seed 项目中的 import 语句 MUST 引用 workspace 依赖而非本地文件(例如使用 `@terence/ui/components/OrderForm` 而非 `./ui/OrderForm`)
- **FR-004**: packages/ui 包 MUST 通过其 index.js 文件正确导出所有可用的 UI 组件(目前 components/index.js 是空的,需要补充 OrderForm 等组件的导出)
- **FR-005**: packages/core 包 MUST 通过其 index.js 文件正确导出所有引擎和服务(目前已实现)
- **FR-006**: 删除 seed 项目中的 apps/seed/src/ui 目录及其所有内容,因为这些组件现在通过 @terence/ui 导入
- **FR-007**: 更新 seed 项目中所有引用本地 UI 组件的代码,改为从 @terence/ui 导入
- **FR-008**: 外部项目的 CLI 工具行为 MUST 保持不变,仍然采用源码复制的方式引入组件

### Key Entities

- **@terence/core Package**: 业务逻辑包,包含 engines、services、guards、adapters、utils 等模块,通过 src/index.js 导出
- **@terence/ui Package**: UI 组件包,包含 components、adapters、hooks、shared 等模块,通过 src/index.js 导出
- **seed Project**: 示例应用,位于 apps/seed,用于演示 Terence 三层架构
- **UI Component Directory**: apps/seed/src/ui,当前包含复制的 OrderForm 组件源码,将被删除
- **Workspace Dependencies**: pnpm workspace 特性,允许通过包名引用本地包(@terence/core, @terence/ui)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: seed 项目代码量减少至少 30%(通过删除复制的 UI 组件源码)
- **SC-001**: seed 项目中所有组件导入语句 100% 使用 @terence/ui 和 @terence/core 包名
- **SC-003**: 删除 apps/seed/src/ui 目录后,seed 项目构建时间为 0 秒(即没有构建错误或警告)
- **SC-004**: packages/ui 包的导出覆盖率 100%(所有组件都通过 index.js 正确导出)
- **SC-005**: 开发者修改 packages/ui 中的组件后,seed 项目在重新构建时自动使用最新版本,无需任何手动操作
- **SC-006**: 外部项目使用 CLI 工具引入组件的方式 100% 保持不变(通过回归测试验证)

## Assumptions

1. **Monorepo Workspace 假设**: seed 项目和 packages/core、packages/ui 在同一个 pnpm workspace 中,可以通过包名直接引用
2. **构建工具假设**: Vite 的路径别名配置已经正确设置,能够解析 @terence/core 和 @terence/ui 包名
3. **导出完整性假设**: packages/ui 和 packages/core 的 index.js 文件会导出所有公开的 API
4. **向后兼容假设**: CLI 工具的源码复制机制不会被改变,只影响 seed 项目的导入方式
5. **开发模式假设**: seed 项目主要用于演示和开发,不需要对组件进行定制化修改(如果需要,应该在 packages/ui 中修改)

## Dependencies

- 依赖于 pnpm workspace 的正常工作
- 依赖于 Vite 配置中的路径别名解析
- 依赖于 packages/ui 和 packages/core 的正确导出配置
- 不影响 CLI 工具的实现和行为
