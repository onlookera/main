"""
DocMaster — 文件处理工具函数
提供文件校验、清理、路径管理等功能
"""

import os
import shutil
from pathlib import Path
from typing import Tuple, Optional

# 项目根目录（backend/）
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# 上传文件存储目录
UPLOAD_DIR = BASE_DIR / 'uploads'
# 转换输出存储目录
OUTPUT_DIR = BASE_DIR / 'outputs'

# 启动时确保目录存在
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# 允许的文件扩展名
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.ppt', '.pptx'}

# 文件大小不限制（依赖磁盘剩余空间）
MAX_FILE_SIZE = float('inf')


def validate_file(filename: str, file_size: int) -> Tuple[bool, Optional[str]]:
    """
    校验上传文件是否合法

    参数:
        filename: 原始文件名
        file_size: 文件大小（字节）

    返回:
        (是否合法, 错误信息)
    """
    # 检查扩展名
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        allowed = ', '.join(ALLOWED_EXTENSIONS)
        return False, f'不支持的文件格式 ".{ext}"，请上传以下格式：{allowed}'

    # 检查文件大小
    if file_size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE // (1024 * 1024)
        return False, f'文件大小超过 {max_mb}MB 限制，请压缩后再上传'

    return True, None


def get_file_extension(filename: str) -> str:
    """
    获取文件扩展名（不含点号）

    例如: "报告.PDF" → "pdf"
    """
    return Path(filename).suffix.lower().lstrip('.')


def get_safe_filename(task_id: str, original_filename: str) -> str:
    """
    生成安全的存储文件名：task_id + 原始扩展名
    防止路径穿越攻击和文件名冲突
    """
    ext = Path(original_filename).suffix.lower()
    return f'{task_id}{ext}'


def get_output_filename(original_filename: str, target_ext: str) -> str:
    """
    生成输出文件名：原名_已转换.新扩展名

    例如: ("报告.pdf", "docx") → "报告_已转换.docx"
    """
    stem = Path(original_filename).stem
    return f'{stem}_已转换.{target_ext}'


def cleanup_files(task_id: str) -> bool:
    """
    清理指定任务的上传文件和输出文件

    返回: 是否成功清理
    """
    cleaned = False

    # 清理上传目录中的文件
    for file_path in UPLOAD_DIR.glob(f'{task_id}.*'):
        try:
            os.remove(file_path)
            cleaned = True
        except OSError:
            pass

    # 清理输出目录中的文件
    for file_path in OUTPUT_DIR.glob(f'{task_id}.*'):
        try:
            os.remove(file_path)
            cleaned = True
        except OSError:
            pass

    return cleaned


def cleanup_old_files(max_age_hours: int = 24):
    """
    清理超过指定时间的临时文件
    可在定时任务中调用，防止磁盘占满
    """
    import time
    cutoff = time.time() - max_age_hours * 3600

    for directory in [UPLOAD_DIR, OUTPUT_DIR]:
        for file_path in directory.iterdir():
            if file_path.is_file() and file_path.stat().st_mtime < cutoff:
                try:
                    os.remove(file_path)
                except OSError:
                    pass
