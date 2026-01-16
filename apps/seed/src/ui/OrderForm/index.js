/**
 * OrderForm 组件 - 订单表单
 *
 * 架构：Adapter-View 分离
 * - View: 纯 UI 组件，只负责渲染
 * - Adapter: 连接 core Engine 和 View
 * - Logic: UI 内部逻辑（非业务逻辑）
 */

export { OrderFormView } from './OrderForm.view.jsx';
export { useOrderFormAdapter } from './OrderForm.adapter.js';
export { formatAmount, validateItemInput, calculateItemSubtotal } from './OrderForm.logic.js';

/**
 * 默认导出 - 完整组件
 *
 * 使用示例：
 * import { OrderForm } from '@terence/ui/components/OrderForm';
 *
 * function App() {
 *   const adapter = useOrderFormAdapter({
 *     submitOrder: async (payload) => { ... }
 *   });
 *
 *   return <OrderFormView {...adapter} />;
 * }
 */
