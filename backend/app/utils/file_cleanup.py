"""
定时清理临时上传文件的后台任务。
每隔 30 分钟扫描临时目录，删除超过 1 小时的旧文件。
"""

import os
import time
import asyncio
from ..config import TEMP_UPLOAD_DIR, CLEANUP_INTERVAL_MINUTES, FILE_MAX_AGE_MINUTES


async def cleanup_loop():
    """
    后台清理循环（异步）。

    说明:
        - 每 CLEANUP_INTERVAL_MINUTES 分钟执行一次
        - 删除 TEMP_UPLOAD_DIR 中超过 FILE_MAX_AGE_MINUTES 分钟未修改的文件
        - 与 FastAPI lifespan 配合使用，服务启动时自动开始，关闭时停止
    """
    while True:
        try:
            _cleanup_now()
        except Exception as e:
            print(f"[清理任务] 执行出错: {e}")
        await asyncio.sleep(CLEANUP_INTERVAL_MINUTES * 60)


def _cleanup_now():
    """立即执行一次清理"""
    if not os.path.exists(TEMP_UPLOAD_DIR):
        return

    cutoff = time.time() - FILE_MAX_AGE_MINUTES * 60
    cleaned = 0

    for filename in os.listdir(TEMP_UPLOAD_DIR):
        filepath = os.path.join(TEMP_UPLOAD_DIR, filename)
        try:
            if os.path.isfile(filepath) and os.path.getmtime(filepath) < cutoff:
                os.remove(filepath)
                cleaned += 1
        except OSError:
            continue

    if cleaned > 0:
        print(f"[清理任务] 已清理 {cleaned} 个过期临时文件")
