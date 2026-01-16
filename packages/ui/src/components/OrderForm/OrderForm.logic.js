/**
 * OrderFormLogic - UI 内部状态和辅助函数
 *
 * 职责：
 * - 处理纯 UI 相关的逻辑（非业务逻辑）
 * - 表单验证、输入格式化等
 * - 不依赖 @terence/core
 */

/**
 * 格式化金额显示
 * @param {number} amount - 金额（分）
 * @returns {string} 格式化后的金额
 */
export function formatAmount(amount) {
  return `¥${(amount / 100).toFixed(2)}`;
}

/**
 * 验证订单项输入
 * @param {Object} item - 订单项
 * @returns {boolean} 是否有效
 */
export function validateItemInput(item) {
  if (!item.name || item.name.trim() === '') {
    return false;
  }

  if (!item.price || item.price <= 0) {
    return false;
  }

  if (!item.quantity || item.quantity <= 0) {
    return false;
  }

  return true;
}

/**
 * 计算订单项小计
 * @param {Object} item - 订单项
 * @returns {number} 小计金额（分）
 */
export function calculateItemSubtotal(item) {
  return item.price * item.quantity;
}
