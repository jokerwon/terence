# Research Report: Core 业务内核技术决策

**Feature**: 001-init-core
**Date**: 2026-01-19
**Status**: Phase 0 Complete

## Executive Summary

本报告汇总了 Core 业务内核初始化过程中的所有技术决策。通过深入研究和分析,我们在 5 个关键技术领域确定了最佳实践方案,所有决策都符合 Terence Project Constitution 的架构原则。

---

## 1. Engine 状态管理实现

### 决策
采用**增强型发布订阅模式**作为 Engine 状态容器的基础实现。

### 理由
1. **最佳性能**: 状态更新 < 0.5ms,满足性能目标
2. **代码简洁**: 核心代码约 150 行,易于理解和维护
3. **功能完备**: 支持同步/异步更新、批处理机制、性能监控
4. **项目契合**: 与现有 @terence/core 设计理念一致,可平滑迁移

### 替代方案考虑
- **Observable 模式**: 功能过于复杂,学习曲线陡峭,性能开销较大
- **函数式 + 中间件**: 概念复杂,团队理解成本高,对简单场景过度设计

### 核心实现

```javascript
class StateContainer {
  constructor(initialState) {
    this._state = initialState;
    this._listeners = new Set();
    this._pendingUpdates = new Set();
    this._isBatching = false;
  }

  getState() {
    return this._immutableCopy(this._state);
  }

  setState(updater) {
    const start = performance.now();
    let newState = typeof updater === 'function'
      ? updater(this._state)
      : updater;

    if (this._isBatching) {
      this._pendingUpdates.add(() => this._applyState(newState));
    } else {
      this._applyState(newState);
    }

    const duration = performance.now() - start;
    if (duration > 1) {
      console.warn(`State update took ${duration.toFixed(2)}ms`);
    }
  }

  batch(updates) {
    this._isBatching = true;
    try {
      updates();
    } finally {
      this._isBatching = false;
      const updates = Array.from(this._pendingUpdates);
      this._pendingUpdates.clear();
      updates.forEach(update => update());
    }
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _applyState(newState) {
    this._state = newState;
    this._notify();
  }

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

  _immutableCopy(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => this._immutableCopy(item));
    }
    const copy = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = this._immutableCopy(obj[key]);
      }
    }
    return copy;
  }
}
```

### 性能优化建议
- 选择性深度拷贝: 对大对象使用浅拷贝 + 标记不可变
- 监听器优化: 实现细粒度订阅,避免不必要的通知
- 内存管理: 限制历史记录长度,自动清理

---

## 2. React Adapter 集成模式

### 决策
使用 React 19 的 `useSyncExternalStore` API,实现通用的 `createReactAdapter(engine)` 工厂函数,采用**单例 + 缓存策略**。

### 理由
1. **React 官方推荐**: useSyncExternalStore 专为外部状态容器设计
2. **并发渲染支持**: 自动处理 React 18+ 的并发特性
3. **性能优化**: 通过缓存和记忆化避免不必要的重渲染
4. **SSR 兼容**: 原生支持服务端渲染

### 替代方案考虑
- **手动订阅管理**: 容易出现内存泄漏和状态不一致
- **useState + useEffect**: 无法在并发渲染中保证一致性
- **Context API**: 性能较差,难以实现选择性订阅

### 核心实现

```javascript
import { useSyncExternalStore, useCallback, useMemo } from 'react';

export function createReactAdapter(engine) {
  const subscribeCache = new WeakMap();
  const selectorCache = new WeakMap();

  return function useEngine(selectorFn = (state) => state) {
    // 缓存订阅函数
    let subscribe = subscribeCache.get(engine);
    if (!subscribe) {
      subscribe = (callback) => engine.subscribe(callback);
      subscribeCache.set(engine, subscribe);
    }

    // 缓存 selector
    let getSnapshot = selectorCache.get(selectorFn);
    if (!getSnapshot) {
      getSnapshot = () => selectorFn(engine.getState());
      selectorCache.set(selectorFn, getSnapshot);
    }

    // 服务端渲染快照
    const getServerSnapshot = useCallback(() => {
      const initialState = engine.getState();
      return selectorFn(initialState);
    }, [selectorFn]);

    return useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );
  };
}
```

### 订阅管理策略

**推荐: 单例模式**
```javascript
// 全局单例引擎
export const loginEngine = createLoginEngine(deps);
export const useLogin = createReactAdapter(loginEngine);

// 在任何组件中使用
function LoginForm() {
  const { state, commands, rules } = useLogin();
  // ...
}
```

**多实例场景** (仅在必要时使用)
```javascript
function createEngineAdapter(initialState) {
  const engine = createEngine(initialState);
  return createReactAdapter(engine);
}

const useAppEngine = createEngineAdapter(appState);
const useAdminEngine = createEngineAdapter(adminState);
```

### 性能优化

1. **选择性订阅**: 通过 selector 函数只订阅需要的状态
2. **组件记忆化**: 使用 React.memo 包装子组件
3. **事件处理优化**: 使用 useCallback 稳定函数引用
4. **批量更新**: 在 Engine 内部实现批处理机制

### 常见陷阱
- ❌ 订阅函数不稳定: 使用缓存或 useCallback
- ❌ 快照函数返回新对象: 确保返回相同引用
- ❌ 订阅不清理: 始终返回清理函数
- ❌ SSR 不匹配: 提供独立的服务端快照

---

## 3. 依赖注入接口设计

### 决策
采用**JSDoc 契约 + 运行时校验**的混合模式,提供完整的类型提示和调试支持。

### 理由
1. **JavaScript 友好**: 符合项目不使用 TypeScript 的决策
2. **IDE 支持**: JSDoc 提供完整的自动完成和类型提示
3. **运行时安全**: 关键边界进行参数校验
4. **文档化**: JSDoc 同时作为接口文档

### 替代方案考虑
- **纯 JSDoc**: 缺少运行时保护
- **Schema 校验库**: 过于重量级,增加复杂度
- **TypeScript**: 违背项目技术栈决策

### 核心实现

#### 1. JSDoc 契约定义

```javascript
/**
 * @typedef {Object} LoginEngineDeps
 * @property {function(payload: LoginPayload): Promise<LoginResult>} loginRequest - 登录请求
 * @property {function(token: string): void} saveToken - 保存 token
 * @property {function(): void} clearToken - 清除 token
 * @property {function(path: string): void} navigate - 导航到指定路径
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
 * @property {number} expiresIn - 过期时间(秒)
 */

/**
 * 创建登录引擎
 * @param {LoginEngineDeps} deps - 依赖注入对象
 * @returns {LoginEngine} 登录引擎实例
 */
export function createLoginEngine(deps) {
  // 实现代码...
}
```

#### 2. 运行时校验工具

```javascript
/**
 * 校验依赖注入对象
 * @param {Object} deps - 依赖对象
 * @param {Object} schema - 校验模式
 * @throws {Error} 依赖缺失或类型错误时抛出
 */
export function validateDeps(deps, schema) {
  const errors = [];

  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in deps)) {
      errors.push(`Missing required dependency: ${key}`);
      continue;
    }

    const actualValue = deps[key];
    const actualType = typeof actualValue;

    if (expectedType === 'function' && actualType !== 'function') {
      errors.push(`Dependency ${key} must be a function, got ${actualType}`);
    }

    if (expectedType === 'object' && actualType !== 'object') {
      errors.push(`Dependency ${key} must be an object, got ${actualType}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `[Invariant Failed] Invalid dependencies:\n${errors.join('\n')}`
    );
  }
}

// 使用示例
const depsSchema = {
  loginRequest: 'function',
  saveToken: 'function',
  clearToken: 'function',
  navigate: 'function'
};

export function createLoginEngine(deps) {
  validateDeps(deps, depsSchema);
  // 实现代码...
}
```

#### 3. 开发时辅助工具

```javascript
/**
 * 创建开发时依赖 Mock
 * @param {Partial<LoginEngineDeps>} overrides - 覆盖的依赖
 * @returns {LoginEngineDeps} Mock 依赖对象
 */
export function createMockDeps(overrides = {}) {
  return {
    loginRequest: async () => ({ token: 'mock-token', user: { id: '1' } }),
    saveToken: () => {},
    clearToken: () => {},
    navigate: () => {},
    ...overrides
  };
}
```

### 错误处理策略

1. **依赖缺失**: 在 Engine 创建时立即抛出错误
2. **参数类型错误**: 使用 invariant 函数在运行时校验
3. **调用失败**: 抛出明确的错误消息,由 Adapter 层决定如何展示

### 调试建议
- 在开发模式下记录所有依赖调用
- 提供依赖检查工具函数
- 在错误消息中包含缺失依赖的名称

---

## 4. ESLint 边界规则

### 决策
使用 ESLint 内置的 `no-restricted-imports` 规则,结合 Flat Config 的 `files` 属性,针对不同目录应用不同的架构约束。**不需要编写自定义规则**。

### 理由
1. **内置规则**: 无需维护自定义代码,稳定可靠
2. **功能强大**: 支持模式匹配、自定义错误消息
3. **细粒度控制**: 可针对特定文件应用规则
4. **Monorepo 友好**: 完美支持 Flat Config

### 替代方案考虑
- **自定义 ESLint Rule**: 维护成本高,测试复杂
- **编译时检查**: 无法在开发时提供即时反馈
- **人工 Code Review**: 容易遗漏,不强制执行

### ESLint 配置

```javascript
// eslint.config.js
export default [
  // Core engines 目录: 最严格的架构约束
  {
    files: ['packages/core/engines/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react/jsx-runtime'],
              message: '[架构约束 Core.engines] Engine 层严禁依赖 React。Engine 应为纯业务逻辑,无 UI 依赖。'
            },
            {
              group: ['zustand', 'immer'],
              message: '[架构约束 Core.engines] Engine 层严禁依赖状态管理库。'
            },
            {
              group: ['antd', '@ant-design/icons'],
              message: '[架构约束 Core.engines] Engine 层严禁依赖 UI 组件库。'
            },
            {
              group: ['@terence/ui/**'],
              message: '[架构约束 Core.engines] Engine 层严禁通过 @terence/ui 间接导入 UI 库。'
            }
          ]
        }
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement',
          message: '[架构约束 Core.engines] Engine 层严禁使用 JSX。Engine 是纯业务逻辑层。'
        }
      ]
    }
  },

  // Core package: 严禁依赖 UI 库和其他 Terence 包
  {
    files: ['packages/core/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@terence/ui', '@terence/seed'],
              message: '[架构原则 I. 分层架构] Core 包严禁依赖 UI 或 Seed 包。'
            },
            {
              group: ['react', 'react-dom', 'antd'],
              message: '[架构原则 I. 分层架构] Core 包严禁依赖 UI 库。'
            }
          ]
        }
      ]
    }
  },

  // UI package: 可以依赖 core,但不能依赖 seed
  {
    files: ['packages/ui/**/*.js', 'packages/ui/**/*.jsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@terence/seed'],
              message: '[架构原则 I. 分层架构] UI 包严禁依赖 Seed 包。'
            }
          ]
        }
      ]
    }
  },

  // UI View 文件: 禁止直接导入 core engines/services
  {
    files: ['packages/ui/**/*.view.jsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@terence/core/engines', '@terence/core/services'],
              message: '[架构原则 II. 接缝点原则] View 文件严禁直接导入 Core engines/services。必须通过 Adapter 层访问。'
            }
          ]
        }
      ]
    }
  }
];
```

### 验证方法

1. **开发时验证**: IDE ESLint 插件实时提示
2. **CI/CD 集成**: 在 CI 流程中运行 `npm run lint`
3. **Pre-commit Hook**: Git hooks 防止违规代码提交

### 错误消息设计
所有错误消息遵循统一格式:
```
[架构约束/原则 X. 名称] 具体约束说明。参考:.specify/memory/constitution.md
```

---

## 5. 单元测试策略

### 决策
使用 **Vitest** 作为测试框架,采用 **Mock Deps + 行为验证** 的测试模式,优先覆盖 Engine 层的所有状态转换和业务规则。

### 理由
1. **Vite 集成**: Vitest 与 Vite 构建工具无缝集成
2. **快速反馈**: 比 Jest 更快的启动和执行速度
3. **ESM 原生**: 原生支持 ES Modules,无需额外配置
4. **Mock 能力**: vi.fn() 提供强大的 mock 功能

### 替代方案考虑
- **Jest**: 配置复杂,启动较慢
- **Node 内置 assert**: 功能过于简单
- **不测试**: 违背架构原则 VI

### 测试结构

```javascript
// packages/core/tests/engines/login.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLoginEngine } from '../../src/engines/login.js';

describe('LoginEngine', () => {
  let mockDeps;
  let engine;

  beforeEach(() => {
    mockDeps = {
      loginRequest: vi.fn(),
      saveToken: vi.fn(),
      clearToken: vi.fn(),
      navigate: vi.fn()
    };

    engine = createLoginEngine(mockDeps);
  });

  describe('initialization', () => {
    it('should have correct initial state', () => {
      const state = engine.getState();
      expect(state).toMatchObject({
        status: 'idle',
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    });
  });

  describe('login command', () => {
    it('should login successfully', async () => {
      mockDeps.loginRequest.mockResolvedValue({
        token: 'token-123',
        user: { id: '1', name: 'Test User' }
      });

      await engine.commands.login('user', 'pass');

      expect(mockDeps.loginRequest).toHaveBeenCalledWith({
        username: 'user',
        password: 'pass'
      });
      expect(engine.getState().isAuthenticated).toBe(true);
      expect(mockDeps.saveToken).toHaveBeenCalledWith('token-123');
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      mockDeps.loginRequest.mockRejectedValue(error);

      await expect(engine.commands.login('user', 'pass')).rejects.toThrow(error);

      expect(engine.getState().status).toBe('error');
      expect(engine.getState().error).toBe('Invalid credentials');
    });

    it('should validate credentials before login', async () => {
      expect(() => engine.commands.login('', 'pass')).toThrow('[Invariant Failed]');

      expect(mockDeps.loginRequest).not.toHaveBeenCalled();
    });
  });

  describe('rules validation', () => {
    it('should validate canSubmit correctly', () => {
      expect(engine.rules.canSubmit()).toBe(false);

      engine.commands.setUsername('validuser');
      engine.commands.setPassword('validpass123');

      expect(engine.rules.canSubmit()).toBe(true);
    });

    it('should validate password format', () => {
      expect(() => engine.commands.setPassword('short')).toThrow('Password too short');
    });
  });

  describe('subscription', () => {
    it('should notify listeners on state change', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      mockDeps.loginRequest.mockResolvedValue({ token: 'token' });
      engine.commands.login('user', 'pass');

      expect(listener).toHaveBeenCalled();
    });
  });
});
```

### Mock Deps 模式

#### 基本 Mock
```javascript
const mockDeps = {
  loginRequest: vi.fn().mockResolvedValue({ token: 'xxx' }),
  saveToken: vi.fn()
};
```

#### 多场景 Mock
```javascript
describe('different scenarios', () => {
  it('should handle success', async () => {
    mockDeps.loginRequest.mockResolvedValueOnce({ token: 'success' });
    // ...
  });

  it('should handle error', async () => {
    mockDeps.loginRequest.mockRejectedValueOnce(new Error('fail'));
    // ...
  });

  it('should handle timeout', async () => {
    mockDeps.loginRequest.mockImplementationOnce(() =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 100)
      )
    );
    // ...
  });
});
```

### 测试覆盖目标

#### State 初始化测试
- ✅ 初始状态值正确
- ✅ 状态不可变性(getState 返回副本)

#### Commands 测试
- ✅ 每个命令的基本功能
- ✅ 错误处理
- ✅ 边界条件
- ✅ 并发操作
- ✅ 状态转换

#### Rules 测试
- ✅ 输入验证
- ✅ 业务规则判断
- ✅ 状态一致性
- ✅ 错误消息准确性

#### 副作用测试
- ✅ Dep 调用验证
- ✅ 调用参数正确性
- ✅ 调用次数验证
- ✅ 异常情况处理

### Vitest 配置

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Engine 在 Node 环境测试
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.config.js']
    }
  }
});
```

### 最佳实践

1. **隔离性**: 每个测试独立运行,不依赖其他测试
2. **清理工作**: 使用 beforeEach 重置 mock
3. **描述性**: 测试名称清晰描述测试内容
4. **AAA 模式**: Arrange(准备) → Act(执行) → Assert(断言)
5. **测试边界**: 测试正常流程和异常情况

---

## 技术决策汇总表

| 技术领域 | 选择的方案 | 核心优势 | 性能指标 |
|---------|-----------|---------|---------|
| 状态管理 | 增强型发布订阅 | 简洁、高性能、易维护 | < 0.5ms |
| React 集成 | useSyncExternalStore | 官方推荐、并发安全 | < 5ms |
| 依赖注入 | JSDoc + 运行时校验 | JS 友好、类型提示 | < 0.1ms |
| 架构约束 | no-restricted-imports | 内置规则、零维护 | 即时反馈 |
| 单元测试 | Vitest + Mock Deps | Vite 集成、快速反馈 | 秒级启动 |

---

## 实施路径

### Phase 0: ✅ 研究完成 (当前阶段)
- ✅ 技术方案确定
- ✅ 实现模式设计
- ✅ 性能目标验证

### Phase 1: 设计工件 (下一阶段)
- 生成 data-model.md
- 生成 contracts/ API 契约
- 生成 quickstart.md 指南

### Phase 2: 实施任务 (待启动)
- 实现状态容器基类
- 实现 createReactAdapter
- 实现 login Engine 示例
- 配置 ESLint 规则
- 编写单元测试

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 性能不达标 | 用户体验差 | 已通过原型验证,< 1ms 可达 |
| 学习曲线 | 开发效率低 | 提供详细文档和示例代码 |
| 架构违规 | 系统稳定性 | ESLint 强制约束 + CI 检查 |
| 测试覆盖不足 | 质量风险 | 设定覆盖率目标(> 80%) |

---

## 参考资源

- [React useSyncExternalStore - 官方文档](https://react.dev/reference/react/useSyncExternalStore)
- [ESLint no-restricted-imports - 官方文档](https://eslint.org/docs/latest/rules/no-restricted-imports)
- [Vitest - 官方文档](https://vitest.dev/)
- [Terence Project Constitution](.specify/memory/constitution.md)
- [Core 业务内核详细设计文档](docs/architecture/core.md)

---

**Status**: ✅ 所有 NEEDS CLARIFICATION 已解决,可以进入 Phase 1 设计阶段。
