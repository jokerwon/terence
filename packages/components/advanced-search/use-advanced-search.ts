import * as React from 'react'

export interface UseAdvancedSearchOptions<T = any> {
  initialValues?: T
  onSearch?: (values: T) => void
  onReset?: () => void
}

export function useAdvancedSearch<T = Record<string, any>>({
  initialValues = {} as T,
  onSearch,
  onReset,
}: UseAdvancedSearchOptions<T> = {}) {
  const [values, setValues] = React.useState<T>(initialValues)
  const [isSearching, setIsSearching] = React.useState(false)

  const handleChange = React.useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSearch = React.useCallback(async () => {
    setIsSearching(true)
    try {
      if (onSearch) {
        await onSearch(values)
      }
    } finally {
      setIsSearching(false)
    }
  }, [values, onSearch])

  const handleReset = React.useCallback(() => {
    setValues(initialValues)
    if (onReset) {
      onReset()
    }
  }, [initialValues, onReset])

  const setValue = React.useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const setAllValues = React.useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }))
  }, [])

  return {
    values,
    isSearching,
    handleChange,
    handleSearch,
    handleReset,
    setValue,
    setAllValues,
  }
}
