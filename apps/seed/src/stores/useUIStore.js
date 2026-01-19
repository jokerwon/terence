import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * UI 状态管理 Store
 *
 * 职责边界:
 * - ✅ 管理跨页面 UI 状态 (modal、drawer、sidebar)
 * - ✅ 管理用户信息和权限
 * - ❌ 禁止管理 core 业务状态
 */
export const useUIStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Modal 状态
        modal: {
          visible: false,
          content: null,
          title: null,
          onOk: null,
          onCancel: null,
        },
        setModal: (modal) => set({ modal }, false, 'setModal'),
        openModal: (config) => set(
          { modal: { visible: true, ...config } },
          false,
          'openModal'
        ),
        closeModal: () => set({ modal: { visible: false, content: null, title: null, onOk: null, onCancel: null } }, false, 'closeModal'),

        // Drawer 状态
        drawer: {
          visible: false,
          content: null,
          title: null,
          placement: 'right',
        },
        setDrawer: (drawer) => set({ drawer }, false, 'setDrawer'),
        openDrawer: (config) => set(
          { drawer: { visible: true, ...config } },
          false,
          'openDrawer'
        ),
        closeDrawer: () => set({ drawer: { visible: false, content: null, title: null, placement: 'right' } }, false, 'closeDrawer'),

        // 用户信息 (如需要)
        user: null,
        setUser: (user) => set({ user }, false, 'setUser'),
        clearUser: () => set({ user: null }, false, 'clearUser'),

        // 全局加载状态
        loading: {
          global: false,
          page: false,
        },
        setGlobalLoading: (loading) => set((state) => ({ loading: { ...state.loading, global: loading } }), false, 'setGlobalLoading'),
        setPageLoading: (loading) => set((state) => ({ loading: { ...state.loading, page: loading } }), false, 'setPageLoading'),

        // 主题状态
        theme: {
          mode: 'light',
        },
        setThemeMode: (mode) => set((state) => ({ theme: { ...state.theme, mode } }), false, 'setThemeMode'),
        toggleTheme: () => set((state) => ({ theme: { mode: state.theme.mode === 'light' ? 'dark' : 'light' } }), false, 'toggleTheme'),
      }),
      {
        name: 'terence-seed-ui-store', // localStorage key
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
        }), // 只持久化部分状态
      }
    ),
    { name: 'UIStore' }
  )
)
