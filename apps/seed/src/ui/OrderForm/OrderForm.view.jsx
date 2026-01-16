/**
 * OrderFormView - 订单表单视图组件
 *
 * 职责：
 * - 纯 UI 渲染，不包含业务逻辑
 * - 通过 props 接收 state 和 actions（由 adapter 提供）
 * - 不直接导入 @terence/core
 * - 使用 antd 组件渲染表单
 */

import { Table, InputNumber, Button, Space, Alert, Typography, Spin } from 'antd'

const { Text } = Typography

/**
 * 订单表单视图组件
 *
 * @param {Object} props
 * @param {Object} props.state - 订单状态（由 adapter 提供）
 * @param {Array} props.state.items - 订单项列表
 * @param {string} props.state.status - 订单状态
 * @param {boolean} props.state.canSubmit - 是否可提交
 * @param {number} props.state.totalAmount - 总金额
 * @param {string|null} props.state.error - 错误信息
 * @param {Function} props.onAddItem - 添加订单项
 * @param {Function} props.onRemoveItem - 移除订单项
 * @param {Function} props.onUpdateQty - 更新数量
 * @param {Function} props.onSubmit - 提交订单
 * @param {Function} props.onReset - 重置订单
 * @param {boolean} props.loading - 加载状态
 * @returns {import('react').JSX.Element}
 */
export function OrderFormView({ state, onAddItem: _onAddItem, onRemoveItem, onUpdateQty, onSubmit, onReset, loading = false }) {
  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text>¥{(price / 100).toFixed(2)}</Text>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber min={1} max={999} value={quantity} onChange={(value) => onUpdateQty?.(record.productId, value)} disabled={state.status === 'submitting' || state.status === 'completed'} />
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_, record) => <Text>¥{((record.price * record.quantity) / 100).toFixed(2)}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" danger onClick={() => onRemoveItem?.(record.productId)} disabled={state.status === 'submitting' || state.status === 'completed'}>
          删除
        </Button>
      ),
    },
  ]

  const summary = () => (
    <Table.Summary fixed>
      <Table.Summary.Row>
        <Table.Summary.Cell index={0} colSpan={3} align="right">
          <Text strong>总计：</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={1}>
          <Text strong style={{ fontSize: 16 }}>
            ¥{(state.totalAmount / 100).toFixed(2)}
          </Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={2} />
      </Table.Summary.Row>
    </Table.Summary>
  )

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 状态提示 */}
        {state.status === 'completed' && <Alert message="订单已提交成功" type="success" showIcon closable />}

        {state.status === 'failed' && state.error && <Alert message="订单提交失败" description={state.error} type="error" showIcon closable />}

        {state.status === 'submitting' && <Alert message="正在提交订单..." type="info" showIcon />}

        {/* 表格 */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={state.items}
            rowKey="productId"
            pagination={false}
            summary={summary}
            locale={{
              emptyText: '暂无商品，请添加商品',
            }}
          />
        </Spin>

        {/* 操作按钮 */}
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onReset} disabled={state.status === 'submitting'}>
            重置
          </Button>
          <Button type="primary" onClick={onSubmit} disabled={!state.canSubmit || state.status === 'submitting' || state.status === 'completed'} loading={state.status === 'submitting'}>
            提交订单
          </Button>
        </Space>
      </Space>
    </div>
  )
}
