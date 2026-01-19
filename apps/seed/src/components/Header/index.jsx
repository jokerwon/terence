/**
 * Header - 示例项目级组件
 */
import { Button } from 'antd'
import { useUIStore } from '../../stores/useUIStore.js'

export function Header() {
  const { theme, toggleTheme } = useUIStore()
  const isDark = theme.mode === 'dark'

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '20px',
      borderBottom: '1px solid #eee' 
    }}>
      <h2 style={{ margin: 0 }}>@terence/seed</h2>
      <Button onClick={toggleTheme}>
        切换到{isDark ? '亮色' : '暗色'}主题
      </Button>
    </header>
  )
}
