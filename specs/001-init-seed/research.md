# Research: @terence/seed 初始化脚手架搭建

**Feature**: 001-init-seed
**Date**: 2026-01-19
**Status**: ✅ COMPLETE

本文档记录 Phase 0 研究阶段的所有技术决策和最佳实践,为 Phase 1 设计提供依据。

---

## 1. Vite 7 最佳实践

### Decision: 使用 Vite 7 作为构建工具

**Rationale**:
- Vite 7 是最新的稳定版本,提供更好的性能和开发体验
- 原生支持 ES Modules,冷启动速度快
- 与 React 19 和 Vitest 完美集成
- 丰富的插件生态系统

**Alternatives Considered**:
- Webpack 5: 配置复杂,启动速度慢,已过时
- Parcel 2: 零配置但生态不如 Vite,React 支持不如 Vite 完善

### Implementation Details

**配置要点** (`vite.config.js`):

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@terence/core': path.resolve(__dirname, '../../packages/core/src'),
      '@terence/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
        },
      },
    },
  },
})
```

**关键配置说明**:
1. **路径别名**: `@` 指向 src,简化导入路径
2. **workspace 依赖**: 使用绝对路径指向 core 和 ui,确保解析正确
3. **代码分割**: 分离 React 和 Ant Design,优化缓存
4. **sourcemap**: 生产环境也生成,便于调试

**参考文档**:
- Vite 官方文档: https://vitejs.dev/
- React 插件: https://github.com/vitejs/vite-plugin-react

---

## 2. Ant Design 6 主题定制

### Decision: 使用 ConfigProvider + Token 系统定制主题

**Rationale**:
- Ant Design 6 采用全新的 Design Token 系统
- 支持动态主题切换
- 与 CSS-in-JS 无缝集成
- 暗色模式原生支持

**Alternatives Considered**:
- CSS Variables: 兼容性问题,IE 不支持 (但本项目不考虑 IE)
- Less 变量覆盖: Ant Design 6 已弃用 Less,不推荐

### Implementation Details

**主题配置** (`src/styles/theme.js`):

```javascript
import { theme } from 'antd'

const { defaultAlgorithm, darkAlgorithm } = theme

export const lightTheme = {
  algorithm: defaultAlgorithm,
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
  },
}

export const darkTheme = {
  algorithm: darkAlgorithm,
  token: {
    colorPrimary: '#177ddc',
  },
}
```

**使用方式** (`src/App.jsx`):

```javascript
import { ConfigProvider, theme } from 'antd'

function App() {
  const { token } = theme.useToken()
  const [isDark, setIsDark] = useState(false)

  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme}>
      {/* 应用内容 */}
    </ConfigProvider>
  )
}
```

**关键特性**:
1. **动态切换**: 通过 state 控制主题
2. **Token 访问**: 使用 `theme.useToken()` 获取当前主题值
3. **组件级覆盖**: 可以在 ConfigProvider 中覆盖特定组件的 token

**参考文档**:
- Ant Design 6 主题: https://ant.design/components/theme-cn

---

## 3. Zustand 最佳实践

### Decision: Zustand v4 作为状态管理库

**Rationale**:
- 轻量级 (1KB gzip)
- 无需 Provider 包裹
- 支持 DevTools
- TypeScript 友好 (虽然本项目不用 TS)
- 简单直观的 API

**Alternatives Considered**:
- Redux Toolkit: 过于重量级,对于 UI 状态管理过于复杂
- Jotai/Recoil: 原子化状态管理,不适合本项目场景
- Context API: 性能问题,容易造成不必要的重渲染

### Implementation Details

**Store 组织** (`src/stores/useUIStore.js`):

```javascript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * UI 状态管理 Store
 *
 * 职责边界:
 * - ✅ 管理跨页面 UI 状态 (modal、drawer、sidebar)
 * - ✅ 管理用户信息和权限
 * - ❌ 禁止管理 core 业务状态
 */
export const useUIStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Modal 状态
        modal: {
          visible: false,
          content: null,
        },
        setModal: (modal) => set({ modal }, false, 'setModal'),

        // Drawer 状态
        drawer: {
          visible: false,
          content: null,
        },
        setDrawer: (drawer) => set({ drawer }, false, 'setDrawer'),

        // 用户信息 (如需要)
        user: null,
        setUser: (user) => set({ user }, false, 'setUser'),
      }),
      {
        name: 'terence-seed-ui-store', // localStorage key
        partialize: (state) => ({ user: state.user }), // 只持久化部分状态
      }
    ),
    { name: 'UIStore' }
  )
)
```

**关键要点**:
1. **职责边界**: 只管理 UI 状态,不包含 core 业务状态
2. **DevTools**: 集成 Redux DevTools,方便调试
3. **持久化**: 使用 persist 中间件,选择性持久化
4. **命名规范**: actions 使用 set 前缀,保持一致性

**在组件中使用**:

```javascript
function MyComponent() {
  const { modal, setModal } = useUIStore()

  return (
    <Button onClick={() => setModal({ visible: true, content: 'Hello' })}>
      Open Modal
    </Button>
  )
}
```

**参考文档**:
- Zustand 官方文档: https://zustand-demo.pmnd.rs/

---

## 4. ESLint 架构边界检测

### Decision: 使用 no-restricted-imports + 自定义规则

**Rationale**:
- ESLint 内置的 `no-restricted-imports` 可以禁止特定导入
- 配合 `eslint-plugin-import` 检测导入路径
- 可扩展性强,易于维护

**Alternatives Considered**:
- 自定义 ESLint 插件: 开发成本高,维护复杂
- 编译时检查: 无法覆盖所有场景

### Implementation Details

**ESLint 配置** (`.eslintrc.js`):

```javascript
export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: ['import'],
    rules: {
      // 禁止在 core 中导入 UI 相关包
      'no-restricted-imports': [
        'error',
        {
          patterns: [{
            group: ['antd', '@ant-design/*', 'react', 'react-dom'],
            message: 'Core 包不能依赖 UI 技术。请移除此导入。',
          }],
        },
      ],
      // 禁止在 ui 组件中直接使用 engine
      'no-restricted-imports': [
        'error',
        {
          patterns: [{
            group: ['@terence/core/engines/*', '@terence/core/*'],
            message: 'UI 组件不能直接访问 engine,必须通过 adapter。请使用 @terence/ui/adapters 中的 adapter。',
          }],
        },
      ],
      // 禁止 ui 组件感知路由
      'no-restricted-imports': [
        'error',
        {
          patterns: [{
            group: ['react-router-dom', '@reach/router'],
            message: 'UI 组件不能感知路由。路由逻辑必须在页面层处理。',
          }],
        },
      ],
      // 检测反向依赖
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './packages/core',
              from: './packages/ui',
              message: 'Core 包不能依赖 UI 包,违反架构边界。',
            },
            {
              target: './packages/core',
              from: './apps/seed',
              message: 'Core 包不能依赖 Seed 应用,违反架构边界。',
            },
          ],
        },
      ],
    },
  },
]
```

**分层配置** (针对不同目录):

```javascript
// packages/core/.eslintrc.js
export default [
  {
    files: ['**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['antd', '@ant-design/*'], message: 'Core 禁止 UI 依赖' },
            { group: ['react', 'react-dom'], message: 'Core 禁止 React 依赖' },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement',
          message: 'Core 包禁止使用 JSX',
        },
      ],
    },
  },
]

// packages/ui/.eslintrc.js
export default [
  {
    files: ['**/*.jsx', '**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@terence/core/engines', '@terence/core/*'],
              message: 'UI 组件必须通过 adapter 访问 core,禁止直接导入 engine',
            },
            {
              group: ['react-router-dom'],
              message: 'UI 组件不能感知路由,路由逻辑由页面层处理',
            },
          ],
        },
      ],
    },
  },
]

// apps/seed/.eslintrc.js
export default [
  {
    files: ['**/*.jsx', '**/*.js'],
    rules: {
      // Seed 可以导入 core 和 ui,但不编写业务逻辑
      // 这里主要依靠代码审查和测试来保证
    },
  },
]
```

**检测策略**:
1. **静态分析**: ESLint 在编译时检测导入路径
2. **分层配置**: 不同目录应用不同规则
3. **友好提示**: 错误信息明确说明原因和正确做法

**参考文档**:
- ESLint no-restricted-imports: https://eslint.org/docs/latest/rules/no-restricted-imports
- eslint-plugin-import: https://github.com/import-js/eslint-plugin-import

---

## 5. Vitest 配置

### Decision: Vitest 作为测试框架

**Rationale**:
- 与 Vite 配置共享,无需额外配置
- 原生支持 ESM
- 兼容 Jest API,迁移成本低
- 性能优异,并行执行

**Alternatives Considered**:
- Jest: 配置复杂,与 Vite 集成困难
- AVA: API 不如 Jest 熟悉

### Implementation Details

**Vitest 配置** (`vitest.config.js`):

```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/*.test.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@terence/core': path.resolve(__dirname, '../../packages/core/src'),
      '@terence/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
})
```

**测试设置** (`src/test/setup.js`):

```javascript
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// 扩展 expect 匹配器
expect.extend(matchers)

// 每个测试后清理
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia (Ant Design 需要)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

**示例测试** (`src/components/__tests__/Button.test.jsx`):

```javascript
import { render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    screen.getByText('Click me').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**关键要点**:
1. **jsdom 环境**: 模拟浏览器环境
2. **自动清理**: afterEach 清理,避免测试污染
3. **覆盖率**: 使用 v8 provider,准确快速
4. **全局 API**: globals: true,无需导入 describe/it/expect

**参考文档**:
- Vitest 官方文档: https://vitest.dev/
- Testing Library: https://testing-library.com/react

---

## 6. React 19 新特性

### Decision: 使用 React 19 最新特性

**Rationale**:
- 项目从零开始,可以使用最新特性
- 性能提升显著
- 开发体验更好

**关键新特性**:

1. **并发渲染 (Concurrent Rendering)**:
   - 使用 `useTransition` 标记非紧急更新
   - 使用 `useDeferredValue` 延迟非关键更新

2. **自动批处理 (Automatic Batching)**:
   - 多个 state 更新自动批处理
   - 减少不必要的重渲染

3. **use() Hook**:
   - 读取资源 (Promise/Context)
   - 简化异步数据获取

**示例** (`src/pages/Example/index.jsx`):

```javascript
import { useState, useTransition, useDeferredValue } from 'react'

function ExamplePage() {
  const [isPending, startTransition] = useTransition()
  const [input, setInput] = useState('')
  const deferredInput = useDeferredValue(input)

  const handleChange = (e) => {
    // 紧急更新:立即反映用户输入
    setInput(e.target.value)

    // 非紧急更新:可以延迟
    startTransition(() => {
      // 执行搜索等耗时操作
    })
  }

  return (
    <div>
      <input value={input} onChange={handleChange} />
      {isPending && <div>Loading...</div>}
      {/* 使用 deferredInput 进行搜索 */}
    </div>
  )
}
```

**参考文档**:
- React 19 文档: https://react.dev/blog/2024/12/05/react-19

---

## 7. 路由方案选择

### Decision: React Router v6

**Rationale**:
- 成熟稳定,社区庞大
- 与 React 19 完美兼容
- 支持 Hooks API
- 嵌套路由简单

**Alternatives Considered**:
- TanStack Router: 类型安全,但需要 TypeScript,本项目不适用
- Reach Router: 已被 React Router 取代,不再维护

### Implementation Details

**路由配置** (`src/routes/index.jsx`):

```javascript
import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '../pages/Home'
import { ExamplePage } from '../pages/Example'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'example', element: <ExamplePage /> },
    ],
  },
])
```

**在应用中使用** (`src/main.jsx`):

```javascript
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
```

**页面组件示例** (`src/pages/Home/index.jsx`):

```javascript
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={() => navigate('/example')}>Go to Example</button>
    </div>
  )
}
```

**架构边界**:
- ✅ 页面组件可以使用 `useNavigate`、`useLocation` 等 hooks
- ❌ UI 组件禁止导入 `react-router-dom`
- ❌ UI 组件禁止使用路由相关 hooks

**参考文档**:
- React Router v6: https://reactrouter.com/

---

## 8. 样式方案选择

### Decision: Tailwind CSS + Ant Design Token

**Rationale**:
- Tailwind CSS: 实用工具优先,开发效率高
- Ant Design Token: 统一设计语言
- 两者结合: 既保持一致性,又提供灵活性

**Alternatives Considered**:
- CSS Modules: 样式隔离,但类名管理复杂
- styled-components: 运行时开销,增加包体积
- 纯 CSS: 难以维护,重复代码多

### Implementation Details

**Tailwind 配置** (`tailwind.config.js`):

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 可以从 Ant Design token 派生
        primary: 'var(--ant-color-primary)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // 禁用与 Ant Design 冲突的插件
    preflight: false,
  },
}
```

**样式文件** (`src/styles/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义全局样式 */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 从 Ant Design token 派生 */
.custom-button {
  background-color: var(--ant-color-primary);
  @apply rounded px-4 py-2 text-white;
}
```

**使用示例**:

```javascript
// 使用 Tailwind 类名
<div className="flex items-center gap-4 p-4">
  {/* ... */}
</div>

// 使用 Ant Design 组件
import { Button } from 'antd'

<Button type="primary" className="mt-4">
  Submit
</Button>
```

**关键要点**:
1. **禁用 preflight**: 避免与 Ant Design 样式冲突
2. **Token 集成**: 从 CSS 变量读取 Ant Design token
3. **组合使用**: Tailwind 用于布局,Ant Design 用于组件

**参考文档**:
- Tailwind CSS: https://tailwindcss.com/
- Ant Design 样式: https://ant.design/docs/react/customize-theme-cn

---

## 技术栈总结

| 类别 | 技术选择 | 版本 | 用途 |
|------|---------|------|------|
| **构建工具** | Vite | 7.x | 开发服务器、构建 |
| **UI 框架** | React | 19.x | 组件化开发 |
| **UI 库** | Ant Design | 6.x | 企业级组件 |
| **状态管理** | Zustand | 4.x | UI 状态管理 |
| **路由** | React Router | 6.x | 前端路由 |
| **样式** | Tailwind CSS | 3.x | 工具类样式 |
| **测试** | Vitest | 1.x | 单元测试 |
| **测试工具** | Testing Library | 16.x | 组件测试 |
| **代码规范** | ESLint | 9.x | 代码检查 |

---

## 未解决问题 (N/A)

所有技术选型问题均已解决,无 NEEDS CLARIFICATION。

---

## 下一步

Phase 0 研究已完成,可以继续:
1. ✅ 生成 `data-model.md` (如果需要)
2. ✅ 生成 `quickstart.md`
3. ✅ 更新 agent 上下文
4. ✅ 进入 Phase 2: 任务分解 (`/speckit.tasks`)
