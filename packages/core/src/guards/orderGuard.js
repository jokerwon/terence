/**
 * Order Guards - 订单相关校验逻辑
 *
 * Guard 职责：
 * - 校验状态变更的合法性
 * - 抛出错误阻止非法操作
 * - 纯函数，无副作用
 */

import { invariant } from '../utils/invariant.js';

// Type definitions are imported from order.js
// OrderState, OrderItem types are used but not redefined here

/**
 * 断言订单可以提交
 *
 * @param {OrderState} state - 订单状态
 * @throws {Error} 如果订单不能提交
 *
 * @example
 * assertCanSubmit(orderState);
 * // 如果不能提交，会抛出错误
 */
export function assertCanSubmit(state) {
  invariant(state.status === 'editing' || state.status === 'idle',
    `Cannot submit order with status: ${state.status}`);
  invariant(state.items.length > 0,
    'Cannot submit empty order');
  invariant(!state.error,
    `Cannot submit order with error: ${state.error}`);
}

/**
 * 断言订单项合法性
 *
 * @param {OrderItem} item - 订单项
 * @throws {Error} 如果订单项不合法
 *
 * @example
 * assertValidItem(orderItem);
 * // 如果不合法，会抛出错误
 */
export function assertValidItem(item) {
  invariant(item != null, 'Item must not be null');
  invariant(typeof item === 'object', 'Item must be an object');

  // productId 校验
  invariant(item.productId, 'Item must have productId');
  invariant(typeof item.productId === 'string', 'productId must be a string');

  // name 校验
  invariant(item.name, 'Item must have name');
  invariant(typeof item.name === 'string', 'name must be a string');

  // price 校验
  invariant(typeof item.price === 'number', 'price must be a number');
  invariant(item.price > 0, 'price must be positive');
  invariant(Number.isFinite(item.price), 'price must be finite');

  // quantity 校验
  invariant(typeof item.quantity === 'number', 'quantity must be a number');
  invariant(item.quantity > 0, 'quantity must be positive');
  invariant(Number.isFinite(item.quantity), 'quantity must be finite');
  invariant(Number.isInteger(item.quantity), 'quantity must be integer');

  // unit 校验（可选）
  if (item.unit != null) {
    invariant(typeof item.unit === 'string', 'unit must be a string');
  }
}

/**
 * 断言数量合法性
 *
 * @param {number} quantity - 数量
 * @throws {Error} 如果数量不合法
 */
export function assertValidQuantity(quantity) {
  invariant(typeof quantity === 'number', 'quantity must be a number');
  invariant(quantity > 0, 'quantity must be positive');
  invariant(Number.isFinite(quantity), 'quantity must be finite');
  invariant(Number.isInteger(quantity), 'quantity must be integer');
}

/**
 * 断言产品 ID 存在于订单中
 *
 * @param {OrderState} state - 订单状态
 * @param {string} productId - 产品 ID
 * @throws {Error} 如果产品不存在
 */
export function assertProductExists(state, productId) {
  invariant(productId, 'productId must not be empty');
  invariant(typeof productId === 'string', 'productId must be a string');

  const exists = state.items.some(item => item.productId === productId);
  invariant(exists, `Product ${productId} not found in order`);
}
