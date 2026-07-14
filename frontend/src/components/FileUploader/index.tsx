/**
 * DocMaster — 文件上传组件
 * 支持拖拽上传（Drag & Drop）和点击选择文件
 * 动态元素：空闲呼吸边框 + 拖拽渐变光晕 + 文件卡片动效
 */

import React, { useState, useCallback } from 'react';
import { Upload, message, Typography } from 'antd';
import { InboxOutlined, FileOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { FileInfo } from '../../types';

const { Text } = Typography;
const { Dragger } = Upload;

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, disabled }) => {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  /** 格式化文件大小 */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /** 支持的格式扩展名 */
  const acceptedFormats = '.pdf,.doc,.docx,.ppt,.pptx';

  /** 根据扩展名返回文件图标颜色 */
  const getFileColor = (ext: string): string => {
    if (ext === 'pdf') return '#EF4444';
    if (ext === 'doc' || ext === 'docx') return '#3B82F6';
    if (ext === 'ppt' || ext === 'pptx') return '#F97316';
    return 'var(--color-indigo-600)';
  };

  /** 文件选择 / 拖拽处理 */
  const handleFile = useCallback(
    (file: File) => {
      const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        message.error(`不支持的格式 ".${ext}"，请上传 PDF / Word / PPT 文件`);
        return;
      }
      // 不限制文件大小
      setFileInfo({ name: file.name, size: file.size, type: ext });
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    accept: acceptedFormats,
    beforeUpload: (file) => {
      handleFile(file);
      return false;
    },
    onDrop: () => setIsDragOver(false),
    disabled,
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.currentTarget === e.target) setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
  }, []);

  return (
    <div
      style={{ position: 'relative' }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
    >
      {/* 外层渐变光晕 — 拖拽时扩大 */}
      <div
        style={{
          position: 'absolute',
          inset: isDragOver ? -6 : -2,
          borderRadius: isDragOver ? '22px' : '18px',
          background: isDragOver
            ? 'conic-gradient(from 0deg, #4F46E5, #818CF8, #6366F1, #A78BFA, #4F46E5)'
            : 'transparent',
          opacity: isDragOver ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 0,
          animation: isDragOver ? 'borderRotate 2s linear infinite' : 'none',
          filter: isDragOver ? 'blur(2px)' : 'blur(0px)',
        }}
      />

      {/* 拖拽时的粒子光点 */}
      {isDragOver && (
        <>
          <div style={{
            position: 'absolute', top: '-20px', left: '15%',
            width: 8, height: 8, borderRadius: '50%',
            background: '#818CF8', zIndex: 2,
            animation: 'floatParticle 1.5s ease-in-out infinite',
            opacity: 0.8,
          }} />
          <div style={{
            position: 'absolute', top: '-10px', right: '20%',
            width: 5, height: 5, borderRadius: '50%',
            background: '#A78BFA', zIndex: 2,
            animation: 'floatParticle 2s ease-in-out 0.3s infinite',
            opacity: 0.6,
          }} />
          <div style={{
            position: 'absolute', bottom: '-15px', left: '50%',
            width: 6, height: 6, borderRadius: '50%',
            background: '#6366F1', zIndex: 2,
            animation: 'floatParticle 1.8s ease-in-out 0.6s infinite',
            opacity: 0.7,
          }} />
        </>
      )}

      <Dragger
        {...uploadProps}
        className={!fileInfo && !disabled ? 'upload-breathe' : ''}
        style={{
          position: 'relative',
          zIndex: 1,
          background: isDragOver
            ? 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(129,140,248,0.06))'
            : disabled ? 'var(--color-slate-100)' : 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          border: isDragOver
            ? '2px solid var(--color-indigo-600)'
            : '2px dashed var(--color-slate-200)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          padding: '36px 24px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isDragOver ? '0 0 40px rgba(79,70,229,0.12)' : 'none',
          transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {fileInfo ? (
          /* 已选择文件 — 带入场动画的文件卡片 */
          <div style={{ textAlign: 'center' }} className="fade-in-up">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: `${getFileColor(fileInfo.type)}15`,
              marginBottom: 12,
              transition: 'transform 0.3s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1) rotate(-3deg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
            >
              <FileOutlined style={{ fontSize: 32, color: getFileColor(fileInfo.type) }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 16 }}>{fileInfo.name}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {formatFileSize(fileInfo.size)}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                点击或拖拽以替换文件
              </Text>
            </div>
          </div>
        ) : (
          /* 空状态 */
          <div style={{ textAlign: 'center' }}>
            <InboxOutlined
              style={{
                fontSize: 64,
                color: isDragOver
                  ? 'var(--color-indigo-600)'
                  : 'var(--color-slate-300)',
                transition: 'all 0.4s ease',
                marginBottom: 12,
                transform: isDragOver ? 'scale(1.15) translateY(-4px)' : 'scale(1)',
              }}
            />
            <div>
              <Text strong style={{ fontSize: 16, transition: 'color 0.3s ease' }}>
                {isDragOver ? '✨ 松开以添加文件' : '拖拽文件到此处，或点击上传'}
              </Text>
            </div>
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              支持 PDF / Word / PPT 格式，无文件大小限制
            </Text>
          </div>
        )}
      </Dragger>

      {/* 动画关键帧 */}
      <style>{`
        @keyframes borderRotate {
          0% { filter: blur(2px) hue-rotate(0deg); }
          100% { filter: blur(2px) hue-rotate(360deg); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-12px) scale(1.5); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default FileUploader;
