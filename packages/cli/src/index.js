#!/usr/bin/env node
/**
 * @terence/cli - CLI tool for delivering Terence UI components
 *
 * This CLI tool copies UI component SOURCE CODE to user projects.
 * It does NOT distribute npm packages - it delivers the actual source.
 *
 * Usage:
 *   terence init [options]
 *   terence add <ComponentName> [options]
 *   terence list
 *   terence upgrade <ComponentName> [options]
 */

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { upgradeCommand } from './commands/upgrade.js';

const program = new Command();

program
  .name('terence')
  .description('Architecture-compliant frontend business component system')
  .version('1.0.0');

// Register commands
program.addCommand(initCommand);
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(upgradeCommand);

// Parse and execute
program.parse();
