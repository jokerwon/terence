/**
 * @fileoverview 禁止在 engines 目录下导入 UI 相关模块
 * @author Terence Team
 */
"use strict";

const path = require("path");

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "禁止在 engines 目录下导入 UI 相关模块",
      category: "Architecture",
      recommended: true,
      url: "https://docs.terence.com/architecture/rules/no-ui-in-engines",
    },
    messages: {
      uiModuleInEngine: "Engine 层严禁导入 UI 相关模块: '{{moduleName}}'。Engine 应为纯业务逻辑层。",
      reactModuleInEngine: "Engine 层严禁导入 React: '{{moduleName}}'。UI 层应由适配器处理。",
      zustandModuleInEngine: "Engine 层严禁导入状态管理库: '{{moduleName}}'。状态管理应在适配器层完成。",
      antdModuleInEngine: "Engine 层严禁导入 UI 组件库: '{{moduleName}}'。UI 组件应在适配器层使用。",
    },
    fixable: null,
    schema: [],
  },

  create(context) {
    // 检查当前文件是否在 engines 目录下
    const filename = context.getFilename();

    // 标准化路径，处理不同操作系统的路径分隔符
    const normalizedPath = path.normalize(filename);
    const isInEnginesDirectory = normalizedPath.includes(path.normalize("packages/core/engines"));

    if (!isInEnginesDirectory) {
      return {}; // 如果不在 engines 目录，跳过检查
    }

    // 禁止的模块模式
    const forbiddenPatterns = {
      react: /^react(\/.*)?$/,
      reactDom: /^react-dom(\/.*)?$/,
      zustand: /^zustand(\/.*)?$/,
      antd: /^antd(\/.*)?$/,
      antIcons: /^@ant-design\/icons(\/.*)?$/,
      antPro: /^@ant-design\/pro-components(\/.*)?$/,
      terenceUi: /^@terence\/ui(\/.*)?$/,
    };

    return {
      ImportDeclaration(node) {
        const sourceValue = node.source.value;

        // 检查导入的模块是否在禁止列表中
        for (const [category, pattern] of Object.entries(forbiddenPatterns)) {
          if (typeof pattern === "string") {
            if (pattern === sourceValue || sourceValue.startsWith(pattern + "/")) {
              context.report({
                node: node.source,
                messageId: getCategoryId(category),
                data: {
                  moduleName: sourceValue,
                },
              });
            }
          } else if (pattern instanceof RegExp) {
            if (pattern.test(sourceValue)) {
              context.report({
                node: node.source,
                messageId: getCategoryId(category),
                data: {
                  moduleName: sourceValue,
                },
              });
            }
          }
        }
      },
    };
  },
};

// 根据模块类别返回对应的 messageId
function getCategoryId(category) {
  const categoryMap = {
    react: "reactModuleInEngine",
    reactDom: "reactModuleInEngine",
    zustand: "zustandModuleInEngine",
    antd: "antdModuleInEngine",
    antIcons: "antdModuleInEngine",
    antPro: "antdModuleInEngine",
    terenceUi: "uiModuleInEngine",
  };
  return categoryMap[category] || "uiModuleInEngine";
}