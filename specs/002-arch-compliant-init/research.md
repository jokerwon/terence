# Research: Architecture-Compliant Project Initialization

**Feature**: 002-arch-compliant-init
**Date**: 2026-01-16
**Phase**: Phase 0 - Research

本文档记录实施计划所需的所有技术调研结果,包括技术选型决策、最佳实践和替代方案评估。

---

## 1. Monorepo 工具选择

### Decision: pnpm workspace

**Rationale**:
- **性能优势**: pnpm 使用硬链接和符号链接,磁盘空间效率高,安装速度快
- **严格依赖隔离**: pnpm 的 node_modules 结构防止包可以访问未声明的依赖
- **Workspace 支持**: 原生支持 monorepo,配置简单且功能完整
- **社区趋势**: Vue、Vite、React 等主流项目都采用 pnpm workspace

**Alternatives Considered**:
- **npm workspaces**: 功能相对简单,性能不如 pnpm
- **Yarn workflows**: Berry (Yarn 2+) 配置复杂,学习曲线陡峭
- **Lerna**: 额外的抽象层,增加了维护成本,pnpm workspace 已经足够

**Configuration Example**:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'packages/examples/*'
```

```json
// package.json (root)
{
  "name": "terence",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @terence/seed dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "clean": "pnpm -r clean"
  },
  "devDependencies": {
    "@vitest/ui": "^1.0.0",
    "eslint": "^9.0.0",
    "vitest": "^1.0.0"
  }
}
```

**Best Practices**:
1. 使用 `pnpm --filter <package>` 命令针对特定包运行脚本
2. 使用 `pnpm -r` 递归运行所有包的脚本
3. Root package.json 只管理 devDependencies,具体包的依赖在各自的 package.json 中
4. Core 包的 `publishConfig.access` 设置为 `public`

**Common Pitfalls**:
- ❌ 在 root package.json 中声明所有依赖 → ✅ 每个包独立管理依赖
- ❌ 使用相对路径引用本地包 → ✅ 使用 workspace 协议 (`@terence/core@workspace:*`)
- ❌ 忘记设置 private: true → ✅ Root 和不发布的包设置 private: true

---

## 2. ESLint 架构边界检测

### Decision: ESLint + no-restricted-imports + eslint-plugin-import

**Rationale**:
- **no-restricted-imports**: 原生 ESLint 规则,可以精确控制哪些模块不能导入哪些包
- **eslint-plugin-import**: 提供更强大的 import/export 静态分析,支持 no-restricted-paths
- **多层配置**: 使用 ESLint overrides 为不同包应用不同规则
- **清晰错误信息**: 自定义错误消息,指导开发者正确做法

**Alternatives Considered**:
- **自定义 ESLint 插件**: 开发成本高,维护困难,现有规则已足够
- **ESLint 规则 + 注释**: 不可强制执行,容易绕过
- **Pre-commit hooks**: 只能防止提交,不能在编辑时提示

**Configuration Example**:

```javascript
// .eslintrc.js (root)
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  ignorePatterns: ['node_modules/', 'dist/', 'build/'],
  overrides: [
    {
      files: ['packages/core/**/*.js'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [{
            group: ['antd', 'react', 'react-dom', '@react', '../ui', '../seed'],
            message: 'Core package MUST NOT depend on UI libraries. See .specify/memory/constitution.md Principle I.'
          }]
        }],
        'no-restricted-syntax': ['error', {
          selector: 'JSXElement',
          message: 'Core package MUST NOT contain JSX. See .specify/memory/constitution.md Principle I.'
        }]
      }
    },
    {
      files: ['**/*.view.jsx', 'packages/ui/**/*.view.jsx'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [{
            group: ['@terence/core/engines', '@terence/core/services'],
            message: 'View MUST NOT directly import core engines/services. Use adapter instead. See constitution.md Principle IV.'
          }]
        }]
      }
    }
  ]
};
```

```javascript
// .eslintrc.core.js (core package specific)
module.exports = {
  extends: ['../.eslintrc.js'],
  rules: {
    // Core-specific rules
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
```

**Best Practices**:
1. 使用清晰的错误消息,引用宪章中的具体原则
2. 将架构规则提交到版本库,作为代码审查的一部分
3. 在 CI/CD 中强制执行 ESLint,拒绝违规代码
4. 定期审查 ESLint 报告,确保没有 false positives

**Implementation Strategy**:
- Phase 1: 实现基础的 restricted-imports 规则
- Phase 2: 添加自定义规则检测更复杂的边界违规
- Phase 3: 集成到 pre-commit hooks 和 CI/CD

---

## 3. JSDoc 类型检查

### Decision: JSDoc + TypeScript Compiler (for type checking only)

**Rationale**:
- **零运行时开销**: JSDoc 是注释,不影响运行时性能
- **IDE 支持**: VS Code、WebStorm 等 IDE 完整支持 JSDoc,提供自动补全和类型检查
- **渐进式**: 可以逐步添加类型,不需要一次性迁移到 TypeScript
- **与架构一致**: 核心原则是"JavaScript 友好",JSDoc 是最自然的选择

**TypeScript Compiler 用法**:
- 使用 `jsconfig.json` 启用 TypeScript 的类型检查(仅用于检查,不编译)
- 保留 `.js` 文件扩展名,使用 JSDoc 注释提供类型信息
- 获得完整的类型检查和 IDE 支持,无需迁移到 TypeScript

**Alternatives Considered**:
- **完整迁移到 TypeScript**: 违反"JavaScript 技术栈"原则,增加学习成本
- **Flow.js**: 社区较小,IDE 支持不如 TypeScript/JSDoc
- **无类型检查**: 在大型项目中维护困难,容易引入 bug

**Configuration Example**:

```json
// jsconfig.json (root)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "checkJs": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@terence/core": ["packages/core"],
      "@terence/core/*": ["packages/core/*"]
    },
    "jsx": "react"
  },
  "include": [
    "packages/**/*.js",
    "packages/**/*.jsx"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

**JSDoc Best Practices**:

```javascript
/**
 * @typedef {Object} OrderItem
 * @property {string} id - 商品 ID
 * @property {number} qty - 数量
 * @property {number} price - 单价
 */

/**
 * @typedef {Object} OrderState
 * @property {OrderItem[]} items - 订单项列表
 * @property {'idle'|'editing'|'submitting'|'completed'} status - 订单状态
 * @property {boolean} canSubmit - 是否可以提交
 * @property {Error|null} error - 错误信息
 */

/**
 * 创建订单引擎
 * @param {Object} options - 配置选项
 * @param {function(Object): Promise<void>} options.submitOrder - 提交订单的 API
 * @returns {{ state: OrderState, actions: Object }} 引擎实例
 */
export function createOrderEngine(options) {
  // implementation
}
```

**Complex Type Examples**:

```javascript
// 泛型函数
/**
 * @template T
 * @param {T[]} arr - 数组
 * @param {function(T): boolean} predicate - 谓词函数
 * @returns {T[]} 过滤后的数组
 */
export function filterArray(arr, predicate) {
  return arr.filter(predicate);
}

// 联合类型
/**
 * @typedef {'success'|'error'|'loading'} AsyncStatus
 */

// 可选属性
/**
 * @typedef {Object} User
 * @property {string} name
 * @property {string} [email] - 可选
 * @property {number|null} age - 可为 null
 */

// 回调函数
/**
 * @param {function(Error|null, string=): void} callback
 */
function fetchData(callback) {
  // implementation
}
```

**Validation Tools**:
- **IDE**: VS Code 原生支持,WebStorm 完整支持
- **CLI**: `npx tsc --noEmit` 执行类型检查
- **Pre-commit**: 在 git hooks 中运行类型检查
- **CI/CD**: 在构建流程中集成类型检查

---

## 4. CLI 工具架构

### Decision: Commander.js + Inquirer + Chalk

**Rationale**:
- **Commander.js**: 成熟的 CLI 框架,简洁的 API,支持子命令和选项
- **Inquirer.js**: 交互式命令行界面,支持输入、选择、确认等
- **Chalk**: 终端字符串样式,彩色输出提升用户体验
- **社区验证**: 被 npm、eslint、vite 等主流工具使用

**Alternatives Considered**:
- **Yargs**: 功能强大但 API 较复杂
- **Oclif**: TypeScript 优先,过度设计
- **Cac**: 轻量级但功能有限

**Architecture Design**:

```
terence/
├── src/
│   ├── cli.js           # CLI 入口,使用 commander 定义命令
│   ├── commands/
│   │   ├── init.js      # init 命令实现
│   │   ├── add.js       # add 命令实现
│   │   ├── list.js      # list 命令实现
│   │   └── upgrade.js   # upgrade 命令实现
│   └── utils/
│       ├── config.js    # 配置文件读写 (ui.config.json)
│       ├── template.js  # 模板拷贝和变量替换
│       ├── diff.js      # diff 生成 (用于 upgrade)
│       └── logger.js    # 日志工具 (chalk 封装)
```

**Command Examples**:

```javascript
// src/cli.js
import { Command } from 'commander';
import init from './commands/init.js';
import add from './commands/add.js';
import list from './commands/list.js';
import upgrade from './commands/upgrade.js';

const program = new Command();

program
  .name('terence')
  .description('Terence CLI - UI 组件生命周期管理工具')
  .version('1.0.0');

program.addCommand(init);
program.addCommand(add);
program.addCommand(list);
program.addCommand(upgrade);

program.parse();
```

```javascript
// src/commands/init.js
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { initConfig } from '../utils/config.js';
import { logSuccess, logError } from '../utils/logger.js';

export default new Command('init')
  .description('初始化 UI 资产管理环境')
  .option('-d, --ui-dir <dir>', 'UI 目录名称', 'ui')
  .action(async (options) => {
    try {
      // 检查是否已初始化
      if (await isInitialized()) {
        const { overwrite } = await inquirer.prompt([{
          type: 'confirm',
          name: 'overwrite',
          message: '项目已初始化,是否覆盖?',
          default: false
        }]);

        if (!overwrite) {
          console.log(chalk.yellow('操作已取消'));
          return;
        }
      }

      // 创建配置文件
      await initConfig(options.uiDir);

      logSuccess('UI 资产管理环境初始化完成!');
      console.log(chalk.gray('配置文件: ui.config.json'));
      console.log(chalk.gray(`UI 目录: ${options.uiDir}/`));
    } catch (error) {
      logError(error.message);
      process.exit(1);
    }
  });
```

**Source Code Copy Strategy**:

```javascript
// src/utils/template.js
import fs from 'fs/promises';
import path from 'path';

/**
 * 从模板拷贝组件到项目
 * @param {string} componentName - 组件名称
 * @param {string} templateDir - 模板目录
 * @param {string} targetDir - 目标目录
 */
export async function copyComponent(componentName, templateDir, targetDir) {
  const sourcePath = path.join(templateDir, componentName);
  const targetPath = path.join(targetDir, componentName);

  // 检查源模板是否存在
  try {
    await fs.access(sourcePath);
  } catch {
    throw new Error(`组件模板不存在: ${componentName}`);
  }

  // 检查目标是否存在
  try {
    await fs.access(targetPath);
    throw new Error(`组件已存在: ${componentName}. 请使用 upgrade 命令升级`);
  } catch {
    // 不存在则继续
  }

  // 递归拷贝
  await copyDirectory(sourcePath, targetPath);

  // 读取 meta.json
  const meta = JSON.parse(
    await fs.readFile(path.join(targetPath, 'meta.json'), 'utf-8')
  );

  // 更新 ui.config.json
  await updateUiConfig(componentName, meta);

  return meta;
}

/**
 * 递归拷贝目录
 */
async function copyDirectory(source, target) {
  await fs.mkdir(target, { recursive: true });

  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
```

**Version Management**:

```javascript
// src/utils/config.js
import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE = 'ui.config.json';

/**
 * 读取 ui.config.json
 */
export async function readConfig() {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * 更新 ui.config.json
 */
export async function updateUiConfig(componentName, meta) {
  const config = await readConfig() || {
    uiDir: 'ui',
    components: {}
  };

  config.components[componentName] = {
    version: meta.version,
    source: meta.source || 'local',
    core: meta.core
  };

  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}
```

---

## 5. Vitest 配置

### Decision: Vitest (Vite Native Testing)

**Rationale**:
- **与 Vite 同构**: 共享配置,启动快,热重载支持
- **ESM 原生**: 原生支持 ES modules,无需配置
- **兼容 Jest**: API 类似 Jest,迁移成本低
- **Watch 模式**: 开发时实时反馈
- **UI 界面**: 可视化测试结果

**Alternatives Considered**:
- **Jest**: 配置复杂,ESM 支持不够完善
- **Mocha + Chai**: 需要额外配置和组装
- **AVA**: 学习曲线较陡

**Configuration Example**:

```javascript
// vite.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // core 包测试不依赖浏览器
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/core/**/*.js'],
      exclude: ['**/*.test.js', '**/*.spec.js']
    },
    // 为 core 包设置别名
    alias: {
      '@terence/core': new URL('./packages/core', import.meta.url).pathname
    }
  }
});
```

```javascript
// packages/core/vite.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.js'],
    coverage: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
});
```

**Testing Best Practices**:

```javascript
// packages/core/engines/order.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { createOrderEngine } from './order.js';

describe('OrderEngine', () => {
  let engine;

  beforeEach(() => {
    engine = createOrderEngine({
      submitOrder: async () => {}
    });
  });

  describe('initial state', () => {
    it('should have empty items', () => {
      expect(engine.state.items).toEqual([]);
    });

    it('should have idle status', () => {
      expect(engine.state.status).toBe('idle');
    });

    it('should not be submittable', () => {
      expect(engine.state.canSubmit).toBe(false);
    });
  });

  describe('addItem', () => {
    it('should add item to state', () => {
      engine.actions.addItem('p1', 2);

      expect(engine.state.items).toEqual([
        { id: 'p1', qty: 2 }
      ]);
    });

    it('should update quantity if item exists', () => {
      engine.actions.addItem('p1', 2);
      engine.actions.addItem('p1', 3);

      expect(engine.state.items).toEqual([
        { id: 'p1', qty: 5 }
      ]);
    });
  });

  describe('submit', () => {
    it('should throw error if no items', async () => {
      await expect(engine.actions.submit()).rejects.toThrow(
        'Cannot submit empty order'
      );
    });

    it('should call submitOrder API', async () => {
      const mockSubmit = vi.fn().mockResolvedValue({ id: 'o1' });
      const engineWithMock = createOrderEngine({
        submitOrder: mockSubmit
      });

      engineWithMock.actions.addItem('p1', 1);
      await engineWithMock.actions.submit();

      expect(mockSubmit).toHaveBeenCalledWith({
        items: [{ id: 'p1', qty: 1 }]
      });
    });
  });
});
```

**Test Organization**:

```
packages/core/
├── engines/
│   ├── order.js
│   └── order.test.js       # Engine 测试
├── services/
│   ├── pricing.js
│   └── pricing.test.js     # Service 测试
├── guards/
│   ├── orderGuard.js
│   └── orderGuard.test.js  # Guard 测试
└── tests/
    ├── fixtures/           # 测试夹具
    │   └── orders.js
    └── helpers/            # 测试辅助函数
        └── engine.js
```

**Coverage Strategy**:
- Core 包: 80%+ 覆盖率目标
- UI 包: 基本行为测试,不追求高覆盖率
- CLI: 命令集成测试

---

## 6. React@19 + Vite@7 最佳实践

### Decision: React 19 + Vite 7 + Zustand + Tailwind CSS

**Rationale**:
- **React 19**: 最新稳定版,包含 Server Components、Actions 等新特性
- **Vite 7**: 极速开发服务器,优化的生产构建
- **Zustand**: 轻量级状态管理,API 简洁,与 React 19 配合良好
- **Tailwind CSS**: 实用优先的 CSS 框架,快速构建 UI

**Project Structure**:

```javascript
// packages/examples/seed/src/App.jsx
import { createOrderEngine } from '@terence/core';
import OrderPage from './pages/OrderPage.jsx';

function App() {
  // 创建 engine 实例
  const orderEngine = createOrderEngine({
    submitOrder: async (payload) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <OrderPage engine={orderEngine} />
    </div>
  );
}

export default App;
```

```javascript
// packages/examples/seed/src/pages/OrderPage.jsx
import { useState, useEffect } from 'react';
import OrderForm from '../../ui/OrderForm';

function OrderPage({ engine }) {
  const [state, setState] = useState(engine.state);

  // 订阅 engine 状态变化
  useEffect(() => {
    const unsubscribe = engine.subscribe(setState);
    return unsubscribe;
  }, [engine]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">订单管理</h1>

      <OrderForm
        state={state}
        actions={engine.actions}
      />

      {state.status === 'completed' && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
          订单提交成功!
        </div>
      )}

      {state.error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
          {state.error.message}
        </div>
      )}
    </div>
  );
}

export default OrderPage;
```

**Vite Configuration**:

```javascript
// packages/examples/seed/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@terence/core': '/packages/core',
      '@': '/src'
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

**Known Issues & Workarounds**:
1. **React 19 Strict Mode**: 双重调用 useEffect,确保 cleanup 函数正确
2. **Vite HMR**: Engine 实例需要正确重置,避免状态残留
3. **Tailwind PurgeCSS**: 配置 content 路径包含 UI 组件目录

---

## 7. 技术栈总结

| 层级 | 技术选型 | 版本 | 理由 |
|------|---------|------|------|
| **Monorepo** | pnpm workspace | 8+ | 性能高,配置简单 |
| **Core** | JavaScript + JSDoc | ES2022+ | 无类型运行时开销 |
| **UI Layer** | React + antd | 19 + 6 | 成熟稳定,生态完善 |
| **Seed** | Vite + Zustand + Tailwind | 7 + 4 + 3 | 开发体验好,性能优秀 |
| **CLI** | Commander + Inquirer | 11 + 9 | 简洁易用,社区验证 |
| **Testing** | Vitest | 1+ | 与 Vite 同构,快速 |
| **Linting** | ESLint | 9+ | 可扩展,架构约束 |
| **Build** | Vite | 7+ | 统一构建工具链 |

---

## 8. 实施风险评估

### 高风险项

1. **ESLint 架构边界检测**
   - **风险**: 规则配置可能过于严格或产生 false positives
   - **缓解**: 分阶段实施,先实现基础规则,逐步完善
   - **回退**: 使用 pre-commit hooks 作为补充

2. **JSDoc 类型维护**
   - **风险**: 大量 JSDoc 注释增加维护成本
   - **缓解**: 优先覆盖核心 API,工具类型使用 @typedef 复用
   - **回退**: 关键模块使用 TypeScript,其他保持 JSDoc

### 中风险项

1. **CLI 工具复杂度**
   - **风险**: upgrade 命令的 diff 生成和合并逻辑复杂
   - **缓解**: MVP 阶段只实现 init/add/list,upgrade 后续迭代
   - **回退**: 使用外部 diff 工具库

2. **Monorepo 依赖管理**
   - **风险**: 本地包依赖可能出现循环引用或版本冲突
   - **缓解**: 严格的依赖方向约束,定期审查 package.json
   - **回退**: 使用 pnpm 的 --no-frozen-lockfile 选项

### 低风险项

1. **测试覆盖率目标**
   - **风险**: 80% 覆盖率可能难以达成
   - **缓解**: 优先覆盖核心业务逻辑,UI 层测试可适当放宽
   - **回退**: 根据实际情况调整覆盖率目标

---

## 9. 后续调研需求

### Phase 0 完成后,Phase 1 可能需要:

1. **详细的 meta.json schema 设计**
2. **Engine 订阅机制的实现细节**
3. **CLI 命令的错误处理和用户提示**
4. **示例业务场景的完整数据模型**

### Phase 1 完成后,Phase 2 可能需要:

1. **具体的 Engine 实现代码**
2. **UI 组件的 antd 集成示例**
3. **集成测试的端到端场景**
4. **文档站点生成工具选择**

---

## 10. 结论

所有关键技术选型已确定,替代方案已评估。本调研为 Phase 1 设计和 Phase 2 实施提供了坚实的技术基础。

**关键决策**:
- ✅ pnpm workspace (Monorepo)
- ✅ ESLint + no-restricted-imports (架构边界)
- ✅ JSDoc + TypeScript Compiler (类型检查)
- ✅ Commander.js + Inquirer (CLI)
- ✅ Vitest (测试)
- ✅ React 19 + Vite 7 (Seed)

**下一步**: 执行 Phase 1 Design,创建数据模型和 API 契约。
