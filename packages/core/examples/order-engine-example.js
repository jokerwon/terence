/**
 * Stateful Engine 使用示例
 *
 * 演示如何使用 Stateful Engine 管理复杂的多阶段订单流程。
 *
 * @file order-engine-example.js
 */

import { createOrderEngine } from '@terence/core/engines/order-engine/index.js'

/**
 * 示例 1: 创建订单 Engine
 */
const context = {
  createOrder: async (data) => {
    console.log('创建订单:', data)
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 100))
    return 'order-' + Date.now()
  },
  validateInventory: async (items) => {
    console.log('验证库存:', items)
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 100))
    return true
  },
  payOrder: async (orderId) => {
    console.log('支付订单:', orderId)
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 100))
    return true
  },
}

const engine = createOrderEngine(context)

/**
 * 示例 2: 订阅状态变化
 */
// const unsubscribe = engine.subscribe((state) => {
//   console.log('订单状态变化:', state)
// })

// 初始状态
console.log('初始状态:', engine.getState())
// 输出: { step: 'draft', items: [], total: 0, createdAt: ..., error: null }

/**
 * 示例 3: 执行状态迁移
 */

// 1. 提交订单
engine.actions.transition('submit')
// 订阅者收到: { step: 'validating', items: [], total: 0, submittedAt: ... }

// 2. 验证成功
engine.actions.transition('success', { orderId: 'order-123' })
// 订阅者收到: { step: 'confirmed', items: [], total: 0, orderId: 'order-123', confirmedAt: ... }

// 3. 支付订单
engine.actions.transition('pay')
// 订阅者收到: { step: 'paid', items: [], total: 0, paidAt: ... }

// 4. 发货
engine.actions.transition('ship', { trackingNumber: 'SF123456' })
// 订阅者收到: { step: 'shipped', items: [], total: 0, trackingNumber: 'SF123456', shippedAt: ... }

// 5. 完成
engine.actions.transition('complete')
// 订阅者收到: { step: 'completed', items: [], total: 0, completedAt: ... }

/**
 * 示例 4: 错误处理
 */
const engine2 = createOrderEngine({
  ...context,
  error: new Error('库存不足'),
})

engine2.actions.transition('submit')
engine2.actions.transition('fail')
// 订阅者收到: { step: 'draft', items: [], total: 0, error: Error('库存不足'), failedAt: ... }

/**
 * 示例 5: 在 React 中使用（需要 Adapter）
 * 注意：这部分代码应该在 UI 层实现，这里仅作演示参考
 */
/*
import { createReactAdapter } from '@terence/ui/hooks/adapters/index.js'

// 创建 Engine
const orderEngine = createOrderEngine(context)

// 创建 Adapter Hook
const useOrder = createReactAdapter(orderEngine)

// 在组件中使用
function OrderForm() {
  const { state, actions } = useOrder()
  // ... React 组件代码
}
*/

/**
 * 示例 6: 状态机验证
 */
function validateStateTransition(engine, fromState, action) {
  const state = engine.getState()

  if (state.step !== fromState) {
    throw new Error(`当前状态不是 ${fromState}，而是 ${state.step}`)
  }

  try {
    engine.actions.transition(action)
    console.log(`✓ 状态迁移成功: ${fromState} --[${action}]--> ${engine.getState().step}`)
  } catch (error) {
    console.log(`✗ 状态迁移失败: ${error.message}`)
  }
}

// 使用验证函数
const engine3 = createOrderEngine(context)

validateStateTransition(engine3, 'draft', 'submit')   // ✓
validateStateTransition(engine3, 'draft', 'pay')      // ✗ 无效动作
validateStateTransition(engine3, 'confirmed', 'pay')  // ✓

/**
 * 示例 7: 查询状态信息
 */
function getOrderInfo(engine) {
  const state = engine.getState()

  return {
    currentStep: state.step,
    isDraft: state.step === 'draft',
    isCompleted: state.step === 'completed',
    isCancelled: state.step === 'cancelled',
    hasError: !!state.error,
    timeElapsed: Date.now() - state.createdAt,
  }
}

// 使用
const info = getOrderInfo(engine)
console.log('订单信息:', info)

/**
 * 示例 8: 取消订阅
 */
// 订阅状态变化
const unsubscribe2 = engine.subscribe((state) => {
  console.log('状态变化:', state.step)

  // 在某个条件下取消订阅
  if (state.step === 'completed' || state.step === 'cancelled') {
    unsubscribe2()
    console.log('取消订阅')
  }
})

/**
 * 导出示例
 */
export {
  engine,
  validateStateTransition,
  getOrderInfo,
}
