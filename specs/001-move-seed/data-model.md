# Data Model: 移动 @terence/seed 到 apps/seed

**Feature**: 001-move-seed
**Date**: 2026-01-16
**Status**: Complete

## Overview

此功能主要是目录结构重构,不涉及新的数据实体或业务逻辑。本文档描述需要维护的配置和元数据结构。

## Entities

### 1. Workspace Package

**Description**: pnpm workspace 中的包定义

**Attributes**:
- `name` (string, required): 包名,如 `@terence/seed`
- `version` (string, required): 语义化版本号
- `private` (boolean): 是否为私有包
- `location` (string, derived): 包在文件系统中的位置

**State Transitions**:
```
packages/examples/seed → apps/seed
- name: @terence/seed (不变)
- version: 1.0.0 (不变)
- location: packages/examples/seed → apps/seed (变更)
```

**Validation Rules**:
- 包名必须符合 npm 包命名规范
- location 必须匹配 workspace glob 模式
- version 必须遵循语义化版本控制

### 2. Workspace Configuration

**Description**: pnpm workspace 配置结构

**Structure**:
```yaml
packages:
  - <glob-pattern-1>
  - <glob-pattern-2>
  - ...
```

**Current State**:
```yaml
packages:
  - 'packages/*'
  - 'packages/examples/*'
```

**Target State**:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**Validation Rules**:
- glob 模式必须使用 POSIX 路径分隔符(`/`)
- 模式必须匹配包含 package.json 的目录
- 不应有重复或冗余的模式

### 3. Git Index Entry

**Description**: Git 索引中的文件记录

**Attributes**:
- `path` (string): 文件在工作区中的路径
- `sha` (string): 文件内容的 SHA-1 哈希
- `status` (enum): 文件状态 (renamed, modified, added, deleted)

**Transition**:
```
packages/examples/seed/* → apps/seed/*
- status: renamed
- sha: 保持不变(如果内容未修改)
- history: 通过 git log --follow 可追溯
```

**Validation Rules**:
- 重命名操作应保持文件内容不变
- Git 应能识别重命名而非删除+添加
- 历史记录应完整保留

## Relationships

```
Workspace Configuration
    ├── contains (1:N) → Workspace Package
    └── matches via glob pattern

Workspace Package (@terence/seed)
    ├── located at → File System Path
    ├── registered in → Git Index
    └── referenced by → Other Packages (via workspace protocol)

Git Index
    ├── tracks → File System Path
    └── preserves → History (via --follow)
```

## Data Flow

### Before Move

```
pnpm-workspace.yaml:
  packages: ['packages/*', 'packages/examples/*']
         ↓
         ├── matches → packages/cli/package.json
         ├── matches → packages/core/package.json
         ├── matches → packages/ui/package.json
         └── matches → packages/examples/seed/package.json
                         ↓
                     @terence/seed
```

### After Move

```
pnpm-workspace.yaml:
  packages: ['packages/*', 'apps/*']
         ↓
         ├── matches → packages/cli/package.json
         ├── matches → packages/core/package.json
         ├── matches → packages/ui/package.json
         └── matches → apps/seed/package.json
                         ↓
                     @terence/seed
```

## Validation

### Workspace Resolution

**Input**: 包名 `@terence/seed`
**Process**:
1. pnpm 读取 pnpm-workspace.yaml
2. 扫描所有匹配 glob 模式的目录
3. 读取每个目录的 package.json
4. 查找 name === '@terence/seed' 的包
5. 返回包的路径

**Expected Output**:
- Before: `/path/to/repo/packages/examples/seed`
- After: `/path/to/repo/apps/seed`

**Assertion**: 路径变更不影响依赖解析,因为解析基于包名而非路径

### Dependency Resolution

**Scenario**: 另一个包依赖 `@terence/seed`

**package.json**:
```json
{
  "dependencies": {
    "@terence/seed": "workspace:*"
  }
}
```

**Resolution Process**:
1. pnpm 看到 `workspace:*` 协议
2. 在 workspace 中查找 `@terence/seed` 包
3. 无论包位于哪个目录,都能找到
4. 创建符号链接或本地路径引用

**Assertion**: 移动不影响依赖解析,因为查找基于包名

## Migration Scripts

### Validation Script

```bash
#!/bin/bash
# 验证移动后的完整性

echo "1. 验证 workspace 识别..."
pnpm list --filter @terence/seed

echo "2. 验证依赖解析..."
pnpm why @terence/seed

echo "3. 验证 Git 历史..."
git log --follow apps/seed/package.json | head -n 5

echo "4. 验证构建..."
pnpm build

echo "5. 验证测试..."
pnpm test

echo "✅ 所有验证通过"
```

## Summary

此重构不涉及新的业务数据实体,主要变更:
1. **Workspace Package Location**: `packages/examples/seed` → `apps/seed`
2. **Workspace Configuration**: 添加 `apps/*`, 移除 `packages/examples/*`
3. **Git Index**: 文件路径更新,历史记录保留

所有数据关系和验证逻辑保持不变,仅物理位置发生变更。
