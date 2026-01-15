# Contributing to Business UI

Thank you for your interest in contributing to Business UI! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Git

### Getting Started

1. Fork and clone the repository:

```bash
git clone https://github.com/yourusername/business-ui.git
cd business-ui
```

2. Install dependencies:

```bash
pnpm install
```

3. Build all packages:

```bash
pnpm build:all
```

## Project Structure

```
business-ui/
├── packages/
│   ├── cli/              # CLI tool
│   └── components/       # Component source code
├── registry/             # Component registry definitions
├── examples/             # Example applications
├── docs/                 # Documentation
└── package.json          # Root package.json
```

## Adding a New Component

### 1. Create Component Files

Create your component in `packages/components/[component-name]/`:

```
packages/components/my-component/
├── index.tsx             # Main component
├── use-my-component.ts   # Optional: React hook
└── types.ts              # Optional: Type definitions
```

### 2. Create Registry Definition

Create `registry/my-component.json`:

```json
{
  "name": "my-component",
  "description": "Description of your component",
  "type": "component",
  "dependencies": [
    "react"
  ],
  "registryDependencies": [
    "button",
    "input"
  ],
  "files": [
    {
      "path": "my-component/index.tsx",
      "type": "component",
      "content": "... component source code ..."
    }
  ]
}
```

**Important:** The `content` field should contain the complete source code of the file as a string.

### 3. Update Registry Index

Add your component to `registry/index.json`:

```json
{
  "components": [
    {
      "name": "my-component",
      "description": "Description of your component",
      "dependencies": ["react"],
      "registryDependencies": ["button", "input"]
    }
  ]
}
```

### 4. Write Documentation

Add documentation to `docs/COMPONENTS.md`:

```markdown
## MyComponent

Description of your component.

### Installation

\`\`\`bash
npx business-ui add my-component
\`\`\`

### Usage

\`\`\`tsx
import { MyComponent } from '@/components/my-component'

// Example usage
\`\`\`

### API Reference

...
```

### 5. Create Example

Add an example to `examples/next-app/app/my-component/page.tsx`.

## Component Guidelines

### Code Style

- Use TypeScript
- Use functional components with hooks
- Export types and interfaces
- Use proper JSDoc comments for complex logic
- Follow existing code patterns

### Styling

- Use Tailwind CSS utility classes
- Support dark mode with `dark:` variants
- Use CSS variables from the theme
- Make components responsive
- Use the `cn()` utility for className merging

### Props

- Use descriptive prop names
- Provide sensible defaults
- Make components flexible but not overly complex
- Export prop types as interfaces

### Dependencies

- Minimize external dependencies
- Use shadcn/ui base components when possible
- Document all dependencies in registry

### Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Support keyboard navigation
- Test with screen readers

## Testing

Before submitting:

1. **Build test**: Ensure everything builds

```bash
pnpm build:all
```

2. **Type check**: Ensure no TypeScript errors

```bash
pnpm type-check
```

3. **Manual test**: Test the CLI

```bash
cd examples/next-app
npx business-ui add my-component
```

4. **Example test**: Verify the component works in the example app

```bash
cd examples/next-app
pnpm dev
```

## Pull Request Process

1. Create a feature branch:

```bash
git checkout -b feature/my-component
```

2. Make your changes following the guidelines above

3. Commit with clear messages:

```bash
git commit -m "feat: add MyComponent"
```

Use conventional commit format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

4. Push and create a pull request:

```bash
git push origin feature/my-component
```

5. Fill out the PR template with:
   - Description of changes
   - Screenshots (if UI changes)
   - Testing steps
   - Related issues

## Code Review

All submissions require review. We'll look for:

- Code quality and style
- Documentation completeness
- Component usability
- Performance considerations
- Accessibility compliance

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues and docs first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Business UI! 🎉
