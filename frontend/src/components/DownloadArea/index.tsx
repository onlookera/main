/**
 * DocMaster — 下载区域组件
 * 转换完成后展示下载按钮，带庆祝动效
 */

import React from 'react';
import { Button, Typography, Space } from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  RedoOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { getDownloadUrl } from '../../services/api';

const { Text } = Typography;

interface DownloadAreaProps {
  taskId: string;
  outputFilename?: string;
  onReset: () => void;
  onDelete: () => void;
}

const DownloadArea: React.FC<DownloadAreaProps> = ({
  taskId,
  outputFilename,
  onReset,
  onDelete,
}) => {
  const handleDownload = () => {
    const url = getDownloadUrl(taskId);
    const link = document.createElement('a');
    link.href = url;
    link.download = outputFilename || 'converted_file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #FFFFFF, #F0FDF4)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 24px',
        border: '2px solid var(--color-emerald-400)',
        boxShadow: '0 0 32px rgba(16, 185, 129, 0.15), 0 4px 16px rgba(0,0,0,0.04)',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 庆祝彩带 — 装饰性斜线 */}
      <div style={{
        position: 'absolute',
        top: -30, left: '10%',
        width: 60, height: 120,
        background: 'linear-gradient(180deg, rgba(16,185,129,0.08), transparent)',
        transform: 'rotate(25deg)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: -20, right: '15%',
        width: 40, height: 100,
        background: 'linear-gradient(180deg, rgba(79,70,229,0.06), transparent)',
        transform: 'rotate(-20deg)',
        pointerEvents: 'none',
      }} />

      {/* 成功图标 — 带脉冲涟漪 */}
      <div style={{ marginBottom: 12, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'successPulse 2s ease-out infinite',
        }}>
          <CheckCircleFilled
            style={{ fontSize: 48, color: 'var(--color-emerald-500)' }}
          />
        </div>
      </div>

      <Text strong style={{ fontSize: 17, display: 'block', marginBottom: 4 }}>
        🎉 文件转换完成
      </Text>
      {outputFilename && (
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
          {outputFilename}
        </Text>
      )}

      {/* 操作按钮 */}
      <Space size="middle" wrap>
        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          style={{
            background: 'linear-gradient(135deg, #10B981, #34D399)',
            border: 'none',
            fontWeight: 600,
            minWidth: 160,
            height: 44,
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
          }}
        >
          下载文件
        </Button>
        <Button size="large" icon={<RedoOutlined />} onClick={onReset}>
          重新转换
        </Button>
        <Button size="large" icon={<DeleteOutlined />} onClick={onDelete} danger>
          删除
        </Button>
      </Space>
    </div>
  );
};

export default DownloadArea;
