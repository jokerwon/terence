/**
 * 应用状态集成测试
 *
 * 验证 Zustand 与 Engine 的协作,确保:
 * - 业务流程中间态保留在 Engine 中
 * - 最终结果存储在应用状态中
 * - 业务规则判断从 Engine.rules 获取
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLoginEngine, createMockDeps } from '../../src/engines/login/index.js';
import { createReactAdapter } from '../../src/adapters/react/createAdapter.js';

describe('Application State Integration', () => {
  let mockDeps;
  let engine;
  let useLogin;
  let tokenStorage = {};
  let currentPath = '';

  beforeEach(() => {
    tokenStorage = {};
    currentPath = '';

    mockDeps = createMockDeps({
      loginRequest: vi.fn(),
      saveToken: vi.fn((token) => {
        tokenStorage.token = token;
      }),
      clearToken: vi.fn(() => {
        delete tokenStorage.token;
      }),
      navigate: vi.fn((path) => {
        currentPath = path;
      })
    });

    engine = createLoginEngine(mockDeps);
    useLogin = createReactAdapter(engine);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('token storage', () => {
    it('should save token to state after login success', async () => {
      mockDeps.loginRequest.mockResolvedValue({
        token: 'saved-token',
        user: { id: '123', name: 'User' }
      });

      engine.commands.setUsername('user');
      engine.commands.setPassword('password123');
      await engine.commands.submit();

      expect(mockDeps.saveToken).toHaveBeenCalledWith('saved-token');
      expect(tokenStorage.token).toBe('saved-token');
    });

    it('should clear token on reset', () => {
      engine.commands.setUsername('user');
      engine.commands.setPassword('password123');
      engine.commands.reset();

      expect(mockDeps.clearToken).toHaveBeenCalled();
      expect(tokenStorage.token).toBeUndefined();
    });
  });

  describe('state boundaries', () => {
    it('should keep intermediate status in Engine, not in storage', async () => {
      mockDeps.clearToken();
      tokenStorage = {};

      // 验证中间态保留在 Engine 中
      mockDeps.loginRequest.mockImplementation(async () => {
        expect(engine.getState().status).toBe('idle'); //  中间态在 Engine 中
      });

      engine.commands.setUsername('user');
      engine.commands.setPassword('password123');
      await engine.commands.submit();

      expect(tokenStorage).not.toHaveProperty('status'); // Zustand 没有状态
      expect(engine.getState().status).toBe('success'); // Engine 有状态
    });

    it('should store only final results in storage', async () => {
      mockDeps.loginRequest.mockResolvedValue({
        token: 'final-token',
        user: { id: '123', name: 'User' }
      });

      engine.commands.setUsername('user');
      engine.commands.setPassword('password123');
      await engine.commands.submit();

      expect(tokenStorage.token).toBe('final-token');
      expect(engine.getState().user).toEqual({ id: '123', name: 'User' });
    });
  });

  describe('business rules separation', () => {
    it('should get canSubmit from Engine.rules, not from storage', () => {
      const { rules } = useLogin();

      expect(rules.canSubmit()).toBe(false);

      engine.commands.setUsername('user');
      engine.commands.setPassword('password123');

      const { rules: newRules } = useLogin();
      expect(newRules.canSubmit()).toBe(true);
    });
  });
});
