/**
 * Custom ESLint Rules for Terence Architecture
 *
 * 这些规则用于强制执行项目的架构边界和约束
 */

const noUiInEngines = require("./no-ui-in-engines");

export default {
  "no-ui-in-engines": noUiInEngines,
};