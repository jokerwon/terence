# Component Documentation

Comprehensive documentation for all Business UI components.

## Table of Contents

- [AdvancedSearch](#advancedsearch)
- [DataTable](#datatable)
- [FormWizard](#formwizard)

---

## AdvancedSearch

A flexible search component that supports multiple field types including text, select, date, and number inputs. Perfect for building advanced search interfaces with multiple filters.

### Installation

```bash
npx business-ui add advanced-search
```

### Dependencies

- `react`
- shadcn/ui components: `button`, `input`, `label`, `select`

### Basic Usage

```tsx
import { AdvancedSearch } from '@/components/advanced-search'

const fields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Enter name...',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'Enter email...',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
]

function SearchPage() {
  const handleSearch = (values: Record<string, any>) => {
    console.log('Search values:', values)
    // Perform search logic
  }

  return (
    <AdvancedSearch
      fields={fields}
      onSearch={handleSearch}
      columns={3}
    />
  )
}
```

### API Reference

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | `SearchField[]` | **required** | Array of field configurations |
| `onSearch` | `(values: Record<string, any>) => void` | **required** | Callback when search is triggered |
| `onReset` | `() => void` | `undefined` | Callback when reset is clicked |
| `className` | `string` | `undefined` | Additional CSS classes |
| `columns` | `1 \| 2 \| 3 \| 4` | `3` | Number of columns in the grid |

#### SearchField

```tsx
interface SearchField {
  name: string
  label: string
  type: 'text' | 'select' | 'date' | 'number'
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  defaultValue?: string | number
}
```

### Advanced Usage

#### With Default Values

```tsx
const fields = [
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    defaultValue: 'active',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
]
```

#### With Custom Reset Handler

```tsx
<AdvancedSearch
  fields={fields}
  onSearch={handleSearch}
  onReset={() => {
    console.log('Reset clicked')
    // Custom reset logic
  }}
/>
```

#### Responsive Columns

```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<AdvancedSearch fields={fields} onSearch={handleSearch} columns={3} />

// Always 2 columns
<AdvancedSearch fields={fields} onSearch={handleSearch} columns={2} />
```

### useAdvancedSearch Hook

For more control, use the `useAdvancedSearch` hook:

```tsx
import { useAdvancedSearch } from '@/components/advanced-search/use-advanced-search'

function CustomSearch() {
  const {
    values,
    isSearching,
    handleChange,
    handleSearch,
    handleReset,
    setValue,
    setAllValues,
  } = useAdvancedSearch({
    initialValues: { status: 'active' },
    onSearch: async (values) => {
      // Async search logic
      await searchAPI(values)
    },
  })

  return (
    <div>
      {/* Build your custom UI */}
      <input
        value={values.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
      />
      <button onClick={handleSearch} disabled={isSearching}>
        Search
      </button>
    </div>
  )
}
```

### Customization Examples

#### Custom Styling

```tsx
<AdvancedSearch
  fields={fields}
  onSearch={handleSearch}
  className="bg-slate-50 border-slate-300 shadow-md"
/>
```

#### Add Date Range Support

Modify the component to support date ranges:

```tsx
// Add to SearchField interface
interface SearchField {
  // ... existing fields
  type: 'text' | 'select' | 'date' | 'number' | 'dateRange'
}

// Implement in component
{field.type === 'dateRange' && (
  <div className="flex gap-2">
    <Input type="date" {...props} />
    <span>to</span>
    <Input type="date" {...props} />
  </div>
)}
```

---

## DataTable

A powerful data table component built on TanStack Table with support for sorting, pagination, row selection, and more.

### Installation

```bash
npx business-ui add data-table
```

### Dependencies

- `react`
- `@tanstack/react-table`
- shadcn/ui components: `button`, `checkbox`, `select`, `table`

### Basic Usage

```tsx
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'

type User = {
  id: string
  name: string
  email: string
  status: string
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
]

function UsersTable() {
  const data: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  ]

  return <DataTable columns={columns} data={data} />
}
```

### API Reference

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | **required** | Column definitions |
| `data` | `TData[]` | **required** | Table data |
| `enableRowSelection` | `boolean` | `false` | Enable row selection checkboxes |
| `enablePagination` | `boolean` | `true` | Enable pagination controls |
| `enableSorting` | `boolean` | `true` | Enable column sorting |
| `pageSize` | `number` | `10` | Initial page size |
| `onRowSelectionChange` | `(selectedRows: TData[]) => void` | `undefined` | Callback when selection changes |
| `className` | `string` | `undefined` | Additional CSS classes |

### Advanced Usage

#### With Row Selection

```tsx
function SelectableTable() {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection
        onRowSelectionChange={setSelectedUsers}
      />
      <p>Selected: {selectedUsers.length} users</p>
    </div>
  )
}
```

#### With Sortable Columns

```tsx
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]
```

#### With Custom Cell Rendering

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <span
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            status === 'Active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          )}
        >
          {status}
        </span>
      )
    },
  },
]
```

#### With Actions Column

```tsx
const columns: ColumnDef<User>[] = [
  // ... other columns
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(user)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(user)}
          >
            Delete
          </Button>
        </div>
      )
    },
  },
]
```

### Customization Examples

#### Custom Page Sizes

```tsx
// Modify the component to support custom page sizes
const pageSizeOptions = [5, 10, 20, 50, 100]

{pageSizeOptions.map(size => (
  <SelectItem key={size} value={`${size}`}>
    {size}
  </SelectItem>
))}
```

#### Add Search/Filter

```tsx
function TableWithSearch() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <DataTable columns={columns} data={filteredData} />
    </div>
  )
}
```

---

## FormWizard

A multi-step form wizard component with step indicators, validation, and navigation controls.

### Installation

```bash
npx business-ui add form-wizard
```

### Dependencies

- `react`
- shadcn/ui components: `button`

### Basic Usage

```tsx
import { FormWizard, WizardStep } from '@/components/form-wizard'

function RegistrationWizard() {
  const steps: WizardStep[] = [
    {
      id: 'personal',
      title: 'Personal Info',
      description: 'Enter your personal information',
      content: <PersonalInfoForm />,
      validate: async () => {
        // Return true if valid, false otherwise
        return personalInfoIsValid()
      },
    },
    {
      id: 'account',
      title: 'Account Details',
      description: 'Set up your account',
      content: <AccountForm />,
      validate: async () => accountIsValid(),
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Review your information',
      content: <ReviewStep />,
    },
  ]

  const handleComplete = async () => {
    console.log('Wizard completed!')
    // Submit form data
    await submitRegistration()
  }

  return (
    <FormWizard
      steps={steps}
      onComplete={handleComplete}
      showStepIndicator
    />
  )
}
```

### API Reference

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `WizardStep[]` | **required** | Array of wizard steps |
| `onComplete` | `(data?: any) => void \| Promise<void>` | **required** | Callback when wizard is completed |
| `onStepChange` | `(stepIndex: number) => void` | `undefined` | Callback when step changes |
| `className` | `string` | `undefined` | Additional CSS classes |
| `showStepIndicator` | `boolean` | `true` | Show step indicator |

#### WizardStep

```tsx
interface WizardStep {
  id: string
  title: string
  description?: string
  content: React.ReactNode
  validate?: () => boolean | Promise<boolean>
}
```

### Advanced Usage

#### With Form State Management

```tsx
function RegistrationWizard() {
  const [formData, setFormData] = useState({
    personal: {},
    account: {},
  })

  const steps: WizardStep[] = [
    {
      id: 'personal',
      title: 'Personal Info',
      content: (
        <PersonalInfoForm
          data={formData.personal}
          onChange={(data) =>
            setFormData(prev => ({ ...prev, personal: data }))
          }
        />
      ),
      validate: () => validatePersonalInfo(formData.personal),
    },
    // ... more steps
  ]

  const handleComplete = async () => {
    await api.submitRegistration(formData)
  }

  return <FormWizard steps={steps} onComplete={handleComplete} />
}
```

#### With Step Change Tracking

```tsx
<FormWizard
  steps={steps}
  onComplete={handleComplete}
  onStepChange={(stepIndex) => {
    console.log('Moved to step:', stepIndex)
    // Track analytics
    analytics.track('wizard_step_change', { step: stepIndex })
  }}
/>
```

### useFormWizard Hook

For custom wizard implementations:

```tsx
import { useFormWizard } from '@/components/form-wizard'

function CustomWizard() {
  const {
    currentStep,
    completedSteps,
    goToStep,
    nextStep,
    previousStep,
    reset,
    isFirstStep,
    isLastStep,
  } = useFormWizard(steps)

  return (
    <div>
      <div>Current step: {currentStep}</div>
      <button onClick={previousStep} disabled={isFirstStep}>
        Previous
      </button>
      <button onClick={nextStep} disabled={isLastStep}>
        Next
      </button>
      <button onClick={reset}>Start Over</button>
    </div>
  )
}
```

### Customization Examples

#### Custom Step Indicator

Modify the `StepIndicator` component to change its appearance:

```tsx
// Change step circle styling
<button
  className={cn(
    'flex h-12 w-12 items-center justify-center rounded-lg', // Changed from rounded-full
    'font-bold text-lg', // Increased font size
    // ... other classes
  )}
>
  {isCompleted ? '✓' : index + 1}
</button>
```

#### Add Progress Bar

```tsx
function FormWizardWithProgress({ steps, ...props }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div>
      <div className="mb-4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <FormWizard
        steps={steps}
        onStepChange={setCurrentStep}
        {...props}
      />
    </div>
  )
}
```

#### Vertical Step Indicator

Modify the layout for a vertical wizard:

```tsx
// Change flex direction in StepIndicator
<div className="flex flex-col items-start space-y-4">
  {/* Step items */}
</div>
```

---

## Common Patterns

### Combining Components

#### Search + Table

```tsx
function UserManagement() {
  const [filteredData, setFilteredData] = useState(userData)

  const searchFields = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [...] },
  ]

  const handleSearch = (values: Record<string, any>) => {
    const filtered = userData.filter(user => {
      if (values.name && !user.name.includes(values.name)) return false
      if (values.status && user.status !== values.status) return false
      return true
    })
    setFilteredData(filtered)
  }

  return (
    <div className="space-y-6">
      <AdvancedSearch fields={searchFields} onSearch={handleSearch} />
      <DataTable columns={columns} data={filteredData} />
    </div>
  )
}
```

#### Wizard + Form

```tsx
function MultiStepForm() {
  const [formData, setFormData] = useState({})

  const steps = [
    {
      id: 'step1',
      title: 'Search Criteria',
      content: (
        <AdvancedSearch
          fields={searchFields}
          onSearch={(values) => setFormData(prev => ({ ...prev, search: values }))}
        />
      ),
    },
    // ... more steps
  ]

  return <FormWizard steps={steps} onComplete={handleSubmit} />
}
```

---

## Tips & Best Practices

1. **Type Safety**: Define proper TypeScript types for your data
2. **Validation**: Implement comprehensive validation in wizard steps
3. **Error Handling**: Add error boundaries and user feedback
4. **Performance**: Use React.memo for expensive components
5. **Accessibility**: Ensure keyboard navigation and ARIA labels
6. **Responsive Design**: Test on different screen sizes
7. **Dark Mode**: Add dark mode support using Tailwind's dark: prefix

---

Need more help? Check out the [example project](../examples/next-app) for complete implementations!
