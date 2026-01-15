# Business UI

> Enterprise business component library built on shadcn/ui

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)

A collection of reusable business components built with React, TypeScript, and Tailwind CSS, inspired by the shadcn/ui component philosophy. Unlike traditional component libraries, Business UI delivers source code directly to your project, giving you complete control over customization and styling.

## 🎯 Quick Start

```bash
# Initialize shadcn/ui (if not already done)
npx shadcn-ui@latest init

# Add a component
npx business-ui add advanced-search

# Use it in your app
import { AdvancedSearch } from '@/components/advanced-search'
```

👉 [5-Minute Quick Start Guide](./docs/QUICK_START.md)

## ✨ Features

- 🎨 **Source Code Delivery** - Components are copied to your project, not installed as dependencies
- 🔧 **Fully Customizable** - Modify styles and behavior to match your needs
- 🎯 **Built on shadcn/ui** - Leverages battle-tested UI primitives from Radix UI
- 📦 **Zero Lock-in** - Own your components, no vendor lock-in
- 🚀 **CLI Tool** - Easy installation with `npx business-ui add`
- 💪 **TypeScript First** - Full type safety out of the box
- 🎭 **Tailwind CSS** - Style with utility classes
- 📚 **Rich Components** - Advanced search, data tables, form wizards, and more

## 🚀 Quick Start

### Prerequisites

- React 18+
- Node.js 18+
- A project with Tailwind CSS configured
- shadcn/ui initialized (for base components)

### Installation

Initialize shadcn/ui in your project first (if not already done):

```bash
npx shadcn-ui@latest init
```

Then add Business UI components:

```bash
# Add a single component
npx business-ui add advanced-search

# Add multiple components
npx business-ui add advanced-search data-table form-wizard

# Add all components
npx business-ui add --all

# Specify custom path
npx business-ui add advanced-search --path src/components
```

### List Available Components

```bash
npx business-ui list
```

## 📦 Available Components

### AdvancedSearch

A flexible search component with support for multiple field types (text, select, date, number).

```tsx
import { AdvancedSearch } from '@/components/advanced-search'

const fields = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Enter name...' },
  { name: 'status', label: 'Status', type: 'select', options: [...] },
  { name: 'date', label: 'Date', type: 'date' },
]

<AdvancedSearch
  fields={fields}
  onSearch={(values) => console.log(values)}
  columns={3}
/>
```

### DataTable

Feature-rich data table with sorting, pagination, and row selection based on TanStack Table.

```tsx
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<User>[] = [...]
const data: User[] = [...]

<DataTable
  columns={columns}
  data={data}
  enableRowSelection
  enablePagination
  enableSorting
/>
```

### FormWizard

Multi-step form wizard with validation and navigation.

```tsx
import { FormWizard } from '@/components/form-wizard'

const steps = [
  {
    id: 'step1',
    title: 'Personal Info',
    content: <PersonalInfoForm />,
    validate: () => validatePersonalInfo(),
  },
  // ... more steps
]

<FormWizard
  steps={steps}
  onComplete={handleComplete}
  showStepIndicator
/>
```

## 🎨 Customization

Since components are copied to your project, you have full control:

1. **Modify Styles**: Change Tailwind classes directly in the component
2. **Add Features**: Extend components with additional functionality
3. **Refactor**: Reorganize code to match your architecture
4. **No Breaking Changes**: Updates don't affect your customized code

## 📚 Documentation

- **Getting Started**
  - [Quick Start (5 min)](./docs/QUICK_START.md)
  - [Detailed Setup Guide](./docs/GETTING_STARTED.md)
- **Components**
  - [Component API Reference](./docs/COMPONENTS.md)
  - [Live Examples](./examples/next-app)
- **Development**
  - [Architecture Overview](./docs/ARCHITECTURE.md)
  - [Development Guide](./docs/DEVELOPMENT.md)
  - [Contributing Guidelines](./CONTRIBUTING.md)
- **Other**
  - [Changelog](./CHANGELOG.md)

## 🛠️ Development

This project uses pnpm workspaces:

```bash
# Install dependencies
pnpm install

# Build CLI tool
pnpm build

# Build all packages
pnpm build:all

# Run type checking
pnpm type-check
```

## 🏗️ Project Structure

```
business-ui/
├── packages/
│   ├── cli/              # CLI tool
│   └── components/       # Component source code
├── registry/             # Component registry
├── examples/             # Example applications
└── docs/                 # Documentation
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - feel free to use in your projects.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Inspiration and base components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [TanStack Table](https://tanstack.com/table) - Powerful table library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 💡 Philosophy

Business UI follows the shadcn/ui philosophy: **components are not installed as npm packages**. Instead, they're copied into your project as source code. This approach gives you:

- Complete ownership of your components
- Ability to customize without limitations
- No dependency on external package updates
- Freedom to modify and extend as needed

Think of Business UI as a **component cookbook** rather than a traditional library.

---

Built with ❤️ for developers who value control and flexibility.
