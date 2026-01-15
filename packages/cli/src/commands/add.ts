import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { prompt } from 'enquirer'
import { resolveComponentDependencies, getMissingDependencies, deduplicateComponents } from '../utils/resolver.js'
import { writeFile, resolveProjectPath, installDependencies, fileExists } from '../utils/fs.js'
import { fetchRegistryIndex } from '../utils/fetcher.js'

interface AddOptions {
  path?: string
  all?: boolean
  yes?: boolean
}

export function createAddCommand(): Command {
  const add = new Command('add')
    .description('Add a component to your project')
    .argument('[component]', 'Component name to add')
    .option('-p, --path <path>', 'Components directory path', 'src/components')
    .option('-a, --all', 'Add all components')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (componentArg: string | undefined, options: AddOptions) => {
      try {
        await addCommand(componentArg, options)
      } catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })

  return add
}

async function addCommand(componentArg: string | undefined, options: AddOptions): Promise<void> {
  const componentsPath = options.path || 'src/components'
  
  let componentsToAdd: string[] = []
  
  if (options.all) {
    const spinner = ora('Fetching available components...').start()
    const index = await fetchRegistryIndex()
    spinner.succeed('Fetched component list')
    
    componentsToAdd = index.components.map(c => c.name)
    
    if (!options.yes) {
      const { confirm } = await prompt<{ confirm: boolean }>({
        type: 'confirm',
        name: 'confirm',
        message: `Add all ${componentsToAdd.length} components?`,
        initial: true,
      })
      
      if (!confirm) {
        console.log(chalk.yellow('Cancelled'))
        return
      }
    }
  } else if (componentArg) {
    componentsToAdd = [componentArg]
  } else {
    const spinner = ora('Fetching available components...').start()
    const index = await fetchRegistryIndex()
    spinner.succeed('Fetched component list')
    
    const { selectedComponents } = await prompt<{ selectedComponents: string[] }>({
      type: 'multiselect',
      name: 'selectedComponents',
      message: 'Select components to add',
      choices: index.components.map(c => ({
        name: c.name,
        message: `${c.name} - ${c.description}`,
      })),
    })
    
    if (!selectedComponents || selectedComponents.length === 0) {
      console.log(chalk.yellow('No components selected'))
      return
    }
    
    componentsToAdd = selectedComponents
  }
  
  const spinner = ora('Resolving dependencies...').start()
  
  const allResolvedComponents = []
  const allDependencies = new Set<string>()
  
  for (const componentName of componentsToAdd) {
    try {
      const resolved = await resolveComponentDependencies(componentName)
      allResolvedComponents.push(resolved.component)
      
      resolved.registryDependencies.forEach(dep => {
        allResolvedComponents.push(dep)
      })
      
      resolved.dependencies.forEach(dep => allDependencies.add(dep))
    } catch (error) {
      spinner.fail(`Failed to resolve ${componentName}`)
      throw error
    }
  }
  
  const uniqueComponents = deduplicateComponents(allResolvedComponents)
  const missingDeps = await getMissingDependencies(Array.from(allDependencies))
  
  spinner.succeed(`Resolved ${uniqueComponents.length} component(s)`)
  
  if (missingDeps.length > 0 && !options.yes) {
    console.log(chalk.cyan('\nMissing dependencies:'))
    missingDeps.forEach(dep => console.log(chalk.gray(`  - ${dep}`)))
    
    const { installDeps } = await prompt<{ installDeps: boolean }>({
      type: 'confirm',
      name: 'installDeps',
      message: 'Install missing dependencies?',
      initial: true,
    })
    
    if (installDeps) {
      const installSpinner = ora('Installing dependencies...').start()
      await installDependencies(missingDeps)
      installSpinner.succeed('Dependencies installed')
    }
  } else if (missingDeps.length > 0) {
    const installSpinner = ora('Installing dependencies...').start()
    await installDependencies(missingDeps)
    installSpinner.succeed('Dependencies installed')
  }
  
  const writeSpinner = ora('Writing component files...').start()
  
  for (const component of uniqueComponents) {
    for (const file of component.files) {
      const filePath = resolveProjectPath(componentsPath, file.path)
      
      if (await fileExists(filePath) && !options.yes) {
        writeSpinner.stop()
        const { overwrite } = await prompt<{ overwrite: boolean }>({
          type: 'confirm',
          name: 'overwrite',
          message: `File ${file.path} already exists. Overwrite?`,
          initial: false,
        })
        
        if (!overwrite) {
          console.log(chalk.yellow(`Skipped ${file.path}`))
          writeSpinner.start()
          continue
        }
        writeSpinner.start()
      }
      
      await writeFile(filePath, file.content)
    }
  }
  
  writeSpinner.succeed('Components added successfully!')
  
  console.log(chalk.green('\n✓ Done!'))
  console.log(chalk.cyan('\nComponents added:'))
  uniqueComponents.forEach(c => console.log(chalk.gray(`  - ${c.name}`)))
  
  console.log(chalk.cyan('\nNext steps:'))
  console.log(chalk.gray(`  Import and use the components in your app`))
  console.log(chalk.gray(`  Customize styles and behavior as needed`))
}
