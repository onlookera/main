"""
文档上传接口。
端点: POST /api/v1/documents/upload
"""

import os
import uuid
import hashlib
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from ..auth import verify_api_key
from ..schemas.rag_schemas import UploadResponse
from ..services.parser import parse_document
from ..services.chunker import chunk_text
from ..services.embedder import get_embeddings
from ..services.vector_store import add_document_chunks
from ..config import TEMP_UPLOAD_DIR

router = APIRouter()


@router.post("/documents/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key),
):
    """
    上传 PDF 或 Word 文档 → 解析 → 分块 → 向量化 → 存入 ChromaDB。

    鉴权: 请求头需携带 x-api-key。

    流程:
        1. 校验文件格式（仅 PDF 和 Word）
        2. 保存到临时目录
        3. parser.py 提取纯文本
        4. chunker.py 分块
        5. embedder.py 向量化
        6. vector_store.py 存入 ChromaDB

    返回: {"document_id": "...", "chunks_count": 42}
    """
    # 校验格式
    filename = (file.filename or "unknown").lower()
    if not (filename.endswith(".pdf") or filename.endswith(".doc") or filename.endswith(".docx")):
        raise HTTPException(
            status_code=400,
            detail="仅支持 PDF 和 Word (.doc/.docx) 格式的文档",
        )

    # 生成唯一 document_id
    content = await file.read()
    doc_hash = hashlib.sha256(content).hexdigest()[:16]
    document_id = f"{doc_hash}"

    # 保存到临时目录
    os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "unknown")[1]
    temp_path = os.path.join(TEMP_UPLOAD_DIR, f"{document_id}{ext}")
    with open(temp_path, "wb") as f:
        f.write(content)

    # 解析 → 分块
    try:
        text = parse_document(temp_path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="文档没有可提取的文本内容")

    # 向量化 → 存储
    try:
        embeddings = get_embeddings(chunks)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=f"向量化失败: {str(e)}")

    add_document_chunks(document_id, file.filename or "unknown", chunks, embeddings)

    return UploadResponse(document_id=document_id, chunks_count=len(chunks))
