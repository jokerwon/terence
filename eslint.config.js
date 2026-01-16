import js from '@eslint/js'
import globals from 'globals'

/**
 * ESLint Flat Config for Terence Project
 * Enforces architectural boundaries between core, ui, and seed packages
 */

export default [
  // Ignore patterns
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', '*.config.ts', '*.config.js'],
  },

  // Global base configuration
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // 基础规则
      'no-console': 'off',
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        vars: 'all',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^React$'  // 忽略未使用的 React 导入
      }],

      // ES2022+ 特性
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  // JSX 文件：放宽未使用变量检查（因为 JSX 中的使用可能无法被检测）
  {
    files: ['**/*.jsx'],
    rules: {
      'no-unused-vars': 'off'  // 在 JSX 文件中禁用此规则，因为无法可靠地检测 JSX 中的使用
    }
  },

  // Core package: 严禁依赖 UI 库和其他 Terence 包
  {
    files: ['packages/core/**/*.js'],
    rules: {
      // 禁止导入 UI 库和其他包
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@terence/ui', '@terence/seed'],
              message: '[架构原则 I. 分层架构] Core 包严禁依赖 UI 或 Seed 包。依赖方向：core → ui 是被禁止的。参考：.specify/memory/constitution.md',
            },
            {
              group: ['react', 'react-dom', 'antd'],
              message: '[架构原则 I. 分层架构] Core 包严禁依赖 UI 库（React/antd）。Core 应只包含业务逻辑。参考：.specify/memory/constitution.md',
            },
          ],
        },
      ],
      // 禁止使用 JSX（Core 包是纯 JS，不包含 UI）
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement',
          message: '[架构原则 I. 分层架构] Core 包严禁使用 JSX。Core 是纯业务逻辑层，不包含 UI 代码。参考：.specify/memory/constitution.md',
        },
      ],
    },
  },

  // UI package: 可以依赖 core，但不能依赖 seed
  {
    files: ['packages/ui/**/*.js', 'packages/ui/**/*.jsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@terence/seed'],
              message: '[架构原则 I. 分层架构] UI 包严禁依赖 Seed 包。依赖方向：ui → seed 是被禁止的。参考：.specify/memory/constitution.md',
            },
          ],
        },
      ],
    },
  },

  // UI View 文件：禁止直接导入 core engines/services（必须通过 adapter）
  {
    files: ['packages/ui/**/*.view.jsx', 'packages/ui/**/View.jsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@terence/core/engines', '@terence/core/services', '@terence/core/guards'],
              message: '[架构原则 II. 接缝点原则] View 文件严禁直接导入 Core engines/services/guards。所有业务逻辑必须通过 Adapter 层访问。参考：.specify/memory/constitution.md',
            },
          ],
        },
      ],
    },
  },
]
