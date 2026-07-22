"""
DocMaster — Pydantic 数据模型
定义所有 API 请求/响应的数据结构
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime


# ==================== 转换类型枚举 ====================

# 支持的转换类型（字面量联合类型）
ConversionType = Literal[
    'pdf_to_word',
    'pdf_to_ppt',
    'word_to_pdf',
    'ppt_to_pdf',
    'ppt_to_word',
    'pdf_merge',
    'pdf_split',
    'ppt_compress',
]

# 任务状态
TaskStatus = Literal['uploading', 'pending', 'processing', 'completed', 'failed']


# ==================== 请求模型 ====================

class ConvertRequest(BaseModel):
    """发起格式转换的请求体"""
    task_id: str = Field(..., min_length=1, description="上传后返回的任务ID（主文件）")
    conversion_type: ConversionType = Field(..., description="转换类型，如 pdf_to_word")
    extra_task_ids: Optional[List[str]] = Field(
        None, description="额外任务ID列表（PDF合并时需要多个文件）"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "task_id": "abc123-def456",
                "conversion_type": "pdf_merge",
                "extra_task_ids": ["xyz789-ghi012", "mno345-pqr678"]
            }
        }


# ==================== 响应模型 ====================

class UploadResponse(BaseModel):
    """文件上传成功的响应"""
    task_id: str = Field(..., description="唯一任务ID，用于后续操作")
    filename: str = Field(..., description="原始文件名")
    size: int = Field(..., description="文件大小（字节）")

    class Config:
        json_schema_extra = {
            "example": {
                "task_id": "abc123-def456",
                "filename": "报告.pdf",
                "size": 2048576
            }
        }


class ConvertResponse(BaseModel):
    """发起转换的响应"""
    task_id: str
    status: str


class TaskStatusResponse(BaseModel):
    """任务状态查询的响应"""
    task_id: str
    status: TaskStatus
    progress: int = Field(..., ge=0, le=100, description="进度百分比 0-100")
    filename: str = Field(..., description="原始文件名")
    conversion_type: Optional[ConversionType] = None
    output_filename: Optional[str] = Field(None, description="输出文件名（完成后可用）")
    error_message: Optional[str] = Field(None, description="错误信息（失败时可用）")
    created_at: str = Field(..., description="任务创建时间（ISO格式）")


class ErrorResponse(BaseModel):
    """通用错误响应"""
    detail: str = Field(..., description="错误详情描述")

    class Config:
        json_schema_extra = {
            "example": {"detail": "不支持的文件格式，请上传 PDF/Word/PPT 文件"}
        }
