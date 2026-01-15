# Business UI Components

Source code for all Business UI components.

## Components

### Advanced Search

Multi-field search component with support for text, select, date, and number inputs.

**Files:**
- `advanced-search/index.tsx` - Main component
- `advanced-search/use-advanced-search.ts` - React hook for state management

**Features:**
- Multiple field types (text, select, date, number)
- Configurable column layout (1-4 columns)
- Search and reset functionality
- Default values support
- Fully customizable styling

### Data Table

Feature-rich data table built on TanStack Table.

**Files:**
- `data-table/index.tsx` - Main component

**Features:**
- Sorting
- Pagination
- Row selection
- Custom cell rendering
- Responsive design
- Configurable page sizes

### Form Wizard

Multi-step form wizard with validation and navigation.

**Files:**
- `form-wizard/index.tsx` - Main component with useFormWizard hook

**Features:**
- Multi-step navigation
- Step validation
- Visual step indicator
- Previous/Next buttons
- Step jumping (to completed steps)
- Customizable step content

## Usage

These components are not installed as npm packages. Instead, they're copied to your project via the CLI:

```bash
npx business-ui add advanced-search
npx business-ui add data-table
npx business-ui add form-wizard
```

Once copied, you have full control over the code and can customize it as needed.

## Dependencies

Each component may depend on:
- shadcn/ui base components (button, input, select, etc.)
- External libraries (e.g., @tanstack/react-table for data-table)

The CLI automatically handles dependency installation.

## Customization

Since components are source code in your project, you can:

1. **Modify styles** - Change Tailwind classes
2. **Add features** - Extend functionality
3. **Refactor** - Match your code style
4. **Remove features** - Simplify if needed

## Development

To add a new component:

1. Create component files in `packages/components/[component-name]/`
2. Create registry JSON in `registry/[component-name].json`
3. Update `registry/index.json`
4. Document in `docs/COMPONENTS.md`
5. Add example to `examples/next-app/`

## License

MIT
