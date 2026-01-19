/**
 * 路由配置
 */
import { createBrowserRouter } from 'react-router'
import GlobalLayout from '../layouts/GlobalLayout'
import { HomePage } from '../pages/HomePage'
import { StateExample } from '../pages/StateExample'

export const router = createBrowserRouter([
  {
    Component: GlobalLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: 'state-example',
        Component: StateExample,
      },
    ],
  },
])
