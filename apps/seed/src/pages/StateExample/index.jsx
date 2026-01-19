/**
 * StateExample - 状态管理示例页面
 */
import { useUIStore } from '../../stores/useUIStore.js'
import { Modal } from '../../components/Modal'
import { Drawer } from '../../components/Drawer'
import { Button, Space, Card, Typography } from 'antd'

const { Text, Paragraph } = Typography

export function StateExample() {
  const { theme, toggleTheme, openModal, openDrawer } = useUIStore()

  const handleOpenModal = () => {
    openModal({
      title: '示例 Modal',
      content: <div>这是一个使用 Zustand 管理的模态框</div>,
      onOk: () => console.log('Modal OK clicked'),
      onCancel: () => console.log('Modal Cancel clicked'),
    })
  }

  const handleOpenDrawer = () => {
    openDrawer({
      title: '示例 Drawer',
      placement: 'right',
      content: <div>这是一个使用 Zustand 管理的抽屉</div>,
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <Card title="状态管理示例">
        <Paragraph>此页面演示如何正确使用 Zustand 管理 UI 状态。</Paragraph>

        <Space orientation="vertical" size="large">
          <div>
            <Text strong>当前主题: {theme.mode}</Text>
          </div>

          <Space>
            <Button type="primary" onClick={toggleTheme}>
              切换主题
            </Button>
            <Button onClick={handleOpenModal}>打开 Modal</Button>
            <Button onClick={handleOpenDrawer}>打开 Drawer</Button>
          </Space>

          <Paragraph>
            <Text type="secondary">注意: Zustand 只管理 UI 状态,不管理 core 业务状态。</Text>
          </Paragraph>
        </Space>
      </Card>

      <Modal />
      <Drawer />
    </div>
  )
}
