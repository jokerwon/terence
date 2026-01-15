import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type SearchFieldType = 'text' | 'select' | 'date' | 'number'

export interface SearchField {
  name: string
  label: string
  type: SearchFieldType
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  defaultValue?: string | number
}

export interface AdvancedSearchProps {
  fields: SearchField[]
  onSearch: (values: Record<string, any>) => void
  onReset?: () => void
  className?: string
  columns?: 1 | 2 | 3 | 4
}

export function AdvancedSearch({
  fields,
  onSearch,
  onReset,
  className,
  columns = 3,
}: AdvancedSearchProps) {
  const [values, setValues] = React.useState<Record<string, any>>(() => {
    const initialValues: Record<string, any> = {}
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialValues[field.name] = field.defaultValue
      }
    })
    return initialValues
  })

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = () => {
    onSearch(values)
  }

  const handleReset = () => {
    const resetValues: Record<string, any> = {}
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        resetValues[field.name] = field.defaultValue
      }
    })
    setValues(resetValues)
    if (onReset) {
      onReset()
    } else {
      onSearch(resetValues)
    }
  }

  const gridClassName = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns]

  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className={cn('grid gap-4', gridClassName)}>
        {fields.map(field => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === 'text' && (
              <Input
                id={field.name}
                type="text"
                placeholder={field.placeholder}
                value={values[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value)}
              />
            )}
            {field.type === 'number' && (
              <Input
                id={field.name}
                type="number"
                placeholder={field.placeholder}
                value={values[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value)}
              />
            )}
            {field.type === 'date' && (
              <Input
                id={field.name}
                type="date"
                placeholder={field.placeholder}
                value={values[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value)}
              />
            )}
            {field.type === 'select' && field.options && (
              <Select
                value={values[field.name] || ''}
                onValueChange={value => handleChange(field.name, value)}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder={field.placeholder || 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <Button onClick={handleSearch}>Search</Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  )
}
