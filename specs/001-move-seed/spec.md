# Feature Specification: 移动 @terence/seed 到 apps/seed

**Feature Branch**: `001-move-seed`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "我需要将子包 @terence/seed 移动到路径 apps/seed 下"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 重构项目结构以提升可维护性 (Priority: P1)

开发团队需要将示例应用 @terence/seed 从 `packages/examples/seed` 移动到 `apps/seed` 目录,以更好地反映其在项目中的角色,并符合 monorepo 的最佳实践,将可部署的应用与库代码分开管理。

**Why this priority**: 这是核心需求,直接影响项目结构的清晰度和可维护性。将应用代码与库代码分离是业界标准实践,有助于新开发者理解项目结构。

**Independent Test**: 可以通过验证新位置 `apps/seed` 是否包含所有原有文件和功能来独立测试,同时确保所有依赖关系和引用仍然正常工作。

**Acceptance Scenarios**:

1. **Given** @terence/seed 当前位于 `packages/examples/seed`, **When** 移动操作完成, **Then** 所有代码文件应位于 `apps/seed` 目录
2. **Given** 移动完成, **When** 开发者运行开发服务器, **Then** 应用应能正常启动和运行
3. **Given** 移动完成, **When** 其他包引用 @terence/seed, **Then** 引用应继续正常工作
4. **Given** 移动完成, **When** 开发者运行构建命令, **Then** 构建应成功完成

---

### User Story 2 - 更新项目配置和文档 (Priority: P2)

更新所有相关的项目配置文件和文档,以反映新的目录结构,确保团队成员和工具能够正确识别和使用新的位置。

**Why this priority**: 配置和文档的更新是确保项目持续可用的关键,但可以在文件移动完成后再进行。

**Independent Test**: 可以通过检查所有配置文件中的路径引用是否更新来独立测试,并验证文档中的说明是否准确。

**Acceptance Scenarios**:

1. **Given** 文件已移动到新位置, **When** 检查 workspace 配置, **Then** 应包含 `apps/*` 路径
2. **Given** 配置已更新, **When** 开发者运行包管理命令, **Then** 命令应正确识别 apps/seed
3. **Given** 配置已更新, **When** 查看项目文档, **Then** 文档应准确反映新的目录结构

---

### Edge Cases

- 如果目标路径 `apps/seed` 已经存在文件或目录,系统应如何处理?
- 如果其他包或文档中有硬编码的 `packages/examples/seed` 路径引用,这些引用应该如何更新?
- 移动过程中如果出现错误(如文件权限问题、磁盘空间不足),应如何处理?
- 版本控制系统中,移动操作应保留文件的 Git 历史记录

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须将 `packages/examples/seed` 目录下的所有文件和子目录移动到 `apps/seed` 目录
- **FR-002**: 系统必须在 `apps` 目录不存在时创建该目录
- **FR-003**: 系统必须更新 workspace 配置文件(如 pnpm-workspace.yaml)以包含 `apps/*` 路径
- **FR-004**: 系统必须保持 @terence/seed 的包名和版本号不变
- **FR-005**: 系统必须保留所有文件的版本控制历史记录(Git history)
- **FR-006**: 系统必须更新根 package.json 中引用旧路径的脚本命令(如果有)
- **FR-007**: 系统必须确保移动后应用仍能正常构建和运行
- **FR-008**: 系统必须更新项目文档(如 README、架构文档)中对 seed 包路径的引用

### Key Entities

- **@terence/seed 包**: 示例应用,包含源代码、配置文件和资源文件
- **apps 目录**: 存放可部署应用的新目录位置
- **workspace 配置**: 定义 monorepo 中包的位置和管理方式
- **依赖引用**: 其他包对 @terence/seed 的引用关系

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 文件移动操作完成后,`apps/seed` 目录应包含原 `packages/examples/seed` 的所有文件
- **SC-002**: 所有项目脚本(dev, build, test, lint)在移动后应能正常运行,无错误
- **SC-003**: 移动后,`git log --follow` 应能显示被移动文件的完整历史记录
- **SC-004**: 项目构建时间应在移动前后保持基本一致(差异不超过 5%)
- **SC-005**: 新团队成员能够在 5 分钟内通过文档找到 seed 应用的位置并成功运行

## Assumptions

- 假设当前项目使用 pnpm 作为包管理器
- 假设当前 workspace 配置在 pnpm-workspace.yaml 文件中
- 假设 Git 版本控制系统可用于移动操作
- 假设移动操作应在开发环境进行,不影响生产环境
- 假设移动后无需更改包的导入路径(因为包名 @terence/seed 保持不变)
