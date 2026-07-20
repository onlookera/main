"""
智能 RAG 知识库 — Pydantic 请求/响应模型
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ============================================================
# 文档上传接口 — 请求/响应
# ============================================================

class UploadResponse(BaseModel):
    """文档上传成功的响应"""
    document_id: str = Field(..., description="文件的哈希或 UUID 作为唯一标识")
    chunks_count: int = Field(..., description="文本分块数量")

    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "chunks_count": 42
            }
        }


# ============================================================
# 问答接口 — 请求/响应
# ============================================================

class QueryRequest(BaseModel):
    """用户提问请求"""
    question: str = Field(..., min_length=1, description="用户问题字符串")
    top_k: int = Field(5, ge=1, le=20, description="返回的文档片段数量")

    class Config:
        json_schema_extra = {
            "example": {
                "question": "公司的请假流程是什么？",
                "top_k": 5
            }
        }


class SourceInfo(BaseModel):
    """检索到的文档片段信息"""
    content: str = Field(..., description="检索到的文本片段内容")
    source: str = Field(..., description="源文件名")
    score: float = Field(..., description="融合后的相关性分数（0-1）")


class QueryResponse(BaseModel):
    """问答响应"""
    answer: str = Field(..., description="LLM 生成的回答")
    sources: List[SourceInfo] = Field(..., description="检索到的文档片段列表")

    class Config:
        json_schema_extra = {
            "example": {
                "answer": "根据员工手册，请假流程为：先填写请假申请表，经主管审批后提交给HR。",
                "sources": [
                    {
                        "content": "请假申请需经主管审批...",
                        "source": "员工手册2024.pdf",
                        "score": 0.92
                    }
                ]
            }
        }


# ============================================================
# 索引管理接口 — 请求/响应
# ============================================================

class DocumentInfo(BaseModel):
    """已索引的文档信息"""
    document_id: str = Field(..., description="文档唯一标识")
    source: str = Field(..., description="源文件名")
    chunks_count: int = Field(..., description="该文档的分块数量")
    uploaded_at: str = Field(..., description="上传时间（ISO 格式）")


class DocumentListResponse(BaseModel):
    """文档列表响应"""
    documents: List[DocumentInfo] = Field(default_factory=list, description="已索引的文档列表")
    total: int = Field(0, description="文档总数")


class DeleteResponse(BaseModel):
    """文档删除响应"""
    document_id: str = Field(..., description="已删除的文档 ID")
    message: str = Field("文档已删除", description="删除结果描述")
