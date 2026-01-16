/**
 * terence add command
 * Add a UI component to the current project
 */

import { Command } from 'commander';
import path from 'path';
import { info, success, warn, error, command, section } from '../utils/logger.js';
import { readUiConfig, writeUiConfig } from '../utils/config.js';
import { copyComponent, readComponentMeta, listAvailableComponents } from '../utils/template.js';

export const addCommand = new Command('add')
  .description('Add a Terence UI component to your project')
  .argument('<ComponentName>', 'Name of the component to add')
  .option('-d, --dest <path>', 'Destination directory (default: from ui.config.json)')
  .option('-f, --force', 'Overwrite if component already exists')
  .action(async (componentName, _options) => {
    try {
      command(`terence add ${componentName}`);
      section('Adding Component');

      const projectRoot = process.cwd();

      // 检查是否已初始化
      info('Checking project initialization...');
      if (!await readUiConfig(projectRoot)) {
        error('Project not initialized. Run "terence init" first.');
        process.exit(1);
      }
      success('Project initialized');

      // 读取配置
      const config = await readUiConfig(projectRoot);
      const uiDir = _options.dest || path.join(projectRoot, config.uiDir);

      // 检查组件是否已存在
      if (config.components[componentName]) {
        warn(`Component "${componentName}" already added`);
        info(`Current version: ${config.components[componentName].version}`);

        if (!_options.force) {
          error('Use --force to overwrite');
          process.exit(1);
        }
      }

      // 读取组件元数据
      info(`Reading component metadata...`);
      const meta = await readComponentMeta(componentName);

      if (!meta) {
        error(`Component "${componentName}" not found in template registry`);
        info('');
        info('Available components:');
        const available = await listAvailableComponents();
        if (available.length === 0) {
          info('  (No components available)');
        } else {
          available.forEach(name => info(`  - ${name}`));
        }
        process.exit(1);
      }

      success(`Component found: v${meta.version}`);

      // 检查 core 版本兼容性
      if (meta.coreVersion) {
        info(`Core version required: ${meta.coreVersion}`);
        // TODO: 检查项目中的 @terence/core 版本
      }

      // 拷贝组件文件
      info(`Copying component files...`);
      const result = await copyComponent(componentName, uiDir, {
        overwrite: _options.force
      });

      if (result.errors.length > 0) {
        warn('Some errors occurred during copy:');
        result.errors.forEach(err => warn(`  - ${err}`));
      }

      if (result.copied.length > 0) {
        success(`Copied ${result.copied.length} file(s)`);
      }

      if (result.skipped.length > 0) {
        info(`Skipped ${result.skipped.length} existing file(s)`);
      }

      // 更新配置文件
      info('Updating configuration...');
      config.components[componentName] = {
        version: meta.version,
        coreVersion: meta.coreVersion || 'latest',
        addedAt: new Date().toISOString()
      };

      await writeUiConfig(config, projectRoot);
      success('Configuration updated');

      section('Component Added Successfully');
      success(`${componentName} v${meta.version} has been added to your project`);
      info('');
      info('Component location:');
      info(`  ${path.join(config.uiDir, componentName)}`);
      info('');

    } catch (err) {
      error(`Failed to add component: ${err.message}`);
      if (process.env.DEBUG) {
        console.error(err);
      }
      process.exit(1);
    }
  });
