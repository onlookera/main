"""
问答接口。
端点: POST /api/v1/query
"""

from fastapi import APIRouter, Depends, HTTPException
from ..auth import verify_api_key
from ..schemas.rag_schemas import QueryRequest, QueryResponse, SourceInfo
from ..services.retriever import hybrid_search
from ..services.generator import generate_answer

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def query(
    request: QueryRequest,
    api_key: str = Depends(verify_api_key),
):
    """
    基于知识库文档回答用户问题。

    鉴权: 请求头需携带 x-api-key。

    请求体: {"question": "...", "top_k": 5}
    响应: {"answer": "生成的回答", "sources": [...]}

    流程:
        1. retriever.hybrid_search() 混合检索（向量 + BM25）
        2. generator.generate_answer() 调用 LLM 生成回答
    """
    # 检索
    try:
        sources = hybrid_search(request.question, top_k=request.top_k)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=f"检索失败: {str(e)}")

    if not sources:
        return QueryResponse(
            answer="文档中未提及",
            sources=[],
        )

    # 生成
    try:
        answer = generate_answer(request.question, sources)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=f"LLM 生成失败: {str(e)}")

    # 格式化返回
    source_infos = [
        SourceInfo(
            content=s["content"][:300],  # 截取前300字展示
            source=s.get("metadata", {}).get("source", "未知文档"),
            score=round(s["score"], 4),
        )
        for s in sources
    ]

    return QueryResponse(answer=answer, sources=source_infos)
