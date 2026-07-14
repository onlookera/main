"""
DocMaster — PDF 合并/拆分 服务
纯 Python 方案，基于 pypdf 库
"""

import os
from pathlib import Path
from typing import List
from pypdf import PdfReader, PdfWriter


def merge_pdfs(
    input_paths: List[str],
    output_path: str,
    progress_callback=None,
) -> str:
    """
    合并多个 PDF 文件为一个

    参数:
        input_paths: 多个源 PDF 文件路径列表
        output_path: 合并输出路径
        progress_callback: 进度回调 callback(percent: int)

    返回:
        输出文件路径
    """
    if len(input_paths) < 2:
        raise ValueError('至少需要 2 个 PDF 文件才能合并')

    # 验证所有文件存在
    for path in input_paths:
        if not os.path.exists(path):
            raise FileNotFoundError(f'输入文件不存在: {path}')

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    writer = PdfWriter()
    total_pages = 0

    # 第一步：计算总页数（用于进度估算）
    readers = []
    for path in input_paths:
        reader = PdfReader(path)
        readers.append(reader)
        total_pages += len(reader.pages)

    # 第二步：逐页添加
    current_page = 0
    for reader in readers:
        for page in reader.pages:
            writer.add_page(page)
            current_page += 1
            if progress_callback:
                progress_callback(int(current_page / total_pages * 100))

    # 写入输出文件
    with open(output_path, 'wb') as f:
        writer.write(f)

    return output_path


def split_pdf(
    input_path: str,
    output_dir: str,
    pages_per_split: int = 1,
    progress_callback=None,
) -> List[str]:
    """
    拆分 PDF 文件为多个独立的 PDF

    参数:
        input_path: 源 PDF 文件路径
        output_dir: 拆分文件输出目录
        pages_per_split: 每个拆分文件包含的页数（默认 1 = 每页一个文件）
        progress_callback: 进度回调 callback(percent: int)

    返回:
        拆分后的文件路径列表
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f'输入文件不存在: {input_path}')

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    reader = PdfReader(input_path)
    total_pages = len(reader.pages)

    if total_pages <= 1:
        raise RuntimeError('PDF 只有 1 页，无需拆分')

    output_files = []
    base_name = Path(input_path).stem

    # 按页数分组
    for start_page in range(0, total_pages, pages_per_split):
        writer = PdfWriter()
        end_page = min(start_page + pages_per_split, total_pages)

        for page_num in range(start_page, end_page):
            writer.add_page(reader.pages[page_num])

        # 生成输出文件名
        if pages_per_split == 1:
            filename = f'{base_name}_第{start_page + 1}页.pdf'
        else:
            filename = f'{base_name}_第{start_page + 1}-{end_page}页.pdf'

        output_path = os.path.join(output_dir, filename)
        with open(output_path, 'wb') as f:
            writer.write(f)

        output_files.append(output_path)

        if progress_callback:
            progress_callback(int((start_page + pages_per_split) / total_pages * 100))

    return output_files


def split_pdf_all_pages(
    input_path: str,
    output_dir: str,
    progress_callback=None,
) -> List[str]:
    """
    将 PDF 的每一页拆分为单独的文件
    这是 split_pdf 的便捷包装
    """
    return split_pdf(input_path, output_dir, pages_per_split=1,
                     progress_callback=progress_callback)
