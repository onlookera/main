/**
 * DocMaster — 根组件
 * 使用 Layout 包裹 Home 页面，管理全局历史记录状态
 */

import React, { useState, useCallback } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import type { HistoryRecord } from './types';

const HISTORY_STORAGE_KEY = 'docmaster_history';

/** 从 localStorage 读取历史记录（Home 组件修改后 App 重新读取） */
const loadHistory = (): HistoryRecord[] => {
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryRecord[]>(loadHistory);

  /** Home 组件修改历史后，同步刷新 App 的 history 状态 */
  const handleHistoryChange = useCallback(() => {
    setHistory(loadHistory());
  }, []);

  /** 清空历史记录 */
  const handleClearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setHistory([]);
  }, []);

  return (
    <Layout history={history} onClearHistory={handleClearHistory}>
      <Home onHistoryChange={handleHistoryChange} />
    </Layout>
  );
};

export default App;
