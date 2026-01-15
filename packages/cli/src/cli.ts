import { Command } from 'commander'
import chalk from 'chalk'
import { createAddCommand } from './commands/add.js'
import { createListCommand } from './commands/list.js'

export function createCLI(): Command {
  const program = new Command()
    .name('business-ui')
    .description('CLI tool for Business UI component library')
    .version('0.1.0', '-v, --version', 'Display version number')

  program.addCommand(createAddCommand())
  program.addCommand(createListCommand())

  program.on('command:*', () => {
    console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`))
    console.log(chalk.cyan('See --help for a list of available commands'))
    process.exit(1)
  })

  return program
}
