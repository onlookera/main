"""
DocMaster — PPT 转 PDF 服务
Windows: COM (PowerPoint) → LibreOffice 回退
"""

import os
import traceback
from pathlib import Path
from ..utils.libreoffice import convert_with_libreoffice


def convert_ppt_to_pdf(input_path: str, output_path: str, progress_callback=None) -> str:
    """将 PPT (.pptx) 文件转换为 PDF"""
    if not os.path.exists(input_path):
        raise FileNotFoundError(f'输入文件不存在: {input_path}')

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    last_error = None

    # 方案1: Windows COM (PowerPoint 应用程序)
    if os.name == 'nt':
        try:
            return _convert_with_com(input_path, output_path, progress_callback)
        except Exception as e:
            last_error = str(e)
            print(f'[PPT→PDF] COM 转换失败: {last_error}')
            print(f'[PPT→PDF] 回退到 LibreOffice...')

    # 方案2: LibreOffice 命令行
    if convert_with_libreoffice(input_path, output_path, 'pdf'):
        if progress_callback:
            progress_callback(100)
        return output_path

    # 均失败，给出详细错误
    com_hint = f'COM 错误: {last_error}' if last_error else 'COM 未尝试'
    raise RuntimeError(
        f'PPT 转 PDF 失败。{com_hint}\n\n'
        '需要以下任一软件支持：\n'
        '  1) Microsoft PowerPoint（推荐，已检测到 Office）\n'
        '  2) LibreOffice（免费: https://www.libreoffice.org/）\n\n'
        '如果已安装 Office，请检查 PowerPoint 是否能正常打开该文件。'
    )


def _convert_with_com(input_path: str, output_path: str, progress_callback=None) -> str:
    """使用 Windows COM (PowerPoint) 导出 PDF"""
    import pythoncom
    import win32com.client

    # 初始化 COM
    pythoncom.CoInitialize()

    powerpoint = None
    presentation = None
    try:
        powerpoint = win32com.client.Dispatch('PowerPoint.Application')
        # 新的 Office 安全策略禁止隐藏窗口，最小化代替
        try:
            powerpoint.WindowState = 2  # ppWindowMinimized
        except Exception:
            pass

        abs_input = os.path.abspath(input_path)
        abs_output = os.path.abspath(output_path)

        presentation = powerpoint.Presentations.Open(abs_input, WithWindow=False)
        presentation.SaveAs(abs_output, 32)  # 32 = ppSaveAsPDF
        presentation.Close()
        presentation = None

        if progress_callback:
            progress_callback(100)

        return output_path

    finally:
        if presentation is not None:
            try:
                presentation.Close()
            except Exception:
                pass
        if powerpoint is not None:
            try:
                powerpoint.Quit()
            except Exception:
                pass
        pythoncom.CoUninitialize()
