"""
DocMaster — PDF 转 Word 服务
使用 pdf2docx 库，排版还原度高，支持表格和图片
"""

import os
from pathlib import Path
from pdf2docx import Converter


def convert_pdf_to_word(
    input_path: str,
    output_path: str,
    progress_callback=None,
) -> str:
    """
    将 PDF 文件转换为 Word (.docx) 文档

    参数:
        input_path: 源 PDF 文件路径
        output_path: 目标 .docx 文件路径
        progress_callback: 进度回调函数 callback(percent: int)

    返回:
        输出文件路径

    异常:
        FileNotFoundError: 输入文件不存在
        RuntimeError: 转换失败（如加密PDF）
    """
    # 校验输入文件
    if not os.path.exists(input_path):
        raise FileNotFoundError(f'输入文件不存在: {input_path}')

    # 确保输出目录存在
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    # 创建转换器实例
    cv = Converter(input_path)

    try:
        # 执行转换（pdf2docx 自动解析页面布局）
        # start=0 表示从第 0 页开始，end=None 表示到最后一页
        cv.convert(
            output_path,
            start=0,
            end=None,
            # 进度回调包装
            progress=lambda current, total: (
                progress_callback(int(current / total * 100))
                if progress_callback
                else None
            ),
        )
    finally:
        # 确保关闭转换器，释放资源
        cv.close()

    return output_path


def is_pdf_encrypted(input_path: str) -> bool:
    """
    检查 PDF 是否被密码保护
    """
    from pypdf import PdfReader
    try:
        reader = PdfReader(input_path)
        return reader.is_encrypted
    except Exception:
        # 如果连 pypdf 都读不了，文件可能损坏
        return False
