/**
 * OrderEngine - 订单业务逻辑引擎
 *
 * Engine 职责：
 * - 管理订单状态（state）
 * - 提供状态变更操作（actions）
 * - 使用 Guard 校验操作合法性
 * - 使用 Service 计算衍生数据
 * - 支持订阅状态变化
 */

import { invariant } from '../utils/invariant.js';

/**
 * @typedef {Object} OrderItem
 * @property {string} productId - 产品 ID
 * @property {string} name - 产品名称
 * @property {number} price - 单价
 * @property {number} quantity - 数量
 * @property {string} [unit] - 单位，默认 '件'
 */

/**
 * @typedef {'idle'|'editing'|'submitting'|'completed'|'failed'} OrderStatus
 */

/**
 * @typedef {Object} OrderState
 * @property {OrderItem[]} items - 订单项列表
 * @property {OrderStatus} status - 订单状态
 * @property {boolean} canSubmit - 是否可以提交
 * @property {number} totalAmount - 总金额（分）
 * @property {string|null} error - 错误信息
 * @property {string|null} orderId - 订单 ID
 */

/**
 * @typedef {Object} OrderEngine
 * @property {function(): OrderState} getState - 获取当前状态（只读）
 * @property {function(OrderItem): void} addItem - 添加订单项
 * @property {function(string): void} removeItem - 移除订单项
 * @property {function(string, number): void} updateQty - 更新数量
 * @property {function(): Promise<void>} submit - 提交订单
 * @property {function(): void} reset - 重置订单
 * @property {function(function(OrderState): void): function(): void} subscribe - 订阅状态变化
 */

/**
 * 创建订单引擎
 *
 * @param {Object} options
 * @param {function(Object): Promise<{id: string}>} options.submitOrder - 提交订单到后端的异步函数
 * @returns {OrderEngine} 订单引擎实例
 *
 * @example
 * const engine = createOrderEngine({
 *   submitOrder: async (payload) => {
 *     const response = await fetch('/api/orders', {
 *       method: 'POST',
 *       body: JSON.stringify(payload)
 *     });
 *     return response.json();
 *   }
 * });
 */
export function createOrderEngine({ submitOrder }) {
  // 内部状态
  let state = /** @type {OrderState} */ ({
    items: [],
    status: 'idle',
    canSubmit: false,
    totalAmount: 0,
    error: null,
    orderId: null
  });

  // 监听器集合
  const listeners = new Set();

  /**
   * 通知所有监听器
   */
  function notify() {
    listeners.forEach(listener => listener(getState()));
  }

  /**
   * 获取当前状态（只读副本）
   * @returns {OrderState}
   */
  function getState() {
    return { ...state, items: state.items.map(item => ({ ...item })) };
  }

  /**
   * 添加订单项
   * @param {OrderItem} item
   */
  function addItem(item) {
    invariant(item != null, 'Item must not be null');
    invariant(item.productId, 'Item must have productId');
    invariant(item.name, 'Item must have name');
    invariant(typeof item.price === 'number' && item.price > 0, 'Item price must be a positive number');
    invariant(typeof item.quantity === 'number' && item.quantity > 0, 'Item quantity must be a positive number');

    state.items.push({ ...item, unit: item.unit || '件' });
    state.status = 'editing';
    state.error = null;
    recalculate();
    notify();
  }

  /**
   * 移除订单项
   * @param {string} productId
   */
  function removeItem(productId) {
    invariant(productId, 'productId must not be empty');

    const index = state.items.findIndex(item => item.productId === productId);
    invariant(index !== -1, `Item with productId ${productId} not found`);

    state.items.splice(index, 1);
    state.status = state.items.length > 0 ? 'editing' : 'idle';
    state.error = null;
    recalculate();
    notify();
  }

  /**
   * 更新订单项数量
   * @param {string} productId
   * @param {number} quantity
   */
  function updateQty(productId, quantity) {
    invariant(productId, 'productId must not be empty');
    invariant(typeof quantity === 'number' && quantity > 0, 'Quantity must be a positive number');

    const item = state.items.find(i => i.productId === productId);
    invariant(item, `Item with productId ${productId} not found`);

    item.quantity = quantity;
    state.status = 'editing';
    state.error = null;
    recalculate();
    notify();
  }

  /**
   * 提交订单
   * @returns {Promise<void>}
   */
  async function submit() {
    // Guard: 检查是否可以提交
    invariant(state.items.length > 0, 'Cannot submit empty order');
    invariant(state.status !== 'submitting', 'Order is already submitting');

    try {
      state.status = 'submitting';
      state.error = null;
      notify();

      // 构建提交数据
      const payload = {
        items: state.items.map(({ productId, quantity }) => ({ productId, quantity })),
        totalAmount: state.totalAmount
      };

      // 调用 Service
      const result = await submitOrder(payload);

      state.orderId = result.id;
      state.status = 'completed';
      notify();
    } catch (err) {
      state.status = 'failed';
      state.error = err instanceof Error ? err.message : 'Unknown error';
      notify();
      throw err;
    }
  }

  /**
   * 重置订单
   */
  function reset() {
    state = {
      items: [],
      status: 'idle',
      canSubmit: false,
      totalAmount: 0,
      error: null,
      orderId: null
    };
    notify();
  }

  /**
   * 订阅状态变化
   * @param {function(OrderState): void} listener
   * @returns {function(): void} 取消订阅函数
   */
  function subscribe(listener) {
    listeners.add(listener);

    // 返回取消订阅函数
    return () => {
      listeners.delete(listener);
    };
  }

  /**
   * 重新计算衍生状态
   */
  function recalculate() {
    // 计算总金额
    state.totalAmount = state.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // 更新是否可提交
    state.canSubmit = state.items.length > 0 && state.status !== 'submitting';
  }

  return {
    getState,
    addItem,
    removeItem,
    updateQty,
    submit,
    reset,
    subscribe
  };
}
