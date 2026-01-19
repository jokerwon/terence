# Quickstart Guide: Core 业务内核

**Feature**: 001-init-core
**Target Audience**: Core 开发者
**Time to Complete**: 30 分钟
**Date**: 2026-01-19

## 目录

1. [快速开始](#快速开始)
2. [创建第一个 Engine](#创建第一个-engine)
3. [使用 React Adapter](#使用-react-adapter)
4. [编写测试](#编写测试)
5. [常见问题](#常见问题)
6. [最佳实践](#最佳实践)

---

## 快速开始

本指南将带你创建一个完整的登录业务引擎,包括:
- Engine 状态管理
- 业务命令 (Commands)
- 业务规则 (Rules)
- 依赖注入 (Dependencies)
- React Adapter 集成
- 单元测试

**前置要求**:
- 熟悉 JavaScript (ES2022+)
- 了解 React Hooks
- 理解依赖注入概念
- 阅读过 `docs/architecture/core.md`

---

## 创建第一个 Engine

### Step 1: 定义 State 结构

首先创建 `state.js`,定义初始状态:

```javascript
// packages/core/engines/login/state.js

/**
 * 初始化登录状态
 * @returns {LoginState} 初始状态
 */
export function initialState() {
  return {
    username: '',
    password: '',
    status: 'idle', // idle | editing | submitting | success | error
    error: null,
    token: null,
    user: null
  };
}
```

### Step 2: 定义 Dependencies 契约

创建 `effects.js`,声明副作用接口:

```javascript
// packages/core/engines/login/effects.js

/**
 * @typedef {Object} LoginDependencies
 * @property {function(payload: LoginPayload): Promise<LoginResult>} loginRequest - 登录 API 请求
 * @property {function(token: string): void} saveToken - 保存 token
 * @property {function(): void} clearToken - 清除 token
 * @property {function(path: string): void} navigate - 导航
 */

// 开发模式 Mock 工厂
export function createMockDeps(overrides = {}) {
  return {
    loginRequest: async () => ({
      token: 'mock-token',
      user: { id: '1', name: 'Test User', email: 'test@example.com' }
    }),
    saveToken: () => {},
    clearToken: () => {},
    navigate: () => {},
    ...overrides
  };
}
```

### Step 3: 实现 Commands

创建 `commands.js`,实现业务动作:

```javascript
// packages/core/engines/login/commands.js

import { invariant } from '@terence/core/utils/invariant';

export function createCommands(deps, getState, setState) {
  return {
    /**
     * 设置用户名
     * @param {string} value - 用户名
     */
    setUsername(value) {
      invariant(typeof value === 'string', 'Username must be a string');
      setState(state => ({
        ...state,
        username: value,
        status: 'editing'
      }));
    },

    /**
     * 设置密码
     * @param {string} value - 密码
     */
    setPassword(value) {
      invariant(typeof value === 'string', 'Password must be a string');
      invariant(value.length >= 6, 'Password must be at least 6 characters');

      setState(state => ({
        ...state,
        password: value,
        status: 'editing'
      }));
    },

    /**
     * 提交登录
     */
    async submit() {
      const state = getState();

      // 参数校验
      invariant(state.username.trim().length > 0, 'Username is required');
      invariant(state.password.length >= 6, 'Password must be at least 6 characters');

      // 更新状态
      setState({
        ...state,
        status: 'submitting',
        error: null
      });

      try {
        // 调用副作用
        const result = await deps.loginRequest({
          username: state.username,
          password: state.password
        });

        // 更新状态为成功
        setState({
          ...state,
          status: 'success',
          token: result.token,
          user: result.user
        });

        // 触发后续副作用
        deps.saveToken(result.token);
        deps.navigate('/dashboard');

      } catch (error) {
        // 更新状态为错误
        setState({
          ...state,
          status: 'error',
          error: error.message
        });
      }
    },

    /**
     * 重置状态
     */
    reset() {
      setState({
        username: '',
        password: '',
        status: 'idle',
        error: null,
        token: null,
        user: null
      });
    }
  };
}
```

### Step 4: 实现 Rules

创建 `rules.js`,实现业务规则:

```javascript
// packages/core/engines/login/rules.js

export function createRules(getState) {
  return {
    /**
     * 是否可以提交
     * @returns {boolean}
     */
    canSubmit() {
      const state = getState();
      return (
        state.username.trim().length > 0 &&
        state.password.length >= 6 &&
        state.status !== 'submitting'
      );
    },

    /**
     * 是否正在提交
     * @returns {boolean}
     */
    isSubmitting() {
      return getState().status === 'submitting';
    },

    /**
     * 是否有错误
     * @returns {boolean}
     */
    hasError() {
      return getState().status === 'error';
    },

    /**
     * 是否已登录
     * @returns {boolean}
     */
    isAuthenticated() {
      return getState().status === 'success';
    },

    /**
     * 获取错误消息
     * @returns {string}
     */
    getErrorMessage() {
      const state = getState();
      return state.error || '';
    }
  };
}
```

### Step 5: 组装 Engine

创建 `engine.js`,组装完整的 Engine:

```javascript
// packages/core/engines/login/engine.js

import { StateContainer } from '@terence/core/utils/StateContainer';
import { initialState } from './state.js';
import { createCommands } from './commands.js';
import { createRules } from './rules.js';

/**
 * 创建登录引擎
 * @param {LoginDependencies} deps - 依赖注入
 * @returns {LoginEngine}
 */
export function createLoginEngine(deps) {
  // 创建状态容器
  const container = new StateContainer(initialState());

  // 创建 commands 和 rules
  const commands = createCommands(
    deps,
    () => container.getState(),
    (updater) => container.setState(updater)
  );

  const rules = createRules(() => container.getState());

  // 返回 Engine 接口
  return {
    getState: () => container.getState(),
    subscribe: (listener) => container.subscribe(listener),
    commands,
    rules
  };
}
```

### Step 6: 导出 Engine

创建 `index.js`,对外暴露 Engine:

```javascript
// packages/core/engines/login/index.js

export { createLoginEngine } from './engine.js';
export { initialState } from './state.js';
export { createMockDeps } from './effects.js';
```

---

## 使用 React Adapter

### Step 1: 创建通用 Adapter

创建 `packages/core/adapters/react/createAdapter.js`:

```javascript
import { useSyncExternalStore } from 'react';

export function createReactAdapter(engine) {
  const subscribeCache = new WeakMap();
  const selectorCache = new WeakMap();

  return function useEngine(selector = (state) => state) {
    // 缓存订阅函数
    let subscribe = subscribeCache.get(engine);
    if (!subscribe) {
      subscribe = (callback) => engine.subscribe(callback);
      subscribeCache.set(engine, subscribe);
    }

    // 缓存 selector
    let getSnapshot = selectorCache.get(selector);
    if (!getSnapshot) {
      getSnapshot = () => selector(engine.getState());
      selectorCache.set(selector, getSnapshot);
    }

    // 使用 useSyncExternalStore
    const state = useSyncExternalStore(
      subscribe,
      getSnapshot,
      () => selector(engine.getInitialState?.() || engine.getState())
    );

    return {
      state,
      commands: engine.commands,
      rules: engine.rules
    };
  };
}
```

### Step 2: 创建登录 Hook

创建 `packages/core/adapters/react/useLogin.js`:

```javascript
import { createReactAdapter } from './createAdapter.js';
import { loginEngine } from '@terence/core/engines/login';

export const useLogin = createReactAdapter(loginEngine);
```

### Step 3: 在组件中使用

```javascript
import { useLogin } from '@terence/core/adapters/react';

function LoginForm() {
  const { state, commands, rules } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await commands.submit();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={state.username}
        onChange={(e) => commands.setUsername(e.target.value)}
        placeholder="Username"
      />

      <input
        type="password"
        value={state.password}
        onChange={(e) => commands.setPassword(e.target.value)}
        placeholder="Password"
      />

      {rules.hasError() && (
        <div className="error">{rules.getErrorMessage()}</div>
      )}

      <button type="submit" disabled={!rules.canSubmit() || rules.isSubmitting()}>
        {rules.isSubmitting() ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## 编写测试

### Step 1: 创建测试文件

创建 `packages/core/tests/engines/login.test.js`:

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLoginEngine, createMockDeps } from '@terence/core/engines/login';

describe('LoginEngine', () => {
  let mockDeps;
  let engine;

  beforeEach(() => {
    // 创建 Mock 依赖
    mockDeps = createMockDeps({
      loginRequest: vi.fn()
    });

    // 创建 Engine
    engine = createLoginEngine(mockDeps);
  });

  describe('initialization', () => {
    it('should have correct initial state', () => {
      const state = engine.getState();
      expect(state).toMatchObject({
        username: '',
        password: '',
        status: 'idle',
        error: null,
        token: null,
        user: null
      });
    });
  });

  describe('commands', () => {
    it('should set username', () => {
      engine.commands.setUsername('user@example.com');

      expect(engine.getState().username).toBe('user@example.com');
      expect(engine.getState().status).toBe('editing');
    });

    it('should set password with valid length', () => {
      engine.commands.setPassword('password123');

      expect(engine.getState().password).toBe('password123');
      expect(engine.getState().status).toBe('editing');
    });

    it('should reject short password', () => {
      expect(() => engine.commands.setPassword('short')).toThrow();
    });

    it('should submit login successfully', async () => {
      mockDeps.loginRequest.mockResolvedValue({
        token: 'token-123',
        user: { id: '1', name: 'Test User' }
      });

      engine.commands.setUsername('user@example.com');
      engine.commands.setPassword('password123');

      await engine.commands.submit();

      expect(mockDeps.loginRequest).toHaveBeenCalledWith({
        username: 'user@example.com',
        password: 'password123'
      });

      expect(engine.getState().status).toBe('success');
      expect(engine.getState().token).toBe('token-123');
      expect(mockDeps.saveToken).toHaveBeenCalledWith('token-123');
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      mockDeps.loginRequest.mockRejectedValue(error);

      engine.commands.setUsername('user@example.com');
      engine.commands.setPassword('password123');

      await expect(engine.commands.submit()).rejects.toThrow(error);

      expect(engine.getState().status).toBe('error');
      expect(engine.getState().error).toBe('Invalid credentials');
    });
  });

  describe('rules', () => {
    it('should validate canSubmit correctly', () => {
      expect(engine.rules.canSubmit()).toBe(false);

      engine.commands.setUsername('user@example.com');
      expect(engine.rules.canSubmit()).toBe(false);

      engine.commands.setPassword('password123');
      expect(engine.rules.canSubmit()).toBe(true);
    });

    it('should validate isAuthenticated correctly', () => {
      expect(engine.rules.isAuthenticated()).toBe(false);

      mockDeps.loginRequest.mockResolvedValue({
        token: 'token-123',
        user: { id: '1' }
      });

      engine.commands.setUsername('user');
      engine.commands.setPassword('password123');
      await engine.commands.submit();

      expect(engine.rules.isAuthenticated()).toBe(true);
    });
  });

  describe('subscription', () => {
    it('should notify listeners on state change', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      engine.commands.setUsername('newuser');

      expect(listener).toHaveBeenCalled();
    });
  });
});
```

### Step 2: 运行测试

```bash
npm test packages/core/tests/engines/login.test.js
```

---

## 常见问题

### Q1: Engine 可以在 Node 环境运行吗?

**A**: 可以。Engine 不依赖任何浏览器 API,可以在 Node 环境独立运行:

```javascript
// Node.js 脚本
import { createLoginEngine, createMockDeps } from '@terence/core/engines/login';

const engine = createLoginEngine(createMockDeps());

engine.commands.setUsername('user');
engine.commands.setPassword('password123');

console.log(engine.getState()); // { username: 'user', password: 'password123', ... }
```

### Q2: 如何处理异步副作用?

**A**: 在 Command 中使用 async/await:

```javascript
async submit() {
  const state = getState();

  setState({ ...state, status: 'submitting' });

  try {
    const result = await deps.loginRequest(payload);
    setState({ ...state, status: 'success', data: result });
  } catch (error) {
    setState({ ...state, status: 'error', error: error.message });
  }
}
```

### Q3: 如何实现选择性订阅?

**A**: 使用 selector 参数:

```javascript
// 只订阅 username
const username = useLogin(state => state.username);

// 只订阅特定规则
const canSubmit = useLogin(state => state.rules.canSubmit());

// 订阅多个状态
const { username, status } = useLogin(state => ({
  username: state.username,
  status: state.status
}));
```

### Q4: 如何测试 Engine?

**A**: 使用 Vitest 和 Mock Deps:

```javascript
import { createLoginEngine, createMockDeps } from '@terence/core/engines/login';
import { vi } from 'vitest';

const mockDeps = createMockDeps({
  loginRequest: vi.fn().mockResolvedValue({ token: 'xxx' })
});

const engine = createLoginEngine(mockDeps);

// 测试...
```

### Q5: ESLint 报错 "no-restricted-imports"?

**A**: 确保在 `packages/core/engines/**` 目录下没有导入以下模块:
- react
- zustand
- antd
- @terence/ui

这些是架构约束,Engine 层严禁依赖 UI 库。

### Q6: 如何实现状态持久化?

**A**: 状态持久化应该通过 Dependencies 实现,而非在 Engine 内部:

```javascript
// ❌ 错误: 在 Engine 内部直接使用 localStorage
async submit() {
  localStorage.setItem('token', token); // 违反架构原则
}

// ✅ 正确: 通过依赖注入
async submit() {
  const result = await deps.loginRequest(payload);
  deps.saveToken(result.token); // 由外部实现
}
```

---

## 最佳实践

### 1. 保持 State 简单

State 只包含业务数据,不包含 UI 状态:

```javascript
// ✅ 好的 State
{
  username: '',
  password: '',
  status: 'idle',
  error: null
}

// ❌ 不好的 State (包含 UI 状态)
{
  username: '',
  password: '',
  status: 'idle',
  error: null,
  isButtonDisabled: true,  // UI 状态,应由 rules.canSubmit() 计算
  buttonText: '登录',       // UI 文本,不应在 Engine 中
  isLoadingText: '登录中...' // UI 文本,不应在 Engine 中
}
```

### 2. Command 只做一件事

每个 Command 应该专注于一个业务动作:

```javascript
// ✅ 好的 Command: 职责单一
commands.setUsername('user');
commands.setPassword('pass');
commands.submit();

// ❌ 不好的 Command: 职责混乱
commands.loginAndSaveTokenAndNavigate('user', 'pass');
```

### 3. Rule 必须是纯函数

Rules 不应该有副作用:

```javascript
// ✅ 好的 Rule: 纯函数
canSubmit() {
  const state = getState();
  return state.username.length > 0 && state.password.length >= 6;
}

// ❌ 不好的 Rule: 有副作用
canSubmit() {
  const state = getState();
  if (state.username.length === 0) {
    console.log('Username required'); // 副作用!
    return false;
  }
  return true;
}
```

### 4. 使用 JSDoc 提供类型提示

```javascript
/**
 * 设置用户名
 * @param {string} value - 用户名(邮箱格式)
 * @throws {Error} 如果 value 不是字符串
 */
setUsername(value) {
  // ...
}
```

### 5. 编写完整的测试

确保覆盖所有 Command 和 Rule:

```javascript
describe('LoginEngine', () => {
  // State 初始化
  // 每个 Command
  // 每个 Rule
  // 错误处理
  // 订阅机制
});
```

### 6. 遵循架构边界

- Engine 不依赖 React/antd/zustand
- Adapter 不包含业务逻辑
- View 不直接访问 Engine

---

## 下一步

恭喜!你已经学会了如何创建一个完整的 Engine。接下来:

1. 阅读 `docs/architecture/core.md` 了解更多架构细节
2. 查看 `packages/core/tests/engines/login.test.js` 了解更多测试技巧
3. 创建你自己的 Engine

---

**References**:
- [Core 业务内核详细设计文档](../../docs/architecture/core.md)
- [Research Report](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)
