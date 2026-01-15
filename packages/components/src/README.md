# Component Source Code

This directory contains the source code for all Business UI components.

## Directory Structure

```
src/
├── lib/                  # Utility functions
│   └── utils.ts          # Common utilities (cn function, etc.)
└── components/
    └── ui/               # shadcn/ui base components
        ├── button.tsx
        ├── input.tsx
        ├── label.tsx
        ├── select.tsx
        ├── checkbox.tsx
        ├── table.tsx
        └── card.tsx
```

## UI Components (shadcn/ui)

These are the foundational UI components based on Radix UI primitives and styled with Tailwind CSS:

### Core Components

- **button** - Button component with multiple variants (default, destructive, outline, secondary, ghost, link)
- **input** - Text input field component
- **label** - Accessible label component
- **select** - Dropdown select component with search and keyboard navigation
- **checkbox** - Checkbox input component
- **table** - Table components (Table, TableHeader, TableBody, TableRow, TableCell, etc.)
- **card** - Card layout component with header, content, and footer

### Utilities

- **utils** - Helper functions including the `cn()` utility for merging Tailwind classes

## Usage

Components are distributed via the CLI tool (`business-ui add <component>`), which copies the source code directly into user projects. This approach provides:

- Full control and customization
- No runtime dependencies on this package
- Easy modification to fit specific needs
- Type-safe TypeScript components

## Dependencies

All UI components depend on:

- React 18+
- Tailwind CSS 3+
- Radix UI primitives (for accessible, unstyled components)
- class-variance-authority (for variant management)
- clsx & tailwind-merge (for className handling)
- lucide-react (for icons)

## Path Aliases

Components use `@/` path aliases which resolve to the project root:

- `@/components/ui/*` - UI components
- `@/lib/utils` - Utility functions

Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```
