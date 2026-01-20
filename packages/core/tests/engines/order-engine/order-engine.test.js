/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest'
import { createOrderEngine } from '../../../src/engines/order-engine/engine.js'

describe('Stateful Engine: Order Engine', () => {
  it('should initialize with draft state', () => {
    const context = {
      createOrder: vi.fn(),
      validateInventory: vi.fn(),
      payOrder: vi.fn(),
    }

    const engine = createOrderEngine(context)
    const state = engine.getState()

    expect(state.step).toBe('draft')
    expect(state.items).toEqual([])
    expect(state.total).toBe(0)
  })

  it('should transition from draft to validating on submit action', () => {
    const context = {
      createOrder: vi.fn().mockResolvedValue('order-123'),
      validateInventory: vi.fn().mockResolvedValue(true),
    }

    const engine = createOrderEngine(context)

    engine.actions.transition('submit')

    const state = engine.getState()
    expect(state.step).toBe('validating')
  })

  it('should transition from validating to confirmed on success action', async () => {
    const context = {
      createOrder: vi.fn().mockResolvedValue('order-123'),
      validateInventory: vi.fn().mockResolvedValue(true),
    }

    const engine = createOrderEngine(context)

    engine.actions.transition('submit')
    await new Promise((resolve) => setTimeout(resolve, 0))

    engine.actions.transition('success')

    const state = engine.getState()
    expect(state.step).toBe('confirmed')
    expect(state.orderId).toBe('order-123')
  })

  it('should transition from validating to draft on fail action', () => {
    const context = {
      createOrder: vi.fn(),
      validateInventory: vi.fn(),
      payOrder: vi.fn(),
      error: new Error('Inventory not available'),
    }

    const engine = createOrderEngine(context)

    engine.actions.transition('submit')
    engine.actions.transition('fail')

    const state = engine.getState()
    expect(state.step).toBe('draft')
    expect(state.error).toBeDefined()
  })

  it('should notify subscribers on state changes', () => {
    const context = {
      createOrder: vi.fn(),
      validateInventory: vi.fn(),
      payOrder: vi.fn(),
    }

    const engine = createOrderEngine(context)
    const listener = vi.fn()

    const unsubscribe = engine.subscribe(listener)

    engine.actions.transition('submit')

    expect(listener).toHaveBeenCalled()
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'validating' })
    )

    unsubscribe()
  })

  it('should return unsubscribe function from subscribe', () => {
    const context = {
      createOrder: vi.fn(),
      validateInventory: vi.fn(),
      payOrder: vi.fn(),
    }

    const engine = createOrderEngine(context)
    const listener = vi.fn()

    const unsubscribe = engine.subscribe(listener)

    expect(typeof unsubscribe).toBe('function')

    unsubscribe()

    engine.actions.transition('submit')

    // Listener should not be called after unsubscribe
    expect(listener).not.toHaveBeenCalled()
  })
})
