/**
 * Template utilities for copying UI components
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { error } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取组件模板根目录
 * @returns {string}
 */
export function getTemplateRoot() {
  // 从 CLI 包向上查找 Terence 根目录，然后进入 ui/src/components
  const terenceRoot = path.join(__dirname, '../../../');
  return path.join(terenceRoot, 'ui/src/components');
}

/**
 * 获取组件模板路径
 * @param {string} componentName - 组件名称
 * @returns {string}
 */
export function getComponentTemplatePath(componentName) {
  return path.join(getTemplateRoot(), componentName);
}

/**
 * 递归拷贝组件源码
 * @param {string} componentName - 组件名称
 * @param {string} destDir - 目标目录
 * @param {Object} [options] - 选项
 * @param {boolean} [options.overwrite=false] - 是否覆盖已存在的文件
 * @returns {Promise<{copied: string[], skipped: string[], errors: string[]}>}
 */
export async function copyComponent(componentName, destDir, options = {}) {
  const { overwrite = false } = options;
  const result = {
    copied: [],
    skipped: [],
    errors: []
  };

  try {
    const sourcePath = getComponentTemplatePath(componentName);

    // 检查源模板是否存在
    const exists = await fs.pathExists(sourcePath);
    if (!exists) {
      throw new Error(`Component template "${componentName}" not found`);
    }

    // 检查目标目录是否已存在
    const destPath = path.join(destDir, componentName);
    const destExists = await fs.pathExists(destPath);

    if (destExists && !overwrite) {
      throw new Error(`Component "${componentName}" already exists in target directory`);
    }

    // 创建目标目录
    await fs.ensureDir(destPath);

    // 递归拷贝文件
    const files = await getFilesRecursively(sourcePath);

    for (const file of files) {
      const relativePath = path.relative(sourcePath, file);
      const targetFile = path.join(destPath, relativePath);

      try {
        // 检查文件是否已存在
        const targetExists = await fs.pathExists(targetFile);
        if (targetExists && !overwrite) {
          result.skipped.push(relativePath);
          continue;
        }

        // 拷贝文件
        await fs.copy(file, targetFile, { overwrite });
        result.copied.push(relativePath);
      } catch (err) {
        result.errors.push(`${relativePath}: ${err.message}`);
      }
    }

    // 拷贝 meta.json（如果存在）
    const metaPath = path.join(sourcePath, 'meta.json');
    if (await fs.pathExists(metaPath)) {
      const destMetaPath = path.join(destPath, 'meta.json');
      await fs.copy(metaPath, destMetaPath, { overwrite });
    }

  } catch (err) {
    result.errors.push(err.message);
  }

  return result;
}

/**
 * 递归获取目录下所有文件
 * @param {string} dir - 目录路径
 * @returns {Promise<string[]>}
 */
async function getFilesRecursively(dir) {
  const files = [];

  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      // 跳过 node_modules 和隐藏目录
      if (item.name === 'node_modules' || item.name.startsWith('.')) {
        continue;
      }
      const subFiles = await getFilesRecursively(fullPath);
      files.push(...subFiles);
    } else if (item.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 读取组件元数据
 * @param {string} componentName - 组件名称
 * @returns {Promise<Object|null>}
 */
export async function readComponentMeta(componentName) {
  try {
    const templatePath = getComponentTemplatePath(componentName);
    const metaPath = path.join(templatePath, 'meta.json');

    const exists = await fs.pathExists(metaPath);
    if (!exists) {
      return null;
    }

    const content = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to read meta.json for "${componentName}": ${err.message}`);
  }
}

/**
 * 列出所有可用的组件模板
 * @returns {Promise<string[]>}
 */
export async function listAvailableComponents() {
  try {
    const templateRoot = getTemplateRoot();
    const exists = await fs.pathExists(templateRoot);

    if (!exists) {
      return [];
    }

    const items = await fs.readdir(templateRoot, { withFileTypes: true });
    return items
      .filter(item => item.isDirectory())
      .map(item => item.name);
  } catch (err) {
    error(`Failed to list components: ${err.message}`);
    return [];
  }
}

/**
 * 删除组件
 * @param {string} componentName - 组件名称
 * @param {string} uiDir - UI 目录
 * @returns {Promise<boolean>}
 */
export async function removeComponent(componentName, uiDir) {
  try {
    const componentPath = path.join(uiDir, componentName);
    const exists = await fs.pathExists(componentPath);

    if (!exists) {
      return false;
    }

    await fs.remove(componentPath);
    return true;
  } catch (err) {
    throw new Error(`Failed to remove component "${componentName}": ${err.message}`);
  }
}
