# Research: 移动 @terence/seed 到 apps/seed

**Feature**: 001-move-seed
**Date**: 2026-01-16
**Status**: Complete

## Overview

本文档记录了将 @terence/seed 从 `packages/examples/seed` 移动到 `apps/seed` 的研究决策和技术选择。

## Research Questions & Decisions

### RQ-1: 如何保留 Git 历史记录?

**Question**: 移动文件时如何确保 Git 能够保留完整的���史记录?

**Decision**: 使用 `git mv` 命令而非文件系统的复制/删除操作

**Rationale**:
- `git mv` 在 Git 内部执行重命名操作,自动保留文件历史
- 当使用 `git log --follow` 时,可以跨越重命名查看完整历史
- 这是 Git 官方推荐的移动文件方式
- 操作原子性更好,不会出现中间状态

**Alternatives Considered**:
1. **文件系统复制 + 删除**: 会丢失历史记录,Git 会将其识别为新文件和删除的文件
2. **git add 新位置 + git rm 旧位置**: 效果相同于 `git mv`,但需要两条命令

**Implementation**:
```bash
# 确保工作区干净
git status

# 使用 git mv 移动目录
git mv packages/examples/seed apps/seed

# 验证移动结果
git status
```

### RQ-2: 如何更新 pnpm workspace 配置?

**Question**: pnpm-workspace.yaml 需要如何更新以识别新的 apps 目录?

**Decision**: 在 workspace packages 中添加 `apps/*` 路径,并移除 `packages/examples/*`

**Rationale**:
- pnpm workspace 支持多个 glob 模式
- 添加新路径后,pnpm 会自动索引新位置的包
- 包名 @terence/seed 保持不变,因此依赖解析不受影响
- 移除旧路径避免 pnpm 索引不存在的目录

**Alternatives Considered**:
1. **保留旧路径**: 会导致 pnpm 警告找不到包,不推荐
2. **使用绝对路径**: 不符合 workspace 最佳实践,降低可移植性

**Implementation**:
```yaml
# 更新前
packages:
  - 'packages/*'
  - 'packages/examples/*'

# 更新后
packages:
  - 'packages/*'
  - 'apps/*'
```

### RQ-3: 是否需要更新包的导入路径?

**Question**: 移动后,其他包对 @terence/seed 的引用是否需要更新?

**Decision**: 不需要更新导入路径

**Rationale**:
- pnpm workspace 通过包名(而非路径)解析依赖
- package.json 中的 `name` 字段保持为 `@terence/seed`
- workspace 协议 `workspace:*` 基于包名解析
- 移动不影响包的注册和解析机制

**Verification**:
```bash
# 移动后验证依赖解析
pnpm list --filter @terence/seed

# 验证依赖此包的其他包
pnpm why @terence/seed
```

### RQ-4: 如何处理根 package.json 中的脚本引用?

**Question**: 根 package.json 中是否有引用旧路径的脚本需要更新?

**Decision**: 检查并更新所有硬编码路径引用

**Rationale**:
- 根 package.json 中的 `dev` 脚本使用 `pnpm --filter @terence/seed dev`
- 使用 `--filter` 通过包名而非路径过滤,因此无需更新
- 但需要检查是否有其他脚本直接引用路径

**Current Scripts**:
```json
{
  "dev": "pnpm --filter @terence/seed dev",
  "build": "pnpm -r build",
  "test": "pnpm -r test",
  "lint": "pnpm -r lint"
}
```

**Result**: ✅ 所有脚本使用包名或 `-r` (递归),无需修改

### RQ-5: 如何更新文档中的路径引用?

**Question**: 项目文档中有哪些地方需要更新以反映新的目录结构?

**Decision**: 系统性地搜索并更新所有文档中的路径引用

**Rationale**:
- 文档是开发者理解项目结构的关键
- 过时的文档会导致混淆
- 需要更新 README、架构文档、CLI 文档等

**Files to Update**:
1. **README.md** (如果存在)
   - 项目结构说明
   - 快速开始指南中的路径

2. **docs/architecture/*.md**
   - 架构图中的目录结构
   - 层级关系说明

3. **packages/cli/README.md** (如果存在)
   - CLI 使用示例中的路径

4. **apps/seed/README.md**
   - 相对路径引用(如果有)

**Implementation Strategy**:
```bash
# 搜索所有包含 "packages/examples/seed" 的文档
grep -r "packages/examples/seed" docs/ *.md

# 逐个检查并更新
```

### RQ-6: 如何验证移动后的功能完整性?

**Question**: 移动后需要执行哪些验证步骤确保一切正常工作?

**Decision**: 多层次的验证策略

**Rationale**:
- 需要确保包管理、构建、测试、运行都正常
- 验证 Git 历史记录完整性
- 确保性能没有下降

**Validation Checklist**:

1. **Workspace 识别**
   ```bash
   pnpm list
   # 应该显示 @terence/seed 在正确位置
   ```

2. **依赖解析**
   ```bash
   pnpm why @terence/seed
   # 应该显示依赖关系正常
   ```

3. **开发服务器**
   ```bash
   pnpm dev
   # 应该能正常启动
   ```

4. **构建**
   ```bash
   pnpm build
   # 应该成功完成,无错误
   ```

5. **测试**
   ```bash
   pnpm test
   # 所有测试应该通过
   ```

6. **Lint**
   ```bash
   pnpm lint
   # 应该无错误
   ```

7. **Git 历史**
   ```bash
   git log --follow apps/seed/package.json
   # 应该显示完整历史,包括移动前的提交
   ```

8. **性能基准**
   - 记录移动前的构建时间
   - 移动后对比,确保差异 < 5%

### RQ-7: 是否需要 ESLint 配置更新?

**Question**: ESLint 配置是否需要更新以识别新的目录结构?

**Decision**: 可能需要检查并更新

**Rationale**:
- 如果 eslint.config.js 中有硬编码路径,需要更新
- 如果使用 glob 模式包含文件,可能需要调整

**Investigation Required**:
```bash
# 检查 ESLint 配置
cat eslint.config.js

# 搜索是否有路径相关配置
grep -E "packages|examples" eslint.config.js
```

**Fallback**: 如果配置复杂,可以在验证阶段运行 `pnpm lint` 确认

### RQ-8: 如何处理可能的 CI/CD 配置?

**Question**: 如果项目有 CI/CD 配置,是否需要更新?

**Decision**: 检查并更新所有 CI/CD 配置文件

**Rationale**:
- CI 脚本可能有路径引用
- 构建脚本可能需要更新
- 缓存策略可能受影响

**Files to Check**:
- `.github/workflows/*.yml`
- `.gitlab-ci.yml`
- `Dockerfile`
- `.dockerignore`
- 其他 CI/CD 配置

**Current Status**: 项目当前未检测到 CI/CD 配置文件

## Risk Assessment

### Low Risk
- ✅ Git 历史保留: 使用标准 `git mv` 命令
- ✅ 包名不变: 依赖解析不受影响
- ✅ 脚本兼容: 现有脚本使用包名过滤

### Medium Risk
- ⚠️ 文档更新: 需要系统性地检查所有文档
- ⚠️ ESLint 配置: 可能需要调整路径引用

### Mitigation Strategies
1. 在分支上执行移动,充分测试后再合并
2. 保留详细的验证清单
3. 如有问题,可以回滚到移动前状态

## Best Practices Reference

### Monorepo Structure
- **Nx**: 推荐将应用放在 `apps/`,库放在 `libs/` 或 `packages/`
- **Turborepo**: 类似的结构约定
- **pnpm**: 支持任意 workspace 配置,使用 glob 模式

### Git File Movement
- 使用 `git mv` 而非文件系统操作
- 移动前确保工作区干净
- 移动后立即提交,避免中间状态

### Workspace Configuration
- 使用 glob 模式而非绝对路径
- 保持配置简洁,避免过度复杂的模式
- 定期清理不再使用的路径

## Summary

| Research Question | Decision | Risk Level |
|-------------------|----------|------------|
| Git 历史保留 | 使用 `git mv` | Low |
| Workspace 配置 | 添加 `apps/*`,移除 `packages/examples/*` | Low |
| 导入路径更新 | 不需要 | Low |
| 脚本更新 | 不需要(使用包名) | Low |
| 文档更新 | 系统性搜索并更新 | Medium |
| 验证策略 | 多层次验证清单 | Low |
| ESLint 配置 | 检查并可能更新 | Medium |
| CI/CD 配置 | 检查并更新 | Low |

**Overall Risk**: ✅ **LOW** - 这是一个标准的目录重构操作,有成熟的技术方案和最佳实践可循。

## Next Steps

进入 Phase 1: Design & Contracts
- 生成 data-model.md
- 生成 contracts/workspace-structure.yaml
- 生成 quickstart.md
- 更新 agent 上下文
