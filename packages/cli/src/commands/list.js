/**
 * terence list command
 * List all available or added UI components
 */

import { Command } from 'commander';
import { info, success, error, command, section } from '../utils/logger.js';
import { readUiConfig } from '../utils/config.js';
import { listAvailableComponents } from '../utils/template.js';

export const listCommand = new Command('list')
  .description('List all available Terence UI components')
  .option('-a, --available', 'List available components instead of added ones')
  .option('-j, --json', 'Output in JSON format')
  .action(async (_options) => {
    try {
      command('terence list');
      section('Component List');

      const { available, json } = _options;

      if (available) {
        // 列出可用的组件
        const components = await listAvailableComponents();

        if (json) {
          console.log(JSON.stringify({ available: components }, null, 2));
        } else {
          if (components.length === 0) {
            info('No components available');
          } else {
            success(`Available components (${components.length}):`);
            console.log('');
            components.forEach(name => {
              console.log(`  • ${name}`);
            });
            console.log('');
            info('Use "terence add <ComponentName>" to add a component');
          }
        }
      } else {
        // 列出已添加的组件
        const config = await readUiConfig();

        if (!config) {
          error('Project not initialized. Run "terence init" first.');
          process.exit(1);
        }

        const components = Object.entries(config.components);

        if (json) {
          console.log(JSON.stringify({ added: components.map(([name, info]) => ({ name, ...info })) }, null, 2));
        } else {
          if (components.length === 0) {
            info('No components added yet');
            info('Use "terence list --available" to see available components');
          } else {
            success(`Added components (${components.length}):`);
            console.log('');

            // 打印表格
            const maxNameLength = Math.max(...components.map(([name]) => name.length));

            // 表头
            console.log(
              '  ' +
              'Component'.padEnd(maxNameLength + 2) +
              'Version'.padEnd(12) +
              'Core Version'
            );
            console.log(
              '  ' +
              '─'.repeat(maxNameLength + 2) +
              '─'.repeat(12) +
              '─'.repeat(12)
            );

            // 数据行
            components.forEach(([name, info]) => {
              console.log(
                '  ' +
                name.padEnd(maxNameLength + 2) +
                info.version.padEnd(12) +
                info.coreVersion
              );
            });
            console.log('');
          }
        }
      }

    } catch (err) {
      error(`Failed to list components: ${err.message}`);
      if (process.env.DEBUG) {
        console.error(err);
      }
      process.exit(1);
    }
  });
