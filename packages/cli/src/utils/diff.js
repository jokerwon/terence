/**
 * Diff utilities for component upgrades
 */

import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { getComponentTemplatePath } from './template.js';

/**
 * @typedef {Object} FileDiff
 * @property {string} path - 文件相对路径
 * @property {'added'|'modified'|'deleted'|'conflict'} status - 变更状态
 * @property {string} [hash] - 文件 hash
 */

/**
 * @typedef {Object} ComponentDiff
 * @property {string} component - 组件名称
 * @property {string} fromVersion - 当前版本
 * @property {string} toVersion - 目标版本
 * @property {FileDiff[]} files - 文件变更列表
 * @property {boolean} hasLocalChanges - 是否有本地修改
 */

/**
 * 计算文件 hash（用于检测本地修改）
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>}
 */
async function calculateFileHash(filePath) {
  const content = await fs.readFile(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * 递归获取目录下所有文件的相对路径
 * @param {string} dir - 目录路径
 * @returns {Promise<string[]>}
 */
async function getFilePaths(dir) {
  const files = [];

  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (item.name === 'node_modules' || item.name.startsWith('.')) {
        continue;
      }
      const subFiles = await getFilePaths(fullPath);
      files.push(...subFiles.map(f => path.join(item.name, f)));
    } else if (item.isFile()) {
      files.push(item.name);
    }
  }

  return files;
}

/**
 * 生成组件差异报告
 * @param {string} componentName - 组件名称
 * @param {string} currentDir - 当前组件目录
 * @param {Object} [options] - 选项
 * @param {boolean} [options.checkLocalChanges=true] - 是否检查本地修改
 * @returns {Promise<ComponentDiff>}
 */
export async function generateDiff(componentName, currentDir, options = {}) {
  const { checkLocalChanges = true } = options;

  const templatePath = getComponentTemplatePath(componentName);
  const templateExists = await fs.pathExists(templatePath);

  if (!templateExists) {
    throw new Error(`Template for component "${componentName}" not found`);
  }

  // 读取版本信息
  const currentMetaPath = path.join(currentDir, 'meta.json');
  const templateMetaPath = path.join(templatePath, 'meta.json');

  let fromVersion = 'unknown';
  let toVersion = 'unknown';

  if (await fs.pathExists(currentMetaPath)) {
    const currentMeta = JSON.parse(await fs.readFile(currentMetaPath, 'utf-8'));
    fromVersion = currentMeta.version || fromVersion;
  }

  if (await fs.pathExists(templateMetaPath)) {
    const templateMeta = JSON.parse(await fs.readFile(templateMetaPath, 'utf-8'));
    toVersion = templateMeta.version || toVersion;
  }

  // 获取文件列表
  const currentFiles = await fs.pathExists(currentDir)
    ? await getFilePaths(currentDir)
    : [];
  const templateFiles = await getFilePaths(templatePath);

  // 计算文件差异
  const fileSet = new Set([...currentFiles, ...templateFiles]);
  const files = [];

  let hasLocalChanges = false;

  for (const filePath of fileSet) {
    const currentFilePath = path.join(currentDir, filePath);
    const templateFilePath = path.join(templatePath, filePath);

    const inCurrent = currentFiles.includes(filePath);
    const inTemplate = templateFiles.includes(filePath);

    let status = '';
    let hash = undefined;

    if (!inCurrent && inTemplate) {
      // 新增文件
      status = 'added';
    } else if (inCurrent && !inTemplate) {
      // 删除文件
      status = 'deleted';
    } else if (inCurrent && inTemplate) {
      // 检查是否有修改
      if (checkLocalChanges) {
        try {
          const currentHash = await calculateFileHash(currentFilePath);
          const templateHash = await calculateFileHash(templateFilePath);

          if (currentHash !== templateHash) {
            status = 'conflict';
            hash = currentHash;
            hasLocalChanges = true;
          } else {
            status = 'modified'; // 版本升级导致的内容变化
          }
        } catch {
          status = 'modified';
        }
      } else {
        status = 'modified';
      }
    }

    files.push({ path: filePath, status, hash });
  }

  return {
    component: componentName,
    fromVersion,
    toVersion,
    files,
    hasLocalChanges
  };
}

/**
 * 检测组件是否有本地修改
 * @param {string} componentName - 组件名称
 * @param {string} currentDir - 当前组件目录
 * @returns {Promise<boolean>}
 */
export async function hasLocalChanges(componentName, currentDir) {
  try {
    const diff = await generateDiff(componentName, currentDir);
    return diff.hasLocalChanges;
  } catch {
    return false;
  }
}

/**
 * 格式化差异报告为可读文本
 * @param {ComponentDiff} diff - 差异报告
 * @returns {string}
 */
export function formatDiffReport(diff) {
  const lines = [
    `\n📦 Component: ${diff.component}`,
    `   Version: ${diff.fromVersion} → ${diff.toVersion}`,
    ''
  ];

  if (diff.hasLocalChanges) {
    lines.push('⚠️  Warning: Local changes detected!');
    lines.push('');
  }

  // 按状态分组
  const added = diff.files.filter(f => f.status === 'added');
  const modified = diff.files.filter(f => f.status === 'modified');
  const deleted = diff.files.filter(f => f.status === 'deleted');
  const conflicts = diff.files.filter(f => f.status === 'conflict');

  if (added.length > 0) {
    lines.push('✨ Added files:');
    added.forEach(f => lines.push(`   + ${f.path}`));
    lines.push('');
  }

  if (modified.length > 0) {
    lines.push('📝 Modified files:');
    modified.forEach(f => lines.push(`   ~ ${f.path}`));
    lines.push('');
  }

  if (deleted.length > 0) {
    lines.push('🗑️  Deleted files:');
    deleted.forEach(f => lines.push(`   - ${f.path}`));
    lines.push('');
  }

  if (conflicts.length > 0) {
    lines.push('⚠️  Conflicts (local changes will be overwritten):');
    conflicts.forEach(f => lines.push(`   ! ${f.path}`));
    lines.push('');
  }

  if (added.length + modified.length + deleted.length + conflicts.length === 0) {
    lines.push('✅ No changes');
  }

  return lines.join('\n');
}

/**
 * 格式化差异报告为 JSON
 * @param {ComponentDiff} diff - 差异报告
 * @returns {string}
 */
export function formatDiffAsJson(diff) {
  return JSON.stringify(diff, null, 2);
}
