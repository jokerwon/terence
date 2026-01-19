/**
 * invariant - 运行时参数校验工具
 *
 * 用于断言条件为真,如果条件为假则抛出错误。
 *
 * @param {boolean} condition - 需要验证的条件
 * @param {string} message - 错误消息
 * @throws {Error} 如果条件为 false
 *
 * @example
 * invariant(value !== null, 'Value must not be null');
 * invariant(typeof value === 'string', 'Value must be a string');
 */
export function invariant(condition, message) {
  if (!condition) {
    throw new Error(`[Invariant Failed] ${message}`);
  }
}

/**
 * invariantWithType - 带类型检查的断言
 * @param {*} value - 需要检查的值
 * @param {string} type - 期望的类型
 * @param {string} name - 变量名(用于错误消息)
 * @throws {Error} 如果类型不匹配
 *
 * @example
 * invariantWithType(username, 'string', 'username');
 */
export function invariantWithType(value, type, name) {
  const actualType = typeof value;

  if (actualType !== type) {
    throw new Error(
      `[Invariant Failed] ${name} must be ${type}, got ${actualType}`
    );
  }
}
