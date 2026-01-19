# Data Model: Core 业务内核

**Feature**: 001-init-core
**Date**: 2026-01-19
**Status**: Phase 1 - Design Artifacts

## Overview

本文档定义了 Core 业务内核的核心数据模型,包括 Engine 实体、Adapter 实体和依赖注入契约。这些模型基于 Phase 0 的研究成果,遵循 Terence Project Constitution 的架构原则。

---

## 1. Engine 实体模型

Engine 是业务逻辑的核心抽象,负责管理业务状态、提供业务动作和业务规则判断。

### 1.1 Engine 标准接口

每个 Engine 必须实现以下接口:

```javascript
/**
 * @typedef {Object} Engine
 * @property {function(): State} getState - 获取当前业务状态(不可变)
 * @property {function(listener: Function): Function} subscribe - 订阅状态变化,返回取消订阅函数
 * @property {Commands} commands - 业务动作集合
 * @property {Rules} rules - 业务规则集合
 */
```

### 1.2 State 结构

State 是业务的**真实状态**,而非 UI 投影。必须满足:
- 可序列化
- 可完整描述业务当前所处阶段
- 不包含 UI 相关状态(如 loading text、button disabled)

#### 示例: LoginEngine State

```javascript
/**
 * @typedef {Object} LoginState
 * @property {string} username - 用户名输入
 * @property {string} password - 密码输入
 * @property {'idle'|'submitting'|'success'|'error'} status - 登录状态
 * @property {Error|null} error - 错误信息
 * @property {string|null} token - 登录成功后的 token
 * @property {User|null} user - 登录成功后的用户信息
 */
```

### 1.3 Commands 接口

Commands 表示"业务试图发生一次变化",是状态修改的唯一入口。

#### Command 特征
- 允许修改 state
- 允许调用 deps
- 不允许返回 UI 信息
- 失败时抛出明确的 Error

#### 示例: LoginEngine Commands

```javascript
/**
 * @typedef {Object} LoginCommands
 * @property {function(value: string): void} setUsername - 设置用户名
 * @property {function(value: string): void} setPassword - 设置密码
 * @property {function(): Promise<void>} submit - 提交登录
 * @property {function(): void} reset - 重置登录状态
 */
```

### 1.4 Rules 接口

Rules 用于回答业务层判断问题,必须是纯函数。

#### Rule 特征
- 纯函数,无副作用
- 只依赖 state
- 不修改 state
- 返回 boolean 或简单值

#### 示例: LoginEngine Rules

```javascript
/**
 * @typedef {Object} LoginRules
 * @property {function(): boolean} canSubmit - 是否可以提交登录
 * @property {function(): boolean} isSubmitting - 是否正在提交
 * @property {function(): boolean} hasError - 是否有错误
 * @property {function(): boolean} isAuthenticated - 是否已登录
 */
```

### 1.5 副作用接口 (Dependencies)

Engine 通过依赖注入的方式执行副作用,不在内部直接使用 fetch/axios 等。

#### 示例: LoginEngine Dependencies

```javascript
/**
 * @typedef {Object} LoginDependencies
 * @property {function(payload: LoginPayload): Promise<LoginResult>} loginRequest - 登录 API 请求
 * @property {function(token: string): void} saveToken - 保存 token 到应用状态
 * @property {function(): void} clearToken - 清除 token
 * @property {function(path: string): void} navigate - 页面导航
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} username - 用户名
 * @property {string} password - 密码
 */

/**
 * @typedef {Object} LoginResult
 * @property {string} token - 认证 token
 * @property {User} user - 用户信息
 */
```

---

## 2. Adapter 实体模型

Adapter 是连接 UI 和 Engine 的桥梁,负责订阅 Engine 状态并暴露给 React 组件。

### 2.1 React Adapter 标准接口

```javascript
/**
 * @typedef {Function} UseEngine
 * @property {function(selector?: function(State): any): EngineHookResult} useEngine - React Hook
 */

/**
 * @typedef {Object} EngineHookResult
 * @property {State} state - 当前业务状态
 * @property {Commands} commands - 业务动作
 * @property {Rules} rules - 业务规则
 */
```

### 2.2 createReactAdapter 工厂函数

```javascript
/**
 * 创建 React Adapter
 * @param {Engine} engine - 业务引擎实例
 * @returns {UseEngine} React Hook
 *
 * @example
 * const useLogin = createReactAdapter(loginEngine);
 *
 * function LoginForm() {
 *   const { state, commands, rules } = useLogin();
 *   return (
 *     <form onSubmit={() => commands.submit()}>
 *       <input value={state.username} onChange={(e) => commands.setUsername(e.target.value)} />
 *       <button disabled={!rules.canSubmit()}>登录</button>
 *     </form>
 *   );
 * }
 */
export function createReactAdapter(engine) {
  // 实现参见 research.md
}
```

### 2.3 Adapter 职责边界

#### 允许做的事情
- ✅ 订阅 engine.state
- ✅ 调用 engine.commands
- ✅ 调用 engine.rules
- ✅ 转换数据结构(如表单值 ↔ 业务结构)

#### 禁止做的事情
- ❌ 判断业务是否合法
- ❌ 推断业务流程
- ❌ 修改业务状态结构
- ❌ 引入业务逻辑

---

## 3. 数据流转模型

### 3.1 单向数据流

```
┌─────────────┐
│  UI Layer   │  (React Components)
└──────┬──────┘
       │ 1. 用户操作
       ↓
┌─────────────┐
│  Adapter    │  (createReactAdapter)
└──────┬──────┘
       │ 2. 调用 command
       ↓
┌─────────────┐
│   Engine    │  (Business Logic)
└──────┬──────┘
       │ 3. 调用 deps (副作用)
       ↓
┌─────────────┐
│  Side Effects│ (API, Storage, Router)
└──────┬──────┘
       │ 4. 返回结果
       ↓
┌─────────────┐
│   Engine    │  (更新 state)
└──────┬──────┘
       │ 5. 通知订阅者
       ↓
┌─────────────┐
│  Adapter    │  (useSyncExternalStore)
└──────┬──────┘
       │ 6. 触发 React 重渲染
       ↓
┌─────────────┐
│  UI Layer   │  (显示新状态)
└─────────────┘
```

### 3.2 订阅-发布机制

```javascript
// 1. Engine 维护订阅者列表
class StateContainer {
  constructor(initialState) {
    this._state = initialState;
    this._listeners = new Set(); // 订阅者集合
  }

  // 2. 订阅状态变化
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener); // 返回取消订阅函数
  }

  // 3. 状态更新时通知所有订阅者
  _notify() {
    const currentState = this.getState();
    this._listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Listener error:', err);
      }
    });
  }
}

// 4. React Adapter 使用 useSyncExternalStore
function useEngine(selector) {
  return useSyncExternalStore(
    engine.subscribe,  // 订阅函数
    () => selector(engine.getState()),  // 获取快照
    () => selector(initialState)  // SSR 快照
  );
}
```

---

## 4. 状态转换模型

### 4.1 状态转换图 (以 LoginEngine 为例)

```
          ┌─────────┐
          │  idle   │  (初始状态)
          └────┬────┘
               │ commands.setUsername()
               │ commands.setPassword()
               ↓
          ┌─────────┐
          │ editing │  (用户输入中)
          └────┬────┘
               │ commands.submit()
               │ rules.canSubmit() === true
               ↓
          ┌─────────┐
          │submitting│ (正在提交)
          └────┬────┘
               │
        ┌──────┴──────┐
        │             │
    成功 │             │ 失败
        │             │
        ↓             ↓
   ┌─────────┐   ┌─────────┐
   │ success │   │  error  │
   └────┬────┘   └────┬────┘
        │             │
        │             │ commands.reset()
        │             ↓
        │        ┌─────────┐
        │        │  idle   │
        │        └─────────┘
        │
        │ deps.saveToken()
        │ deps.navigate()
        ↓
   (应用状态更新)
```

### 4.2 状态不可变性

Engine 必须保证状态不可变:

```javascript
// ✅ 正确: 返回状态副本
getState() {
  return this._immutableCopy(this._state);
}

// ❌ 错误: 直接返回内部状态
getState() {
  return this._state;  // 外部可能修改状态
}
```

---

## 5. 错误处理模型

### 5.1 错误分类

| 错误类型 | 处理位置 | 处理方式 |
|---------|---------|---------|
| 参数校验错误 | Engine (Command 开始处) | 立即抛出 Error,不修改 state |
| 业务规则错误 | Engine (Guard 检查) | 抛出明确错误消息 |
| 副作用��行错误 | Engine (try-catch) | 更新 state.error,由 Adapter 展示 |
| 状态不一致 | Engine (Invariant) | 抛出 Error,开发模式警告 |

### 5.2 错误处理流程

```javascript
async function submit(username, password) {
  // 1. 参数校验
  if (!username || !password) {
    throw new Error('[Invariant Failed] Username and password are required');
  }

  // 2. 业务规则校验
  if (!this._validatePassword(password)) {
    throw new Error('Password format invalid');
  }

  // 3. 更新状态为 submitting
  this._state = { ...this._state, status: 'submitting', error: null };
  this._notify();

  try {
    // 4. 执行副作用
    const result = await this._deps.loginRequest({ username, password });

    // 5. 更新状态为 success
    this._state = {
      ...this._state,
      status: 'success',
      token: result.token,
      user: result.user
    };
    this._notify();

    // 6. 触发后续副作用
    this._deps.saveToken(result.token);
    this._deps.navigate('/dashboard');

  } catch (error) {
    // 7. 更新状态为 error
    this._state = {
      ...this._state,
      status: 'error',
      error: error.message
    };
    this._notify();
  }
}
```

---

## 6. 性能模型

### 6.1 性能目标

| 指标 | 目标值 | 测量方法 |
|-----|-------|---------|
| 状态更新延迟 | < 1ms | performance.now() |
| Adapter 订阅延迟 | < 5ms | React DevTools Profiler |
| 内存占用 | < 1MB per Engine | Chrome Memory Profiler |
| 订阅者数量 | 无限 | Set 数据结构 |

### 6.2 性能优化策略

#### 6.2.1 选择性订阅

```javascript
// ❌ 订阅整个状态(不必要的重渲染)
const state = useLogin();

// ✅ 只订阅需要的状态
const username = useLogin(state => state.username);
const canSubmit = useLogin(state => state.rules.canSubmit());
```

#### 6.2.2 批量更新

```javascript
// Engine 支持批量更新
engine.batch(() => {
  engine.commands.setUsername('user');
  engine.commands.setPassword('pass');
  engine.commands.setRememberMe(true);
});
// 只触发一次通知
```

#### 6.2.3 记忆化

```javascript
// 使用 React.memo 避免不必要的重渲染
const SubmitButton = React.memo(({ canSubmit, onSubmit }) => {
  return <button disabled={!canSubmit} onClick={onSubmit}>登录</button>;
});
```

---

## 7. 扩展性模型

### 7.1 Engine 组合

当业务复杂时,可以将多个 Engine 组合使用:

```javascript
// 组合多个 Engine
function useCheckout() {
  const cart = useCartEngine();
  const payment = usePaymentEngine();
  const shipping = useShippingEngine();

  return {
    state: { cart, payment, shipping },
    commands: { cart, payment, shipping },
    rules: {
      canCheckout: () => cart.rules.isValid() &&
                        payment.rules.isValid() &&
                        shipping.rules.isValid()
    }
  };
}
```

### 7.2 中间件扩展 (可选)

如果需要更高级的功能(如日志、时间旅行),可以添加中间件机制:

```javascript
class Engine {
  use(middleware) {
    this._middleware.push(middleware);
  }

  _applyMiddleware(action) {
    let chain = this._middleware.map(m => m(this));
    return chain.reduce((acc, middleware) => middleware(acc), action);
  }
}
```

---

## 8. 验证规则

### 8.1 State 验证

- ✅ State 可序列化 (JSON.stringify)
- ✅ State 不包含函数
- ✅ State 不包含循环引用
- ✅ State 有明确的初始值

### 8.2 Command 验证

- ✅ 所有 Command 都有 JSDoc
- ✅ 所有 Command 都进行参数校验
- ✅ 所有 Command 都抛出明确的错误
- ✅ 所有 Command 都更新 state

### 8.3 Rule 验证

- ✅ 所有 Rule 都是纯函数
- ✅ 所有 Rule 都有 JSDoc
- ✅ 所有 Rule 不修改 state
- ✅ 所有 Rule 不调用 deps

### 8.4 Dependency 验证

- ✅ 所有依赖都有 JSDoc 契约
- ✅ 所有依赖在创建 Engine 时校验
- ✅ 缺失依赖立即抛出错误
- ✅ 提供开发模式 Mock

---

## 9. 实施检查清单

在实现 Engine 时,必须满足以下检查清单:

- [ ] Engine 实现标准接口 (getState, subscribe, commands, rules)
- [ ] State 可序列化且不可变
- [ ] 所有 Command 有 JSDoc 和参数校验
- [ ] 所有 Rule 是纯函数且有 JSDoc
- [ ] 通过依赖注入执行副作用
- [ ] 提供 JSDoc 契约定义 Dependencies
- [ ] 支持在 Node 环境独立运行
- [ ] 编写单元测试覆盖所有 Command 和 Rule
- [ ] 不违反 ESLint 架构规则
- [ ] 提供使用示例代码

---

**Status**: ✅ 数据模型设计完成,可以生成 contracts 和 quickstart。
