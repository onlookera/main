"""
DocMaster — 异步任务管理器
使用内存字典追踪所有转换任务的状态和进度
生产环境可替换为 Redis + Celery
"""

import uuid
import threading
from datetime import datetime, timezone
from typing import Dict, Optional
from ..models.schemas import TaskStatus, ConversionType


class TaskInfo:
    """单个任务的完整信息"""
    def __init__(self, task_id: str, filename: str, original_path: str):
        self.task_id = task_id
        self.filename = filename
        self.original_path = original_path   # 原始文件路径
        self.output_path: Optional[str] = None
        self.output_filename: Optional[str] = None
        self.status: TaskStatus = 'uploading'
        self.progress: int = 0
        self.conversion_type: Optional[ConversionType] = None
        self.error_message: Optional[str] = None
        self.created_at = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> dict:
        """转为字典，用于 API 响应"""
        return {
            'task_id': self.task_id,
            'status': self.status,
            'progress': self.progress,
            'filename': self.filename,
            'conversion_type': self.conversion_type,
            'output_filename': self.output_filename,
            'error_message': self.error_message,
            'created_at': self.created_at,
        }


class TaskManager:
    """
    任务管理器（单例模式）
    使用内存字典存储任务状态，适合原型和低负载场景
    """

    def __init__(self):
        self._tasks: Dict[str, TaskInfo] = {}
        self._lock = threading.Lock()

    def create_task(self, filename: str, original_path: str) -> TaskInfo:
        """创建新任务，返回唯一的 task_id"""
        task_id = str(uuid.uuid4())
        task = TaskInfo(task_id, filename, original_path)
        with self._lock:
            self._tasks[task_id] = task
        return task

    def get_task(self, task_id: str) -> Optional[TaskInfo]:
        """根据 task_id 获取任务信息"""
        return self._tasks.get(task_id)

    def update_task(
        self,
        task_id: str,
        status: Optional[TaskStatus] = None,
        progress: Optional[int] = None,
        conversion_type: Optional[ConversionType] = None,
        output_path: Optional[str] = None,
        output_filename: Optional[str] = None,
        error_message: Optional[str] = None,
    ):
        """更新任务状态（线程安全）"""
        with self._lock:
            task = self._tasks.get(task_id)
            if task is None:
                return
            if status is not None:
                task.status = status
            if progress is not None:
                task.progress = progress
            if conversion_type is not None:
                task.conversion_type = conversion_type
            if output_path is not None:
                task.output_path = output_path
            if output_filename is not None:
                task.output_filename = output_filename
            if error_message is not None:
                task.error_message = error_message

    def delete_task(self, task_id: str) -> bool:
        """删除任务记录，返回是否成功"""
        with self._lock:
            if task_id in self._tasks:
                del self._tasks[task_id]
                return True
            return False

    def get_all_tasks(self) -> list:
        """获取所有任务列表"""
        with self._lock:
            return [t.to_dict() for t in self._tasks.values()]


# 全局单例 — 整个应用共享同一个 TaskManager 实例
task_manager = TaskManager()
