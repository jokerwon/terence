# Architecture

This document describes the architecture and design decisions of Business UI.

## Overview

Business UI is a monorepo project that distributes React components as source code rather than npm packages. It consists of:

1. **CLI Tool** - Command-line interface for component installation
2. **Component Library** - Source code for business components
3. **Registry System** - Component metadata and distribution
4. **Documentation** - Usage guides and API docs
5. **Examples** - Reference implementations

## Philosophy

### Source Code Distribution

Unlike traditional component libraries (Material-UI, Ant Design), Business UI follows the shadcn/ui philosophy:

**Traditional Approach:**
```
npm install component-library → Use components → Limited customization
```

**Business UI Approach:**
```
CLI copies source → Components in your codebase → Full customization
```

**Advantages:**
- ✅ Complete code ownership
- ✅ No breaking changes from updates
- ✅ Full customization freedom
- ✅ Easier debugging (source code visible)
- ✅ No bundle size overhead

**Trade-offs:**
- ⚠️ Manual updates (copy new version if needed)
- ⚠️ Code duplication across projects
- ⚠️ No automatic security patches

## Project Structure

```
business-ui/
├── packages/
│   ├── cli/                      # CLI Tool Package
│   │   ├── src/
│   │   │   ├── commands/         # CLI commands
│   │   │   │   ├── add.ts       # Component installation
│   │   │   │   └── list.ts      # List components
│   │   │   ├── utils/           # Utility functions
│   │   │   │   ├── fetcher.ts   # Registry fetching
│   │   │   │   ├── resolver.ts  # Dependency resolution
│   │   │   │   └── fs.ts        # File operations
│   │   │   ├── cli.ts           # CLI setup
│   │   │   └── index.ts         # Entry point
│   │   ├── package.json         # CLI dependencies
│   │   └── tsup.config.ts       # Build config
│   │
│   └── components/               # Component Source Code
│       ├── advanced-search/      # Advanced Search
│       │   ├── index.tsx        # Component
│       │   └── use-advanced-search.ts
│       ├── data-table/           # Data Table
│       │   └── index.tsx
│       └── form-wizard/          # Form Wizard
│           └── index.tsx
│
├── registry/                     # Registry System
│   ├── index.json               # Component index
│   ├── advanced-search.json     # Component metadata + code
│   ├── data-table.json
│   └── form-wizard.json
│
├── examples/                     # Example Applications
│   └── next-app/                # Next.js example
│       ├── app/                 # App router
│       ├── components/          # Installed components
│       └── package.json
│
├── docs/                         # Documentation
│   ├── README.md
│   ├── GETTING_STARTED.md
│   ├── COMPONENTS.md
│   ├── QUICK_START.md
│   └── ARCHITECTURE.md
│
├── scripts/                      # Development scripts
│   └── generate-registry.js     # Registry generator
│
├── package.json                  # Root package.json
├── pnpm-workspace.yaml          # Workspace config
└── tsconfig.json                # TypeScript config
```

## Component Architecture

### Component Structure

Each component follows this structure:

```
component-name/
├── index.tsx                     # Main component export
├── use-component-name.ts         # Optional: React hook
├── types.ts                      # Optional: Type definitions
└── utils.ts                      # Optional: Utility functions
```

### Component Design Principles

1. **Self-contained**: Components should work independently
2. **Customizable**: Props for common customizations
3. **Extensible**: Easy to modify source code
4. **Accessible**: ARIA labels, keyboard navigation
5. **Responsive**: Mobile-first design
6. **Type-safe**: Full TypeScript support
7. **Styled**: Tailwind CSS utilities

### Example Component

```tsx
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface MyComponentProps {
  // Props interface
  data: Data[]
  onAction: (item: Data) => void
  className?: string
}

export function MyComponent({
  data,
  onAction,
  className,
}: MyComponentProps) {
  // Component implementation
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      {/* Component JSX */}
    </div>
  )
}

// Optional: Custom hook for state management
export function useMyComponent() {
  // Hook implementation
}
```

## Registry System

### Registry Structure

Each component has a JSON file in the `registry/` directory:

```json
{
  "name": "component-name",
  "description": "Component description",
  "type": "component",
  "dependencies": [
    "react",
    "external-package"
  ],
  "registryDependencies": [
    "button",
    "input"
  ],
  "files": [
    {
      "path": "component-name/index.tsx",
      "type": "component",
      "content": "... full source code ..."
    }
  ]
}
```

### Registry Index

The `registry/index.json` provides a listing:

```json
{
  "components": [
    {
      "name": "component-name",
      "description": "Component description",
      "dependencies": ["react"],
      "registryDependencies": ["button"]
    }
  ]
}
```

### Dependency Types

1. **dependencies**: npm packages to install
   - Example: `@tanstack/react-table`, `date-fns`
   - Installed via package manager

2. **registryDependencies**: shadcn/ui components
   - Example: `button`, `input`, `select`
   - User should install via `npx shadcn-ui add`

## CLI Architecture

### Command Flow

```
User runs command
     ↓
CLI parses arguments
     ↓
Fetch registry data
     ↓
Resolve dependencies
     ↓
Check missing dependencies
     ↓
Prompt user (if needed)
     ↓
Install dependencies
     ↓
Copy component files
     ↓
Success!
```

### Add Command Flow

```typescript
// 1. Parse arguments
const component = args[0]
const options = { path, all, yes }

// 2. Fetch from registry
const registryData = await fetchRegistry(component)

// 3. Resolve dependencies
const resolved = await resolveComponentDependencies(component)

// 4. Check installed packages
const missing = await getMissingDependencies(resolved.dependencies)

// 5. Install if needed
if (missing.length > 0) {
  await installDependencies(missing)
}

// 6. Copy files
for (const file of registryData.files) {
  await writeFile(targetPath, file.content)
}
```

### Dependency Resolution

```typescript
// Recursive dependency resolution
async function resolveComponentDependencies(name: string) {
  const component = await fetchRegistry(name)
  const deps = []
  
  // Resolve registry dependencies recursively
  for (const depName of component.registryDependencies) {
    const depResolved = await resolveComponentDependencies(depName)
    deps.push(...depResolved.registryDependencies)
  }
  
  return {
    component,
    dependencies: component.dependencies,
    registryDependencies: deduplicateComponents(deps),
  }
}
```

## Build System

### Monorepo Setup

Using pnpm workspaces:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'examples/*'
```

### CLI Build

Using tsup for fast TypeScript bundling:

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
})
```

Output: `dist/index.js` (executable)

## Distribution

### npm Publishing

The CLI is published to npm:

```json
{
  "name": "business-ui-cli",
  "bin": {
    "business-ui": "./dist/index.js"
  },
  "files": ["dist"]
}
```

Users run: `npx business-ui add component`

### Registry Hosting

Options for hosting registry files:

1. **GitHub Raw** (current)
   - URL: `https://raw.githubusercontent.com/user/repo/main/registry/`
   - Free, simple, version control

2. **CDN**
   - URL: `https://cdn.example.com/registry/`
   - Faster, caching, custom domain

3. **Custom API**
   - URL: `https://api.example.com/registry/`
   - Dynamic, analytics, authentication

## Design Decisions

### Why Source Code Distribution?

**Pros:**
- Full customization control
- No version lock-in
- Easier debugging
- No peer dependency conflicts
- Smaller bundle (only used code)

**Cons:**
- Manual updates
- Code duplication
- No automatic patches

**Decision:** Pros outweigh cons for business components that need heavy customization.

### Why Monorepo?

**Pros:**
- Shared tooling
- Atomic commits across packages
- Easier development
- Consistent versioning

**Cons:**
- Complex setup
- Slower CI/CD

**Decision:** Benefits worth the complexity for maintainability.

### Why pnpm?

**Pros:**
- Fast installation
- Efficient disk usage
- Good monorepo support
- Strict dependency resolution

**Cons:**
- Less popular than npm/yarn
- Requires user installation

**Decision:** Best developer experience, users can use any package manager.

### Why Not a React Library?

Traditional approach:
```bash
npm install business-ui
import { AdvancedSearch } from 'business-ui'
```

**Problems:**
- Limited customization (CSS modules, themes)
- Version conflicts
- Bundle size overhead (entire library)
- Tight coupling

**Our approach:**
- Copy source code
- Modify as needed
- No dependencies

## Security Considerations

### CLI Security

1. **Input Validation**: Sanitize user input
2. **Path Traversal**: Prevent directory traversal attacks
3. **Code Injection**: Use parameterized commands
4. **HTTPS**: Fetch registry over HTTPS

### Registry Security

1. **Content Integrity**: Verify registry content
2. **HTTPS Only**: No HTTP fallback
3. **Version Pinning**: Pin dependency versions

### User Responsibilities

Since code is copied to user projects:
- Users own security updates
- Users should audit copied code
- Users control dependencies

## Performance

### CLI Performance

- Fast downloads (registry is small JSON)
- Efficient file operations (streaming)
- Minimal dependencies (small install size)

### Component Performance

- No runtime overhead (no wrapper library)
- Tree-shakeable (Tailwind purges unused CSS)
- Optimized by user's build system

## Future Improvements

### Planned Features

1. **Component Updates**
   ```bash
   business-ui update advanced-search
   ```

2. **Version Management**
   ```bash
   business-ui add advanced-search@1.2.0
   ```

3. **Diff Tool**
   ```bash
   business-ui diff advanced-search
   ```

4. **Custom Templates**
   ```bash
   business-ui init --template dashboard
   ```

5. **Registry API**
   - Dynamic component listing
   - Usage analytics
   - Version history

### Technical Debt

- Add comprehensive tests
- Improve error handling
- Add progress indicators
- Support offline mode

---

For implementation details, see the source code and inline documentation.
