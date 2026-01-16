/**
 * Logging utilities for CLI
 */

import chalk from 'chalk';

/**
 * Log info message
 * @param {string} message
 */
export function info(message) {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Log success message
 * @param {string} message
 */
export function success(message) {
  console.log(chalk.green('✓'), message);
}

/**
 * Log warning message
 * @param {string} message
 */
export function warn(message) {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Log error message
 * @param {string} message
 */
export function error(message) {
  console.error(chalk.red('✖'), message);
}

/**
 * Log debug message (only in development)
 * @param {string} message
 */
export function debug(message) {
  if (process.env.DEBUG) {
    console.log(chalk.gray('›'), chalk.gray(message));
  }
}

/**
 * Log command start
 * @param {string} command
 */
export function command(command) {
  console.log(chalk.cyan.bold(`\n$ ${command}`));
}

/**
 * Log section header
 * @param {string} title
 */
export function section(title) {
  console.log(chalk.bold.cyan(`\n─── ${title} ───\n`));
}
