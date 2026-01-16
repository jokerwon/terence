/**
 * OrderFormAdapter - 订单表单适配器
 *
 * 职责：
 * - 订阅 @terence/core 的 Engine 状态变化
 * - 包装 engine actions，添加错误处理和 UI 状态管理
 * - 转换 core state 为 view 可消费的格式
 * - 作为唯一接缝点，连接 core 和 view
 */

import { useState, useEffect, useCallback } from 'react';
import { createOrderEngine } from '@terence/core';

/**
 * 订单表单适配器 Hook
 *
 * @param {Object} options
 * @param {Function} options.submitOrder - 提交订单到后端的函数
 * @returns {Object} 适配器状态和操作
 *
 * @example
 * const adapter = useOrderFormAdapter({
 *   submitOrder: async (payload) => {
 *     const response = await fetch('/api/orders', {
 *       method: 'POST',
 *       body: JSON.stringify(payload)
 *     });
 *     return response.json();
 *   }
 * });
 */
export function useOrderFormAdapter({ submitOrder }) {
  // UI 内部状态（不来自 core）
  const [engine] = useState(() => createOrderEngine({ submitOrder }));
  const [state, setState] = useState(engine.getState());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 订阅状态变化
  useEffect(() => {
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
    });

    // 初始化状态
    setState(engine.getState());

    return unsubscribe;
  }, [engine]);

  // 包装 actions - 添加错误处理和 UI 状态
  const actions = {
    addItem: useCallback((item) => {
      try {
        setError(null);
        engine.addItem(item);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }, [engine]),

    removeItem: useCallback((productId) => {
      try {
        setError(null);
        engine.removeItem(productId);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }, [engine]),

    updateQty: useCallback((productId, quantity) => {
      try {
        setError(null);
        engine.updateQty(productId, quantity);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }, [engine]),

    submit: useCallback(async () => {
      try {
        setError(null);
        setLoading(true);
        await engine.submit();
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, [engine]),

    reset: useCallback(() => {
      try {
        setError(null);
        engine.reset();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }, [engine])
  };

  return {
    state,
    error,
    loading,
    actions
  };
}
