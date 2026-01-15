# Development Guide

Guide for developing and maintaining Business UI.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/business-ui.git
cd business-ui
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Build All Packages

```bash
pnpm build:all
```

## Development Workflow

### Working on the CLI

```bash
cd packages/cli

# Watch mode (auto-rebuild on changes)
pnpm dev

# Build
pnpm build

# Type check
pnpm type-check
```

### Testing CLI Locally

```bash
# Link the CLI globally
cd packages/cli
pnpm link --global

# Now you can use it anywhere
cd ~/test-project
business-ui add advanced-search

# Unlink when done
pnpm unlink --global business-ui-cli
```

### Testing with Examples

```bash
cd examples/next-app

# Install dependencies
pnpm install

# Test CLI
npx business-ui add advanced-search

# Run dev server
pnpm dev
```

## Adding a New Component

### 1. Create Component Files

```bash
mkdir -p packages/components/my-component
```

Create `packages/components/my-component/index.tsx`:

```tsx
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface MyComponentProps {
  className?: string
}

export function MyComponent({ className }: MyComponentProps) {
  return (
    <div className={cn('p-4', className)}>
      My Component
    </div>
  )
}
```

### 2. Generate Registry File

Use the helper script:

```bash
node scripts/generate-registry.js my-component
```

This creates `registry/my-component.json`. Then edit it to:
- Add proper description
- List dependencies
- List registryDependencies

### 3. Update Registry Index

Edit `registry/index.json`:

```json
{
  "components": [
    {
      "name": "my-component",
      "description": "Description here",
      "dependencies": ["react"],
      "registryDependencies": ["button"]
    }
  ]
}
```

### 4. Write Documentation

Add to `docs/COMPONENTS.md`:

```markdown
## MyComponent

Description...

### Installation

\`\`\`bash
npx business-ui add my-component
\`\`\`

### Usage

\`\`\`tsx
import { MyComponent } from '@/components/my-component'

<MyComponent />
\`\`\`

### API

...
```

### 5. Create Example

Create `examples/next-app/app/my-component/page.tsx`:

```tsx
import { MyComponent } from '@/components/my-component'

export default function MyComponentExample() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">MyComponent Example</h1>
      <MyComponent />
    </div>
  )
}
```

### 6. Test

```bash
# Build CLI
cd packages/cli
pnpm build

# Test in example
cd ../../examples/next-app
pnpm business-ui add my-component
pnpm dev
```

## Code Standards

### TypeScript

- Use strict mode
- Export all types and interfaces
- Avoid `any` (use `unknown` if needed)
- Use proper generic types

### React

- Functional components only
- Use hooks for state management
- Properly type props
- Use React.forwardRef for refs

### Styling

- Tailwind CSS utilities
- Use `cn()` for className merging
- Support dark mode with `dark:` prefix
- Responsive design with breakpoints

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Utils: `kebab-case.ts`
- Types: `types.ts` or inline

### Code Organization

```tsx
// 1. Imports
import * as React from 'react'
import { ExternalComponent } from 'external'
import { InternalComponent } from '@/components/...'

// 2. Types
export interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ prop }: ComponentProps) {
  // 3a. Hooks
  const [state, setState] = React.useState()
  
  // 3b. Handlers
  const handleClick = () => {}
  
  // 3c. Render
  return <div>...</div>
}

// 4. Sub-components (if not exported)
function SubComponent() {
  return <div>...</div>
}

// 5. Hooks
export function useComponent() {
  // ...
}
```

## Testing

### Manual Testing

```bash
# Build
pnpm build:all

# Test CLI commands
npx business-ui list
npx business-ui add advanced-search

# Test in example app
cd examples/next-app
pnpm dev
```

### Type Checking

```bash
pnpm type-check
```

### Future: Automated Tests

```bash
# Unit tests (planned)
pnpm test

# E2E tests (planned)
pnpm test:e2e
```

## Documentation

### Writing Docs

- Use clear, concise language
- Include code examples
- Add screenshots for UI components
- Document all props and options

### Doc Structure

- **README.md**: Project overview
- **QUICK_START.md**: 5-minute guide
- **GETTING_STARTED.md**: Detailed setup
- **COMPONENTS.md**: Component API docs
- **ARCHITECTURE.md**: Technical details
- **CONTRIBUTING.md**: Contribution guide

## Release Process

### 1. Update Version

```bash
# Update package.json versions
npm version patch  # or minor, major
```

### 2. Update Changelog

Edit `CHANGELOG.md`:

```markdown
## [0.2.0] - 2024-01-20

### Added
- New component: XYZ

### Fixed
- Bug in ABC component
```

### 3. Build and Test

```bash
pnpm build:all
pnpm type-check
# Manual testing
```

### 4. Commit and Tag

```bash
git add .
git commit -m "chore: release v0.2.0"
git tag v0.2.0
```

### 5. Push

```bash
git push origin main
git push origin v0.2.0
```

### 6. Publish to npm

```bash
cd packages/cli
npm publish
```

### 7. Create GitHub Release

- Go to GitHub → Releases
- Create new release
- Tag: v0.2.0
- Copy changelog content
- Publish

## Debugging

### CLI Issues

```bash
# Enable debug logging
DEBUG=business-ui* npx business-ui add component

# Check CLI code
cat packages/cli/dist/index.js
```

### Component Issues

- Check generated registry JSON
- Verify component source code
- Test in example app
- Check console for errors

### Build Issues

```bash
# Clean and rebuild
rm -rf node_modules packages/*/node_modules
pnpm install
pnpm build:all
```

## Common Tasks

### Update Dependencies

```bash
# Check outdated
pnpm outdated

# Update
pnpm update

# Update to latest
pnpm update --latest
```

### Format Code

```bash
# Add prettier (optional)
pnpm add -D -w prettier

# Format
pnpm exec prettier --write "**/*.{ts,tsx,md}"
```

### Lint Code

```bash
# Add ESLint (optional)
pnpm add -D -w eslint

# Lint
pnpm lint
```

## Troubleshooting

### pnpm link issues

```bash
# Unlink all
pnpm unlink --global

# Link again
cd packages/cli
pnpm link --global
```

### Type errors

```bash
# Rebuild
pnpm build:all

# Clean TypeScript cache
rm -rf packages/*/tsconfig.tsbuildinfo
```

### Import errors

Check:
- Path aliases in tsconfig.json
- File extensions (.tsx vs .ts)
- Named vs default exports

## Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [tsup Documentation](https://tsup.egoist.dev/)
- [Commander.js](https://github.com/tj/commander.js)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

Happy developing! 🚀
