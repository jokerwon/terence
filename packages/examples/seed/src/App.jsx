/**
 * Root application component
 */

import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import OrderPage from './pages/OrderPage.jsx';

function RootApp() {
  return (
    <ConfigProvider locale={zhCN}>
      <App>
        <OrderPage />
      </App>
    </ConfigProvider>
  );
}

export default RootApp;
