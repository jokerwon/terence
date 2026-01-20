<!--
Sync Impact Report:
- Version change: Initial → 1.0.0
- Modified principles: N/A (initial version)
- Added sections: All sections (initial version)
- Removed sections: N/A
- Templates requiring updates:
  ✅ plan-template.md - reviewed, aligned with constitution principles
  ✅ spec-template.md - reviewed, aligned with constitution principles
  ✅ tasks-template.md - reviewed, aligned with constitution principles
- Follow-up TODOs: None
-->

# Terence Project Constitution

## Core Principles

### I. Layered Architecture (NON-NEGOTIABLE)

本项目采用严格的三层分离架构：**core → ui → seed**，依赖关系只能自上而下，严禁反向依赖。

**核心规则**：

- **core 层**：业务内核层，定义业务状态、规则和流转，以 npm 包形式发布，不依赖任何 UI 技术（antd、DOM、CSS）
- **ui 层**：业务组件 UI 层，基于 antd@6 实现，通过 CLI 工具按需生成源码到项目中，不编写业务规则判断
- **seed 层**：项目应用层，组合使用 core 与 ui，通过 React@19、Vite@7、Zustand、Tailwind CSS 等技术栈交付最终业务

**依赖约束**：

- seed → ui → core（单向依赖）
- seed → core（允许直接使用）
- **禁止**：core 依赖 ui/seed，ui 依赖 seed

**代码边界约束**：

- core 中禁止出现 JSX、DOM API、antd 依赖
- ui 中禁止编写业务规则判断（必须通过 adapter 层对接 core）
- seed 中禁止复制 core 业务逻辑

通过 ESLint 边界规则与工程约定进行强制约束。

**理由**：确保业务逻辑的单一真理源（Single Source of Truth），实现业务确定性 + UI 可塑性 + 项目可生长性。

---

### II. Source Code Delivery

ui 层采用 **CLI 驱动的源码交付模式**，而非 npm 黑盒依赖。

**核心规则**：

- ui 组件以源码模板形式存在于仓库
- 通过 CLI 工具（terence）按需生成到 seed 项目中
- 生成后的代码完全归 seed 项目所有，可自由修改
- 所有生成的资产必须可追踪来源（通过 meta.json 和 ui.config.json）

**CLI 工具职责**：

- 业务 UI 资产初始化（init）
- 组件级别的按需引入（add）
- 资产版本与元信息管理（list）
- 升级辅助（upgrade - 非强制，开发者手动决策）

**升级策略**：

- CLI 不自动覆盖代码
- 升级是辅助行为，而非强制
- 生成 diff 报告，由开发者手动合并

**理由**：业务组件天然存在"最后 20% 定制"，源码交付避免二次封装与 hack，降低心智负担（代码即真相）。

---

### III. Business Logic Centricity

所有业务逻辑必须集中在 core 层，UI 永远只是业务的表达形式。

**core 层设计原则**：

- **职责单一**：只关心"业务是什么"，不关心"如何展示"
- **显式状态**：所有业务状态必须可枚举、可序列化、可检查，禁止隐式状态
- **单向数据流**：状态只能通过 action 发生变化，action 内部可触发副作用但结果必须回到状态中
- **JavaScript 友好**：使用 JSDoc 描述对外接口，关键边界进行运行时校验，结构清晰优于类型炫技

**Engine 模型**：

- core 中最核心的抽象，用于持有业务状态、暴露可调用的业务动作（actions）、管理副作用与状态回流
- state 必须是只读语义（不对外暴露 setter）
- actions 是唯一的状态修改入口

**Guard（业务校验）**：

- 校验 action 入参
- 校验当前状态是否允许该行为
- Guard 失败应抛出明确错误，不修改任何状态

**理由**：在 JavaScript 技术栈下，core 的稳定性来自于明确的职责边界、显式的状态模型、严格的 action 入口和工程与测试约束。

---

### IV. Adapter Pattern

所有 ui 与 core 的交互，必须通过 adapter 层。

**Adapter 职责边界**：

- **允许做的事情**：
  - 调用 engine.actions
  - 订阅 engine.state
  - 转换数据结构（如表单值 ↔ 业务结构）
- **禁止做的事情**：
  - 判断业务是否合法
  - 推断业务流程
  - 修改业务状态结构

**View 层规范**：

- View 是纯展示组件，接收 adapter 提供的数据，渲染 antd 组件，触发 adapter 方法
- View 禁止直接访问 engine，禁止写业务 if/else，禁止维护业务状态
- View 的判断依据只能来自 state

**antd@6 使用约束**：

- antd 只存在于 ui 层
- Form 只负责输入收集，校验规则仅限"格式校验"
- 业务校验必须由 core 完成

**理由**：Adapter 是 UI 与业务的唯一接缝点，防止 UI 直接操作业务状态，确保业务行为永远不被意外改变。

---

### V. Interface Constraints

在 JavaScript 技术栈下，通过以下方式保证稳定性：

**结构约束**：

- 明确模块职责
- 固定代码组织方式

**接口约束**：

- core 对外 API 必须使用 JSDoc 描述
- UI 与 core 之间通过 adapter 层交互

**运行时约束**：

- 关键边界进行参数与状态校验

**工程约束**：

- ESLint 规则
- 单元测试优先覆盖 core

**JSDoc 强制规范**：

- 所有对外方法必须有 JSDoc
- 所有 state 结构必须定义 typedef
- JSDoc 的角色：接口说明、IDE 自动提示、架构文档的一部分

**理由**：在不使用 TypeScript 的前提下，仍然具备清晰的边界与工程约束。

---

### VI. Testing Strategy

测试优先覆盖 core 层，确保业务逻辑的正确性和稳定性。

**core 层必测内容**：

- 状态初始化
- 每个 action 的状态变化
- guard 拦截行为

**测试原则**：

- 不 mock UI
- 不依赖浏览器环境
- TDD：测试编写 → 用户审批 → 测试失败 → 实现功能 → 重构

**ui 层测试策略**：

- Adapter：基本行为测试
- View：Smoke test
- 不追求 UI 层高覆盖率

**理由**：core 是业务真理源，测试覆盖 core 确保业务规则的一致性和跨项目行为稳定性。

---

## Development Standards

### Code Organization

**core 推荐结构**：

```
core/
├── engines/        # 业务引擎（状态 + action）
├── services/       # 纯业务服务（可被多个 engine 复用）
├── guards/         # 业务校验与断言
├── adapters/       # 对外适配（可选，如 storage / api）
├── utils/          # 通用工具函数
└── index.js        # 对外出口
```

**ui 推荐结构**：

```
ui/
├── components/
│   └── [ComponentName]/
│       └── index.jsx
├── hooks/                          # UI 专用 hooks
└── shared/                         # UI 工具与常量
```

### Error Handling

- 所有业务非法操作 → 抛出 Error
- 不吞异常
- UI 决定如何展示错误
- core 只负责"是否正确"，不负责"如何提示"

### Versioning

**core 版本管理**：

- 以 npm 包形式独立版本管理
- 语义化版本控制（MAJOR.MINOR.PATCH）
- 向后兼容优先

**ui 版本管理**：

- 通过 CLI 驱动源码生成
- 项目可选择：完全托管更新 或 局部定制后自行维护

---

## Governance

本宪章是 Terence 项目的最高指导原则，所有设计决策和代码实现都必须遵循这些原则。

**宪章优先级**：

- 宪章原则优于技术偏好
- 架构约束优先于语言能力
- 业务逻辑集中优于代码便利性

**修订流程**：

1. 识别需要调整的原则或约束
2. 提出修订建议，包含理由和影响分析
3. 评估修订对现有代码的兼容性
4. 更新宪章版本号（遵循语义化版本控制）
5. 同步更新相关文档和模板

**版本控制**：

- MAJOR：向后不兼容的治理原则移除或重新定义
- MINOR：新增原则或章节，或实质性扩展指导原则
- PATCH：澄清、措辞改进、错别字修正、非语义性改进

**合规审查**：

- 所有 PR 必须验证是否符合宪章原则
- 复杂度必须论证其必要性
- 使用架构文档作为运行时开发指导

**参考文档**：

- 总体架构：`docs/architecture/overall.md`
- core 设计：`docs/architecture/core.md`
- ui 设计：`docs/architecture/ui.md`
- CLI 设计：`docs/architecture/cli.md`

**Version**: 1.0.0 | **Ratified**: 2026-01-16 | **Last Amended**: 2026-01-16
