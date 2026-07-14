/**
 * DocMaster — 全局布局组件
 * 深色顶部导航 + 内容区 + 底部版权
 */

import React, { useState } from 'react';
import { Layout as AntLayout, Button, Drawer, Badge } from 'antd';
import {
  HistoryOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { HistoryRecord } from '../../types';
import HistoryList from '../HistoryList';

const { Header, Content, Footer } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
  history: HistoryRecord[];
  onClearHistory: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, history, onClearHistory }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'var(--color-slate-50)' }}>
      {/* === 顶部导航栏 — 深色渐变 + 光泽动画 === */}
      <Header
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 56,
          lineHeight: '56px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 12px rgba(0,0,0,0.3), 0 0 1px rgba(79,70,229,0.3)',
          borderBottom: '1px solid rgba(79,70,229,0.15)',
        }}
      >
        {/* Logo 区 — 带旋转微动效 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4F46E5, #818CF8, #4F46E5)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 3s ease-in-out infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 17,
              color: '#fff',
              boxShadow: '0 0 16px rgba(79,70,229,0.4)',
              transition: 'transform 0.3s ease',
            }}
            className="logo-icon"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1) rotate(-5deg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
          >
            D
          </div>
          <span style={{
            color: '#fff',
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(90deg, #fff, #c7d2fe, #fff)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 3s linear infinite',
          }}>
            DocMaster
          </span>
          <span
            style={{
              color: 'var(--color-slate-400)',
              fontSize: 12,
              marginLeft: 4,
              paddingTop: 4,
              opacity: 0.8,
            }}
          >
            文档格式转换
          </span>
        </div>

        {/* 右侧操作 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge count={history.length} size="small" offset={[-2, 2]}>
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{
                color: 'var(--color-slate-300)',
                fontSize: 14,
              }}
            >
              历史记录
            </Button>
          </Badge>
        </div>
      </Header>

      {/* === 主内容区 === */}
      <Content
        style={{
          padding: '24px 16px',
          maxWidth: 920,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {children}
      </Content>

      {/* === 底部 — 开发者信息 === */}
      <Footer
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(15,23,42,0.02))',
          borderTop: '1px solid var(--color-slate-100)',
          padding: '32px 24px 24px',
          textAlign: 'center',
          marginTop: 32,
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* 分割装饰线 */}
          <div
            style={{
              width: 40,
              height: 3,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
              margin: '0 auto 16px',
            }}
          />

          {/* 开发者署名 */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-slate-500)',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span style={{ color: 'var(--color-slate-400)', fontWeight: 400 }}>Built by</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              onlooker
            </span>
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 6px rgba(16,185,129,0.4)',
              }}
            />
          </div>

          {/* 联系与合作 */}
          <a
            href="mailto:2528087667@qq.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--color-slate-400)',
              textDecoration: 'none',
              transition: 'color 0.2s ease, transform 0.2s ease',
              padding: '6px 14px',
              borderRadius: 20,
              background: 'var(--color-slate-50)',
              border: '1px solid var(--color-slate-200)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#4F46E5';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = '#818CF8';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,70,229,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '';
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 5L12 14L2 5" />
            </svg>
            合作联系 · 2528087667@qq.com
          </a>

          {/* 底部小字 */}
          <div style={{ marginTop: 14, fontSize: 11, color: 'var(--color-slate-300)' }}>
            DocMaster © {new Date().getFullYear()} · 安全 · 快速 · 免费
          </div>
        </div>
      </Footer>

      {/* === 历史记录抽屉 === */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HistoryOutlined />
            <span>转换历史</span>
          </div>
        }
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
        extra={
          history.length > 0 && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                onClearHistory();
                setDrawerOpen(false);
              }}
            >
              清空全部
            </Button>
          )
        }
        styles={{
          body: { padding: 0 },
        }}
      >
        <HistoryList records={history} />
      </Drawer>
    </AntLayout>
  );
};

export default Layout;
