/**
 * terence upgrade command
 * Upgrade a component to the latest version
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import { info, success, warn, error, command, section } from '../utils/logger.js';
import { readUiConfig, writeUiConfig, getUiDir } from '../utils/config.js';
import { copyComponent, readComponentMeta } from '../utils/template.js';
import { generateDiff, formatDiffReport, formatDiffAsJson, hasLocalChanges } from '../utils/diff.js';

export const upgradeCommand = new Command('upgrade')
  .description('Upgrade a component to the latest version')
  .argument('<ComponentName>', 'Name of the component to upgrade')
  .option('-d, --dry-run', 'Preview changes without applying them')
  .option('-f, --force', 'Force upgrade even with local changes')
  .option('-j, --json', 'Output diff in JSON format')
  .action(async (componentName, _options) => {
    try {
      command(`terence upgrade ${componentName}`);
      section('Component Upgrade');

      const { dryRun, force, json } = _options;
      const projectRoot = process.cwd();

      // 检查是否已初始化
      info('Checking project configuration...');
      const config = await readUiConfig(projectRoot);

      if (!config) {
        error('Project not initialized. Run "terence init" first.');
        process.exit(1);
      }

      // 检查组件是否已添加
      if (!config.components[componentName]) {
        error(`Component "${componentName}" not found in project`);
        info('Use "terence list" to see added components');
        process.exit(1);
      }

      const currentVersion = config.components[componentName].version;
      success(`Component found: v${currentVersion}`);

      // 读取新版本元数据
      info('Checking for updates...');
      const meta = await readComponentMeta(componentName);

      if (!meta) {
        error(`Component "${componentName}" not found in template registry`);
        process.exit(1);
      }

      const newVersion = meta.version;
      if (currentVersion === newVersion) {
        info('Already up to date');
        return;
      }

      success(`Update available: v${currentVersion} → v${newVersion}`);

      // 获取 UI 目录
      const uiDir = await getUiDir(projectRoot);
      const componentDir = `${uiDir}/${componentName}`;

      // 生成差异报告
      info('Analyzing changes...');
      const diff = await generateDiff(componentName, componentDir);

      // 检测本地修改
      const hasLocal = await hasLocalChanges(componentName, componentDir);

      if (hasLocal && !force) {
        warn('Local changes detected!');
        warn('Upgrading will overwrite your local modifications.');
        info('');
        info('Modified files:');
        diff.files
          .filter(f => f.status === 'conflict')
          .forEach(f => info(`  ! ${f.path}`));
        info('');

        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Do you want to continue anyway?',
            default: false
          }
        ]);

        if (!answers.proceed) {
          info('Upgrade cancelled');
          return;
        }
      }

      // 显示差异报告
      if (json) {
        console.log(formatDiffAsJson(diff));
      } else {
        console.log(formatDiffReport(diff));
      }

      if (dryRun) {
        info('');
        warn('Dry run mode - no changes applied');
        info('Run without --dry-run to apply the upgrade');
        return;
      }

      // 确认升级
      if (!force) {
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Upgrade ${componentName} from v${currentVersion} to v${newVersion}?`,
            default: true
          }
        ]);

        if (!answers.confirm) {
          info('Upgrade cancelled');
          return;
        }
      }

      // 执行升级
      info('Upgrading component...');
      const result = await copyComponent(componentName, uiDir, {
        overwrite: true
      });

      if (result.errors.length > 0) {
        warn('Some errors occurred during upgrade:');
        result.errors.forEach(err => warn(`  - ${err}`));
      }

      if (result.copied.length > 0) {
        success(`Updated ${result.copied.length} file(s)`);
      }

      // 更新配置
      info('Updating configuration...');
      config.components[componentName] = {
        version: newVersion,
        coreVersion: meta.coreVersion || 'latest',
        addedAt: config.components[componentName].addedAt,
        updatedAt: new Date().toISOString()
      };

      await writeUiConfig(config, projectRoot);
      success('Configuration updated');

      section('Upgrade Complete');
      success(`${componentName} upgraded from v${currentVersion} to v${newVersion}`);
      info('');

    } catch (err) {
      error(`Failed to upgrade component: ${err.message}`);
      if (process.env.DEBUG) {
        console.error(err);
      }
      process.exit(1);
    }
  });
