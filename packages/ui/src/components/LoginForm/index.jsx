import { Input, Button, message, Form } from 'antd'

export function LoginForm() {
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
    <Form className="bg-amber-100" onValuesChange={handleChange} onFinish={handleSubmit}>
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
