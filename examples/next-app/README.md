# Business UI Example Application

This is a Next.js example application demonstrating all Business UI components.

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Run the development server:

```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## What's Included

This example showcases:

- **Advanced Search** - Multi-field search component
- **Data Table** - Interactive data table with sorting and pagination
- **Form Wizard** - Multi-step form with validation

## Adding Business UI Components

To add components to this project:

```bash
# From the examples/next-app directory
npx business-ui add advanced-search
npx business-ui add data-table
npx business-ui add form-wizard
```

Note: The example components are pre-configured. Use the commands above to see how the CLI works.

## Project Structure

```
next-app/
├── app/
│   ├── advanced-search/      # Advanced search example
│   ├── data-table/            # Data table example
│   ├── form-wizard/           # Form wizard example
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── advanced-search/       # Business UI component
│   ├── data-table/            # Business UI component
│   └── form-wizard/           # Business UI component
└── lib/
    └── utils.ts               # Utility functions
```

## Customization

All components are included as source code, so you can:

1. Modify styles in the component files
2. Add new features
3. Change behavior
4. Integrate with your state management

## Learn More

- [Business UI Documentation](../../docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
