/**
 * Configuration utilities for UI components
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * @typedef {Object} UiConfig
 * @property {string} version - 配置文件版本
 * @property {string} uiDir - UI 组件���录，默认 'src/ui'
 * @property {Object<string, ComponentInfo>} components - 已引入的组件
 */

/**
 * @typedef {Object} ComponentInfo
 * @property {string} version - 组件版本
 * @property {string} coreVersion - 依赖的 core 包版本
 * @property {string} [addedAt] - 添加时间
 */

/**
 * 配置文件名称
 */
export const CONFIG_FILENAME = 'ui.config.json';

/**
 * 默认配置
 * @returns {UiConfig}
 * @param {string} [projectRoot=process.cwd()] - 项目根目录
 * @returns {string}
 */
export function getConfigPath(projectRoot = process.cwd()) {
  return path.join(projectRoot, CONFIG_FILENAME);
}

/**
 * 读取 UI 配置��件
 * @param {string} [projectRoot=process.cwd()] - 项目根目录
 * @returns {Promise<UiConfig|null>} 配置对象，如果文件不存在返回 null
 */
export async function readUiConfig(projectRoot = process.cwd()) {
  const configPath = getConfigPath(projectRoot);

  try {
    await fs.access(configPath);
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw new Error(`Failed to read config file: ${err.message}`);
  }
}

/**
 * 写入 UI 配置文件
 * @param {UiConfig} config - 配置对象
 * @param {string} [projectRoot=process.cwd()] - 项目根目录
 * @returns {Promise<void>}
 */
export async function writeUiConfig(config, projectRoot = process.cwd()) {
  const configPath = getConfigPath(projectRoot);

  await fs.writeFile(
    configPath,
    JSON.stringify(config, null, 2),
    'utf-8'
  );
}

/**
 * 验证配置文件格式
 * @param {unknown} config - 配置对象
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateSchema(config) {
  const errors = [];

  // 检查是否为对象
  if (typeof config !== 'object' || config === null) {
    return { valid: false, errors: ['Config must be an object'] };
  }

  // 检查 version
  if (config.version == null) {
    errors.push('Missing required field: version');
  } else if (typeof config.version !== 'string') {
    errors.push('Field "version" must be a string');
  }

  // 检查 uiDir
  if (config.uiDir == null) {
    errors.push('Missing required field: uiDir');
  } else if (typeof config.uiDir !== 'string') {
    errors.push('Field "uiDir" must be a string');
  }

  // 检查 components
  if (config.components == null) {
    errors.push('Missing required field: components');
  } else if (typeof config.components !== 'object') {
    errors.push('Field "components" must be an object');
  } else {
    // 验证每个组件信息
    for (const [name, info] of Object.entries(config.components)) {
      if (typeof info !== 'object' || info === null) {
        errors.push(`Component "${name}" info must be an object`);
        continue;
      }

      if (info.version == null) {
        errors.push(`Component "${name}" missing version`);
      }

      if (info.coreVersion == null) {
        errors.push(`Component "${name}" missing coreVersion`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 检查项目是否已初始化
 * @param {string} [projectRoot=process.cwd()] - 项目根目录
 * @returns {Promise<boolean>}
 */
export async function isInitialized(projectRoot = process.cwd()) {
  const config = await readUiConfig(projectRoot);
  return config !== null;
}

/**
 * 获取 UI 组件目录路径
 * @param {string} [projectRoot=process.cwd()] - 项目根目录
 * @returns {Promise<string>}
 */
export async function getUiDir(projectRoot = process.cwd()) {
  const config = await readUiConfig(projectRoot);
  if (!config) {
    throw new Error('Project not initialized. Run "terence init" first.');
  }
  return path.join(projectRoot, config.uiDir);
}

/**
 * 检查是否是有效项目（存在 package.json）
 * @param {string} [projectRoot=process.cwd()] - 项目根目录
 * @returns {Promise<boolean>}
 */
export async function isValidProject(projectRoot = process.cwd()) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  try {
    await fs.access(packageJsonPath);
    return true;
  } catch {
    return false;
  }
}
