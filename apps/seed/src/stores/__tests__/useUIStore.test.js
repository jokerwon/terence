import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../useUIStore.js'

describe('useUIStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    useUIStore.setState({
      modal: { visible: false, content: null, title: null, onOk: null, onCancel: null },
      drawer: { visible: false, content: null, title: null, placement: 'right' },
      user: null,
      loading: { global: false, page: false },
      theme: { mode: 'light' },
    })
  })

  it('should manage modal state correctly', () => {
    const { modal, openModal, closeModal } = useUIStore.getState()

    expect(modal.visible).toBe(false)

    openModal({
      title: 'Test Modal',
      content: <div>Test Content</div>,
    })

    const updatedState = useUIStore.getState()
    expect(updatedState.modal.visible).toBe(true)
    expect(updatedState.modal.title).toBe('Test Modal')

    closeModal()

    const finalState = useUIStore.getState()
    expect(finalState.modal.visible).toBe(false)
  })

  it('should manage drawer state correctly', () => {
    const { drawer, openDrawer, closeDrawer } = useUIStore.getState()

    expect(drawer.visible).toBe(false)

    openDrawer({
      title: 'Test Drawer',
      placement: 'left',
    })

    const updatedState = useUIStore.getState()
    expect(updatedState.drawer.visible).toBe(true)
    expect(updatedState.drawer.placement).toBe('left')

    closeDrawer()

    const finalState = useUIStore.getState()
    expect(finalState.drawer.visible).toBe(false)
  })

  it('should toggle theme mode correctly', () => {
    const { theme, toggleTheme } = useUIStore.getState()

    expect(theme.mode).toBe('light')

    toggleTheme()

    const updatedState = useUIStore.getState()
    expect(updatedState.theme.mode).toBe('dark')
  })
})
