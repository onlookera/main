/**
 * DocMaster — 转换操作面板
 * 格式选择器 + 转换按钮 + PDF 合并/拆分快捷入口
 */

import React, { useState, useMemo } from 'react';
import { Button, Select, Space, Tag, Tooltip, Typography } from 'antd';
import {
  SwapOutlined,
  ThunderboltOutlined,
  MergeCellsOutlined,
  ScissorOutlined,
} from '@ant-design/icons';
import type { ConversionType, ConversionOption, FileFormat, FileInfo } from '../../types';

const { Text } = Typography;

interface ConversionPanelProps {
  fileInfo: FileInfo | null;
  onStartConversion: (type: ConversionType) => void;
  onMergeSplit: (type: 'pdf_merge' | 'pdf_split') => void;
  disabled?: boolean;
  converting?: boolean;
}

/**
 * 所有可用的转换选项配置
 * 根据源文件格式动态过滤可用选项
 */
const CONVERSION_OPTIONS: ConversionOption[] = [
  {
    value: 'pdf_to_word',
    label: 'PDF → Word',
    sourceFormat: 'pdf',
    targetFormat: 'docx',
    icon: '📄',
    description: '将 PDF 文档转换为可编辑的 Word 文件，保留原始排版',
  },
  {
    value: 'pdf_to_ppt',
    label: 'PDF → PPT',
    sourceFormat: 'pdf',
    targetFormat: 'pptx',
    icon: '📊',
    description: '将 PDF 每一页转换为 PPT 幻灯片',
  },
  {
    value: 'word_to_pdf',
    label: 'Word → PDF',
    sourceFormat: 'docx',
    targetFormat: 'pdf',
    icon: '📝',
    description: '将 Word 文档转换为 PDF 格式',
  },
  {
    value: 'ppt_to_pdf',
    label: 'PPT → PDF',
    sourceFormat: 'pptx',
    targetFormat: 'pdf',
    icon: '🖥️',
    description: '将 PPT 演示文稿转换为 PDF 格式',
  },
  {
    value: 'ppt_to_word',
    label: 'PPT → Word',
    sourceFormat: 'pptx',
    targetFormat: 'docx',
    icon: '📋',
    description: '提取 PPT 文本内容生成 Word 文档',
  },
];

const ConversionPanel: React.FC<ConversionPanelProps> = ({
  fileInfo,
  onStartConversion,
  onMergeSplit,
  disabled,
  converting,
}) => {
  const [selectedType, setSelectedType] = useState<ConversionType | null>(null);

  /** 根据上传文件的扩展名推断格式 */
  const sourceFormat: FileFormat | null = useMemo(() => {
    if (!fileInfo) return null;
    const ext = fileInfo.type;
    if (ext === 'pdf') return 'pdf';
    if (ext === 'doc' || ext === 'docx') return 'docx';
    if (ext === 'ppt' || ext === 'pptx') return 'pptx';
    return null;
  }, [fileInfo]);

  /** 根据源文件格式过滤可用的转换选项 */
  const availableOptions = useMemo(() => {
    if (!sourceFormat) return CONVERSION_OPTIONS;
    return CONVERSION_OPTIONS.filter((opt) => opt.sourceFormat === sourceFormat);
  }, [sourceFormat]);

  /** 是否是 PDF 文件（可触发合并/拆分） */
  const isPdf = sourceFormat === 'pdf';

  return (
    <div
      style={{
        background: 'var(--color-white)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        border: '1px solid var(--color-slate-200)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 标题行 */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <SwapOutlined style={{ color: 'var(--color-indigo-600)', fontSize: 16 }} />
        <Text strong style={{ fontSize: 15 }}>
          选择转换类型
        </Text>
        {sourceFormat && (
          <Tag color="blue" style={{ marginLeft: 'auto' }}>
            源格式：{sourceFormat.toUpperCase()}
          </Tag>
        )}
      </div>

      {!fileInfo ? (
        /* 未上传文件 — 展示全部选项但不可选 */
        <Text type="secondary" style={{ fontSize: 13 }}>
          请先上传文件，系统将自动识别可用转换类型
        </Text>
      ) : (
        <>
          {/* 转换类型下拉选择 */}
          <Select
            placeholder="请选择转换目标格式..."
            style={{ width: '100%' }}
            size="large"
            value={selectedType}
            onChange={setSelectedType}
            options={availableOptions.map((opt) => ({
              value: opt.value,
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-slate-400)' }}>
                      {opt.description}
                    </div>
                  </div>
                </div>
              ),
            }))}
            optionRender={(option) => option.label}
            labelRender={(props) => {
              const opt = availableOptions.find((o) => o.value === props.value);
              return opt ? (
                <span>
                  {opt.icon} {opt.label}
                </span>
              ) : (
                <span>{props.label}</span>
              );
            }}
          />

          {/* 操作按钮区 */}
          <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* 主转换按钮 */}
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              disabled={!selectedType || disabled || converting}
              loading={converting}
              onClick={() => selectedType && onStartConversion(selectedType)}
              style={{
                background: selectedType
                  ? 'linear-gradient(135deg, #4F46E5, #6366F1)'
                  : undefined,
                border: 'none',
                fontWeight: 600,
                minWidth: 140,
              }}
            >
              {converting ? '转换中...' : '开始转换'}
            </Button>

            {/* PDF 合并/拆分 — 仅 PDF 文件时显示 */}
            {isPdf && (
              <Space>
                <Tooltip title="将多个 PDF 合并为一个文件">
                  <Button
                    size="large"
                    icon={<MergeCellsOutlined />}
                    disabled={disabled || converting}
                    onClick={() => onMergeSplit('pdf_merge')}
                  >
                    合并 PDF
                  </Button>
                </Tooltip>
                <Tooltip title="将 PDF 拆分为多个单独页面">
                  <Button
                    size="large"
                    icon={<ScissorOutlined />}
                    disabled={disabled || converting}
                    onClick={() => onMergeSplit('pdf_split')}
                  >
                    拆分 PDF
                  </Button>
                </Tooltip>
              </Space>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ConversionPanel;
