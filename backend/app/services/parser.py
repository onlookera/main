"""
解析 PDF 和 Word 文档，提取纯文本内容。
依赖：PyMuPDF（PDF）、python-docx（Word）
"""

import os
from pathlib import Path


def parse_document(file_path: str) -> str:
    """
    自动识别文件类型并提取纯文本。

    参数:
        file_path: 上传文件的本地路径

    返回:
        提取的纯文本字符串

    异常:
        ValueError: 不支持的格式或解析失败
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"文件不存在: {file_path}")

    ext = Path(file_path).suffix.lower()

    if ext == ".pdf":
        return _parse_pdf(file_path)
    elif ext in (".doc", ".docx"):
        return _parse_docx(file_path)
    else:
        raise ValueError(f"不支持的文档格式: {ext}，仅接受 PDF 和 Word 文件")


def _parse_pdf(file_path: str) -> str:
    """使用 PyMuPDF 提取 PDF 文本"""
    import fitz

    text_parts = []
    try:
        doc = fitz.open(file_path)
        for page_num, page in enumerate(doc):
            page_text = page.get_text()
            if page_text.strip():
                text_parts.append(page_text)
        doc.close()
    except fitz.fitz.FileDataError:
        raise ValueError("PDF 文件损坏或格式异常，无法解析")
    except Exception as e:
        raise ValueError(f"PDF 解析失败: {e}")

    result = "\n\n".join(text_parts)
    if not result.strip():
        raise ValueError("PDF 文件不包含可提取的文字（可能为纯图片扫描件），请使用 OCR 处理")

    return result


def _parse_docx(file_path: str) -> str:
    """使用 python-docx 提取 Word 文档文本"""
    from docx import Document

    try:
        doc = Document(file_path)
        text_parts = []
        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)
        return "\n".join(text_parts)
    except Exception as e:
        raise ValueError(f"Word 文档解析失败: {e}")
