# Changelog

All notable changes to @terence/core will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Stateless Core (Track A - 默认轨道)
- **stateless/login**: 新增登录业务的 Stateless Core 实现
  - `rules.js`: 业务规则纯函数 (`canSubmit`, `validateForm`)
  - `flows.js`: 业务流程函数 (`submitLogin`)
  - `contracts.js`: 副作用接口定义 (`loginEffectsContract`)
- **双轨模型架构**: 引入 Stateless Core 和 Stateful Engine 双轨模型
- **文档**: 完整的架构说明、使用指南和示例代码

#### Stateful Engine (Track B - 受限轨道)
- **engines/order-engine**: 新增订单流程 Engine 示例
  - `engine.js`: 核心状态机实现
  - `transitions.js`: 状态迁移规则定义
  - `contract.js`: 外部能力契约
- **engines/login**: 保留作为 Stateful Engine 参考示例

### Changed

#### 架构重构
- **Adapter 迁移**: Adapter 从 Core 层迁移到 UI 层
  - 旧路径: `@terence/core/adapters/react`
  - 新路径: `@terence/ui/hooks/adapters`
- **目录结构重组**:
  - 新增: `src/stateless/` 目录 (Track A)
  - 保留: `src/engines/` 目录 (Track B)
  - 删除: `src/adapters/` 目录

#### 导出路径更新
- **package.json exports**:
  - 新增: `"./stateless/*": "./src/stateless/*/index.js"`
  - 移除: `"./adapters/*": "./src/adapters/*/index.js"`

### Removed

#### 删除的功能
- **Core 层 Adapter**: 不再包含 React Adapter 代码
  - 原因: Adapter 属于 UI 层，不应污染 Core 层
  - 替代: 使用 `@terence/ui/hooks/adapters`

### Fixed

#### Bug 修复
- 修复 ESLint 配置，覆盖所有 Core 层代码
- 修复示例文件的导入路径（Adapter 迁移后）

### Security

#### 安全增强
- **ESLint 架构约束**: 强制执行架构规则
  - 禁止 Core 层引入 React
  - 禁止 Core 层使用状态管理库
  - 禁止 Core 层使用 JSX

## [0.1.0] - 2025-01-XX

### Added
- 初始版本发布
- Engine + Adapter 架构实现
- 登录业务 Engine 示例
- StateContainer 状态容器
- 运行时校验工具 (invariant, validation)
