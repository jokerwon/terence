/**
 * 创建登录引擎的 Rules
 *
 * Rules 用于回答业务层判断问题,必须是纯函数。
 *
 * @param {Function} getState - 获取当前状态的函数
 * @returns {Object} Rules 集合
 */
export function createRules(getState) {
  return {
    /**
     * 是否可以提交登录
     * @returns {boolean}
     */
    canSubmit() {
      const state = getState();
      return (
        state.username.trim().length > 0 &&
        state.password.length >= 6 &&
        state.status !== 'submitting'
      );
    },

    /**
     * 是否正在提交
     * @returns {boolean}
     */
    isSubmitting() {
      return getState().status === 'submitting';
    },

    /**
     * 是否有错误
     * @returns {boolean}
     */
    hasError() {
      return getState().status === 'error';
    },

    /**
     * 是否已登录
     * @returns {boolean}
     */
    isAuthenticated() {
      return getState().status === 'success';
    },

    /**
     * 获取错误消息
     * @returns {string}
     */
    getErrorMessage() {
      const state = getState();
      return state.error || '';
    }
  };
}
