"""
混合检索（向量 + 关键词 BM25）。
将向量语义检索和 BM25 关键词检索的结果融合排序，
权重配置: 向量 0.7 + 关键词 0.3。
"""

from typing import List, Dict, Any
from ..config import VECTOR_WEIGHT, KEYWORD_WEIGHT
from .embedder import get_single_embedding
from .vector_store import search_similar, get_all_documents, _get_collection


def hybrid_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    混合检索主函数。

    流程：
        1. 向量检索 → top_k * 2 个候选，计算余弦相似度分数
        2. 关键词检索 → BM25 分词匹配，计算 BM25 分数
        3. 分数融合 → min-max 归一化后加权求和
        4. 取最终得分最高的 top_k 个结果

    参数:
        query: 用户问题字符串
        top_k: 最终返回的文档片段数量

    返回:
        排序后的检索结果列表
    """
    # ===== 第一步：向量检索（semantic） =====
    query_emb = get_single_embedding(query)
    vector_results = search_similar(query_emb, top_k=top_k * 2)

    # ===== 第二步：关键词检索（BM25） =====
    bm25_results = _bm25_search(query, top_k * 2)

    # ===== 第三步：分数融合 =====
    merged = _merge_scores(vector_results, bm25_results)

    # 按最终分数降序排序，取 top_k
    merged.sort(key=lambda x: x["score"], reverse=True)
    return merged[:top_k]


def _bm25_search(query: str, top_k: int) -> List[Dict[str, Any]]:
    """
    使用 BM25 算法进行关键词检索。
    对 ChromaDB 中所有已索引的文本块建立 BM25 索引，计算匹配分数。
    """
    from rank_bm25 import BM25Okapi

    # 获取所有已索引的文本块
    collection = _get_collection()
    if collection.count() == 0:
        return []

    all_data = collection.get(include=["documents", "metadatas"])
    all_docs = all_data["documents"] or []
    all_ids = all_data["ids"] or []
    all_metas = all_data["metadatas"] or []

    if not all_docs:
        return []

    # 分词（按空格和中文标点简单分词）
    def tokenize(text: str) -> List[str]:
        import re
        # 中英文混合分词：英文按空格+标点，中文按字符
        tokens = re.findall(r'[一-鿿]|[a-zA-Z0-9]+', text.lower())
        return tokens

    tokenized_docs = [tokenize(doc) for doc in all_docs]
    bm25 = BM25Okapi(tokenized_docs)

    tokenized_query = tokenize(query)
    scores = bm25.get_scores(tokenized_query)

    # 构建结果
    results = []
    for i, score in enumerate(scores):
        results.append({
            "id": all_ids[i],
            "content": all_docs[i],
            "metadata": all_metas[i] if i < len(all_metas) else {},
            "bm25_score": float(score),
        })

    # 按 BM25 分数排序，取 top_k
    results.sort(key=lambda x: x["bm25_score"], reverse=True)
    return results[:top_k]


def _merge_scores(
    vector_results: List[Dict[str, Any]],
    bm25_results: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    分数融合：min-max 归一化后加权求和。
    最终分数 = 0.7 * 归一化向量分数 + 0.3 * 归一化 BM25 分数
    """

    def min_max_norm(scores: List[float]) -> List[float]:
        """min-max 归一化到 [0, 1] 区间"""
        if not scores:
            return scores
        mn = min(scores)
        mx = max(scores)
        if mx == mn:
            return [0.5] * len(scores)  # 全同分时给中性值
        return [(s - mn) / (mx - mn) for s in scores]

    # 提取各来源分数
    v_scores = [r.get("score", 0) for r in vector_results]
    b_scores = [r.get("bm25_score", 0) for r in bm25_results]

    v_norm = min_max_norm(v_scores)
    b_norm = min_max_norm(b_scores)

    # 构建按 id 索引的分数映射
    merged_map: Dict[str, Dict[str, Any]] = {}

    for i, r in enumerate(vector_results):
        merged_map[r["id"]] = {
            "id": r["id"],
            "content": r["content"],
            "metadata": r.get("metadata", {}),
            "score": VECTOR_WEIGHT * v_norm[i] + KEYWORD_WEIGHT * 0,
        }

    for i, r in enumerate(bm25_results):
        if r["id"] in merged_map:
            merged_map[r["id"]]["score"] += KEYWORD_WEIGHT * b_norm[i]
        else:
            merged_map[r["id"]] = {
                "id": r["id"],
                "content": r["content"],
                "metadata": r.get("metadata", {}),
                "score": KEYWORD_WEIGHT * b_norm[i],
            }

    return list(merged_map.values())
