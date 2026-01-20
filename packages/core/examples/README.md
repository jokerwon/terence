# @terence/core Examples

本目录包含 Core 层的使用示例和演示代码。

## 示例列表

### 1. LoginForm.jsx

演示如何使用 Adapter 将 Engine 集成到 React 组件。

**文件**: `LoginForm.jsx`

**功能**:
- 展示 Adapter 的使用方式
- 展示 Engine 与 React 的集成
- 完整的登录表单实现

**运行**:
```jsx
import { LoginForm } from '@terence/core/examples/LoginForm.jsx'

// 在你的 React 应用中使用
<Form />
```

**关键点**:
- Adapter 已从 Core 层迁移到 UI 层
- 使用 `@terence/ui/hooks/adapters` 而不是 `@terence/core/adapters`
- Engine 保持在 Core 层 (`@terence/core/engines`)

## 架构说明

### 双轨模型

Core 层采用双轨模型：

**Track A: Stateless Core** (默认轨道)
```
stateless/login/
├── rules.js      # 业务规则纯函数
├── flows.js      # 业务流程
└── contracts.js  # 副作用契约
```

**Track B: Stateful Engine** (受限轨道)
```
engines/login/
├── engine.js        # 核心状态机
├── commands.js      # 命令
├── rules.js         # 规则
└── state.js         # 状态
```

### Adapter 模式

Adapter 是 UI 层和 Core 层之间的桥梁：

```
UI Layer (packages/ui)
├── hooks/adapters/
│   └── createReactAdapter.js  ← Adapter 工厂函数
└── components/
    └── LoginForm.jsx           ← UI 组件

Core Layer (packages/core)
├── engines/                     ← Engine 实现
│   └── login/
└── stateless/                   ← Stateless Core
    └── login/
```

## 使用示例

### 使用 Stateless Core

```javascript
import { submitLogin, loginEffectsContract } from '@terence/core/stateless/login'

// 实现副作用
const effects = {
  login: async (form) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(form),
    })
    return response.json()
  },
  saveToken: (token) => localStorage.setItem('token', token),
  navigate: (path) => (window.location.href = path),
}

// 使用流程
async function handleLogin(form) {
  try {
    const result = await submitLogin(form, effects)
    console.log('登录成功', result)
  } catch (error) {
    if (error.message === 'LOGIN_INVALID') {
      alert('请填写完整的登录信息')
    }
  }
}
```

### 使用 Stateful Engine

```javascript
import { createLoginEngine } from '@terence/core/engines/login/index.js'
import { createReactAdapter } from '@terence/ui/hooks/adapters/index.js'

// 创建 Engine
const engine = createLoginEngine({
  loginRequest: async (payload) => { /* ... */ },
  saveToken: (token) => { /* ... */ },
  clearToken: () => { /* ... */ },
  navigate: (path) => { /* ... */ },
})

// 创建 Adapter Hook
const useLogin = createReactAdapter(engine)

// 在组件中使用
function LoginForm() {
  const { state, commands, rules } = useLogin()
  return (
    <form onSubmit={() => commands.submit()}>
      <input value={state.username} onChange={(e) => commands.setUsername(e.target.value)} />
      <button disabled={!rules.canSubmit()}>登录</button>
    </form>
  )
}
```

## 更多示例

随着项目的发展，这里将添加更多示例：

- [ ] 订单流程 Engine (order-engine)
- [ ] 表单验证 (validation)
- [ ] 数据转换工具
- [ ] 复杂状态管理示例

## 贡献示例

如果你有好的示例想要分享，欢迎提交 PR！

**要求**:
- 遵循架构规范
- 包含完整注释
- 提供 README 说明
- 通过 ESLint 检查
- 有对应的测试
