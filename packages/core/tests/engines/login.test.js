import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLoginEngine, createMockDeps } from '../../src/engines/login/index.js';

describe('LoginEngine', () => {
  let mockDeps;
  let engine;

  beforeEach(() => {
    mockDeps = createMockDeps({
      loginRequest: vi.fn()
    });
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
    });

    it('should reject short password', () => {
      expect(() => engine.commands.setPassword('short')).toThrow('[Invariant Failed]');
    });

    it('should reject non-string username', () => {
      expect(() => engine.commands.setUsername(null)).toThrow('[Invariant Failed]');
    });

    it('should reject non-string password', () => {
      expect(() => engine.commands.setPassword(123)).toThrow('[Invariant Failed]');
    });
  });

  describe('async commands', () => {
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
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      mockDeps.loginRequest.mockRejectedValue(error);

      engine.commands.setUsername('user@example.com');
      engine.commands.setPassword('password123');
      await expect(engine.commands.submit()).rejects.toThrow(error);
      expect(engine.getState().status).toBe('error');
    });
  });
});
