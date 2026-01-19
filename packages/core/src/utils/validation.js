/**
 * validateDeps - 校验依赖注入对象
 *
 * 验证 deps 对象是否包含所有必需的依赖,且类型正确。
 *
 * @param {Object} deps - 依赖注入对象
 * @param {Object} schema - 校验模式 { key: 'function' | 'object' }
 * @throws {Error} 依赖缺失或类型错误时抛出
 *
 * @example
 * const depsSchema = {
 *   loginRequest: 'function',
 *   saveToken: 'function',
 *   navigate: 'function'
 * };
 *
 * validateDeps(deps, depsSchema);
 */
export function validateDeps(deps, schema) {
  const errors = [];

  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in deps)) {
      errors.push(`Missing required dependency: ${key}`);
      continue;
    }

    const actualValue = deps[key];
    const actualType = typeof actualValue;

    if (expectedType === 'function' && actualType !== 'function') {
      errors.push(`Dependency ${key} must be a function, got ${actualType}`);
    }

    if (expectedType === 'object' && actualType !== 'object') {
      errors.push(`Dependency ${key} must be an object, got ${actualType}`);
    }
  }

  if (errors.length > 0) {
    const errorMsg = errors.join('\n');
    throw new Error(
      `[Invariant Failed] Invalid dependencies:\n${errorMsg}`
    );
  }
}
