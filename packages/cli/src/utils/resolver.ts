import { fetchRegistry, RegistryComponent } from './fetcher.js'
import { readPackageJson } from './fs.js'

export interface ResolvedComponent {
  component: RegistryComponent
  dependencies: string[]
  registryDependencies: RegistryComponent[]
}

export async function resolveComponentDependencies(
  componentName: string,
  visited: Set<string> = new Set()
): Promise<ResolvedComponent> {
  if (visited.has(componentName)) {
    throw new Error(`Circular dependency detected: ${componentName}`)
  }
  
  visited.add(componentName)
  
  const component = await fetchRegistry(componentName)
  const registryDependencies: RegistryComponent[] = []
  const allDependencies = new Set<string>(component.dependencies)
  
  for (const depName of component.registryDependencies) {
    const resolvedDep = await resolveComponentDependencies(depName, new Set(visited))
    registryDependencies.push(resolvedDep.component)
    
    resolvedDep.dependencies.forEach(dep => allDependencies.add(dep))
    resolvedDep.registryDependencies.forEach(regDep => {
      if (!registryDependencies.find(rd => rd.name === regDep.name)) {
        registryDependencies.push(regDep)
      }
    })
  }
  
  return {
    component,
    dependencies: Array.from(allDependencies),
    registryDependencies,
  }
}

export async function getMissingDependencies(dependencies: string[]): Promise<string[]> {
  try {
    const packageJson = await readPackageJson()
    const installedDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }
    
    return dependencies.filter(dep => !installedDeps[dep])
  } catch {
    return dependencies
  }
}

export function deduplicateComponents(components: RegistryComponent[]): RegistryComponent[] {
  const seen = new Set<string>()
  return components.filter(component => {
    if (seen.has(component.name)) {
      return false
    }
    seen.add(component.name)
    return true
  })
}
