"""
PPT 压缩服务。
大幅减小 PPTX 文件体积（如 200MB → 50MB），内容不丢失。
原理：PPTX = ZIP(XML + 图片)，压缩图片 + 极限 ZIP 压缩。
"""

import os
import io
import zipfile
from pathlib import Path
from PIL import Image


def compress_pptx(
    input_path: str,
    output_path: str,
    max_image_width: int = 1920,
    jpeg_quality: int = 70,
    progress_callback=None,
) -> str:
    """
    压缩 PPTX 文件。

    策略（多重优化，保证内容不丢失）：
        1. 分析所有嵌入图片，超过 max_image_width 宽度的大图缩小分辨率
        2. PNG 大图转为 JPEG（大幅缩小体积）
        3. JPEG 图片用指定质量重压缩
        4. 使用 ZIP_DEFLATED 最大压缩级别重新打包

    参数:
        input_path:  源 .pptx 文件路径
        output_path: 输出 .pptx 文件路径
        max_image_width: 图片最大宽度（像素），超出则等比缩小。默认 1920px 足够高清。
        jpeg_quality: JPEG 压缩质量 1-100，默认 70（肉眼几乎无差异）
        progress_callback: 进度回调 callback(msg: str)

    返回:
        输出文件路径
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"输入文件不存在: {input_path}")

    original_size = os.path.getsize(input_path)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    if progress_callback:
        progress_callback("正在分析 PPT 结构...")

    # PPTX 本质是 ZIP 文件 — 解压 → 处理图片 → 重压缩
    with zipfile.ZipFile(input_path, 'r') as zin:
        file_list = zin.namelist()

        # 找出所有图片文件
        image_exts = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.emf', '.wmf'}
        image_files = [f for f in file_list if Path(f).suffix.lower() in image_exts]

        if progress_callback:
            progress_callback(f"找到 {len(image_files)} 张图片，开始压缩...")

        # 创建输出 ZIP
        with zipfile.ZipFile(
            output_path, 'w',
            compression=zipfile.ZIP_DEFLATED,
            compresslevel=9,  # 最高压缩级别
        ) as zout:
            processed_images = 0

            for item in file_list:
                data = zin.read(item)
                ext = Path(item).suffix.lower()

                # 如果是图片，进行压缩处理
                if ext in image_exts:
                    try:
                        compressed = _compress_image(
                            data, ext,
                            max_image_width, jpeg_quality,
                        )
                        if compressed and len(compressed) < len(data):
                            data = compressed
                            processed_images += 1
                    except Exception:
                        pass  # 压缩失败则保留原图

                zout.writestr(zin.getinfo(item), data)

                if progress_callback and image_files:
                    idx = file_list.index(item)
                    progress_callback(
                        f"压缩图片中... ({processed_images}/{len(image_files)})"
                    )

    # 结果统计
    compressed_size = os.path.getsize(output_path)
    ratio = (1 - compressed_size / original_size) * 100 if original_size > 0 else 0

    msg = (
        f"压缩完成: {_format_size(original_size)} → {_format_size(compressed_size)} "
        f"(减小 {ratio:.0f}%)"
    )

    if progress_callback:
        progress_callback(msg)

    print(f"[PPT压缩] {msg}")
    return output_path


def _compress_image(
    data: bytes,
    ext: str,
    max_width: int,
    jpeg_quality: int,
) -> bytes | None:
    """
    压缩单张图片。

    返回:
        压缩后的字节数据，如果不需要压缩返回 None
    """
    img = Image.open(io.BytesIO(data))

    # 跳过矢量图（EMF/WMF）
    if img.mode in ('P', 'RGBA', 'LA') and ext in ('.png', '.gif', '.webp', '.tiff'):
        # 带透明通道的 PNG：保留 PNG 格式，调整尺寸和调色板
        pass
    elif ext in ('.emf', '.wmf'):
        return None  # 矢量格式，无法压缩

    width, height = img.size

    # 1) 缩小过大图片
    if width > max_width:
        ratio = max_width / width
        new_size = (max_width, int(height * ratio))
        try:
            img = img.resize(new_size, Image.LANCZOS)
        except Exception:
            img = img.resize(new_size, Image.BILINEAR)

    # 2) 决定输出格式
    has_transparency = img.mode in ('RGBA', 'LA', 'P')
    output_ext = ext

    # 大 PNG 且无透明通道 → 转 JPEG（体积能减 90%）
    if ext == '.png' and not has_transparency and max(img.size) > 400:
        if img.mode != 'RGB':
            img = img.convert('RGB')
        output_ext = '.jpg'

    # 3) 编码输出
    out_buf = io.BytesIO()

    if output_ext in ('.jpg', '.jpeg'):
        img.save(out_buf, format='JPEG', quality=jpeg_quality, optimize=True)
    elif output_ext == '.png':
        img.save(out_buf, format='PNG', optimize=True)
    elif output_ext == '.gif':
        img.save(out_buf, format='GIF', optimize=True)
    elif output_ext == '.webp':
        img.save(out_buf, format='WEBP', quality=jpeg_quality)
    elif output_ext == '.bmp':
        img.save(out_buf, format='JPEG', quality=jpeg_quality)  # BMP 直接转 JPEG
    elif output_ext == '.tiff':
        img.save(out_buf, format='JPEG', quality=jpeg_quality)

    result = out_buf.getvalue()

    # 只有真正减小了才返回（某些情况压缩可能变大）
    if len(result) < len(data):
        return result
    return None


def _format_size(size_bytes: int) -> str:
    """格式化文件大小为人类可读形式"""
    mb = size_bytes / (1024 * 1024)
    if mb >= 1:
        return f"{mb:.1f} MB"
    kb = size_bytes / 1024
    if kb >= 1:
        return f"{kb:.0f} KB"
    return f"{size_bytes} B"
