# Quick Start Guide: @terence/seed

**Feature**: 001-init-seed
**Date**: 2026-01-19
**Status**: ✅ COMPLETE

本文档提供 @terence/seed 项目的快速开始指南。

---

## 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- 现代浏览器 (Chrome、Firefox、Safari、Edge 最新版本)

---

## 安装依赖

```bash
# 在 monorepo 根目录
pnpm install
```

这将安装所有 workspace 依赖,包括:
- @terence/core
- @terence/ui
- @terence/seed

---

## 启动开发服务���

```bash
# 在 monorepo 根目录
pnpm --filter @terence/seed dev
```

或

```bash
# 在 apps/seed 目录
cd apps/seed
pnpm dev
```

开发服务器将在 `http://localhost:3000` 启动。

---

## 项目结构

```
apps/seed/
├── src/
│   ├── assets/              # 静态资源
│   ├── components/          # 项目级组件
│   ├── pages/               # 页面组件 (负责 Engine 生命周期)
│   ��   └── [PageName]/
│   │       ├── index.jsx    # 页面入口
│   │       └── use[PageName].js  # 页面 hooks
│   ├── routes/              # 路由配置
│   ├── stores/              # Zustand stores (仅 UI 状态)
│   ├── hooks/               # 项目级 hooks
│   ├── utils/               # 工具函数
│   ├── constants/           # 常量
│   ├── services/            # 服务 (API、auth 等)
│   ├── styles/              # 样式
│   ├── main.jsx             # 应用入口
│   └── App.jsx              # 应用根组件
├── public/                  # 公共静态资源
├── index.html               # HTML 入口
├── vite.config.js           # Vite 配置
├── .eslintrc.js             # ESLint 配置
├── vitest.config.js         # Vitest 配置
└── package.json             # 依赖管理
```

---

## 开发工作流

### 1. 创建新页面

```bash
# 创建页面目录
mkdir -p src/pages/NewPage

# 创建页面文件
touch src/pages/NewPage/index.jsx
touch src/pages/NewPage/useNewPage.js
```

**示例** (`src/pages/NewPage/index.jsx`):

```javascript
import { useNewPage } from './useNewPage'

export function NewPage() {
  const { state, handleSubmit } = useNewPage()

  return (
    <div>
      <h1>New Page</h1>
      {/* 页面内容 */}
    </div>
  )
}
```

**注册路由** (`src/routes/index.jsx`):

```javascript
import { NewPage } from '../pages/NewPage'

// 在路由配置中添加
{ path: 'new', element: <NewPage /> }
```

### 2. 使用 Core Engine

```javascript
import { createOrderEngine } from '@terence/core'
import { useEffect, useState } from 'react'

export function OrderPage() {
  const [engine, setEngine] = useState(null)

  useEffect(() => {
    // 创建 Engine 实例
    const orderEngine = createOrderEngine({ /* 初始状态 */ })
    setEngine(orderEngine)

    return () => {
      // 清理 (如果需要)
      orderEngine.destroy?.()
    }
  }, [])

  if (!engine) return <div>Loading...</div>

  // 订阅状态
  const state = engine.state

  // 通过 adapter 调用 actions
  const handleSubmit = () => {
    // adapter.submitOrder()
  }

  return (
    <div>
      <h2>Order State: {state.status}</h2>
      {/* UI 组件 */}
    </div>
  )
}
```

### 3. 使用 UI 状态

```javascript
import { useUIStore } from '../stores/useUIStore'

export function MyComponent() {
  const { modal, setModal } = useUIStore()

  const openModal = () => {
    setModal({
      visible: true,
      title: 'Title',
      content: <div>Content</div>,
      onOk: () => console.log('OK'),
      onCancel: () => setModal({ visible: false }),
    })
  }

  return (
    <button onClick={openModal}>Open Modal</button>
  )
}
```

### 4. 添加测试

```bash
# 创建测试文件
touch src/components/__tests__/MyComponent.test.jsx
```

**示例** (`src/components/__tests__/MyComponent.test.jsx`):

```javascript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Open Modal')).toBeInTheDocument()
  })
})
```

运行测试:

```bash
pnpm test
```

---

## 代码规范

### 运行 Lint

```bash
pnpm lint
```

### 自动修复

```bash
pnpm lint --fix
```

### 架构边界检查

ESLint 会自动检测以下违规:
- ❌ Core 包导入 UI 依赖 (antd、React)
- ❌ UI 组件直接访问 Engine
- ❌ UI 组件感知路由
- ❌ Zustand 存储 Core 业务状态

---

## 构建

### 开发构建

```bash
pnpm build
```

构建产物将输出到 `dist/` 目录。

### 预览构建

```bash
pnpm preview
```

---

## 关键原则

### ✅ 允许

- 页面组件直接使用 Engine 和 useUIStore
- UI 组件通过 Adapter 访问 Engine
- 使用 Zustand 管理跨页面 UI 状态
- 使用 useState 管理组件内部状态

### ❌ 禁止

- UI 组件直接访问 Engine (必须通过 Adapter)
- UI 组件导入 `react-router-dom`
- Zustand 存储 Engine 状态
- 在 seed 中编写业务逻辑
- 在 UI 组件中编写业务规则判断

---

## 常见问题

### Q: 如何添加新的依赖?

```bash
# 在 monorepo 根目录
pnpm --filter @terence/seed add <package>

# 或在 apps/seed 目录
cd apps/seed
pnpm add <package>
```

### Q: 如何使用 Ant Design 组件?

```javascript
import { Button, Table } from 'antd'

function MyComponent() {
  return (
    <div>
      <Button type="primary">Click me</Button>
      <Table dataSource={[]} columns={[]} />
    </div>
  )
}
```

### Q: 如何定制主题?

在 `src/styles/theme.js` 中配置:

```javascript
export const customTheme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
  },
}
```

在 `src/App.jsx` 中应用:

```javascript
import { ConfigProvider } from 'antd'
import { customTheme } from './styles/theme'

function App() {
  return (
    <ConfigProvider theme={customTheme}>
      {/* ... */}
    </ConfigProvider>
  )
}
```

---

## 下一步

- 查看 [research.md](./research.md) 了解技术选型和最佳实践
- 查看 [data-model.md](./data-model.md) 了解状态管理架构
- 查看 [spec.md](./spec.md) 了解完整的功能需求

---

## 获取帮助

- 架构文档: `docs/architecture/`
- 项目宪章: `.specify/memory/constitution.md`
- 提交 Issue: GitHub Issues
