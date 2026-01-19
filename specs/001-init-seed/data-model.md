# Data Model: @terence/seed 初始化脚手架搭建

**Feature**: 001-init-seed
**Date**: 2026-01-19
**Status**: ✅ COMPLETE

本文档描述 seed 项目的数据模型和实体定义。

---

## 说明

@terence/seed 是一个脚手架项目,用于搭建符合 Terence 三层架构规范的 React 应用基础环境。

本项目本身**不包含特定的业务数据模型**,因为:
1. 业务逻辑由 @terence/core 定义
2. 业务状态由 core 的 Engine 管理
3. seed 只负责组合使用 core 和 ui

但是,seed 项目需要定义一���**项目级的 UI 状态模型**,用于管理跨页面的 UI 状态。

---

## UI 状态模型

### Store: useUIStore

**职责**: 管理跨页面的 UI 状态,**不包含业务状态**

**存储位置**: `src/stores/useUIStore.js`

**数据结构**:

```javascript
{
  // Modal 状态
  modal: {
    visible: boolean,      // 是否可见
    content: ReactNode | null,  // 内容
    title: string | null,  // 标题
    onOk: (() => void) | null,  // 确认回调
    onCancel: (() => void) | null,  // 取消回调
  },

  // Drawer 状态
  drawer: {
    visible: boolean,
    content: ReactNode | null,
    title: string | null,
    placement: 'left' | 'right' | 'top' | 'bottom',
  },

  // 用户信息 (如需要)
  user: {
    id: string | null,
    name: string | null,
    email: string | null,
    permissions: string[] | null,
  } | null,

  // 全局加载状态
  loading: {
    global: boolean,
    page: boolean,
  },

  // 主题状态
  theme: {
    mode: 'light' | 'dark',
  }
}
```

**Actions**:

```javascript
// Modal actions
setModal(modal: Partial<ModalState>): void
openModal(config: { content, title, onOk, onCancel }): void
closeModal(): void

// Drawer actions
setDrawer(drawer: Partial<DrawerState>): void
openDrawer(config: { content, title, placement }): void
closeDrawer(): void

// User actions
setUser(user: UserState | null): void
clearUser(): void

// Loading actions
setGlobalLoading(loading: boolean): void
setPageLoading(loading: boolean): void

// Theme actions
setThemeMode(mode: 'light' | 'dark'): void
toggleTheme(): void
```

**持久化策略**:
- 使用 Zustand persist 中间件
- 只持久化 `user` 和 `theme.mode`
- `modal`、`drawer`、`loading` 不持久化

---

## 页面状态模型

### Page: HomePage

**职责**: 首页,展示应用概览

**状态来源**: @terence/core 的 Engine (如果使用)

**本地 UI 状态**: 无

---

### Page: ExamplePage

**职责**: 示例页面,展示如何使用 core 和 ui

**状态来源**:
- @terence/core 的 Engine (业务状态)
- useUIStore (UI 状态)

**本地 UI 状态**: 无 (或使用 useState 管理组件内部状态)

---

## 数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                         Page Layer                          │
│  (负责 Engine 生命周期、业务组合、路由)                        │
├─────────────────────────────────────────────────────────────┤
│  - 创建 Engine 实例                                           │
│  - 订阅 engine.state                                          │
│  - 调用 engine.actions (通过 adapter)                         │
│  - 使用 useUIStore 管理 UI 状态                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ 直接使用
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                             │
│  (@terence/ui - 组件、adapters)                               │
├─────────────────────────────────────────────────────────────┤
│  - Adapter: 调用 engine.actions,订阅 state,转换数据            │
│  - View: 纯展示,渲染 antd 组件                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Adapter 层交互
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Core Layer                           │
│  (@terence/core - engines, services, guards)                 │
├─────────────────────────────────────────────────────────────┤
│  - Engine: 持有业务状态,暴露 actions                           │
│  - Guard: 校验业务规则                                         │
│  - Service: 纯业务服务                                         │
└─────────────────────────────────────────────────────────────┘

                           │
                           │ Zustand (仅 UI 状态)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     UI State Store                           │
│  (useUIStore - 跨页面 UI 状态)                                 │
├─────────────────────────────────────────────────────────────┤
│  - Modal 状态                                                 │
│  - Drawer 状态                                                │
│  - 用户信息                                                   │
│  - 主题状态                                                   │
└─────────────────────────────────────────────────────────────┘
```

**关键原则**:
1. ✅ 页面可以直接使用 Engine 和 useUIStore
2. ✅ UI 组件通过 Adapter 访问 Engine
3. ❌ 禁止 useUIStore 存储 Engine 状态
4. ❌ 禁止 UI 组件直接访问 Engine

---

## 状态生命周期

### Engine 实例生命周期

```javascript
function ExamplePage() {
  const [engine, setEngine] = useState(null)

  // 1. 创建 Engine
  useEffect(() => {
    const orderEngine = createOrderEngine({ /* 初始状态 */ })
    setEngine(orderEngine)

    // 2. 清理 Engine
    return () => {
      orderEngine.destroy() // 如果需要
    }
  }, [])

  // 3. 订阅状态
  const state = engine?.state

  // 4. 调用 actions (通过 adapter)
  const handleSubmit = () => {
    adapter.submitOrder() // adapter 内部调用 engine.actions.submit()
  }

  return <OrderFormView state={state} onSubmit={handleSubmit} />
}
```

### UI 状态生命周期

```javascript
function App() {
  // UI 状态全局存在,随应用创建而创建
  const { theme, setThemeMode } = useUIStore()

  return (
    <ConfigProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <Routes />
    </ConfigProvider>
  )
}
```

---

## 总结

| 模型类型 | 存储位置 | 职责 | 示例 |
|---------|---------|------|------|
| **业务状态** | @terence/core Engine | 业务逻辑、规则、流转 | 订单状态、商品列表 |
| **UI 状态** | Zustand useUIStore | 跨页面 UI 状态 | Modal、Drawer、用户信息 |
| **本地 UI 状态** | React useState | 组件内部 UI 状态 | 表单输入、折叠面板 |
| **路由状态** | React Router | 页面导航 | 当前路径、history |

**架构边界**:
- ✅ 业务状态在 Core
- ✅ UI 状态在 Zustand (仅跨页面)
- ✅ 本地状态在组件内部
- ✅ 路由状态在 Router
- ❌ 禁止 Zustand 存储 Core 状态
