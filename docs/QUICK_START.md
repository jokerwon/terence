# Quick Start Guide

Get up and running with Business UI in 5 minutes.

## Step 1: Prerequisites (1 minute)

Make sure you have:
- ✅ A React project (Next.js, Vite, Create React App, etc.)
- ✅ Tailwind CSS installed and configured
- ✅ Node.js 18 or higher

## Step 2: Initialize shadcn/ui (2 minutes)

If you haven't already, set up shadcn/ui:

```bash
npx shadcn-ui@latest init
```

Answer the prompts:
- **TypeScript?** Yes
- **Style?** Default (or your preference)
- **Base color?** Slate (or your preference)
- **CSS variables?** Yes

This creates:
- `components/ui/` directory
- `lib/utils.ts` with the `cn()` helper
- Configured Tailwind

## Step 3: Add Your First Component (1 minute)

Let's add the Advanced Search component:

```bash
npx business-ui add advanced-search
```

The CLI will:
1. Download the component
2. Check dependencies
3. Install missing packages (if any)
4. Copy files to your project

## Step 4: Use the Component (1 minute)

Create a new page or component:

```tsx
// app/search/page.tsx or pages/search.tsx
import { AdvancedSearch } from '@/components/advanced-search'

export default function SearchPage() {
  const fields = [
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
  ]

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">User Search</h1>
      <AdvancedSearch
        fields={fields}
        onSearch={(values) => {
          console.log('Search:', values)
          // Your search logic here
        }}
      />
    </div>
  )
}
```

## Step 5: Run and Test (30 seconds)

Start your dev server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Visit your page and try the search component!

## What's Next?

### Explore Other Components

```bash
# List all components
npx business-ui list

# Add more components
npx business-ui add data-table
npx business-ui add form-wizard
```

### Customize

The component is now in your project. Edit it directly:

```
your-project/
└── src/components/
    └── advanced-search/
        ├── index.tsx              # ← Edit this!
        └── use-advanced-search.ts
```

### Learn More

- 📚 [Full Documentation](./GETTING_STARTED.md)
- 🎨 [Component API Reference](./COMPONENTS.md)
- 💻 [Example Project](../examples/next-app)

## Common Issues

### Import errors?

Check your `tsconfig.json` has:

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

### shadcn/ui components missing?

Install them manually:

```bash
npx shadcn-ui@latest add button input select label
```

### TypeScript errors?

Install type definitions:

```bash
npm install -D @types/react @types/node
```

## Need Help?

- 📖 Read the [Getting Started Guide](./GETTING_STARTED.md)
- 🐛 [Open an issue](https://github.com/yourusername/business-ui/issues)
- 💬 [Start a discussion](https://github.com/yourusername/business-ui/discussions)

---

That's it! You're now using Business UI. Happy coding! 🚀
