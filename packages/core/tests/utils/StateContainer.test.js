import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateContainer } from '../../src/utils/StateContainer.js';

describe('StateContainer', () => {
  let container;

  beforeEach(() => {
    container = new StateContainer({
      count: 0,
      name: 'test'
    });
  });

  describe('initialization', () => {
    it('should have correct initial state', () => {
      const state = container.getState();
      expect(state).toEqual({
        count: 0,
        name: 'test'
      });
    });

    it('should return immutable state copies', () => {
      const state1 = container.getState();
      const state2 = container.getState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('setState', () => {
    it('should update state with object', () => {
      container.setState({ count: 1, name: 'updated' });

      expect(container.getState()).toEqual({
        count: 1,
        name: 'updated'
      });
    });

    it('should update state with function', () => {
      container.setState(state => ({
        ...state,
        count: state.count + 1
      }));

      expect(container.getState().count).toBe(1);
    });

    it('should notify listeners on state change', () => {
      const listener = vi.fn();
      container.subscribe(listener);

      container.setState({ count: 5 });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ count: 5 })
      );
    });

    it('should not mutate original state', () => {
      const originalState = container.getState();
      container.setState({ count: 10 });

      expect(originalState.count).toBe(0);
      expect(container.getState().count).toBe(10);
    });
  });

  describe('subscribe', () => {
    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = container.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');

      container.setState({ count: 1 });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      container.setState({ count: 2 });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should notify all listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      container.subscribe(listener1);
      container.subscribe(listener2);

      container.setState({ count: 3 });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();

      container.subscribe(errorListener);
      container.subscribe(normalListener);

      // Should not throw despite error in listener
      expect(() => container.setState({ count: 1 })).not.toThrow();

      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe('batch', () => {
    it('should batch multiple updates into single notification', () => {
      const listener = vi.fn();
      container.subscribe(listener);

      container.batch(() => {
        container.setState({ count: 1 });
        container.setState({ count: 2 });
        container.setState({ count: 3 });
      });

      // Only notified once after batch completes
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ count: 3 })
      );
    });

    it('should apply all batched updates in order', () => {
      container.batch(() => {
        container.setState({ count: 1 });
        container.setState({ count: 2 });
        container.setState({ count: 3 });
      });

      expect(container.getState().count).toBe(3);
    });

    it('should handle nested batch calls', () => {
      const listener = vi.fn();
      container.subscribe(listener);

      container.batch(() => {
        container.setState({ count: 1 });
        container.batch(() => {
          container.setState({ count: 2 });
        });
        container.setState({ count: 3 });
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(container.getState().count).toBe(3);
    });
  });

  describe('immutableCopy', () => {
    it('should deeply clone objects', () => {
      const container = new StateContainer({
        nested: {
          value: 1
        },
        array: [1, 2, 3]
      });

      const state = container.getState();

      state.nested.value = 999;
      state.array.push(4);

      const originalState = container.getState();
      expect(originalState.nested.value).toBe(1);
      expect(originalState.array).toEqual([1, 2, 3]);
    });

    it('should clone arrays', () => {
      const container = new StateContainer({
        items: [{ id: 1 }, { id: 2 }]
      });

      const state1 = container.getState();
      const state2 = container.getState();

      expect(state1.items).not.toBe(state2.items);
      expect(state1).toEqual(state2);
    });

    it('should handle null and primitive values', () => {
      const container = new StateContainer({
        nullValue: null,
        stringValue: 'test',
        numberValue: 42,
        boolValue: true
      });

      const state = container.getState();

      expect(state.nullValue).toBeNull();
      expect(state.stringValue).toBe('test');
      expect(state.numberValue).toBe(42);
      expect(state.boolValue).toBe(true);
    });
  });

  describe('performance', () => {
    it('should warn on slow updates', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock performance.now to simulate slow update
      const originalPerformanceNow = performance.now;
      performance.now = vi.fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(2); // 2ms update

      container.setState({ count: 1 });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('State update took')
      );

      performance.now = originalPerformanceNow;
      consoleWarnSpy.mockRestore();
    });
  });
});
