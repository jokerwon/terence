import { Outlet } from 'react-router'
import { App, ConfigProvider } from 'antd'

export default function GlobalLayout() {
  return (
    <ConfigProvider>
      <App>
        <Outlet />
      </App>
    </ConfigProvider>
  )
}
