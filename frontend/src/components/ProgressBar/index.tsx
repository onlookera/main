/**
 * DocMaster — 进度条组件
 * 展示转换任务进度，包含状态图标和进度百分比
 * 支持 uploading / processing / completed / failed 四种状态
 */

import React from 'react';
import { Progress, Typography, Tag } from 'antd';
import {
  CloudUploadOutlined,
  LoadingOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SyncOutlined,
} from '@ant-design/icons';
import type { TaskStatus } from '../../types';

const { Text } = Typography;

interface ProgressBarProps {
  status: TaskStatus;
  progress: number; // 0-100
  message?: string;
}

/** 状态配置映射 */
const STATUS_CONFIG: Record<
  TaskStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  uploading: {
    color: 'var(--color-indigo-600)',
    icon: <CloudUploadOutlined style={{ fontSize: 24 }} />,
    label: '上传中',
  },
  pending: {
    color: 'var(--color-amber-500)',
    icon: <SyncOutlined spin style={{ fontSize: 24 }} />,
    label: '排队中',
  },
  processing: {
    color: 'var(--color-indigo-600)',
    icon: <LoadingOutlined style={{ fontSize: 24 }} />,
    label: '转换中',
  },
  completed: {
    color: 'var(--color-emerald-500)',
    icon: <CheckCircleFilled style={{ fontSize: 24 }} />,
    label: '完成',
  },
  failed: {
    color: 'var(--color-red-500)',
    icon: <CloseCircleFilled style={{ fontSize: 24 }} />,
    label: '失败',
  },
};

const ProgressBar: React.FC<ProgressBarProps> = ({ status, progress, message }) => {
  const config = STATUS_CONFIG[status];
  const isActive = status === 'uploading' || status === 'processing';

  return (
    <div
      className={isActive ? 'progress-glow' : ''}
      style={{
        background: 'var(--color-white)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        border: '1px solid var(--color-slate-200)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 状态头部 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <span style={{ color: config.color }}>{config.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong style={{ fontSize: 15, color: config.color }}>
              {config.label}
            </Text>
            <Tag
              color={
                status === 'completed'
                  ? 'success'
                  : status === 'failed'
                  ? 'error'
                  : 'processing'
              }
              style={{ fontSize: 11 }}
            >
              {progress}%
            </Tag>
          </div>
          {message && (
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
              {message}
            </Text>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <Progress
        percent={progress}
        status={
          status === 'failed'
            ? 'exception'
            : status === 'completed'
            ? 'success'
            : 'active'
        }
        strokeColor={
          status === 'failed'
            ? 'var(--color-red-500)'
            : status === 'completed'
            ? 'var(--color-emerald-500)'
            : {
                '0%': '#4F46E5',
                '100%': '#818CF8',
              }
        }
        trailColor="var(--color-slate-100)"
        strokeWidth={8}
        showInfo={false}
        style={{ marginBottom: 0 }}
      />

      {/* 完成 / 失败额外提示 */}
      {status === 'completed' && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 12px',
            background: 'var(--color-emerald-50)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CheckCircleFilled style={{ color: 'var(--color-emerald-500)', fontSize: 14 }} />
          <Text style={{ color: 'var(--color-emerald-500)', fontSize: 13 }}>
            转换完成！请点击下方按钮下载文件
          </Text>
        </div>
      )}

      {status === 'failed' && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 12px',
            background: 'var(--color-red-50)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CloseCircleFilled style={{ color: 'var(--color-red-500)', fontSize: 14 }} />
          <Text style={{ color: 'var(--color-red-500)', fontSize: 13 }}>
            {message || '转换失败，请检查文件是否损坏或尝试其他格式'}
          </Text>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
