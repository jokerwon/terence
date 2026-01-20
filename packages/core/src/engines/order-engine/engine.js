/**
 * Order Engine - 订单流程状态机
 *
 * 管理订单的多阶段流程状���，提供状态查询、订阅和迁移接口。
 *
 * @module engines/order-engine/engine
 */

import { orderTransitions } from './transitions.js'

/**
 * 创建订单流程 Engine
 *
 * @param {Object} context - 外部能力
 * @param {Function} context.createOrder - 创建订单
 * @param {Function} context.validateInventory - 验证库存
 * @param {Function} context.payOrder - 支付订单
 * @returns {Object} Engine 实例
 *
 * @example
 * const context = {
 *   createOrder: async (data) => { ... },
 *   validateInventory: async (items) => { ... },
 *   payOrder: async (orderId) => { ... }
 * }
 *
 * const engine = createOrderEngine(context)
 *
 * // 查询状态
 * const state = engine.getState()
 *
 * // 订阅变化
 * const unsubscribe = engine.subscribe((newState) => {
 *   console.log('State changed:', newState)
 * })
 *
 * // 状态迁移
 * engine.actions.transition('submit')
 */
export function createOrderEngine(context) {
  // 内部状态
  let state = {
    step: 'draft',
    items: [],
    total: 0,
    createdAt: Date.now(),
    error: null,
  }

  // 订阅者集合
  const listeners = new Set()

  /**
   * 获取当前状态快照
   * @returns {Object} 当前状态
   */
  function getState() {
    return state
  }

  /**
   * 订阅状态变化
   * @param {Function} listener - 监听器函数
   * @returns {Function} 取消订阅函数
   */
  function subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  /**
   * 执行状态迁移
   * @param {string} action - 动作名称
   * @param {Object} actionData - 动作数据（可选）
   */
  function transition(action, actionData = {}) {
    const transitions = orderTransitions[state.step]

    if (!transitions) {
      throw new Error(`No transitions defined for state: ${state.step}`)
    }

    const transitionFn = transitions[action]
    if (!transitionFn) {
      throw new Error(
        `Invalid action: ${action} for state: ${state.step}. Valid actions: ${Object.keys(
          transitions
        ).join(', ')}`
      )
    }

    // 执行状态迁移
    const newState = transitionFn(state, { ...context, ...actionData })

    // 更新状态
    state = newState

    // 通知所有订阅者
    listeners.forEach((listener) => {
      try {
        listener(state)
      } catch (err) {
        console.error('[OrderEngine] Listener error:', err)
      }
    })
  }

  // 返回 Engine 标准接口
  return {
    getState,
    subscribe,
    actions: {
      transition,
    },
  }
}
