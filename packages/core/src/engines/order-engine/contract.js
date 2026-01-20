/**
 * Order Engine - 外部能力契约
 *
 * 定义订单 Engine 所需的外部能力接口。
 * 项目层需要实现这些接口。
 *
 * @module engines/order-engine/contract
 */

/**
 * 订单 Engine 外部能力契约
 *
 * @type {Object}
 * @property {Function} createOrder - 创建订单
 * @property {Function} validateInventory - 验证库存
 * @property {Function} payOrder - 支付订单
 *
 * @example
 * // 项目层实现
 * const context = {
 *   createOrder: async (data) => {
 *     const response = await fetch('/api/orders', {
 *       method: 'POST',
 *       body: JSON.stringify(data)
 *     })
 *     const result = await response.json()
 *     return result.id
 *   },
 *   validateInventory: async (items) => {
 *     const response = await fetch('/api/inventory/check', {
 *       method: 'POST',
 *       body: JSON.stringify({ items })
 *     })
 *     return response.ok
 *   },
 *   payOrder: async (orderId) => {
 *     const response = await fetch(`/api/orders/${orderId}/pay`, {
 *       method: 'POST'
 *     })
 *     return response.ok
 *   }
 * }
 */
export const orderEngineContextContract = {
  /**
   * 创建订单
   * @param {Object} _data - 订单数据
   * @param {Array} _data.items - 商品列表
   * @param {number} _data.total - 总金额
   * @returns {Promise<string>} 订单 ID
   */
  createOrder: async (_data) => {},

  /**
   * 验证库存
   * @param {Array} _items - 商品列表
   * @returns {Promise<boolean>} 是否有库存
   */
  validateInventory: async (_items) => {},

  /**
   * 支付订单
   * @param {string} _orderId - 订单 ID
   * @returns {Promise<boolean>} 是否支付成功
   */
  payOrder: async (_orderId) => {},
}
