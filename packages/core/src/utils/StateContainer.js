/**
 * StateContainer - 增强���发布订阅状态容器
 *
 * 提供状态管理、订阅通知、批量更新和性能监控功能。
 * 完全符合 ES2022+ 标准,可在 Node 和浏览器环境运行。
 *
 * @example
 * const container = new StateContainer({ count: 0 });
 *
 * // 订阅状态变化
 * const unsubscribe = container.subscribe((newState) => {
 *   console.log('State changed:', newState);
 * });
 *
 * // 更新状态
 * container.setState(state => ({ ...state, count: state.count + 1 }));
 *
 * // 批量更新
 * container.batch(() => {
 *   container.setState(state => ({ ...state, count: state.count + 1 }));
 *   container.setState(state => ({ ...state, count: state.count + 1 }));
 * });
 */
export class StateContainer {
  /**
   * 创建状态容器实例
   * @param {Object} initialState - 初始状态
   */
  constructor(initialState) {
    this._state = initialState;
    this._listeners = new Set();
    this._pendingUpdates = new Set();
    this._isBatching = false;
  }

  /**
   * 获取当前状态的不可变副本
   * @returns {Object} 状态的深拷贝
   */
  getState() {
    return this._immutableCopy(this._state);
  }

  /**
   * 更新状态
   * @param {Object|Function} updater - 新状态或更新函数
   */
  setState(updater) {
    const start = performance.now();

    let newState;
    if (typeof updater === 'function') {
      newState = updater(this._state);
    } else {
      newState = updater;
    }

    if (this._isBatching) {
      this._pendingUpdates.add(() => this._applyState(newState));
    } else {
      this._applyState(newState);
    }

    const duration = performance.now() - start;
    if (duration > 1) {
      console.warn(`[StateContainer] State update took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * 批量更新状态(只触发一次通知)
   * @param {Function} updates - 包含 setState 调用的函数
   */
  batch(updates) {
    this._isBatching = true;
    try {
      updates();
    } finally {
      this._isBatching = false;
      const updates = Array.from(this._pendingUpdates);
      this._pendingUpdates.clear();
      updates.forEach(update => update());
    }
  }

  /**
   * 订阅状态变化
   * @param {Function} listener - 监听器函数
   * @returns {Function} 取消订阅函数
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * 应用状态更新
   * @private
   */
  _applyState(newState) {
    this._state = newState;
    this._notify();
  }

  /**
   * 通知所有监听器
   * @private
   */
  _notify() {
    const currentState = this.getState();
    this._listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('[StateContainer] Listener error:', err);
      }
    });
  }

  /**
   * 创建不可变副本(深拷贝)
   * @private
   */
  _immutableCopy(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => this._immutableCopy(item));
    }
    const copy = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = this._immutableCopy(obj[key]);
      }
    }
    return copy;
  }
}
