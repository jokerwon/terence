/**
 * Pricing Services - 价格计算相关服务
 *
 * Service 职责：
 * - 封装业务计算逻辑
 * - 提供可复用的计算函数
 * - 纯函数，无副作用
 */

/**
 * @typedef {import('../engines/order.js').OrderItem} OrderItem
 */

/**
 * 计算订单总金额
 *
 * @param {OrderItem[]} items - 订单项列表
 * @returns {number} 总���额（分）
 *
 * @example
 * const total = calculateTotal([
 *   { productId: '1', name: '商品A', price: 100, quantity: 2 },
 *   { productId: '2', name: '商品B', price: 50, quantity: 1 }
 * ]);
 * // 返回: 250
 */
export function calculateTotal(items) {
  if (!Array.isArray(items)) {
    throw new Error('items must be an array');
  }

  return items.reduce((sum, item) => {
    if (item == null || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      throw new Error('Invalid item: price and quantity must be numbers');
    }
    return sum + (item.price * item.quantity);
  }, 0);
}

/**
 * 计算折扣金额
 *
 * @param {number} totalAmount - 原始总金额（分）
 * @param {Object} discountRule - 折扣规则
 * @param {number} [discountRule.threshold] - 满减门槛（分）
 * @param {number} [discountRule.amount] - 满减金额（分）
 * @param {number} [discountRule.percent] - 折扣百分比（0-100）
 * @returns {number} 折扣金额（分）
 *
 * @example
 * // 满减：满 10000 减 1000
 * const discount = calculateDiscount(12000, { threshold: 10000, amount: 1000 });
 * // 返回: 1000
 *
 * @example
 * // 百分比折扣：打 8 折
 * const discount = calculateDiscount(10000, { percent: 20 });
 * // 返回: 2000
 */
export function calculateDiscount(totalAmount, discountRule) {
  if (typeof totalAmount !== 'number' || totalAmount < 0) {
    throw new Error('totalAmount must be a non-negative number');
  }

  if (discountRule == null || typeof discountRule !== 'object') {
    return 0;
  }

  // 满减折扣
  if (discountRule.threshold != null && discountRule.amount != null) {
    if (totalAmount >= discountRule.threshold) {
      return Math.min(discountRule.amount, totalAmount);
    }
    return 0;
  }

  // 百分比折扣
  if (discountRule.percent != null) {
    if (discountRule.percent < 0 || discountRule.percent > 100) {
      throw new Error('percent must be between 0 and 100');
    }
    return Math.floor(totalAmount * (discountRule.percent / 100));
  }

  return 0;
}

/**
 * 计算折后总金额
 *
 * @param {number} totalAmount - 原始总金额（分）
 * @param {Object} discountRule - 折扣规则
 * @returns {number} 折后总金额（分）
 *
 * @example
 * const finalAmount = calculateFinalAmount(12000, { threshold: 10000, amount: 1000 });
 * // 返回: 11000
 */
export function calculateFinalAmount(totalAmount, discountRule) {
  const discount = calculateDiscount(totalAmount, discountRule);
  return totalAmount - discount;
}

/**
 * 格式化金额显示
 *
 * @param {number} amount - 金额（分）
 * @param {Object} [options] - 格式化选项
 * @param {string} [options.currency='¥'] - 货币符号
 * @param {number} [options.decimals=2] - 小数位数
 * @returns {string} 格式化后的金额字符串
 *
 * @example
 * formatAmount(10000);
 * // 返回: "¥100.00"
 *
 * @example
 * formatAmount(10000, { currency: '$', decimals: 0 });
 * // 返回: "$100"
 */
export function formatAmount(amount, options = {}) {
  const { currency = '¥', decimals = 2 } = options;

  if (typeof amount !== 'number' || amount < 0) {
    throw new Error('amount must be a non-negative number');
  }

  // 将分转换为元（1元 = 100分）
  const yuan = amount / 100;
  const formatted = yuan.toFixed(decimals);

  return `${currency}${formatted}`;
}
