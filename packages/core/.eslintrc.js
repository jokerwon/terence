import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^React$'
      }]
    }
  },
  {
    files: ['src/engines/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react/jsx-runtime'],
              message: '[架构约束 Core.engines] Engine 层严禁依赖 React。Engine 应为纯业务逻辑,无 UI 依赖。'
            },
            {
              group: ['zustand', 'immer'],
              message: '[架构约束 Core.engines] Engine 层严禁依赖状态管理库。'
            },
            {
              group: ['antd', '@ant-design/icons'],
              message: '[架构约束 Core.engines] Engine 层严禁依赖 UI 组件库。'
            },
            {
              group: ['@terence/ui/**'],
              message: '[架构约束 Core.engines] Engine 层严禁通过 @terence/ui 间接导入 UI 库。'
            }
          ]
        }
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement',
          message: '[架构约束 Core.engines] Engine 层严禁使用 JSX。Engine 是纯业务逻辑层。'
        }
      ]
    }
  }
];
