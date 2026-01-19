import { invariant, invariantWithType } from '../../utils/invariant.js';

/**
 * 创建登录引擎的 Commands
 *
 * Commands 表示"业务试图发生一次变化",是状态修改的唯一入口。
 *
 * @param {LoginDependencies} deps - 依赖注入对象
 * @param {Function} getState - 获取当前状态的函数
 * @param {Function} setState - 设置状态的函数
 * @returns {Object} Commands 集合
 */
export function createCommands(deps, getState, setState) {
  return {
    /**
     * 设置用户名
     * @param {string} value - 用户名
     * @throws {Error} 如果 value 不是字符串
     */
    setUsername(value) {
      invariantWithType(value, 'string', 'Username');
      setState(state => ({
        ...state,
        username: value,
        status: 'editing'
      }));
    },

    /**
     * 设置密码
     * @param {string} value - 密码
     * @throws {Error} 如果 value 不是字符串或长度不足 6
     */
    setPassword(value) {
      invariantWithType(value, 'string', 'Password');
      invariant(value.length >= 6, 'Password must be at least 6 characters');

      setState(state => ({
        ...state,
        password: value,
        status: 'editing'
      }));
    },

    /**
     * 提交登录
     * @throws {Error} 如果用户名或密码为空,或登录请求失败
     */
    async submit() {
      const state = getState();

      // 参数校验
      invariant(state.username.trim().length > 0, 'Username is required');
      invariant(state.password.length >= 6, 'Password must be at least 6 characters');

      // 更新状态为 submitting
      setState({
        ...state,
        status: 'submitting',
        error: null
      });

      try {
        // 调用副作用
        const result = await deps.loginRequest({
          username: state.username,
          password: state.password
        });

        // 更新状态为成功
        setState({
          ...state,
          status: 'success',
          token: result.token,
          user: result.user
        });

        // 触发后续副作用
        deps.saveToken(result.token);
        deps.navigate('/dashboard');

      } catch (error) {
        // 更新状态为错误
        setState({
          ...state,
          status: 'error',
          error: error.message
        });

        // 重新抛出错误,让调用者处理
        throw error;
      }
    },

    /**
     * 重置登录状态
     */
    reset() {
      setState({
        username: '',
        password: '',
        status: 'idle',
        error: null,
        token: null,
        user: null
      });
    }
  };
}
