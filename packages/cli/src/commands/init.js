/**
 * terence init command
 * Initialize a new project with Terence architecture
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { info, success, warn, error, command, section } from '../utils/logger.js';
import { readUiConfig, writeUiConfig, isInitialized, isValidProject, validateSchema, CONFIG_FILENAME } from '../utils/config.js';

export const initCommand = new Command('init')
  .description('Initialize a new Terence project')
  .option('-d, --dest <path>', 'Destination directory', process.cwd())
  .option('-f, --force', 'Force reinitialize if already initialized')
  .option('--ui-dir <path>', 'UI components directory', 'src/ui')
  .action(async (options) => {
    try {
      command('terence init');
      section('Project Initialization');

      const { dest, force, uiDir } = options;
      const projectRoot = path.resolve(dest);

      // 检查是否是有效项目
      info('Checking project...');
      if (!await isValidProject(projectRoot)) {
        error('Not a valid project (package.json not found)');
        error('Please run this command in a project root directory');
        process.exit(1);
      }
      success('Valid project detected');

      // 检查是否已初始化
      info('Checking initialization status...');
      const initialized = await isInitialized(projectRoot);
      let shouldContinue = true;

      if (initialized) {
        await readUiConfig(projectRoot);
        warn(`Project already initialized with ui.config.json`);

        if (!force) {
          const answers = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'reinitialize',
              message: 'Do you want to reinitialize? This will overwrite the existing configuration.',
              default: false
            }
          ]);

          shouldContinue = answers.reinitialize;
        } else {
          info('--force flag detected, overwriting existing configuration...');
        }
      }

      if (!shouldContinue) {
        info('Initialization cancelled');
        return;
      }

      // 创建配置
      const config = {
        version: '1.0.0',
        uiDir: uiDir,
        components: {}
      };

      // 验证配置
      const validation = validateSchema(config);
      if (!validation.valid) {
        error('Invalid configuration:');
        validation.errors.forEach(err => error(`  - ${err}`));
        process.exit(1);
      }

      // 写入配置文件
      info(`Creating ${CONFIG_FILENAME}...`);
      await writeUiConfig(config, projectRoot);
      success(`Configuration file created: ${CONFIG_FILENAME}`);

      // 创建 UI 目录
      const targetUiDir = path.join(projectRoot, uiDir);
      info(`Creating UI directory: ${uiDir}`);
      await fs.ensureDir(targetUiDir);

      // 创建 .gitkeep 文件
      const gitkeepPath = path.join(targetUiDir, '.gitkeep');
      await fs.writeFile(gitkeepPath, '', 'utf-8');
      success('UI directory created');

      // 创建子目录结构
      const subdirs = ['components', 'adapters', 'hooks', 'shared'];
      for (const subdir of subdirs) {
        const subdirPath = path.join(targetUiDir, subdir);
        await fs.ensureDir(subdirPath);
        await fs.writeFile(path.join(subdirPath, '.gitkeep'), '', 'utf-8');
      }
      success('Directory structure created');

      section('Initialization Complete');
      success(`Terence project initialized successfully!`);
      info('');
      info('Next steps:');
      info('  1. Run "terence list" to see available components');
      info('  2. Run "terence add <ComponentName>" to add a component');
      info('  3. Check ui.config.json to manage your components');
      info('');

    } catch (err) {
      error(`Initialization failed: ${err.message}`);
      if (process.env.DEBUG) {
        console.error(err);
      }
      process.exit(1);
    }
  });
