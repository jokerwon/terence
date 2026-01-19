/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 从 Ant Design token 派生
        primary: 'var(--ant-color-primary)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // 禁用与 Ant Design 冲突的插件
    preflight: false,
  },
}
