import { theme } from 'antd'

const { defaultAlgorithm, darkAlgorithm } = theme

export const lightTheme = {
  algorithm: defaultAlgorithm,
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
  },
}

export const darkTheme = {
  algorithm: darkAlgorithm,
  token: {
    colorPrimary: '#177ddc',
  },
}
