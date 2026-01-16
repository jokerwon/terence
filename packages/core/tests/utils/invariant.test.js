/**
 * Tests for invariant utility
 */

import { describe, it, expect } from 'vitest';
import { invariant } from '../../src/utils/invariant.js';

describe('invariant', () => {
  it('should not throw when condition is true', () => {
    expect(() => invariant(true, 'should not throw')).not.toThrow();
  });

  it('should throw when condition is false', () => {
    expect(() => invariant(false, 'should throw')).toThrow('[Invariant Failed] should throw');
  });

  it('should include custom message in error', () => {
    expect(() => invariant(false, 'custom error message'))
      .toThrow('[Invariant Failed] custom error message');
  });
});
