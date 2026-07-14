"""
DocMaster — LibreOffice 命令行工具
提取共享的 LibreOffice 调用逻辑，避免 word_to_pdf 和 ppt_to_pdf 中的重复代码
"""

import os
import subprocess
import shutil
from pathlib import Path


def convert_with_libreoffice(
    input_path: str,
    output_path: str,
    target_format: str = 'pdf',
    timeout: int = 300,
) -> bool:
    """
    使用 LibreOffice 命令行进行文档格式转换

    参数:
        input_path: 输入文件路径
        output_path: 期望的输出文件路径
        target_format: 目标格式（如 pdf, docx, pptx）
        timeout: 超时秒数（默认300秒）

    返回:
        True = 转换成功，False = LibreOffice 不可用或转换失败
    """
    soffice = _find_libreoffice()
    if not soffice:
        print('[LibreOffice] 未找到 soffice/libreoffice 可执行文件')
        return False

    print(f'[LibreOffice] 找到: {soffice}')

    output_dir = os.path.dirname(output_path)
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    try:
        result = subprocess.run(
            [
                soffice,
                '--headless',
                '--convert-to', target_format,
                '--outdir', output_dir,
                input_path,
            ],
            capture_output=True,
            text=True,
            timeout=timeout,
        )

        if result.returncode != 0:
            print(f'[LibreOffice] 转换失败 (exit={result.returncode}): {result.stderr[:200]}')
            return False

        input_stem = os.path.splitext(os.path.basename(input_path))[0]
        generated = os.path.join(output_dir, f'{input_stem}.{target_format}')

        if os.path.exists(generated) and generated != output_path:
            if os.path.exists(output_path):
                os.remove(output_path)
            os.rename(generated, output_path)

        success = os.path.exists(output_path)
        print(f'[LibreOffice] 转换完成: {output_path} ({success})')
        return success

    except subprocess.TimeoutExpired:
        print(f'[LibreOffice] 转换超时 ({timeout}s)')
        return False
    except FileNotFoundError as e:
        print(f'[LibreOffice] 文件未找到: {e}')
        return False
    except PermissionError as e:
        print(f'[LibreOffice] 权限错误: {e}')
        return False


def is_libreoffice_available() -> bool:
    """检查 LibreOffice 是否已安装"""
    return _find_libreoffice() is not None


def _find_libreoffice() -> str | None:
    """
    跨平台查找 LibreOffice 可执行文件路径
    """
    # Windows 典型路径
    if os.name == 'nt':
        for p in [
            r'C:\Program Files\LibreOffice\program\soffice.exe',
            r'C:\Program Files (x86)\LibreOffice\program\soffice.exe',
        ]:
            if os.path.exists(p):
                return p

    # macOS 路径
    mac = '/Applications/LibreOffice.app/Contents/MacOS/soffice'
    if os.path.exists(mac):
        return mac

    # Linux 常见安装路径
    linux_paths = [
        '/usr/bin/libreoffice',
        '/usr/bin/soffice',
        '/usr/lib/libreoffice/program/soffice',
        '/usr/local/bin/libreoffice',
        '/snap/bin/libreoffice',
    ]
    for p in linux_paths:
        if os.path.exists(p):
            return p

    # PATH 环境变量兜底
    for name in ['soffice', 'libreoffice']:
        found = shutil.which(name)
        if found:
            return found

    return None
