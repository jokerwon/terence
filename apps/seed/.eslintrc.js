import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      // 架构边界检测
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@terence/core/engines/*'],
              message: '页面组件应直接使用 engine,但 UI 组件必须通过 adapter 访问 engine',
            },
          ],
        },
      ],
      // React 规则
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      // 其他规则
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]
