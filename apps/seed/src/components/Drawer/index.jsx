/**
 * Drawer - 抽屉组件
 */
import { Drawer as AntDrawer, Button } from 'antd'
import { useUIStore } from '../../stores/useUIStore.js'

export function Drawer() {
  const { drawer, closeDrawer } = useUIStore()

  return (
    <AntDrawer
      open={drawer.visible}
      title={drawer.title}
      placement={drawer.placement}
      onClose={closeDrawer}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" onClick={closeDrawer}>
            确定
          </Button>
        </div>
      }
    >
      {drawer.content}
    </AntDrawer>
  )
}
