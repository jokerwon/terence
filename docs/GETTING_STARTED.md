# Getting Started with Business UI

This guide will help you set up Business UI in your project and add your first component.

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18 or higher
- **React** 18 or higher
- A React project with **Tailwind CSS** configured
- **shadcn/ui** initialized in your project

## Step 1: Initialize shadcn/ui

If you haven't already set up shadcn/ui in your project, run:

```bash
npx shadcn-ui@latest init
```

Follow the prompts to configure:
- TypeScript (recommended: Yes)
- Style (choose your preferred style)
- Base color (choose your brand color)
- CSS variables (recommended: Yes)

This will create:
- `components/ui/` directory for base components
- `lib/utils.ts` with utility functions
- Tailwind CSS configuration
- TypeScript path aliases

## Step 2: Verify Your Setup

Make sure your project has these files:

```
your-project/
├── components/
│   └── ui/              # shadcn/ui components
├── lib/
│   └── utils.ts         # cn() utility function
├── tailwind.config.js   # Tailwind configuration
└── tsconfig.json        # TypeScript configuration with paths
```

Your `tsconfig.json` should have path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Step 3: Add Your First Component

### List Available Components

See what components are available:

```bash
npx business-ui list
```

This will show you all available components with their descriptions and dependencies.

### Add a Component

Let's add the AdvancedSearch component:

```bash
npx business-ui add advanced-search
```

The CLI will:
1. Check for missing dependencies
2. Prompt to install them if needed
3. Download the component files
4. Copy them to your project

By default, components are added to `src/components/`. You can customize this:

```bash
npx business-ui add advanced-search --path components/business
```

### What Gets Installed

After running the command, you'll have:

```
src/components/
└── advanced-search/
    ├── index.tsx                    # Main component
    └── use-advanced-search.ts       # React hook (if applicable)
```

## Step 4: Use the Component

Now you can import and use the component in your app:

```tsx
import { AdvancedSearch } from '@/components/advanced-search'

export default function MyPage() {
  const searchFields = [
    {
      name: 'username',
      label: 'Username',
      type: 'text' as const,
      placeholder: 'Enter username...',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'createdAt',
      label: 'Created Date',
      type: 'date' as const,
    },
  ]

  const handleSearch = (values: Record<string, any>) => {
    console.log('Search values:', values)
    // Perform your search logic here
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Search</h1>
      <AdvancedSearch
        fields={searchFields}
        onSearch={handleSearch}
        columns={3}
      />
    </div>
  )
}
```

## Step 5: Customize the Component

Since the component is now in your project, you can customize it freely:

### Change Styles

Edit `src/components/advanced-search/index.tsx`:

```tsx
// Change the container styling
<div className={cn('rounded-lg border bg-card p-6', className)}>
  // to
<div className={cn('rounded-xl border-2 shadow-lg bg-white p-8', className)}>
```

### Add Features

You can add new props, modify behavior, or extend functionality:

```tsx
export interface AdvancedSearchProps {
  fields: SearchField[]
  onSearch: (values: Record<string, any>) => void
  onReset?: () => void
  className?: string
  columns?: 1 | 2 | 3 | 4
  // Add your custom prop
  showClearButton?: boolean
}
```

### Refactor Code

Reorganize the code to match your project structure:
- Move types to a separate file
- Extract sub-components
- Add custom hooks
- Integrate with your state management

## Step 6: Add More Components

### Add Multiple Components at Once

```bash
npx business-ui add advanced-search data-table form-wizard
```

### Add All Components

```bash
npx business-ui add --all
```

### Skip Prompts

Use the `-y` flag to skip confirmation prompts:

```bash
npx business-ui add data-table -y
```

## Dependencies

### Automatic Installation

The CLI automatically detects and installs missing dependencies. For example, when adding `data-table`, it will install `@tanstack/react-table` if not present.

### Manual Installation

If you prefer to manage dependencies manually, you can skip auto-install and run:

```bash
# For data-table
pnpm add @tanstack/react-table

# For other components, check their dependencies
npx business-ui list
```

## Common Issues

### Path Aliases Not Working

If you get import errors, make sure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

For Next.js, also check `next.config.js`:

```js
module.exports = {
  // ... other config
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    }
    return config
  },
}
```

### Missing shadcn/ui Components

If a component needs a shadcn/ui component that's not installed:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
# etc.
```

The CLI will warn you about missing registry dependencies.

### TypeScript Errors

Make sure you have the required type definitions:

```bash
pnpm add -D @types/react @types/node
```

## Next Steps

- Read the [Component Documentation](./COMPONENTS.md) to learn about all available components
- Check out the [Example Project](../examples/next-app) for complete usage examples
- Customize components to match your design system
- Build your own components following the same patterns

## Support

If you encounter issues:
1. Check the documentation
2. Review the example project
3. Open an issue on GitHub
4. Read the source code - it's all in your project now!

---

Happy building! 🚀
