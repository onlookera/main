"""
索引管理接口。
列出已索引文档、删除指定文档。
端点:
    GET  /api/v1/documents          — 列出所有文档
    DELETE /api/v1/documents/{id}   — 删除指定文档
"""

from fastapi import APIRouter, Depends, HTTPException
from ..auth import verify_api_key
from ..schemas.rag_schemas import DocumentListResponse, DocumentInfo, DeleteResponse
from ..services.vector_store import get_all_documents, delete_document

router = APIRouter()


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(api_key: str = Depends(verify_api_key)):
    """
    列出所有已索引的文档及其分块数量。

    鉴权: 请求头需携带 x-api-key。

    返回:
        {"documents": [...], "total": 5}
    """
    docs = get_all_documents()
    doc_infos = [
        DocumentInfo(
            document_id=d["document_id"],
            source=d["source"],
            chunks_count=d["chunks_count"],
            uploaded_at=d.get("uploaded_at", ""),
        )
        for d in docs
    ]
    return DocumentListResponse(documents=doc_infos, total=len(doc_infos))


@router.delete("/documents/{document_id}", response_model=DeleteResponse)
async def remove_document(
    document_id: str,
    api_key: str = Depends(verify_api_key),
):
    """
    删除指定文档的所有向量块和元数据。

    鉴权: 请求头需携带 x-api-key。

    返回:
        {"document_id": "abc123", "message": "文档已删除"}
    """
    success = delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"文档 {document_id} 不存在")
    return DeleteResponse(document_id=document_id, message="文档已删除")
