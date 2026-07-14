/**
 * DocMaster — 首页组件
 * 整个应用的核心页面，负责：
 * - 编排所有子组件
 * - 管理上传 / 转换 / 下载的状态流转
 * - 轮询转换进度
 * - 持久化历史记录到 localStorage
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { message, Typography } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import type {
  FileInfo,
  ConversionType,
  TaskStatus,
  HistoryRecord,
} from '../../types';
import { uploadFile, startConversion, getTaskStatus } from '../../services/api';
import FileUploader from '../../components/FileUploader';
import ConversionPanel from '../../components/ConversionPanel';
import ProgressBar from '../../components/ProgressBar';
import DownloadArea from '../../components/DownloadArea';

const { Title, Text } = Typography;

/** localStorage 键名 */
const HISTORY_STORAGE_KEY = 'docmaster_history';

interface HomeProps {
  onHistoryChange?: () => void;  // 通知 App 刷新历史记录
}

const Home: React.FC<HomeProps> = ({ onHistoryChange }) => {
  // ==================== 状态定义 ====================

  // 文件相关
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  // 任务相关
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('pending');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [outputFilename, setOutputFilename] = useState('');
  const [conversionType, setConversionType] = useState<ConversionType | null>(null);

  // UI 状态
  const [isConverting, setIsConverting] = useState(false);

  // 历史记录
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 轮询定时器引用
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ==================== 持久化历史记录 ====================

  /** 保存历史记录到 localStorage，并通知父组件刷新 */
  const saveHistory = useCallback((records: HistoryRecord[]) => {
    setHistory(records);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
    onHistoryChange?.();  // 通知 App 同步刷新抽屉中的历史列表
  }, [onHistoryChange]);

  /** 添加一条历史记录 */
  const addHistoryRecord = useCallback(
    (record: HistoryRecord) => {
      const updated = [...history, record];
      saveHistory(updated);
    },
    [history, saveHistory]
  );

  /** 清空历史记录 */
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // ==================== 轮询进度 ====================

  /** 开始轮询任务状态 */
  const startPolling = useCallback((tid: string, cType: ConversionType) => {
    // 清除之前的轮询
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const result = await getTaskStatus(tid);
        setProgress(result.progress);
        setTaskStatus(result.status);

        if (result.status === 'completed') {
          // 转换成功
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setIsConverting(false);
          setOutputFilename(result.output_filename || 'converted_file');

          // 添加到历史记录
          addHistoryRecord({
            id: `${tid}_${Date.now()}`,
            task_id: tid,
            filename: result.filename,
            conversion_type: cType,
            status: 'completed',
            completed_at: new Date().toLocaleString('zh-CN'),
          });

          message.success('转换完成！');
        } else if (result.status === 'failed') {
          // 转换失败
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setIsConverting(false);
          setStatusMessage(result.error_message || '未知错误');

          // 添加到历史记录
          addHistoryRecord({
            id: `${tid}_${Date.now()}`,
            task_id: tid,
            filename: result.filename,
            conversion_type: cType,
            status: 'failed',
            completed_at: new Date().toLocaleString('zh-CN'),
          });

          message.error(result.error_message || '转换失败，请重试');
        }
      } catch (err: any) {
        // 网络错误不马上停止，允许重试几次
        console.error('轮询失败:', err);
      }
    }, 1000); // 每秒轮询一次
  }, [addHistoryRecord]);

  // ==================== 清理 ====================

  /** 组件卸载时清除定时器 */
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // ==================== 事件处理 ====================

  /** 文件被选中后：上传到服务器 */
  const handleFileSelected = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setFileInfo({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.name.split('.').pop() || '',
      });

      // 重置状态
      setTaskId(null);
      setTaskStatus('pending');
      setProgress(0);
      setStatusMessage('');
      setOutputFilename('');
      setIsConverting(false);

      // 开始上传
      setTaskStatus('uploading');
      setStatusMessage('正在上传文件...');

      try {
        const uploadResult = await uploadFile(selectedFile, (pct) => {
          setProgress(pct);
        });

        setTaskId(uploadResult.task_id);
        setTaskStatus('pending');
        setStatusMessage('上传完成，请选择转换类型');
        setProgress(100);

        message.success(`文件 "${uploadResult.filename}" 上传成功`);
      } catch (err: any) {
        setTaskStatus('failed');
        const errorMsg =
          err?.response?.data?.detail || err?.message || '上传失败，请检查网络连接';
        setStatusMessage(errorMsg);
        message.error(errorMsg);
      }
    },
    []
  );

  /** 开始转换 */
  const handleStartConversion = useCallback(
    async (type: ConversionType) => {
      if (!taskId) {
        message.warning('请先上传文件');
        return;
      }

      setConversionType(type);
      setIsConverting(true);
      setTaskStatus('processing');
      setProgress(0);
      setStatusMessage('正在启动转换任务...');

      try {
        await startConversion(taskId, type);
        setStatusMessage('转换中，请耐心等待...');
        // 开始轮询进度
        startPolling(taskId, type);
      } catch (err: any) {
        setIsConverting(false);
        setTaskStatus('failed');
        const errorMsg =
          err?.response?.data?.detail || err?.message || '启动转换失败';
        setStatusMessage(errorMsg);
        message.error(errorMsg);
      }
    },
    [taskId, startPolling]
  );

  /** PDF 合并/拆分（预留，后端实现后启用） */
  const handleMergeSplit = useCallback(
    (type: 'pdf_merge' | 'pdf_split') => {
      if (type === 'pdf_split') {
        handleStartConversion('pdf_split');
      } else if (type === 'pdf_merge') {
        // 合并需要多个文件，提示用户
        message.info('PDF 合并功能需要上传多个文件，请依次选择');
        // 触发合并逻辑
        handleStartConversion('pdf_merge');
      }
    },
    [handleStartConversion]
  );

  /** 重置状态，开始新转换 */
  const handleReset = useCallback(() => {
    setFile(null);
    setFileInfo(null);
    setTaskId(null);
    setTaskStatus('pending');
    setProgress(0);
    setStatusMessage('');
    setOutputFilename('');
    setConversionType(null);
    setIsConverting(false);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  /** 清理服务端文件 */
  const handleDelete = useCallback(async () => {
    if (taskId) {
      try {
        const { deleteFile } = await import('../../services/api');
        await deleteFile(taskId);
        message.success('已清理服务端临时文件');
      } catch {
        // 静默失败，不影响用户体验
      }
    }
    handleReset();
  }, [taskId, handleReset]);

  // ==================== 渲染 ====================

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* 页面标题 — 渐变文字动画 */}
      <div style={{ textAlign: 'center', marginBottom: 36 }} className="fade-in-up">
        <Title
          level={2}
          className="gradient-title"
          style={{
            fontWeight: 800,
            marginBottom: 8,
            letterSpacing: '-1px',
            fontSize: 34,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          <ThunderboltOutlined
            style={{
              marginRight: 10,
              fontSize: 30,
              background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          />
          文档格式转换
        </Title>
        <Text type="secondary" style={{ fontSize: 15, letterSpacing: '0.3px' }}>
          支持 PDF、Word、PPT 之间相互转换 · 安全快速 · 完全免费
        </Text>
      </div>

      {/* 文件上传区域 */}
      <div style={{ marginBottom: 20 }} className="card-lift fade-in-up">
        <FileUploader
          onFileSelected={handleFileSelected}
          disabled={isConverting}
        />
      </div>

      {/* 转换面板 */}
      <div style={{ marginBottom: 20 }} className="card-lift fade-in-up">
        <ConversionPanel
          fileInfo={fileInfo}
          onStartConversion={handleStartConversion}
          onMergeSplit={handleMergeSplit}
          disabled={!taskId}
          converting={isConverting}
        />
      </div>

      {/* 进度条 — 仅在转换/上传进行中时显示 */}
      {(taskStatus === 'uploading' ||
        taskStatus === 'processing' ||
        (taskStatus === 'completed' && !outputFilename)) && (
        <div style={{ marginBottom: 20 }} className="fade-in-up">
          <ProgressBar
            status={taskStatus}
            progress={progress}
            message={statusMessage}
          />
        </div>
      )}

      {/* 进度条 — 失败状态 */}
      {taskStatus === 'failed' && (
        <div style={{ marginBottom: 20 }} className="fade-in-up">
          <ProgressBar
            status="failed"
            progress={progress}
            message={statusMessage}
          />
        </div>
      )}

      {/* 下载区域 — 转换完成后显示，带庆祝动效 */}
      {taskStatus === 'completed' && outputFilename && (
        <div style={{ marginBottom: 20 }} className="fade-in-up success-ring">
          <DownloadArea
            taskId={taskId!}
            outputFilename={outputFilename}
            onReset={handleReset}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
