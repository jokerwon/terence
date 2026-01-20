import { Input, Button, message, Form } from 'antd'
import { createLoginEngine } from '@terence/core'
import { createReactAdapter } from '@terence/core/adapters/react'

const loginEngine = createLoginEngine({
  loginRequest: async (payload) => {
    // Mock 实现
    return {
      token: 'demo-token',
      user: { id: '123', name: 'User' },
    }
  },
  saveToken: (token) => {
    console.log('Token saved:', token)
  },
  clearToken: () => {
    console.log('Token cleared')
  },
  navigate: (path) => {
    console.log('Navigating to:', path)
  },
})

// 创建 Adapter Hook
const useLogin = createReactAdapter(loginEngine)

export function LoginForm() {
  const { state } = useLogin()

  const handleChange = (changedValues) => {
    // commands.updateField(state.activeType, changedValues)
  }

  const handleSubmit = async (values) => {
    // try {
    //   const res = await commands.submit(values)
    //   console.log(res)
    // } catch (error) {
    //   message.error(error?.message)
    // }
  }

  return (
    <Form onValuesChange={handleChange} onFinish={handleSubmit}>
      <Form.Item required name="username">
        <Input placeholder="账号" />
      </Form.Item>

      {/* {state.activeType === 'password' && (
        <Form.Item required name="password">
          <Input.Password placeholder="密码" />
        </Form.Item>
      )}

      {state.activeType === 'otp' && (
        <Form.Item required name="otp">
          <Input placeholder="OTP" />
        </Form.Item>
      )} */}

      <Button htmlType="submit" type="primary">
        登录
      </Button>
    </Form>
  )
}
