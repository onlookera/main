"""
DocMaster + 智能 RAG 知识库 — FastAPI 主入口
"""

import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .api.endpoints import router as api_router
from .routers.upload import router as rag_upload_router
from .routers.query import router as rag_query_router
from .routers.management import router as rag_management_router

FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / 'frontend' / 'dist'


@asynccontextmanager
async def lifespan(app: FastAPI):
    from .utils.file_utils import UPLOAD_DIR, OUTPUT_DIR, cleanup_old_files
    from .utils.libreoffice import is_libreoffice_available
    UPLOAD_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)
    cleanup_old_files(max_age_hours=24)

    # 启动 RAG 文件清理后台任务
    from .utils.file_cleanup import cleanup_loop
    cleanup_task = asyncio.create_task(cleanup_loop())

    print(f'[DocMaster] LibreOffice available: {is_libreoffice_available()}')
    print(f'[DocMaster] RAG 知识库已就绪')
    yield

    # 关闭后台任务
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    print('[DocMaster] stopped')


app = FastAPI(
    title='DocMaster + RAG Knowledge Base API',
    version='1.0.0',
    docs_url='/docs',
    redoc_url='/redoc',
    lifespan=lifespan,
)
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

# ===== DocMaster 格式转换 API（/api/...）=====
app.include_router(api_router)

# ===== 智能 RAG 知识库 API（/api/v1/...）=====
app.include_router(rag_upload_router, prefix="/api/v1")
app.include_router(rag_query_router, prefix="/api/v1")
app.include_router(rag_management_router, prefix="/api/v1")


@app.get('/health')
async def health():
    return {'status': 'healthy'}


@app.get('/system-check')
async def system_check():
    """诊断系统环境"""
    import shutil, sys, os
    from .utils.libreoffice import is_libreoffice_available

    def check(cmd):
        path = shutil.which(cmd)
        return str(path) if path else 'NOT FOUND'

    return {
        'python': sys.executable,
        'python_version': sys.version,
        'os_name': os.name,
        'platform': sys.platform,
        'libreoffice_available': is_libreoffice_available(),
        'which_soffice': check('soffice'),
        'which_libreoffice': check('libreoffice'),
        'path_env': os.environ.get('PATH', ''),
    }


# ===== 前端静态文件 =====
if FRONTEND_DIST.exists():
    # 1) 挂载 /assets/ 目录（Vite 构建的 JS/CSS 都在这里）
    assets_dir = FRONTEND_DIST / 'assets'
    if assets_dir.exists():
        app.mount('/assets', StaticFiles(directory=str(assets_dir)), name='assets')

    # 2) 根路径 → index.html
    @app.get('/')
    async def index():
        return FileResponse(str(FRONTEND_DIST / 'index.html'))

    # 3) catch-all → 文件或 index.html（必须在最后）
    @app.get('/{rest:path}')
    async def spa(rest: str):
        file = FRONTEND_DIST / rest
        if file.exists() and file.is_file():
            return FileResponse(str(file))
        return FileResponse(str(FRONTEND_DIST / 'index.html'))
