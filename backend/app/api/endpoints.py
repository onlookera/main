"""
DocMaster — API 路由端点
定义所有 REST API 接口

接口清单:
    POST /api/upload          — 上传文件
    POST /api/convert         — 启动转换
    GET  /api/status/{id}     — 查询进度
    GET  /api/download/{id}   — 下载结果
    DELETE /api/files/{id}    — 清理文件
"""

import os
import asyncio
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from ..models.schemas import (
    UploadResponse,
    ConvertRequest,
    ConvertResponse,
    TaskStatusResponse,
    ErrorResponse,
)
from ..tasks.manager import task_manager, TaskInfo
from ..utils.file_utils import (
    validate_file,
    get_safe_filename,
    get_output_filename,
    get_file_extension,
    cleanup_files,
    UPLOAD_DIR,
    OUTPUT_DIR,
)
from ..services.pdf_to_word import convert_pdf_to_word
from ..services.pdf_to_ppt import convert_pdf_to_ppt
from ..services.word_to_pdf import convert_word_to_pdf
from ..services.ppt_to_pdf import convert_ppt_to_pdf
from ..services.ppt_to_word import convert_ppt_to_word
from ..services.pdf_merge_split import merge_pdfs, split_pdf_all_pages
from ..services.compress_ppt import compress_pptx

# 创建路由器，所有接口统一加 /api 前缀
router = APIRouter(prefix='/api', tags=['DocMaster'])


# ==================== 文件上传 ====================

@router.post('/upload', response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    接收用户上传的文件，保存到 uploads/ 目录，返回唯一 task_id

    校验规则:
        - 格式限制: pdf / doc / docx / ppt / pptx
        - 大小限制: 无限制
    """
    # 流式写入磁盘（不限制大小，每次 1MB chunk）
    task = task_manager.create_task(file.filename or 'unknown', '')

    safe_name = get_safe_filename(task.task_id, file.filename or 'unknown')
    save_path = UPLOAD_DIR / safe_name

    file_size = 0
    with open(save_path, 'wb') as buffer:
        while chunk := await file.read(1024 * 1024):
            file_size += len(chunk)
            buffer.write(chunk)

    # 校验文件格式（不限制大小）
    is_valid, error_msg = validate_file(file.filename or 'unknown', file_size)
    if not is_valid:
        os.remove(save_path)
        task_manager.delete_task(task.task_id)
        raise HTTPException(status_code=400, detail=error_msg)

    # 更新任务信息
    task.original_path = str(save_path)
    task.status = 'pending'

    return UploadResponse(
        task_id=task.task_id,
        filename=file.filename or 'unknown',
        size=file_size,
    )


# ==================== 启动转换 ====================

@router.post('/convert', response_model=ConvertResponse)
async def convert_file(request: ConvertRequest, background_tasks: BackgroundTasks):
    """
    发起异步格式转换任务

    转换类型:
        - pdf_to_word: PDF → Word
        - pdf_to_ppt:  PDF → PPT
        - word_to_pdf: Word → PDF
        - ppt_to_pdf:  PPT → PDF
        - ppt_to_word: PPT → Word
        - pdf_split:   PDF 拆分
        - pdf_merge:   PDF 合并
    """
    # 校验任务存在
    task = task_manager.get_task(request.task_id)
    if task is None:
        raise HTTPException(status_code=404, detail='任务不存在，请先上传文件')

    if task.status == 'processing':
        raise HTTPException(status_code=400, detail='任务正在处理中，请等待完成')

    # 校验源文件存在
    if not os.path.exists(task.original_path):
        raise HTTPException(status_code=404, detail='源文件已被清理，请重新上传')

    # 初始化转换状态
    task_manager.update_task(
        request.task_id,
        status='processing',
        progress=0,
        conversion_type=request.conversion_type,
    )

    # 将转换任务放入后台执行（不阻塞 API 响应）
    background_tasks.add_task(
        _execute_conversion,
        request.task_id,
        request.conversion_type,
        request.extra_task_ids,
    )

    return ConvertResponse(task_id=request.task_id, status='processing')


def _execute_conversion(task_id: str, conversion_type: str, extra_task_ids=None):
    """
    在后台线程中执行实际的转换逻辑
    这个函数运行在 FastAPI 的 BackgroundTasks 线程池中

    extra_task_ids: PDF 合并时需要额外的文件 task_id 列表
    """
    task = task_manager.get_task(task_id)
    if task is None:
        return

    input_path = task.original_path
    ext = get_file_extension(task.filename)
    output_ext = _get_output_extension(conversion_type)
    output_filename = get_output_filename(task.filename, output_ext)
    output_path = str(OUTPUT_DIR / f'{task_id}.{output_ext}')

    # 进度回调：更新任务管理器中的进度
    def on_progress(percent: int):
        task_manager.update_task(task_id, progress=percent)

    try:
        # 根据转换类型分发到不同的服务函数
        if conversion_type == 'pdf_to_word':
            convert_pdf_to_word(input_path, output_path, on_progress)
            output_ext = 'docx'

        elif conversion_type == 'pdf_to_ppt':
            convert_pdf_to_ppt(input_path, output_path, on_progress)
            output_ext = 'pptx'

        elif conversion_type == 'word_to_pdf':
            convert_word_to_pdf(input_path, output_path, on_progress)
            output_ext = 'pdf'

        elif conversion_type == 'ppt_to_pdf':
            convert_ppt_to_pdf(input_path, output_path, on_progress)
            output_ext = 'pdf'

        elif conversion_type == 'ppt_to_word':
            convert_ppt_to_word(input_path, output_path, on_progress)
            output_ext = 'docx'

        elif conversion_type == 'pdf_split':
            # 拆分：输出到以 task_id 命名的子目录
            split_dir = OUTPUT_DIR / task_id
            split_files = split_pdf_all_pages(input_path, str(split_dir), on_progress)
            # 将拆分后的文件打包为 ZIP
            import zipfile
            zip_path = str(OUTPUT_DIR / f'{task_id}.zip')
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                for f in split_files:
                    zf.write(f, os.path.basename(f))
            output_path = zip_path
            output_ext = 'zip'
            output_filename = get_output_filename(task.filename, 'zip')

        elif conversion_type == 'ppt_compress':
            # PPT 压缩：图片优化 + ZIP 极限压缩（内容不丢失）
            compress_pptx(
                input_path, output_path,
                max_image_width=1920,
                jpeg_quality=70,
                progress_callback=lambda msg: on_progress(50),
            )
            on_progress(100)
            output_filename = get_output_filename(task.filename, 'pptx').replace(
                '_已转换', '_已压缩'
            )

        elif conversion_type == 'pdf_merge':
            merge_paths = [input_path]
            if extra_task_ids:
                for tid in extra_task_ids:
                    t = task_manager.get_task(tid)
                    if t and os.path.exists(t.original_path):
                        merge_paths.append(t.original_path)

            if len(merge_paths) < 2:
                raise RuntimeError(
                    'PDF 合并至少需要 2 个 PDF 文件。请先上传多个 PDF，'
                    '然后在合并时指定额外的 task_id。'
                )

            # 执行合并
            output_ext = 'pdf'
            output_path = str(OUTPUT_DIR / f'{task_id}.pdf')
            merge_pdfs(merge_paths, output_path, on_progress)
            output_filename = get_output_filename(task.filename, 'pdf')

        else:
            raise ValueError(f'不支持的转换类型: {conversion_type}')

        # 更新输出文件名
        final_output_filename = get_output_filename(task.filename, output_ext)
        # 确保输出文件路径匹配
        final_output_path = str(OUTPUT_DIR / f'{task_id}.{output_ext}')
        if output_path != final_output_path and os.path.exists(output_path):
            shutil.move(output_path, final_output_path)
            output_path = final_output_path

        # 更新任务状态为完成
        task_manager.update_task(
            task_id,
            status='completed',
            progress=100,
            output_path=output_path,
            output_filename=final_output_filename,
        )

    except Exception as e:
        # 转换失败，直接返回原始错误（服务层已经提供了详细的错误信息）
        error_detail = str(e)

        task_manager.update_task(
            task_id,
            status='failed',
            error_message=error_detail,
        )


def _get_output_extension(conversion_type: str) -> str:
    """根据转换类型返回输出文件扩展名"""
    mapping = {
        'pdf_to_word': 'docx',
        'pdf_to_ppt': 'pptx',
        'word_to_pdf': 'pdf',
        'ppt_to_pdf': 'pdf',
        'ppt_to_word': 'docx',
        'pdf_split': 'zip',
        'pdf_merge': 'pdf',
        'ppt_compress': 'pptx',
    }
    return mapping.get(conversion_type, 'bin')


# ==================== 查询进度 ====================

@router.get('/status/{task_id}', response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """
    轮询查询转换任务进度（百分比 0-100）

    前端每 1 秒轮询一次，直到 status 为 completed 或 failed
    """
    task = task_manager.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail='任务不存在')

    return TaskStatusResponse(**task.to_dict())


# ==================== 下载文件 ====================

@router.get('/download/{task_id}')
async def download_file(task_id: str):
    """
    下载转换完成的文件

    返回文件流，浏览器自动触发下载
    """
    task = task_manager.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail='任务不存在')

    if task.status != 'completed':
        raise HTTPException(status_code=400, detail='文件尚未转换完成，请等待')

    output_path = task.output_path
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail='输出文件已被清理，请重新转换')

    # 返回文件响应，自动设置 Content-Disposition
    return FileResponse(
        path=output_path,
        filename=task.output_filename or 'converted_file',
        media_type='application/octet-stream',
    )


# ==================== 清理文件 ====================

@router.delete('/files/{task_id}')
async def delete_file(task_id: str):
    """
    删除指定任务的临时文件（上传文件 + 输出文件）
    """
    task = task_manager.get_task(task_id)

    # 清理磁盘文件
    cleaned = cleanup_files(task_id)

    # 清理任务记录
    task_manager.delete_task(task_id)

    return {'task_id': task_id, 'cleaned': cleaned, 'message': '已清理完成'}
