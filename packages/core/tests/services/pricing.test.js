/**
 * Tests for Pricing Services
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTotal,
  calculateDiscount,
  calculateFinalAmount,
  formatAmount
} from '../../src/services/pricing.js';

describe('Pricing Services', () => {
  describe('calculateTotal', () => {
    const items = [
      { productId: 'p1', name: '商品A', price: 100, quantity: 2 },
      { productId: 'p2', name: '商品B', price: 50, quantity: 1 }
    ];

    it('should calculate total correctly', () => {
      expect(calculateTotal(items)).toBe(250);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotal([])).toBe(0);
    });

    it('should throw for non-array', () => {
      expect(() => calculateTotal(null)).toThrow('items must be an array');
      expect(() => calculateTotal('invalid')).toThrow('items must be an array');
    });

    it('should throw for invalid item', () => {
      const invalidItems = [
        { productId: 'p1', name: '商品A', price: 'invalid', quantity: 1 }
      ];
      expect(() => calculateTotal(invalidItems)).toThrow('price and quantity must be numbers');
    });

    it('should handle large numbers', () => {
      const largeItems = [
        { productId: 'p1', name: '商品A', price: 999999, quantity: 999 }
      ];
      expect(calculateTotal(largeItems)).toBe(998999001);
    });
  });

  describe('calculateDiscount', () => {
    describe('threshold discount', () => {
      it('should return discount amount when threshold met', () => {
        const discount = calculateDiscount(12000, { threshold: 10000, amount: 1000 });
        expect(discount).toBe(1000);
      });

      it('should return 0 when threshold not met', () => {
        const discount = calculateDiscount(9000, { threshold: 10000, amount: 1000 });
        expect(discount).toBe(0);
      });

      it('should return 0 when threshold exactly equals amount', () => {
        const discount = calculateDiscount(10000, { threshold: 10000, amount: 1000 });
        expect(discount).toBe(1000);
      });

      it('should cap discount at total amount', () => {
        const discount = calculateDiscount(500, { threshold: 100, amount: 1000 });
        expect(discount).toBe(500);
      });
    });

    describe('percentage discount', () => {
      it('should calculate percentage discount', () => {
        const discount = calculateDiscount(10000, { percent: 20 });
        expect(discount).toBe(2000);
      });

      it('should round down discount', () => {
        const discount = calculateDiscount(9999, { percent: 33 });
        expect(discount).toBe(3299); // 9999 * 0.33 = 3299.67 → 3299
      });

      it('should handle 0% discount', () => {
        const discount = calculateDiscount(10000, { percent: 0 });
        expect(discount).toBe(0);
      });

      it('should handle 100% discount', () => {
        const discount = calculateDiscount(10000, { percent: 100 });
        expect(discount).toBe(10000);
      });

      it('should throw for negative percent', () => {
        expect(() => calculateDiscount(10000, { percent: -10 })).toThrow('percent must be between 0 and 100');
      });

      it('should throw for percent > 100', () => {
        expect(() => calculateDiscount(10000, { percent: 101 })).toThrow('percent must be between 0 and 100');
      });
    });

    describe('no discount rule', () => {
      it('should return 0 for null rule', () => {
        expect(calculateDiscount(10000, null)).toBe(0);
      });

      it('should return 0 for undefined rule', () => {
        expect(calculateDiscount(10000, undefined)).toBe(0);
      });
    });

    describe('invalid total amount', () => {
      it('should throw for negative amount', () => {
        expect(() => calculateDiscount(-100, { percent: 10 })).toThrow('totalAmount must be a non-negative number');
      });

      it('should throw for non-number amount', () => {
        expect(() => calculateDiscount('100', { percent: 10 })).toThrow('totalAmount must be a non-negative number');
      });
    });
  });

  describe('calculateFinalAmount', () => {
    it('should subtract discount from total', () => {
      const final = calculateFinalAmount(12000, { threshold: 10000, amount: 1000 });
      expect(final).toBe(11000);
    });

    it('should return same amount when no discount', () => {
      const final = calculateFinalAmount(9000, { threshold: 10000, amount: 1000 });
      expect(final).toBe(9000);
    });

    it('should return 0 when discount equals total', () => {
      const final = calculateFinalAmount(10000, { percent: 100 });
      expect(final).toBe(0);
    });
  });

  describe('formatAmount', () => {
    it('should format amount with default options', () => {
      expect(formatAmount(10000)).toBe('¥100.00');
    });

    it('should format amount with custom currency', () => {
      expect(formatAmount(10000, { currency: '$' })).toBe('$100.00');
      expect(formatAmount(10000, { currency: '€' })).toBe('€100.00');
    });

    it('should format amount with custom decimals', () => {
      expect(formatAmount(10000, { decimals: 0 })).toBe('¥100');
      expect(formatAmount(10000, { decimals: 1 })).toBe('¥100.0');
      expect(formatAmount(10000, { decimals: 3 })).toBe('¥100.000');
    });

    it('should handle zero', () => {
      expect(formatAmount(0)).toBe('¥0.00');
    });

    it('should handle small amounts', () => {
      expect(formatAmount(1)).toBe('¥0.01');
      expect(formatAmount(10)).toBe('¥0.10');
    });

    it('should handle large amounts', () => {
      expect(formatAmount(1000000)).toBe('¥10000.00');
    });

    it('should throw for negative amount', () => {
      expect(() => formatAmount(-100)).toThrow('amount must be a non-negative number');
    });

    it('should throw for non-number amount', () => {
      expect(() => formatAmount('100')).toThrow('amount must be a non-negative number');
    });
  });
});
