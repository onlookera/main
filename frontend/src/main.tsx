/**
 * DocMaster — 应用入口文件
 * 挂载 React 根组件到 DOM
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

// Ant Design 5 主题定制 — 匹配企业级设计令牌
const themeConfig = {
  token: {
    // 主色：Indigo
    colorPrimary: '#4F46E5',
    // 成功色：Emerald
    colorSuccess: '#10B981',
    // 错误色
    colorError: '#EF4444',
    // 警告色
    colorWarning: '#F59E0B',
    // 字体
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`,
    // 圆角
    borderRadius: 8,
    // 基础字号
    fontSize: 14,
  },
  components: {
    Button: {
      // 按钮圆角稍大，更现代
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      // 卡片圆角
      borderRadiusLG: 12,
    },
    Progress: {
      // 进度条圆角
      borderRadius: 4,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={themeConfig} locale={zhCN}>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);
