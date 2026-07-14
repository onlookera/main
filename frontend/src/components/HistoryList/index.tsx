/**
 * DocMaster — 历史记录列表组件
 * 展示历史转换记录，支持空状态提示
 */

import React from 'react';
import { List, Typography, Tag, Empty } from 'antd';
import {
  FileTextOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
} from '@ant-design/icons';
import type { HistoryRecord, TaskStatus, ConversionType } from '../../types';

const { Text } = Typography;

interface HistoryListProps {
  records: HistoryRecord[];
}

/** 转换类型的中文映射 */
const CONVERSION_LABELS: Record<ConversionType, string> = {
  pdf_to_word: 'PDF → Word',
  pdf_to_ppt: 'PDF → PPT',
  word_to_pdf: 'Word → PDF',
  ppt_to_pdf: 'PPT → PDF',
  ppt_to_word: 'PPT → Word',
  pdf_merge: 'PDF 合并',
  pdf_split: 'PDF 拆分',
};

/** 状态标签配置 */
const STATUS_TAG: Record<TaskStatus, { color: string; icon: React.ReactNode; label: string }> = {
  uploading: { color: 'processing', icon: <ClockCircleFilled />, label: '上传中' },
  pending: { color: 'warning', icon: <ClockCircleFilled />, label: '排队中' },
  processing: { color: 'processing', icon: <ClockCircleFilled />, label: '转换中' },
  completed: { color: 'success', icon: <CheckCircleFilled />, label: '已完成' },
  failed: { color: 'error', icon: <CloseCircleFilled />, label: '失败' },
};

const HistoryList: React.FC<HistoryListProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <Empty
        description="暂无转换记录"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '48px 0' }}
      />
    );
  }

  return (
    <List
      dataSource={[...records].reverse()} // 最新的在前面
      renderItem={(record: HistoryRecord) => {
        const statusCfg = STATUS_TAG[record.status];
        return (
          <List.Item
            style={{
              padding: '12px 24px',
              cursor: 'default',
            }}
          >
            <List.Item.Meta
              avatar={
                <FileTextOutlined
                  style={{ fontSize: 20, color: 'var(--color-slate-400)' }}
                />
              }
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 14, maxWidth: 200 }} ellipsis>
                    {record.filename}
                  </Text>
                  <Tag
                    color={statusCfg.color}
                    icon={statusCfg.icon}
                    style={{ fontSize: 11 }}
                  >
                    {statusCfg.label}
                  </Tag>
                </div>
              }
              description={
                <div style={{ fontSize: 12, color: 'var(--color-slate-400)' }}>
                  <span>{CONVERSION_LABELS[record.conversion_type]}</span>
                  <span style={{ margin: '0 8px' }}>·</span>
                  <span>{record.completed_at}</span>
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};

export default HistoryList;
