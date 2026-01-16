/**
 * Invariant utility for enforcing runtime constraints
 *
 * @param {boolean} condition - Condition that must be true
 * @param {string} message - Error message if condition is false
 * @throws {Error} If condition is false
 *
 * @example
 * invariant(value !== null, 'value must not be null');
 */
export function invariant(condition, message) {
  if (!condition) {
    throw new Error(`[Invariant Failed] ${message}`);
  }
}
