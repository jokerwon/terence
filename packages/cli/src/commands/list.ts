import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { fetchRegistryIndex } from '../utils/fetcher.js'

export function createListCommand(): Command {
  const list = new Command('list')
    .description('List all available components')
    .action(async () => {
      try {
        await listCommand()
      } catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })

  return list
}

async function listCommand(): Promise<void> {
  const spinner = ora('Fetching components...').start()
  
  try {
    const index = await fetchRegistryIndex()
    spinner.succeed('Available components')
    
    console.log(chalk.cyan(`\nFound ${index.components.length} component(s):\n`))
    
    index.components.forEach(component => {
      console.log(chalk.bold.white(`  ${component.name}`))
      console.log(chalk.gray(`  ${component.description}`))
      
      if (component.dependencies.length > 0) {
        console.log(chalk.yellow(`  Dependencies: ${component.dependencies.join(', ')}`))
      }
      
      if (component.registryDependencies.length > 0) {
        console.log(chalk.cyan(`  Registry Dependencies: ${component.registryDependencies.join(', ')}`))
      }
      
      console.log()
    })
    
    console.log(chalk.green('Use "business-ui add <component>" to add a component to your project'))
  } catch (error) {
    spinner.fail('Failed to fetch components')
    throw error
  }
}
