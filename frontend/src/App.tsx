/**
 * DocMaster + 智能 RAG 知识库 — 根组件
 * 支持「文档格式转换」与「知识库问答」两个模块自由切换
 */

import React, { useState, useCallback } from 'react';
import { Tabs } from 'antd';
import {
  ThunderboltOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import Layout from './components/Layout';
import Home from './pages/Home';
import RAGPage from './pages/RAG';
import type { HistoryRecord } from './types';

const HISTORY_STORAGE_KEY = 'docmaster_history';

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
  const [activeTab, setActiveTab] = useState<'converter' | 'rag'>('converter');

  const handleHistoryChange = useCallback(() => {
    setHistory(loadHistory());
  }, []);

  const handleClearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setHistory([]);
  }, []);

  return (
    <Layout history={history} onClearHistory={handleClearHistory}>
      {/* 模块切换标签 */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'converter' | 'rag')}
        centered
        size="large"
        items={[
          {
            key: 'converter',
            label: (
              <span>
                <ThunderboltOutlined />
                文档格式转换
              </span>
            ),
            children: <Home onHistoryChange={handleHistoryChange} />,
          },
          {
            key: 'rag',
            label: (
              <span>
                <RobotOutlined />
                智能知识库问答
              </span>
            ),
            children: <RAGPage />,
          },
        ]}
        style={{ marginTop: -8 }}
      />
    </Layout>
  );
};

export default App;
