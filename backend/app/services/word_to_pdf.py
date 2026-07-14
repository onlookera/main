"""
DocMaster — Word 转 PDF 服务
Windows: COM (Microsoft Word) → LibreOffice 回退
"""

import os
import traceback
from pathlib import Path
from ..utils.libreoffice import convert_with_libreoffice


def convert_word_to_pdf(input_path: str, output_path: str, progress_callback=None) -> str:
    """将 Word (.docx) 文件转换为 PDF"""
    if not os.path.exists(input_path):
        raise FileNotFoundError(f'输入文件不存在: {input_path}')

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    last_error = None

    # 方案1: Windows COM (Microsoft Word)
    if os.name == 'nt':
        try:
            return _convert_with_com(input_path, output_path, progress_callback)
        except Exception as e:
            last_error = str(e)
            print(f'[Word→PDF] COM 转换失败: {last_error}')

    # 方案2: LibreOffice
    if convert_with_libreoffice(input_path, output_path, 'pdf'):
        if progress_callback:
            progress_callback(100)
        return output_path

    com_hint = f'COM 错误: {last_error}' if last_error else 'COM 未尝试'
    raise RuntimeError(
        f'Word 转 PDF 失败。{com_hint}\n\n'
        '需要以下任一软件支持：\n'
        '  1) Microsoft Word（推荐，已检测到 Office）\n'
        '  2) LibreOffice（免费: https://www.libreoffice.org/）'
    )


def _convert_with_com(input_path: str, output_path: str, progress_callback=None) -> str:
    """使用 Windows COM (Microsoft Word) 转换"""
    import pythoncom
    import win32com.client

    pythoncom.CoInitialize()

    word = None
    doc = None
    try:
        word = win32com.client.Dispatch('Word.Application')
        # 安全策略可能禁止 Visible=False，改用最小化
        try:
            word.Visible = False
        except Exception:
            word.WindowState = 0  # wdWindowStateNormal, minimal

        abs_input = os.path.abspath(input_path)
        abs_output = os.path.abspath(output_path)

        doc = word.Documents.Open(abs_input)
        doc.SaveAs(abs_output, FileFormat=17)  # 17 = wdFormatPDF
        doc.Close()
        doc = None

        if progress_callback:
            progress_callback(100)

        return output_path

    finally:
        if doc is not None:
            try:
                doc.Close()
            except Exception:
                pass
        if word is not None:
            try:
                word.Quit()
            except Exception:
                pass
        pythoncom.CoUninitialize()
