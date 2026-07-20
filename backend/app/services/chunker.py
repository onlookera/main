"""
文本分块逻辑。
使用 RecursiveCharacterTextSplitter 将长文本拆分为固定大小的块，
块与块之间有重叠，避免在句子边界截断上下文。
"""

from typing import List
from ..config import CHUNK_SIZE, CHUNK_OVERLAP, CHUNK_SEPARATORS


def chunk_text(text: str) -> List[str]:
    """
    将文本拆分为指定大小的块。

    参数:
        text: 待分块的原始文本

    返回:
        文本块字符串列表

    说明:
        - 使用递归字符分割器，按分隔符优先级依次尝试分割
        - chunk_size=512, chunk_overlap=128（来自 config.py）
        - 分隔符: ["\n\n", "\n", "。", "！", "？", "；", " ", ""]
        - 优先在段落边界和中文句子边界分割，保留上下文连续性
    """
    from langchain.text_splitter import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=CHUNK_SEPARATORS,
        length_function=len,
    )

    chunks = splitter.split_text(text)
    return chunks
