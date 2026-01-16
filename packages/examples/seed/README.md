# Terence Seed - 示例应用

这是一个完整的订单管理示例应用，演示了 Terence 三层架构的实际应用。

## 架构说明

本项目严格遵循 Terence 的三层架构原则：

```
┌─────────────────────────────────────────────────────────┐
│                    Seed 层（应用）                        │
│  - 组装 Engine 和 UI 组件                                  │
│  - 处理应用级逻辑和路由                                    │
│  - 提供后端 API 集成                                      │
└──────────────────────┬──────────────────────────────────┘
                       │ 依赖
                       ↓
┌─────────────────────────────────────────────────────────┐
│                     Core 层（业务）                        │
│  - OrderEngine 管理订单状态和逻辑                           │
│  - Guards 校验业务规则                                     │
│  - Services 计算价格等                                     │
│  - ❌ 不包含任何 UI 代码                                   │
└──────────────────────┬──────────────────────────────────┘
                       │ 依赖（仅通过 Adapter）
                       ↓
┌─────────────────────────────────────────────────────────┐
│                      UI 层（视图）                        │
│  - OrderForm 组件渲染界面                                  │
│  - Adapter 连接 Core 和 View                              │
│  - View 只负责展示，无业务逻辑                              │
└─────────────────────────────────────────────────────────┘
```

## 功能特性

- ✅ **完整的订单管理流程**
  - 添加商品到订单
  - 修改商品数量
  - 删除商品
  - 提交订单
  - 重置订单

- ✅ **实时状态同步**
  - Engine 状态变化实时反映到 UI
  - 订单项、总金额、状态自动更新

- ✅ **错误处理**
  - API 调用失败处理
  - 网络错误模拟（10% 失败率）
  - 友好的错误提示

- ✅ **业务规则校验**
  - 空订单无法提交
  - 订单项数据验证
  - 状态转换控制

## 快速开始

### 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 启动开发服务器

```bash
# 在项目根目录
pnpm dev

# 或直接运行 seed 项目
cd packages/examples/seed
pnpm dev
```

应用将在 http://localhost:3000 启动。

### 使用示例

1. **添加商品**
   - 点击"添加示例商品"按钮
   - 随机添加 MacBook、iPhone 等商品

2. **管理订单**
   - 修改商品数量
   - 删除不需要的商品
   - 查看实时更新的订单状态和总金额

3. **提交订单**
   - 点击"提交订单"按钮
   - 观察 Engine 状态变化（editing → submitting → completed）
   - 查看订单 ID

4. **模拟错误**
   - 多次提交订单，可能遇到模拟的网络错误
   - 观察 Engine 状态变为 failed
   - 可重新编辑并提交

## 技术栈

- **Core 层**: `@terence/core` - 纯 JavaScript，JSDoc 类型
- **UI 层**: `@terence/ui` - React + Ant Design
- **应用层**: Vite + React 19

## 项目结构

```
packages/examples/seed/
├── src/
│   ├── main.jsx              # 应用入口
│   ├── App.jsx               # 根组件（ConfigProvider）
│   ├── pages/
│   │   └── OrderPage.jsx     # 订单管理页面
│   └── ui/                   # UI 组件（从 @terence/ui 复制）
│       └── OrderForm/
│           ├── OrderForm.view.jsx
│           ├── OrderForm.adapter.js
│           ├── OrderForm.logic.js
│           ├── index.js
│           └── meta.json
├── index.html
├── vite.config.js
├── ui.config.json            # CLI 工具生成的配置
├── package.json
└── README.md
```

## 学习要点

### 1. 三层分离

观察代码中的职责分离：

- **OrderPage.jsx (Seed)**: 组装 Engine 和 UI，提供 mock API
- **OrderEngine (Core)**: 管理订单状态、校验规则、提交逻辑
- **OrderForm (UI)**: 渲染界面，通过 Adapter 订阅 Engine 状态

### 2. 单向依赖

检查导入关系：

```javascript
// ✅ 正确：Seed → Core
import { createOrderEngine } from '@terence/core';

// ✅ 正确：Seed → UI
import { OrderFormView } from './ui/OrderForm';

// ❌ 错误：Core 不能导入 UI
// Core 包中禁止导入 react/antd

// ❌ 错误：UI View 不能直接导入 Core Engine
// View 只能通过 props 接收数据
```

### 3. 状态订阅

查看 `OrderPage.jsx` 中的状态订阅：

```javascript
// 订阅 Engine 状态变化
engine.subscribe((newState) => {
  setState(newState);
  console.log('Engine 状态更新:', newState);
});
```

UI 自动响应 Core 状态变化，无需手动同步。

## 调试技巧

### 查看 Engine 状态

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 点击"添加商品"或"提交订单"
4. 观察 Engine 状态变化日志

### 查看组件结构

使用 React Developer Tools：
1. 安装 [React Developer Tools](https://react.dev/learn/react-developer-tools)
2. 切换到 Components 标签
3. 查看 OrderForm 组件的 props 和 state

## 架构验证

### 验证依赖方向

```bash
# 检查 Core 包不依赖 UI
npx eslint packages/core/src

# 检查 UI View 不直接导入 Core Engine
npx eslint packages/ui/src/components/OrderForm/OrderForm.view.jsx
```

### 验证测试覆盖率

```bash
# 运行 Core 包测试
pnpm --filter @terence/core test:coverage

# 预期覆盖率 > 80%
# Statements: 99.13%
# Branches: 94.44%
# Functions: 100%
# Lines: 99.09%
```

## 常见问题

### Q: 为什么 Seed 项目要复制 UI 组件？

A: 这是 Terence 的"源码交付"模式。CLI 工具将 UI 组件源码复制到用户项目中，开发者可以直接修改组件代码，而不受 npm 包的限制。

### Q: 可以在 UI 组件中添加业务逻辑吗？

A: ❌ 不可以。所有业务逻辑必须在 Core 层实现。UI 层只负责：
- 纯渲染（View）
- 状态订阅（Adapter）
- UI 交互逻辑（如输入验证格式）

### Q: 如何在 Seed 项目中使用新的 UI 组件？

A: 使用 CLI 工具：
```bash
# 初始化项目
terence init

# 添加组件
terence add OrderForm

# 列出可用组件
terence list --available
```

## 下一步

- 查看 [Core 包文档](../../core/README.md)
- 查看 [CLI 工具文档](../../cli/README.md)
- 阅读 [架构宪章](../../../../.specify/memory/constitution.md)

## 许可证

MIT
