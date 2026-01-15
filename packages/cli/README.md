# Business UI CLI

Command-line interface for installing Business UI components.

## Installation

```bash
# Use with npx (recommended)
npx business-ui add advanced-search

# Or install globally
npm install -g business-ui-cli
business-ui add advanced-search
```

## Commands

### `add`

Add a component to your project.

```bash
# Add a single component
npx business-ui add advanced-search

# Add multiple components
npx business-ui add advanced-search data-table form-wizard

# Add all components
npx business-ui add --all

# Specify custom path
npx business-ui add advanced-search --path src/components

# Skip confirmation prompts
npx business-ui add advanced-search -y
```

**Options:**
- `-p, --path <path>` - Components directory path (default: `src/components`)
- `-a, --all` - Add all components
- `-y, --yes` - Skip confirmation prompts

### `list`

List all available components.

```bash
npx business-ui list
```

## How It Works

1. **Fetches Component**: Downloads component definition from registry
2. **Resolves Dependencies**: Checks for npm and registry dependencies
3. **Installs Dependencies**: Installs missing npm packages
4. **Copies Files**: Copies component source code to your project
5. **Done**: Components are ready to use and customize

## Registry System

Components are defined in a registry system similar to shadcn/ui:

```json
{
  "name": "advanced-search",
  "description": "Advanced search component",
  "dependencies": ["react"],
  "registryDependencies": ["button", "input", "select"],
  "files": [
    {
      "path": "advanced-search/index.tsx",
      "type": "component",
      "content": "..."
    }
  ]
}
```

### Registry Dependencies

- `dependencies`: npm packages that need to be installed
- `registryDependencies`: shadcn/ui components that should be installed first

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm type-check
```

## Architecture

```
cli/
├── src/
│   ├── commands/
│   │   ├── add.ts       # Add command implementation
│   │   └── list.ts      # List command implementation
│   ├── utils/
│   │   ├── fetcher.ts   # Fetch from registry
│   │   ├── resolver.ts  # Resolve dependencies
│   │   └── fs.ts        # File system operations
│   ├── cli.ts           # CLI setup
│   └── index.ts         # Entry point
└── package.json
```

## License

MIT
