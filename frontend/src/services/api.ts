/**
 * DocMaster — API 服务层
 * 封装所有后端 API 调用，使用 Axios 实例统一管理
 */

import axios, { AxiosProgressEvent } from 'axios';
import type {
  UploadResponse,
  ConvertRequest,
  TaskStatusResponse,
} from '../types';

// 创建 Axios 实例，配置基础 URL 和超时时间
// 生产环境：从 import.meta.env.VITE_API_BASE 读取（Cloudflare Pages 环境变量）
// 回退到 /api（同源代理）
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 600000, // 10 分钟
});

// ==================== 文件上传 ====================

/**
 * 上传文件到服务器
 * @param file — 要上传的文件对象
 * @param onProgress — 上传进度回调 (0-100)
 * @returns 包含 task_id 的响应
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (onProgress && event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    },
  });

  return data;
}

// ==================== 启动转换 ====================

/**
 * 发起格式转换任务
 * @param taskId — 上传后拿到的任务 ID
 * @param conversionType — 转换类型（如 pdf_to_word）
 */
export async function startConversion(
  taskId: string,
  conversionType: string
): Promise<{ task_id: string; status: string }> {
  const { data } = await apiClient.post<{ task_id: string; status: string }>(
    '/convert',
    { task_id: taskId, conversion_type: conversionType } as ConvertRequest
  );
  return data;
}

// ==================== 查询进度 ====================

/**
 * 轮询查询转换任务进度
 * @param taskId — 任务 ID
 * @returns 任务状态（包含进度百分比）
 */
export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const { data } = await apiClient.get<TaskStatusResponse>(`/status/${taskId}`);
  return data;
}

// ==================== 下载文件 ====================

/**
 * 下载转换完成的文件
 * @param taskId — 任务 ID
 * @returns Blob 数据，前端触发浏览器下载
 */
export async function downloadFile(taskId: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(`/download/${taskId}`, {
    responseType: 'blob',
  });
  return data;
}

/**
 * 获取文件下载链接
 */
export function getDownloadUrl(taskId: string): string {
  const base = import.meta.env.VITE_API_BASE || '/api';
  return `${base}/download/${taskId}`;
}

// ==================== 清理文件 ====================

/**
 * 删除服务端临时文件
 * @param taskId — 任务 ID
 */
export async function deleteFile(taskId: string): Promise<void> {
  await apiClient.delete(`/files/${taskId}`);
}

export default apiClient;
