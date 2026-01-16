# CLI Commands Contract

**Feature**: 002-arch-compliant-init
**Date**: 2026-01-16
**Phase**: Phase 1 - Design

本文档定义 CLI 工具 (terence) 的命令契约,包括 init、add、list、upgrade 命令的输入输出规范。

---

## 1. CLI 工具概览

### 1.1 命令列表

| 命令 | 描述 | 用法 |
|------|------|------|
| `init` | 初始化 UI 资产管理环境 | `terence init [options]` |
| `add` | 添加 UI 组件到项目 | `terence add <ComponentName> [options]` |
| `list` | 列出已引入的 UI 组件 | `terence list` |
| `upgrade` | 升级 UI 组件 | `terence upgrade <ComponentName> [options]` |

### 1.2 全局选项

```bash
terence [command] [options]

Options:
  -V, --version          输出版本号
  -h, --help             显示帮助信息
  -v, --verbose          详细输出模式
  --no-color             禁用彩色输出
```

---

## 2. init 命令

初始化项目的 UI 资产管理环境。

### 2.1 用法

```bash
terence init [options]
```

### 2.2 选项

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--ui-dir` | `-d` | string | `"ui"` | UI 目录名称 |
| `--force` | `-f` | boolean | `false` | ���制覆盖已存在的配置 |

### 2.3 交互式提示

如果项目已初始化且未指定 `--force`,CLI 会提示:

```
? 项目已初始化,是否覆盖? (y/N)
```

### 2.4 输入验证

**Preconditions**:

- 当前目录必须是有效项目 (有 `package.json`)
- 如果 `ui.config.json` 已存在且未指定 `--force`,必须用户确认

**错误处理**:

| 错误 | 消息 | HTTP 类比 |
|------|------|----------|
| NOT_A_PROJECT | `"当前目录不是有效项目 (缺少 package.json)"` | 400 |
| ALREADY_INITIALIZED | `"项目已初始化,使用 --force 覆盖"` | 409 |

### 2.5 输出

**成功输出**:

```bash
$ terence init

✅ UI 资产管理环境初始化完成!

📁 创建的文件:
   - ui.config.json
   - ui/.gitkeep

📋 下一步:
   1. 运行 terence add <ComponentName> 添加 UI 组件
   2. 在项目中导入: import OrderForm from './ui/OrderForm'
```

**错误输出**:

```bash
$ terence init

❌ 错误: 当前目录不是有效项目 (缺少 package.json)
```

### 2.6 创建的文件

**ui.config.json**:

```json
{
  "version": "1.0.0",
  "uiDir": "ui",
  "components": {}
}
```

**ui/.gitkeep**: 空文件,确保目录被 git 追踪。

### 2.7 实现契约

```javascript
// packages/cli/src/commands/init.js
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';

export default new Command('init')
  .description('初始化 UI 资产管理环境')
  .option('-d, --ui-dir <dir>', 'UI 目录名称', 'ui')
  .option('-f, --force', '强制覆盖已存在的配置')
  .action(async (options) => {
    try {
      // 1. 检查是否是有效项目
      if (!fs.existsSync('package.json')) {
        throw new Error('NOT_A_PROJECT');
      }

      // 2. 检查是否已初始化
      if (fs.existsSync('ui.config.json') && !options.force) {
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

      // 3. 创建配置文件
      await createUiConfig(options.uiDir);

      // 4. 成功输出
      console.log(chalk.green('✅ UI 资产管理环境初始化完成!'));
      console.log(chalk.gray(`📁 创建的文件:\n   - ui.config.json\n   - ${options.uiDir}/.gitkeep`));
    } catch (error) {
      console.error(chalk.red(`❌ 错误: ${error.message}`));
      process.exit(1);
    }
  });
```

---

## 3. add 命令

从 UI 模板仓库添加组件到项目。

### 3.1 用法

```bash
terence add <ComponentName> [options]
```

### 3.2 参数

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ComponentName` | string | ✅ | 组件名称,如 `OrderForm` |

### 3.3 选项

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--target-dir` | `-t` | string | (from config) | 目标目录 |
| `--source` | `-s` | string | (from template) | 模板来源 |

### 3.4 输入验证

**Preconditions**:

- 项目必须已初始化 (`ui.config.json` 存在)
- 组件模板必须存在于 `ui/components/<ComponentName>/`
- Core 版本必须满足组件要求

**错误处理**:

| 错误 | 消息 | HTTP 类比 |
|------|------|----------|
| NOT_INITIALIZED | `"项目未初始化,请先运行 terence init"` | 400 |
| COMPONENT_NOT_FOUND | `"组件模板不存在: <ComponentName>"` | 404 |
| VERSION_MISMATCH | `"Core 版本不满足要求: 需要 >=1.0.0, 当前 0.9.0"` | 400 |
| ALREADY_EXISTS | `"组件已存在: <ComponentName>. 使用 terence upgrade 升级"` | 409 |

### 3.5 版本检查

CLI 必须检查 `meta.json` 中的 core 版本要求:

```javascript
// 读取当前 core 版本
const coreVersion = JSON.parse(
  fs.readFileSync('node_modules/@terence/core/package.json')
).version;

// 读取组件的 meta.json
const meta = JSON.parse(
  fs.readFileSync(`ui/components/${componentName}/meta.json`)
);

// 检查版本兼容性
if (!checkCoreVersion(coreVersion, meta.core)) {
  throw new Error(`VERSION_MISMATCH: 需要 >=${meta.core.minVersion}, 当前 ${coreVersion}`);
}
```

### 3.6 输出

**成功输出**:

```bash
$ terence add OrderForm

✅ 组件添加成功!

📦 OrderForm v1.0.0
   📁 位置: ui/OrderForm/
   🔗 Core 依赖: order@1.0.0

📄 文件列表:
   - OrderForm.view.jsx    (纯 UI 视图)
   - OrderForm.adapter.js  (Core 适配层)
   - OrderForm.logic.js    (UI 内部状态)
   - meta.json             (组件元信息)
   - index.js              (导出入口)

💡 使用:
   import OrderForm from './ui/OrderForm';
```

**错误输出**:

```bash
$ terence add InvalidComponent

❌ 错误: 组件模板不存在: InvalidComponent

💡 提示: 运行 'terence list' 查看可用组件
```

### 3.7 更新 ui.config.json

添加组件后自动更新配置文件:

```json
{
  "version": "1.0.0",
  "uiDir": "ui",
  "components": {
    "OrderForm": {
      "version": "1.0.0",
      "source": "local",
      "core": {
        "engine": "order",
        "version": "1.0.0"
      },
      "addedAt": "2024-01-16T10:30:00Z",
      "modified": false
    }
  }
}
```

---

## 4. list 命令

列出已引入的 UI 组件。

### 4.1 用法

```bash
terence list
```

### 4.2 选项

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--json` | `-j` | boolean | `false` | 以 JSON 格式输出 |

### 4.3 输出格式

**默认输出 (表格)**:

```bash
$ terence list

已引入的 UI 组件 (2):

┌──────────────┬─────────┬──────────┬────────────────┐
│ 组件名称      │ 版本    │ 来源     │ Core 依赖      │
├──────────────┼─────────┼──────────┼────────────────┤
│ OrderForm    │ 1.0.0   │ local    │ order@1.0.0    │
│ ProductList  │ 1.2.0   │ local    │ product@1.0.0  │
└──────────────┴─────────┴──────────┴────────────────┘
```

**JSON 输出**:

```bash
$ terence list --json

{
  "components": [
    {
      "name": "OrderForm",
      "version": "1.0.0",
      "source": "local",
      "core": {
        "engine": "order",
        "version": "1.0.0"
      },
      "addedAt": "2024-01-16T10:30:00Z",
      "modified": false
    }
  ],
  "total": 1
}
```

### 4.4 空列表

```bash
$ terence list

❌ 未引入任何 UI 组件

💡 提示: 运行 'terence add <ComponentName>' 添加组件
```

---

## 5. upgrade 命令

升级 UI 组件到新版本。

### 5.1 用法

```bash
terence upgrade <ComponentName> [options]
```

### 5.2 参数

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ComponentName` | string | ✅ | 组件名称 |

### 5.3 选项

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--dry-run` | `-n` | boolean | `false` | 预览模式,不实际修改 |
| `--force` | `-f` | boolean | `false` | 强制覆盖本地修改 |

### 5.4 输出

**无更新**:

```bash
$ terence upgrade OrderForm

✅ 组件已是最新版本

📦 OrderForm v1.0.0 (当前) = v1.0.0 (最新)
```

**有更新 (预览)**:

```bash
$ terence upgrade OrderForm --dry-run

🔍 有可用更新: OrderForm v1.0.0 → v1.1.0

📊 变更预览:
   新增文件 (1):
     + OrderForm.types.js

   修改文件 (2):
     ~ OrderForm.view.jsx
     ~ OrderForm.adapter.js

   删除文件 (0):

   冲突文件 (1):
     ⚠️  OrderForm.logic.js (本地有修改)

💡 提示: 运行 'terence upgrade OrderForm --force' 强制升级
```

**执行升级**:

```bash
$ terence upgrade OrderForm --force

⏳ 正在升级 OrderForm v1.0.0 → v1.1.0...

✅ 升级完成!

📄 更新的文件:
   - OrderForm.view.jsx (已合并)
   - OrderForm.adapter.js (已合��)
   - OrderForm.logic.js (已覆盖)
   - OrderForm.types.js (新增)

💡 建议测试组件功能是否正常
```

### 5.5 Diff 生成

CLI 使用 diff 算法生成变更报告:

```javascript
import { diffLines } from 'diff';

const current = fs.readFileSync('OrderForm.view.jsx', 'utf-8');
const latest = fs.readFileSync('template/OrderForm.view.jsx', 'utf-8');

const changes = diffLines(current, latest);

changes.forEach((change) => {
  if (change.added) {
    console.log(chalk.green(`+ ${change.value}`));
  } else if (change.removed) {
    console.log(chalk.red(`- ${change.value}`));
  }
});
```

---

## 6. 错误处理契约

### 6.1 错误代码

| Code | Message | Suggestion |
|------|---------|------------|
| `NOT_INITIALIZED` | `"项目未初始化"` | `"运行 'terence init' 初始化项目"` |
| `NOT_A_PROJECT` | `"当前目录不是有效项目"` | `"在包含 package.json 的目录中运行"` |
| `COMPONENT_NOT_FOUND` | `"组件模板不存在"` | `"运行 'terence list' 查看可用组件"` |
| `VERSION_MISMATCH` | `"Core 版本不满足要求"` | `"升级 @terence/core 到指定版本"` |
| `ALREADY_EXISTS` | `"组件已存在"` | `"使用 'terence upgrade' 升级组件"` |
| `COPY_FAILED` | `"拷贝文件失败"` | `"检查文件权限"` |

### 6.2 错误输出格式

```bash
❌ 错误: <ERROR_MESSAGE>

💡 提示: <SUGGESTION>

🔗 帮助: 运行 'terence --help' 或 'terence <command> --help'
```

---

## 7. 配置文件契约

### 7.1 ui.config.json Schema

参见 `data-model.md` 第 3.2 节。

### 7.2 读取配置

```javascript
export async function readUiConfig() {
  const configPath = 'ui.config.json';

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('NOT_INITIALIZED');
    }
    throw error;
  }
}
```

### 7.3 写入配置

```javascript
export async function writeUiConfig(config) {
  const configPath = 'ui.config.json';

  // 验证 schema
  validateSchema(config);

  // 格式化输出 (2 空格缩进)
  await fs.writeFile(
    configPath,
    JSON.stringify(config, null, 2)
  );
}
```

---

## 8. 文件系统契约

### 8.1 UI 模板结构

```
ui/
└── components/
    └── <ComponentName>/
        ├── <ComponentName>.view.jsx
        ├── <ComponentName>.adapter.js
        ├── <ComponentName>.logic.js (可选)
        ├── meta.json
        └── index.js
```

### 8.2 拷贝行为

```javascript
// 递归拷贝目录
async function copyComponent(source, target) {
  // 1. 检查源目录是否存在
  if (!fs.existsSync(source)) {
    throw new Error('COMPONENT_NOT_FOUND');
  }

  // 2. 检查目标目录是否存在
  if (fs.existsSync(target)) {
    throw new Error('ALREADY_EXISTS');
  }

  // 3. 递归拷贝
  await copyDirectory(source, target);

  // 4. 更新 ui.config.json
  await updateUiConfig(componentName);
}
```

---

## 9. 退出代码

| Code | Meaning |
|------|---------|
| `0` | 成功 |
| `1` | 一般错误 |
| `2` | 输入验证失败 |
| `3` | 文件系统错误 |
| `4` | 网络错误 (未来扩展) |

---

## 10. 性能要求

| 命令 | 最大耗时 | 备注 |
|------|---------|------|
| `init` | 1s | 创建配置文件 |
| `add` | 10s | 拷贝文件 (取决于组件大小) |
| `list` | 100ms | 读取配置文件 |
| `upgrade` | 15s | 生成 diff + 合并 |

---

## 11. 测试契约

### 11.1 单元测试

每个命令必须有单元测试:

```javascript
describe('init command', () => {
  it('should create ui.config.json', async () => {
    await init({ uiDir: 'ui' });
    expect(fs.existsSync('ui.config.json')).toBe(true);
  });

  it('should error if not a project', async () => {
    await expect(init({})).rejects.toThrow('NOT_A_PROJECT');
  });
});
```

### 11.2 集成测试

```bash
# 测试完整的工作流
terence init
terence add OrderForm
terence list
terence upgrade OrderForm --dry-run
```

---

## 12. 总结

本 CLI 命令契约文档定义了:

1. **4 个命令**: init、add、list、upgrade
2. **输入输出规范**: 参数、选项、返回值
3. **错误处理**: 错误代码、消息、建议
4. **文件系统操作**: 配置文件读写、目录拷贝
5. **版本管理**: 版本检查、升级策略
6. **性能要求**: 操作耗时限制
7. **测试契约**: 单元测试和集成测试要求

**下一步**: 创建 UI 组件契约文档 (`contracts/ui-contract.md`)。
