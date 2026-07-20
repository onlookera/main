"""
ChromaDB 向量数据库操作。
负责向量的增（添加文档）、查（批量检索）、删（移除文档）。
Collection 名称固定为 "doc_master"，严禁修改。
"""

import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings as ChromaSettings
from ..config import CHROMA_PERSIST_DIR, COLLECTION_NAME


def _get_collection():
    """
    获取 ChromaDB collection 实例。
    每次调用都动态连接，确保多线程环境下的数据一致性。
    严禁修改 collection 名称和持久化目录。
    """
    os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)

    client = chromadb.PersistentClient(
        path=CHROMA_PERSIST_DIR,
        settings=ChromaSettings(anonymized_telemetry=False),
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},  # 余弦相似度
    )
    return collection


def add_document_chunks(
    document_id: str,
    filename: str,
    chunks: List[str],
    embeddings: List[List[float]],
) -> int:
    """
    将文档的所有文本块及其向量存入 ChromaDB。

    参数:
        document_id: 文档唯一标识
        filename: 原始文件名
        chunks: 文本块字符串列表
        embeddings: 对应的向量列表（与 chunks 一一对应）

    返回:
        成功存储的分块数量
    """
    collection = _get_collection()
    now = datetime.now(timezone.utc).isoformat()

    ids = [f"{document_id}_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "source": filename,
            "uploaded_at": now,
            "chunk_index": i,
            "document_id": document_id,
        }
        for i in range(len(chunks))
    ]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
    )

    return len(chunks)


def search_similar(
    query_embedding: List[float],
    top_k: int = 10,
) -> List[Dict[str, Any]]:
    """
    余弦相似度检索 — 返回最相似的文本块。

    参数:
        query_embedding: 查询问题的向量
        top_k: 返回的最相似文本块数量

    返回:
        结果列表，每项包含: id, content, metadata, score
    """
    collection = _get_collection()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    formatted = []
    if results["ids"] and results["ids"][0]:
        for i, doc_id in enumerate(results["ids"][0]):
            # ChromaDB 返回的是 distance（余弦距离），转换为 similarity score
            distance = results["distances"][0][i]
            score = 1.0 - distance  # 余弦相似度 = 1 - 距离
            formatted.append({
                "id": doc_id,
                "content": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "score": max(0.0, min(1.0, score)),  # 钳制到 [0, 1]
            })

    return formatted


def get_all_documents() -> List[Dict[str, Any]]:
    """
    获取所有已索引文档的摘要信息（去重统计）。

    返回:
        文档列表，每项包含: document_id, source, chunks_count, uploaded_at
    """
    collection = _get_collection()

    if collection.count() == 0:
        return []

    results = collection.get(include=["metadatas"])
    metadatas = results["metadatas"]

    # 按 document_id 聚合
    doc_map: Dict[str, Dict[str, Any]] = {}
    for meta in metadatas:
        doc_id = meta.get("document_id", "unknown")
        if doc_id not in doc_map:
            doc_map[doc_id] = {
                "document_id": doc_id,
                "source": meta.get("source", "未知文件"),
                "uploaded_at": meta.get("uploaded_at", ""),
                "chunks_count": 0,
            }
        doc_map[doc_id]["chunks_count"] += 1

    return list(doc_map.values())


def delete_document(document_id: str) -> bool:
    """
    删除指定文档的所有向量块和元数据。

    参数:
        document_id: 要删除的文档 ID

    返回:
        True 表示成功删除，False 表示文档不存在
    """
    collection = _get_collection()

    # 查找该文档的所有块 ID
    results = collection.get(
        where={"document_id": document_id},
        include=[],
    )

    if not results["ids"]:
        return False

    collection.delete(ids=results["ids"])
    return True
