"""
智能 RAG 知识库 — API Key 鉴权
使用 FastAPI 的 Depends 依赖注入机制，从请求头 x-api-key 提取密钥并校验。
"""

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from .config import API_KEY

# 定义 API Key 的请求头名称
api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)):
    """
    校验 API Key 是否与配置中的密钥一致。

    用法：
        @router.post("/documents/upload")
        async def upload(api_key: str = Depends(verify_api_key)):
            ...

    参数:
        api_key: 从请求头 x-api-key 中自动提取的值

    返回:
        校验成功后返回 api_key 字符串

    异常:
        HTTP 403: 密钥缺失或不匹配
    """
    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="缺少 API Key，请在请求头中添加 x-api-key",
        )

    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API Key 无效，拒绝访问",
        )

    return api_key
