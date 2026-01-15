import fetch from 'node-fetch'

const REGISTRY_BASE_URL = 'https://raw.githubusercontent.com/yourusername/business-ui/main/registry'

export interface RegistryFile {
  path: string
  type: 'component' | 'hook' | 'util' | 'type'
  content: string
}

export interface RegistryComponent {
  name: string
  description: string
  type: 'component'
  dependencies: string[]
  registryDependencies: string[]
  files: RegistryFile[]
}

export interface RegistryIndex {
  components: Array<{
    name: string
    description: string
    dependencies: string[]
    registryDependencies: string[]
  }>
}

export async function fetchRegistry(componentName: string): Promise<RegistryComponent> {
  try {
    const url = `${REGISTRY_BASE_URL}/${componentName}.json`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Component "${componentName}" not found in registry`)
    }
    
    return await response.json() as RegistryComponent
  } catch (error) {
    const localRegistryPath = new URL(`../../../../registry/${componentName}.json`, import.meta.url)
    
    try {
      const fs = await import('fs-extra')
      const content = await fs.readFile(localRegistryPath, 'utf-8')
      return JSON.parse(content) as RegistryComponent
    } catch {
      throw new Error(`Failed to fetch component "${componentName}": ${error}`)
    }
  }
}

export async function fetchRegistryIndex(): Promise<RegistryIndex> {
  try {
    const url = `${REGISTRY_BASE_URL}/index.json`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch registry index')
    }
    
    return await response.json() as RegistryIndex
  } catch (error) {
    const localRegistryPath = new URL('../../../../registry/index.json', import.meta.url)
    
    try {
      const fs = await import('fs-extra')
      const content = await fs.readFile(localRegistryPath, 'utf-8')
      return JSON.parse(content) as RegistryIndex
    } catch {
      throw new Error(`Failed to fetch registry index: ${error}`)
    }
  }
}
