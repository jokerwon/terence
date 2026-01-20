/**
 * Order Engine - 状态迁移规则
 *
 * 定义订单流程中各状态之间的迁移规则。
 *
 * 状态机模型:
 * draft → validating → confirmed → paid → shipped → completed
 *                    ↘ draft (on fail)
 * confirmed → cancelled
 *
 * @module engines/order-engine/transitions
 */

/**
 * 订单状态迁移规则表
 *
 * @type {Object}
 * @property {Object} draft - 草稿状态的迁移
 * @property {Object} validating - 验证状态的迁移
 * @property {Object} confirmed - 已确认状态的迁移
 * @property {Object} paid - 已支付状态的迁移
 * @property {Object} shipped - 已发货状态的迁移
 */
export const orderTransitions = {
  /**
   * 草稿状态
   */
  draft: {
    /**
     * 提交订单，进入验证阶段
     * @param {Object} state - 当前状态
     * @returns {Object} 新状态
     */
    submit: (state) => ({
      ...state,
      step: 'validating',
      submittedAt: Date.now(),
    }),

    /**
     * 保存草稿
     * @param {Object} state - 当前状态
     * @returns {Object} 新状态
     */
    save: (state) => ({
      ...state,
      savedAt: Date.now(),
    }),
  },

  /**
   * 验证状态
   */
  validating: {
    /**
     * 验证成功，订单确认
     * @param {Object} state - 当前状态
     * @param {Object} context - 外部能力
     * @param {string} context.orderId - 订单 ID
     * @returns {Object} 新状态
     */
    success: (state, context) => ({
      ...state,
      step: 'confirmed',
      orderId: context.orderId,
      confirmedAt: Date.now(),
    }),

    /**
     * 验证失败，回到草稿
     * @param {Object} state - 当前状态
     * @param {Object} context - 外部能力
     * @param {Error} context.error - 错误信息
     * @returns {Object} 新状态
     */
    fail: (state, context) => ({
      ...state,
      step: 'draft',
      error: context.error,
      failedAt: Date.now(),
    }),
  },

  /**
   * 已确认状态
   */
  confirmed: {
    /**
     * 支付订单
     * @param {Object} state - 当前状态
     * @returns {Object} 新状态
     */
    pay: (state) => ({
      ...state,
      step: 'paid',
      paidAt: Date.now(),
    }),

    /**
     * 取消订单
     * @param {Object} state - 当前状态
     * @returns {Object} 新状态
     */
    cancel: (state) => ({
      ...state,
      step: 'cancelled',
      cancelledAt: Date.now(),
    }),
  },

  /**
   * 已支付状态
   */
  paid: {
    /**
     * 发货
     * @param {Object} state - 当前状态
     * @param {Object} context - 外部能力
     * @param {string} context.trackingNumber - 物流单号
     * @returns {Object} 新状态
     */
    ship: (state, context) => ({
      ...state,
      step: 'shipped',
      trackingNumber: context.trackingNumber,
      shippedAt: Date.now(),
    }),
  },

  /**
   * 已发货状态
   */
  shipped: {
    /**
     * 完成订单
     * @param {Object} state - 当前状态
     * @returns {Object} 新状态
     */
    complete: (state) => ({
      ...state,
      step: 'completed',
      completedAt: Date.now(),
    }),
  },
}
