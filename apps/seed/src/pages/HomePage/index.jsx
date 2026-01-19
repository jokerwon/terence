/**
 * HomePage - 首页示例组件
 */
import { useHomePage } from './useHomePage'

export function HomePage() {
  const { title, message } = useHomePage()

  return (
    <div style={{ padding: '20px' }}>
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  )
}
