"""
DocMaster — 后端启动脚本
使用 Uvicorn 启动 FastAPI 应用，支持热重载
"""

import uvicorn
import os
import sys

# 确保项目根目录在 Python 路径中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == '__main__':
    uvicorn.run(
        'app.main:app',
        host='127.0.0.1',
        port=9000,
        reload=True,
        log_level='info',
    )
