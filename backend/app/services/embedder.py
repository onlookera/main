"""
DeepSeek Embedding 封装。
将文本块转为 512 维向量，供 ChromaDB 向量检索使用。
"""

from typing import List
from ..config import DEEPSEEK_API_KEY, DEEPSEEK_API_BASE, EMBEDDING_MODEL


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """
    调用 DeepSeek Embedding API，将文本列表转为向量列表。

    参数:
        texts: 文本字符串列表（每个元素是一个文本块）

    返回:
        向量列表，每个向量为 512 维浮点数列表

    异常:
        RuntimeError: API 调用失败
    """
    import requests

    if not DEEPSEEK_API_KEY:
        raise RuntimeError("DEEPSEEK_API_KEY 未配置，请在 .env 文件中设置")

    url = f"{DEEPSEEK_API_BASE.rstrip('/')}/embeddings"
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": EMBEDDING_MODEL,
        "input": texts,
    }

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
        data = resp.json()

        # 按索引排序后提取 embedding 向量
        items = sorted(data["data"], key=lambda x: x["index"])
        vectors = [item["embedding"] for item in items]
        return vectors

    except requests.exceptions.Timeout:
        raise RuntimeError("Embedding API 请求超时，请检查网络或 API Key")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Embedding API 请求失败: {e}")
    except KeyError:
        raise RuntimeError(f"Embedding API 返回数据格式异常: {data}")


def get_single_embedding(text: str) -> List[float]:
    """
    将单个文本转为向量（便捷方法）。

    参数:
        text: 单个文本字符串

    返回:
        512 维向量
    """
    vectors = get_embeddings([text])
    return vectors[0]
