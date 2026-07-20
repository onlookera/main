"""
LLM 问答生成服务。
根据检索到的文档片段和用户问题，调用 DeepSeek Chat API 生成自然语言答案。
"""

from typing import List, Dict, Any
from ..config import DEEPSEEK_API_KEY, DEEPSEEK_API_BASE, LLM_MODEL


# 系统提示词（写死，不可修改）
SYSTEM_PROMPT = (
    "你是一个严谨的文档助手。请仅根据以下检索到的文档片段回答问题。"
    "如果检索内容中没有答案，请直接说'文档中未提及'，不要编造任何信息。"
)


def generate_answer(
    question: str,
    sources: List[Dict[str, Any]],
) -> str:
    """
    根据检索到的文档片段和用户问题生成答案。

    参数:
        question: 用户问题
        sources: 检索到的文档片段列表（来自 retriever.hybrid_search）
                 每项需包含 content 和 metadata.source

    返回:
        LLM 生成的回答字符串
    """
    if not sources:
        return "文档中未提及"

    # 构建上下文（将检索到的文档片段拼接为提示词的一部分）
    context_parts = []
    for i, src in enumerate(sources):
        filename = src.get("metadata", {}).get("source", "未知文档")
        content = src.get("content", "")
        context_parts.append(f"[文档片段 {i+1} - 来源: {filename}]\n{content}")

    context = "\n\n---\n\n".join(context_parts)

    # 构建完整提示词
    user_message = f"""请根据以下文档片段回答用户的问题。

【检索到的文档片段】
{context}

【用户问题】
{question}

请用中文回答，引用文档中的具体信息。如果文档中没有相关答案，请直接说"文档中未提及"。"""

    # 调用 DeepSeek Chat API
    return _call_deepseek_chat(user_message)


def _call_deepseek_chat(user_message: str) -> str:
    """调用 DeepSeek Chat API 完成问答"""
    import requests

    if not DEEPSEEK_API_KEY:
        raise RuntimeError("DEEPSEEK_API_KEY 未配置，请在 .env 文件中设置")

    url = f"{DEEPSEEK_API_BASE.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.1,  # 低温度保证严谨性，减少幻觉
        "max_tokens": 1024,
    }

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        answer = data["choices"][0]["message"]["content"]
        return answer

    except requests.exceptions.Timeout:
        raise RuntimeError("LLM API 请求超时，请稍后重试")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"LLM API 请求失败: {e}")
    except (KeyError, IndexError):
        raise RuntimeError(f"LLM API 返回数据格式异常")
