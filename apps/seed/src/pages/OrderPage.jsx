/**
 * OrderPage - 订单管理页面
 *
 * 演示三层架构：
 * - Core: OrderEngine 管理业务逻辑和状态
 * - UI: OrderForm 组件渲染界面
 * - Seed: 此页面组装 core 和 ui
 */

import { useState, useCallback } from 'react'
import { Card, Button, Space, Typography, Alert, Descriptions, message } from 'antd'
import { PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { createOrderEngine } from '@terence/core'
import { OrderFormView } from '@terence/ui'

const { Title, Text } = Typography

function OrderPage() {
  // 创建 engine 实例，注入 mock API
  const [engine] = useState(() =>
    createOrderEngine({
      submitOrder: async (payload) => {
        console.log('提交订单到后端:', payload)

        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 模拟成功响应（90% 成功率）
        if (Math.random() > 0.1) {
          message.success('订单提交成功！')
          return { id: `ORD-${Date.now()}` }
        } else {
          // 模拟失败
          throw new Error('网络错误，请重试')
        }
      },
    })
  )

  // 订阅 engine 状态
  const [state, setState] = useState(engine.getState())

  useState(() => {
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState)
      console.log('Engine 状态更新:', newState)
    })

    return unsubscribe
  })

  // 添加示例商品
  const handleAddSampleProduct = useCallback(() => {
    try {
      const sampleProducts = [
        { productId: 'p1', name: 'MacBook Pro 14"', price: 149900, quantity: 1, unit: '台' },
        { productId: 'p2', name: 'iPhone 15 Pro', price: 79990, quantity: 1, unit: '台' },
        { productId: 'p3', name: 'AirPods Pro', price: 19990, quantity: 2, unit: '个' },
        { productId: 'p4', name: 'Magic Keyboard', price: 12990, quantity: 1, unit: '个' },
      ]

      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
      engine.addItem(randomProduct)
      message.success(`已添加：${randomProduct.name}`)
    } catch (err) {
      message.error(`添加失败：${err.message}`)
    }
  }, [engine])

  // 提交订单
  const handleSubmit = useCallback(async () => {
    try {
      await engine.submit()
    } catch (err) {
      message.error(`提交失败：${err.message}`)
    }
  }, [engine])

  // 重置订单
  const handleReset = useCallback(() => {
    engine.reset()
    message.info('订单已重置')
  }, [engine])

  // 包装 engine actions 传递给 view
  const actions = {
    onRemoveItem: (productId) => engine.removeItem(productId),
    onUpdateQty: (productId, quantity) => engine.updateQty(productId, quantity),
    onSubmit: handleSubmit,
    onReset: handleReset,
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 页面标题 */}
        <div>
          <Title level={2}>
            <ShoppingCartOutlined /> 订单管理示例
          </Title>
          <Text type="secondary">演示 Terence 三层架构：Core（业务逻辑）→ UI（视图）→ Seed（应用）</Text>
        </div>

        {/* Engine 实时状态 */}
        <Card title="Engine 状态（Core 层）" size="small">
          <Descriptions column={4} size="small">
            <Descriptions.Item label="状态">
              <Text code>{state.status}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="订单项数">
              <Text code>{state.items.length}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="总金额">
              <Text code>¥{(state.totalAmount / 100).toFixed(2)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="可提交">
              <Text code style={{ color: state.canSubmit ? 'green' : 'red' }}>
                {state.canSubmit ? '是' : '否'}
              </Text>
            </Descriptions.Item>
          </Descriptions>

          {state.orderId && <Alert message={`订单已创建，ID: ${state.orderId}`} type="success" showIcon style={{ marginTop: 12 }} />}

          {state.error && <Alert message={`错误: ${state.error}`} type="error" showIcon closable style={{ marginTop: 12 }} />}
        </Card>

        {/* 操作按钮 */}
        <Card>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSampleProduct} disabled={state.status === 'submitting' || state.status === 'completed'}>
              添加示例商品
            </Button>
            <Button onClick={handleReset} disabled={state.status === 'submitting'}>
              重置订单
            </Button>
          </Space>
        </Card>

        {/* 订单表单（UI 层） */}
        <Card title="订单表单（UI 层 - OrderForm 组件）">
          <OrderFormView state={state} {...actions} loading={state.status === 'submitting'} />
        </Card>

        {/* 架构说明 */}
        <Card title="架构说明" size="small">
          <Space direction="vertical" size="small">
            <Text>
              • <Text strong>Core 层</Text>: OrderEngine 管理订单状态、校验规则、提交逻辑
            </Text>
            <Text>
              • <Text strong>UI 层</Text>: OrderForm 组件负责渲染，通过 Adapter 接入 Core
            </Text>
            <Text>
              • <Text strong>Seed 层</Text>: 此页面组装 Engine 和 UI，处理应用级逻辑
            </Text>
            <Text type="secondary">打开控制台查看 Engine 状态变化日志</Text>
          </Space>
        </Card>
      </Space>
    </div>
  )
}

export default OrderPage
