"""
文本预处理工具。
提供文本清洗、截断、格式化等辅助函数。
"""

import re
from typing import List


def clean_text(text: str) -> str:
    """
    清洗文本：去除多余空白、控制字符、特殊符号。

    参数:
        text: 原始文本

    返回:
        清洗后的文本
    """
    # 去除零宽字符和控制字符（保留常见空白符）
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # 合并多个空白行为单个空格
    text = re.sub(r'[ \t]+', ' ', text)
    # 合并多个换行为两个换行
    text = re.sub(r'\n{3,}', '\n\n', text)
    # 去除首尾空白
    text = text.strip()
    return text


def truncate_text(text: str, max_length: int = 1000) -> str:
    """
    截断文本到指定长度，在词边界处截断。

    参数:
        text: 原始文本
        max_length: 最大字符数

    返回:
        截断后的文本（超出时末尾加 "..."）
    """
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."


def tokenize_chinese(text: str) -> List[str]:
    """
    中英文混合分词。
    英文按空格+标点分词，中文字符逐个分离。

    参数:
        text: 待分词文本

    返回:
        分词后的 token 列表
    """
    # 匹配中文字符、英文单词、数字
    tokens = re.findall(r'[一-鿿]|[a-zA-Z0-9]+', text.lower())
    return tokens
