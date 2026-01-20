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
  // Core 层架构约束 - 覆盖所有 src/ 目录
  {
    files: ['src/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react/jsx-runtime'],
              message: '[架构约束 Core] Core 层不能引入 React。Adapter 属于 UI 层 (packages/ui/hooks/adapters/)。'
            },
            {
              group: ['zustand', 'redux', '@reduxjs/toolkit', 'mobx', 'immer'],
              message: '[架构约束 Core] Core 层不能使用状态管理库。Stateless Core 无状态，Engine 使用内部 StateContainer。'
            },
            {
              group: ['antd', '@ant-design/icons'],
              message: '[架构约束 Core] Core 层不能依赖 UI 组件库。'
            },
            {
              group: ['@terence/ui/**'],
              message: '[架构约束 Core] Core 层不能通过 @terence/ui 间接导入 UI 库。'
            }
          ]
        }
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement',
          message: '[架构约束 Core] Core 层不能使用 JSX。Core 是纯业务逻辑层。'
        }
      ]
    }
  },
  // UI 层规则 - 禁止直接调用 Engine.subscribe
  {
    files: ['**/*.jsx', '**/*.js'],
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'CallExpression[callee.object.type="Identifier"][callee.object.name="engine"][callee.property.name="subscribe"]',
          message: '[架构约束 UI] 请使用 Adapter Hook 订阅 Engine 状态，不要��接调用 engine.subscribe()。使用 createReactAdapter(engine) 创建 Hook。'
        }
      ]
    }
  }
];
