/**
 * Modal - 模态框组件
 */
import { Modal as AntModal, Button } from 'antd'
import { useUIStore } from '../../stores/useUIStore.js'

export function Modal() {
  const { modal, closeModal } = useUIStore()

  return (
    <AntModal
      open={modal.visible}
      title={modal.title}
      onCancel={closeModal}
      footer={[
        <Button key="cancel" onClick={closeModal}>
          取消
        </Button>,
        <Button key="ok" type="primary" onClick={modal.onOk}>
          确定
        </Button>,
      ]}
    >
      {modal.content}
    </AntModal>
  )
}
