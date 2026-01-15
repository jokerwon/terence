# shadcn/ui Base Components

This directory contains the foundational UI components based on [shadcn/ui](https://ui.shadcn.com/) design patterns. These components are built on top of [Radix UI](https://www.radix-ui.com/) primitives and styled with Tailwind CSS.

## Available Components

### Button (`button.tsx`)
A versatile button component with multiple variants and sizes.

**Variants:**
- `default` - Primary button
- `destructive` - For dangerous actions
- `outline` - Outlined style
- `secondary` - Secondary button
- `ghost` - Minimal styling
- `link` - Link-style button

**Sizes:** `default`, `sm`, `lg`, `icon`

**Usage:**
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Click me</Button>
<Button variant="outline" size="sm">Small</Button>
<Button variant="destructive">Delete</Button>
```

### Input (`input.tsx`)
A styled input field component.

**Usage:**
```tsx
import { Input } from '@/components/ui/input'

<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

### Label (`label.tsx`)
An accessible label component for form fields.

**Usage:**
```tsx
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### Select (`select.tsx`)
A dropdown select component with keyboard navigation.

**Components:** `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`

**Usage:**
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox (`checkbox.tsx`)
A checkbox input component.

**Usage:**
```tsx
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```

### Table (`table.tsx`)
Table components for displaying tabular data.

**Components:** `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`

**Usage:**
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Card (`card.tsx`)
A card container component with header, content, and footer sections.

**Components:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

**Usage:**
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Installation via CLI

To add these components to your project:

```bash
# Add a single UI component
npx business-ui add button

# Add multiple components
npx business-ui add button input label

# The CLI will automatically install dependencies
```

## Dependencies

These components require the following dependencies:

### Core Dependencies
- `react` ^18.0.0
- `react-dom` ^18.0.0
- `tailwindcss` ^3.0.0

### Radix UI Primitives
- `@radix-ui/react-slot` (for Button)
- `@radix-ui/react-label` (for Label)
- `@radix-ui/react-select` (for Select)
- `@radix-ui/react-checkbox` (for Checkbox)

### Utilities
- `class-variance-authority` - For variant management
- `clsx` - For conditional classes
- `tailwind-merge` - For merging Tailwind classes
- `lucide-react` - For icons

## Styling

All components use Tailwind CSS for styling. The design system uses CSS variables for theming:

- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--destructive` / `--destructive-foreground`
- `--accent` / `--accent-foreground`
- `--muted` / `--muted-foreground`
- `--card` / `--card-foreground`
- `--popover` / `--popover-foreground`
- `--border`
- `--input`
- `--ring`

Configure these in your `tailwind.config.js` or global CSS.

## Customization

Since these components are copied into your project, you have full control to:

1. **Modify styles** - Change Tailwind classes
2. **Add variants** - Extend with new variants
3. **Change behavior** - Modify component logic
4. **Remove features** - Simplify if needed

## Accessibility

All components follow accessibility best practices:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility

Built on Radix UI primitives which are thoroughly tested for accessibility.

## Type Safety

All components are written in TypeScript with full type definitions. They accept standard HTML attributes and forward refs properly.
