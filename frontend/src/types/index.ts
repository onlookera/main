/**
 * DocMaster — 全局类型定义
 * 定义前端所有数据结构，确保类型安全
 */

/** 支持的文档格式枚举 */
export type FileFormat = 'pdf' | 'docx' | 'pptx';

/** 转换方向映射 */
export type ConversionType =
  | 'pdf_to_word'
  | 'pdf_to_ppt'
  | 'word_to_pdf'
  | 'ppt_to_pdf'
  | 'ppt_to_word'
  | 'pdf_merge'
  | 'pdf_split';

/** 转换任务状态 */
export type TaskStatus = 'uploading' | 'pending' | 'processing' | 'completed' | 'failed';

/** 上传接口返回 */
export interface UploadResponse {
  task_id: string;
  filename: string;
  size: number;
}

/** 转换请求参数 */
export interface ConvertRequest {
  task_id: string;
  conversion_type: ConversionType;
}

/** 任务状态查询返回 */
export interface TaskStatusResponse {
  task_id: string;
  status: TaskStatus;
  progress: number;        // 0-100
  filename: string;
  conversion_type: ConversionType;
  output_filename?: string;
  error_message?: string;
  created_at: string;
}

/** 历史记录条目（前端本地存储） */
export interface HistoryRecord {
  id: string;
  task_id: string;
  filename: string;
  conversion_type: ConversionType;
  status: TaskStatus;
  completed_at: string;
}

/** 转换选项配置 */
export interface ConversionOption {
  value: ConversionType;
  label: string;
  sourceFormat: FileFormat;
  targetFormat: FileFormat;
  icon: string;          // emoji 图标
  description: string;
}

/** 文件信息 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
}
