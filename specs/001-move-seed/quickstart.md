# Quickstart: 移动 @terence/seed 到 apps/seed

**Feature**: 001-move-seed
**Branch**: 001-move-seed
**Estimated Time**: 15-30 分钟

## Prerequisites

在开始之前,请确保:

- [ ] Git 工作区是干净的(无未提交的更改)
- [ ] 当前在 `001-move-seed` 分支上
- [ ] 已阅读并理解 [research.md](./research.md) 和 [plan.md](./plan.md)

## Quick Start Guide

### Step 1: 验证当前状态 (2 分钟)

```bash
# 1. 确认当前分支
git branch --show-current

# 2. 确保工作区干净
git status

# 3. 查看当前 workspace 配置
cat pnpm-workspace.yaml

# 4. 验证 seed 包当前位置
ls -la packages/examples/seed/
```

**Expected Output**:
- 分支: `001-move-seed`
- Git status: `nothing to commit`
- Workspace: 包含 `packages/examples/*`
- Seed 包存在且可访问

### Step 2: 执行移动操作 (5 分钟)

```bash
# 1. 创建 apps 目录
mkdir -p apps

# 2. 使用 git mv 移动 seed 包
git mv packages/examples/seed apps/seed

# 3. 验证移动结果
git status
ls -la apps/seed/

# 4. 删除空的 examples 目录
rmdir packages/examples
```

**Expected Output**:
- Git status 显示 `renamed: packages/examples/seed -> apps/seed`
- `apps/seed/` 目录包含所有原文件

### Step 3: 更新 workspace 配置 (2 分钟)

```bash
# 编辑 pnpm-workspace.yaml
# 将:
#   packages:
#     - 'packages/*'
#     - 'packages/examples/*'
# 改为:
#   packages:
#     - 'packages/*'
#     - 'apps/*'

# 使用你喜欢的编辑器
vim pnpm-workspace.yaml
# 或
code pnpm-workspace.yaml
```

**验证编辑**:
```bash
cat pnpm-workspace.yaml
```

应该显示:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### Step 4: 重新安装依赖 (3 分钟)

```bash
# 1. 清理并重新安装
pnpm install

# 2. 验证 workspace 识别
pnpm list

# 3. 验证 seed 包解析
pnpm why @terence/seed
```

**Expected Output**:
- `pnpm list` 显示 `@terence/seed` 在列表中
- `pnpm why @terence/seed` 显示包的位置为 `apps/seed`

### Step 5: 验证功能完整性 (5 分钟)

```bash
# 1. 测试开发服务器
pnpm dev
# 按 Ctrl+C 停止

# 2. 测试构建
pnpm build

# 3. 运行测试
pnpm test

# 4. 运行 lint
pnpm lint
```

**Expected Output**:
- 所有命令成功执行,无错误
- 构建时间与移动前相近(差异 < 5%)

### Step 6: 更新文档 (5 分钟)

```bash
# 1. 查找包含旧路径的文档
grep -r "packages/examples/seed" docs/ *.md 2>/dev/null

# 2. 逐个更新找到的文件
# 将 "packages/examples/seed" 替换为 "apps/seed"

# 3. 如果有 README.md,更新项目结构部分
```

**常见需要更新的地方**:
- README.md 中的项目结构图
- 架构文档中的目录说明
- CLI 文档中的示例路径

### Step 7: 验证 Git 历史 (2 分钟)

```bash
# 验证历史记录完整性
git log --follow apps/seed/package.json | head -n 10
```

**Expected Output**:
- 显示完整的提交历史,包括移动前的提交

### Step 8: 提交更改 (2 分钟)

```bash
# 1. 查看所有更改
git status
git diff --staged

# 2. 提交
git add .
git commit -m "feat: move @terence/seed to apps/seed

- Move seed app from packages/examples/seed to apps/seed
- Update pnpm-workspace.yaml to include apps/* pattern
- Update documentation to reflect new structure
- Preserve git history using git mv

This change aligns with monorepo best practices by separating
deployable applications from library code."

# 3. 验证提交
git log -1 --stat
```

## Verification Checklist

完成上述步骤后,使用此清单验证:

### Workspace Configuration
- [ ] `pnpm-workspace.yaml` 包含 `apps/*` 模式
- [ ] `pnpm-workspace.yaml` 不包含 `packages/examples/*` 模式
- [ ] `pnpm list` 显示所有包(cli, core, ui, seed)

### Package Location
- [ ] `apps/seed/` 目录存在
- [ ] `packages/examples/seed/` 目录不存在
- [ ] `apps/seed/package.json` 存在且有效

### Dependency Resolution
- [ ] `pnpm why @terence/seed` 显示包位置为 `apps/seed`
- [ ] `pnpm install` 无错误
- [ ] 无包解析警告

### Build & Test
- [ ] `pnpm build` 成功
- [ ] `pnpm test` 通过
- [ ] `pnpm lint` 通过
- [ ] `pnpm dev` 能正常启动

### Git History
- [ ] `git log --follow apps/seed/package.json` 显示完整历史
- [ ] 移动操作被识别为 renamed 而非 deleted + added

### Documentation
- [ ] README.md 已更新(如果存在)
- [ ] 架构文档已更新
- [ ] 无遗留的 `packages/examples/seed` 引用

## Troubleshooting

### Issue: pnpm install fails

**Symptom**: 安装依赖时报错找不到包

**Solution**:
```bash
# 清理缓存
pnpm store prune

# 删除 node_modules 和 lockfile
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### Issue: Build fails after move

**Symptom**: 构建时报错找不到文件

**Possible Causes**:
1. ESLint 配置中有硬编码路径
2. Vite 配置中有路径引用

**Solution**:
```bash
# 检查 eslint.config.js
cat eslint.config.js | grep -E "packages|examples"

# 检查 vite.config.js
cat vite.config.js | grep -E "packages|examples"

# 更新找到的硬编码路径
```

### Issue: Git history not preserved

**Symptom**: `git log --follow` 不显示移动前的历史

**Cause**: 没有使用 `git mv`,而是使用了文件系统操作

**Solution**:
```bash
# 如果还未提交,回滚并重新移动
git reset --hard HEAD
git mv packages/examples/seed apps/seed

# 如果已提交,使用 git filter-branch(复杂)
# 或接受历史从移动后开始
```

### Issue: Scripts not working

**Symptom**: `pnpm dev` 等脚本不工作

**Solution**:
```bash
# 检查根 package.json
cat package.json

# 验证脚本使用 --filter 而非路径
# 正确: pnpm --filter @terence/seed dev
# 错误: cd packages/examples/seed && pnpm dev
```

## Rollback Procedure

如果需要回滚所有更改:

```bash
# 1. 回滚最近的提交
git reset --hard HEAD~1

# 2. 恢复到移动前的状态
git mv apps/seed packages/examples/seed

# 3. 恢复 pnpm-workspace.yaml
git checkout HEAD -- pnpm-workspace.yaml

# 4. 重新安装依赖
pnpm install

# 5. 验证
pnpm list
pnpm test
```

## Next Steps

完成移动后:

1. **Code Review**: 创建 PR 进行代码审查
2. **Merge**: 合并到主分支
3. **Documentation**: 更新项目 README 和贡献指南
4. **CI/CD**: 如果有 CI/CD,更新配置(如果需要)

## Additional Resources

- [Research Findings](./research.md) - 技术决策和最佳实践
- [Implementation Plan](./plan.md) - 完整的实施计划
- [Data Model](./data-model.md) - 数据结构和验证
- [Workspace Contract](./contracts/workspace-structure.yaml) - 配置契约

## Support

如果遇到问题:

1. 检查 [Troubleshooting](#troubleshooting) 部分
2. 查看 [research.md](./research.md) 中的常见问题
3. 联系项目维护者

---

**Estimated Completion Time**: 15-30 分钟

**Success Criteria**: 所有验证清单项目通过 ✅
