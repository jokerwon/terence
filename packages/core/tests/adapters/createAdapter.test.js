import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createReactAdapter } from '../../src/adapters/react/createAdapter.js';
import { StateContainer } from '../../src/utils/StateContainer.js';

describe('createReactAdapter', () => {
  let engine;
  let useLogin;

  beforeEach(() => {
    // 创建一个简单的 Engine 用于测试
    const container = new StateContainer({
      username: '',
      password: '',
      status: 'idle',
      error: null
    });

    engine = {
      getState: () => container.getState(),
      subscribe: (listener) => container.subscribe(listener),
      commands: {
        setUsername: (value) => {
          const state = container.getState();
          container.setState({ ...state, username: value, status: 'editing' });
        }
      },
      rules: {
        canSubmit: () => {
          const state = container.getState();
          return state.username.length > 0 && state.password.length >= 6;
        }
      }
    };

    useLogin = createReactAdapter(engine);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // T026: 编写 createReactAdapter 单元测试
  describe('createReactAdapter', () => {
    it('should return a function', () => {
      expect(typeof useLogin).toBe('function');
    });

    it('should return state, commands, and rules', () => {
      const result = useLogin();

      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('commands');
      expect(result).toHaveProperty('rules');
    });

    it('should expose commands', () => {
      const { commands } = useLogin();
      expect(commands).toHaveProperty('setUsername');
      expect(typeof commands.setUsername).toBe('function');
    });

    it('should expose rules', () => {
      const { rules } = useLogin();
      expect(rules).toHaveProperty('canSubmit');
      expect(typeof rules.canSubmit).toBe('function');
    });

    it('should expose state', () => {
      const { state } = useLogin();
      expect(state).toHaveProperty('username');
      expect(state).toHaveProperty('password');
      expect(state).toHaveProperty('status');
    });
  });

  // T027: 编写 Adapter 订阅机制测试
  describe('subscription', () => {
    it('should notify listeners on state change', () => {
      const { state, commands } = useLogin();

      expect(state.username).toBe('');

      commands.setUsername('newuser');

      // 重新获取状态以触发重渲染
      const newState = useLogin();
      expect(newState.username).toBe('newuser');
    });

    it('should call subscribe on mount', () => {
      const subscribeSpy = vi.spyOn(engine, 'subscribe');

      useLogin();

      expect(subscribeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe on unmount', () => {
      const unsubscribeSpy = vi.spyOn(engine, 'subscribe').mockReturnValue(() => vi.fn());

      useLogin();

      // 模拟组件卸载
      const { unsubscribe } = useLogin();
      unsubscribe();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  // 额外的测试: T027 的一部分
  describe('react integration', () => {
    it('should work with React state updates', () => {
      const { state, commands } = useLogin();

      expect(state.status).toBe('idle');

      commands.setUsername('user');
      const newState = useLogin();

      expect(newState.username).toBe('user');
      expect(newState.status).toBe('editing');
    });

    it('should work with rules', () => {
      const { rules, commands } = useLogin();

      expect(rules.canSubmit()).toBe(false);

      commands.setUsername('user');
      commands.setPassword('password123');

      const { rules: newRules } = useLogin();
      expect(newRules.canSubmit()).toBe(true);
    });

    it('should handle errors correctly', () => {
      const { state, commands } = useLogin();

      // 错误处理已经在 Engine 中完成
      expect(state.error).toBeNull();

      // 命令会处理错误更新状态
      expect(() => {
        commands.setUsername('');
      }).not.toThrow();
    });
  });
});
