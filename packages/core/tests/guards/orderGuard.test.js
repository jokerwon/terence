/**
 * Tests for Order Guards
 */

import { describe, it, expect } from 'vitest';
import {
  assertCanSubmit,
  assertValidItem,
  assertValidQuantity,
  assertProductExists
} from '../../src/guards/orderGuard.js';

describe('Order Guards', () => {
  describe('assertCanSubmit', () => {
    it('should pass for valid editing state', () => {
      const state = {
        items: [{ productId: 'p1', name: '商品A', price: 100, quantity: 1 }],
        status: 'editing',
        canSubmit: true,
        totalAmount: 100,
        error: null,
        orderId: null
      };

      expect(() => assertCanSubmit(state)).not.toThrow();
    });

    it('should pass for valid idle state', () => {
      const state = {
        items: [{ productId: 'p1', name: '商品A', price: 100, quantity: 1 }],
        status: 'idle',
        canSubmit: true,
        totalAmount: 100,
        error: null,
        orderId: null
      };

      expect(() => assertCanSubmit(state)).not.toThrow();
    });

    it('should throw for submitting status', () => {
      const state = {
        items: [{ productId: 'p1', name: '商品A', price: 100, quantity: 1 }],
        status: 'submitting',
        canSubmit: false,
        totalAmount: 100,
        error: null,
        orderId: null
      };

      expect(() => assertCanSubmit(state)).toThrow('[Invariant Failed]');
      expect(() => assertCanSubmit(state)).toThrow('submitting');
    });

    it('should throw for empty order', () => {
      const state = {
        items: [],
        status: 'idle',
        canSubmit: false,
        totalAmount: 0,
        error: null,
        orderId: null
      };

      expect(() => assertCanSubmit(state)).toThrow('[Invariant Failed]');
      expect(() => assertCanSubmit(state)).toThrow('empty');
    });

    it('should throw for order with error', () => {
      const state = {
        items: [{ productId: 'p1', name: '商品A', price: 100, quantity: 1 }],
        status: 'failed',
        canSubmit: true,
        totalAmount: 100,
        error: 'Network error',
        orderId: null
      };

      expect(() => assertCanSubmit(state)).toThrow('[Invariant Failed]');
    });
  });

  describe('assertValidItem', () => {
    const validItem = {
      productId: 'p1',
      name: '商品A',
      price: 100,
      quantity: 2
    };

    it('should pass for valid item', () => {
      expect(() => assertValidItem(validItem)).not.toThrow();
    });

    it('should pass for valid item with unit', () => {
      const item = { ...validItem, unit: 'kg' };
      expect(() => assertValidItem(item)).not.toThrow();
    });

    it('should throw for null item', () => {
      expect(() => assertValidItem(null)).toThrow('[Invariant Failed]');
    });

    it('should throw for non-object item', () => {
      expect(() => assertValidItem('invalid')).toThrow('[Invariant Failed]');
    });

    it('should throw for missing productId', () => {
      const { productId, ...item } = validItem;
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for non-string productId', () => {
      const item = { ...validItem, productId: 123 };
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for missing name', () => {
      const { name, ...item } = validItem;
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for non-string name', () => {
      const item = { ...validItem, name: 123 };
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for negative price', () => {
      const item = { ...validItem, price: -100 };
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for zero price', () => {
      const item = { ...validItem, price: 0 };
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for non-number price', () => {
      const item = { ...validItem, price: '100' };
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for infinite price', () => {
      const item = { ...validItem, price: Infinity };
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for negative quantity', () => {
      const item = { ...validItem, quantity: -1 };
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for zero quantity', () => {
      const item = { ...validItem, quantity: 0 };
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for non-integer quantity', () => {
      const item = { ...validItem, quantity: 1.5 };
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });

    it('should throw for non-string unit', () => {
      const item = { ...validItem, unit: 123 };
      expect(() => assertValidItem(item)).toThrow('[Invariant Failed]');
    });
  });

  describe('assertValidQuantity', () => {
    it('should pass for valid quantity', () => {
      expect(() => assertValidQuantity(1)).not.toThrow();
      expect(() => assertValidQuantity(100)).not.toThrow();
    });

    it('should throw for non-number', () => {
      expect(() => assertValidQuantity('1')).toThrow('[Invariant Failed]');
    });

    it('should throw for negative', () => {
      expect(() => assertValidQuantity(-1)).toThrow('[Invariant Failed]');
    });

    it('should throw for zero', () => {
      expect(() => assertValidQuantity(0)).toThrow('[Invariant Failed]');
    });

    it('should throw for infinite', () => {
      expect(() => assertValidQuantity(Infinity)).toThrow('[Invariant Failed]');
    });

    it('should throw for non-integer', () => {
      expect(() => assertValidQuantity(1.5)).toThrow('[Invariant Failed]');
    });
  });

  describe('assertProductExists', () => {
    const state = {
      items: [
        { productId: 'p1', name: '商品A', price: 100, quantity: 1 },
        { productId: 'p2', name: '商品B', price: 50, quantity: 2 }
      ],
      status: 'editing',
      canSubmit: true,
      totalAmount: 200,
      error: null,
      orderId: null
    };

    it('should pass for existing product', () => {
      expect(() => assertProductExists(state, 'p1')).not.toThrow();
      expect(() => assertProductExists(state, 'p2')).not.toThrow();
    });

    it('should throw for non-existing product', () => {
      expect(() => assertProductExists(state, 'p3')).toThrow('[Invariant Failed]');
      expect(() => assertProductExists(state, 'p3')).toThrow('p3');
    });

    it('should throw for empty productId', () => {
      expect(() => assertProductExists(state, '')).toThrow('[Invariant Failed]');
    });

    it('should throw for non-string productId', () => {
      expect(() => assertProductExists(state, 123)).toThrow('[Invariant Failed]');
    });
  });
});
