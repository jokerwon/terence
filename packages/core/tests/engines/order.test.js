/**
 * Tests for OrderEngine
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrderEngine } from '../../src/engines/order.js';

describe('OrderEngine', () => {
  let mockSubmitOrder;
  let engine;

  beforeEach(() => {
    mockSubmitOrder = vi.fn().mockResolvedValue({ id: 'order-123' });
    engine = createOrderEngine({ submitOrder: mockSubmitOrder });
  });

  describe('initialization', () => {
    it('should have initial state', () => {
      const state = engine.getState();

      expect(state.items).toEqual([]);
      expect(state.status).toBe('idle');
      expect(state.canSubmit).toBe(false);
      expect(state.totalAmount).toBe(0);
      expect(state.error).toBeNull();
      expect(state.orderId).toBeNull();
    });
  });

  describe('addItem', () => {
    it('should add item to order', () => {
      const item = {
        productId: 'p1',
        name: '商品A',
        price: 100,
        quantity: 2
      };

      engine.addItem(item);
      const state = engine.getState();

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({ ...item, unit: '件' });
      expect(state.status).toBe('editing');
      expect(state.totalAmount).toBe(200);
      expect(state.canSubmit).toBe(true);
    });

    it('should add custom unit if provided', () => {
      const item = {
        productId: 'p1',
        name: '商品A',
        price: 100,
        quantity: 1,
        unit: 'kg'
      };

      engine.addItem(item);
      const state = engine.getState();

      expect(state.items[0].unit).toBe('kg');
    });

    it('should throw if item is null', () => {
      expect(() => engine.addItem(null)).toThrow('[Invariant Failed]');
    });

    it('should throw if productId is missing', () => {
      const item = { name: '商品A', price: 100, quantity: 1 };
      expect(() => engine.addItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw if price is invalid', () => {
      const item = {
        productId: 'p1',
        name: '商品A',
        price: -100,
        quantity: 1
      };
      expect(() => engine.addItem(item)).toThrow('[Invariant Failed]');
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      engine.addItem({
        productId: 'p1',
        name: '商品A',
        price: 100,
        quantity: 2
      });
    });

    it('should remove item from order', () => {
      engine.removeItem('p1');
      const state = engine.getState();

      expect(state.items).toHaveLength(0);
      expect(state.status).toBe('idle');
      expect(state.canSubmit).toBe(false);
    });

    it('should throw if product not found', () => {
      expect(() => engine.removeItem('p2')).toThrow('[Invariant Failed]');
    });

    it('should throw if productId is empty', () => {
      expect(() => engine.removeItem('')).toThrow('[Invariant Failed]');
    });
  });

  describe('updateQty', () => {
    beforeEach(() => {
      engine.addItem({
        productId: 'p1',
        name: '商品A',
        price: 100,
        quantity: 2
      });
    });

    it('should update item quantity', () => {
      engine.updateQty('p1', 5);
      const state = engine.getState();

      expect(state.items[0].quantity).toBe(5);
      expect(state.totalAmount).toBe(500);
    });

    it('should throw if product not found', () => {
      expect(() => engine.updateQty('p2', 3)).toThrow('[Invariant Failed]');
    });

    it('should throw if quantity is invalid', () => {
      expect(() => engine.updateQty('p1', 0)).toThrow('[Invariant Failed]');
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      engine.addItem({
        productId: 'p1',
        name: '商品A',
        price: 100,
        quantity: 2
      });
    });

    it('should submit order successfully', async () => {
      await engine.submit();
      const state = engine.getState();

      expect(state.status).toBe('completed');
      expect(state.orderId).toBe('order-123');
      expect(mockSubmitOrder).toHaveBeenCalledWith({
        items: [{ productId: 'p1', quantity: 2 }],
        totalAmount: 200
      });
    });

    it('should throw if order is empty', async () => {
      engine.reset();
      await expect(engine.submit()).rejects.toThrow('[Invariant Failed]');
    });

    it('should handle submit failure', async () => {
      mockSubmitOrder.mockRejectedValue(new Error('Network error'));

      await expect(engine.submit()).rejects.toThrow('Network error');

      const state = engine.getState();
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Network error');
    });

    it('should prevent duplicate submissions', async () => {
      mockSubmitOrder.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ id: 'order-123' }), 100))
      );

      const submit1 = engine.submit();
      await expect(engine.submit()).rejects.toThrow('[Invariant Failed]');
      await submit1;
    });
  });

  describe('reset', () => {
    it('should reset order to initial state', () => {
      engine.addItem({
        productId: 'p1',
        name: '商品A',
        price: 100,
        quantity: 2
      });

      engine.reset();
      const state = engine.getState();

      expect(state.items).toEqual([]);
      expect(state.status).toBe('idle');
      expect(state.canSubmit).toBe(false);
      expect(state.totalAmount).toBe(0);
      expect(state.error).toBeNull();
      expect(state.orderId).toBeNull();
    });
  });

  describe('subscribe', () => {
    it('should notify listeners on state change', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = engine.subscribe(listener1);
      engine.subscribe(listener2);

      engine.addItem({
        productId: 'p1',
        name: '商品A',
        price: 100,
        quantity: 1
      });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      const state = listener1.mock.calls[0][0];
      expect(state.items).toHaveLength(1);
    });

    it('should unsubscribe listener', () => {
      const listener = vi.fn();
      const unsubscribe = engine.subscribe(listener);

      unsubscribe();

      engine.addItem({
        productId: 'p1',
        name: '商品A',
        price: 100,
        quantity: 1
      });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple subscriptions', () => {
      const listeners = [vi.fn(), vi.fn(), vi.fn()];

      listeners.forEach(l => engine.subscribe(l));

      engine.addItem({
        productId: 'p1',
        name: '商品A',
        price: 100,
        quantity: 1
      });

      listeners.forEach(l => {
        expect(l).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('immutability', () => {
    it('should return immutable state', () => {
      engine.addItem({
        productId: 'p1',
        name: '商品A',
        price: 100,
        quantity: 1
      });

      const state1 = engine.getState();
      state1.items.push({ productId: 'p2', name: '商品B', price: 50, quantity: 1 });

      const state2 = engine.getState();

      expect(state2.items).toHaveLength(1);
      expect(state1.items).not.toBe(state2.items);
    });
  });
});
