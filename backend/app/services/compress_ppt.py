"""
PPT 极限压缩服务。
将 180MB+ PPT 压缩到 50MB 级别，内容（文字/形状/动画）完全不动。
原理：PPTX 体积的 90%+ 来自嵌入图片 → 强力压缩图片 → ZIP 极限打包。
"""

import os
import io
import zipfile
from pathlib import Path
from PIL import Image


def compress_pptx(
    input_path: str,
    output_path: str,
    max_image_width: int = 1366,
    jpeg_quality: int = 50,
    progress_callback=None,
) -> str:
    """
    极限压缩 PPTX 文件。

    策略（多重优化）：
        1. 取出 ZIP 内所有图片，统一转 JPEG（质量 50），透明通道用白底填充
        2. 所有图片宽度限制 1366px（笔记本电脑标准分辨率），超大图等比缩放
        3. 跳过"压缩后反而变大"的图片（已经是低质量的小图）
        4. ZIP_DEFLATED 最大压缩级别重打包

    参数:
        input_path:  源 .pptx 路径
        output_path: 输出路径
        max_image_width: 图片最大宽度，默认 1366px（标准笔记本分辨率）
        jpeg_quality: JPEG 质量 1-100，默认 50（极强压缩，肉眼无感）
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

    image_exts = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.emf', '.wmf'}

    with zipfile.ZipFile(input_path, 'r') as zin:
        all_files = zin.namelist()
        image_files = [f for f in all_files if Path(f).suffix.lower() in image_exts]
        # 定位 [Content_Types].xml 和幻灯片 XML（需要同步更新图片扩展名）
        xml_files = [f for f in all_files if f.endswith('.xml') or f.endswith('.rels')]

        if progress_callback:
            progress_callback(f"找到 {len(image_files)} 张图片，开始极限压缩...")

        rename_map = {}   # 旧文件名 → 新文件名（PNG→JPG 时需要）
        saved_bytes = 0
        processed = 0

        with zipfile.ZipFile(
            output_path, 'w',
            compression=zipfile.ZIP_DEFLATED,
            compresslevel=9,
        ) as zout:
            for item in all_files:
                data = zin.read(item)
                ext = Path(item).suffix.lower()

                if ext in image_exts:
                    try:
                        compressed, new_ext = _aggressive_compress(
                            data, ext, max_image_width, jpeg_quality
                        )
                        if compressed and len(compressed) < len(data):
                            saved_bytes += len(data) - len(compressed)
                            data = compressed
                            processed += 1
                            # 如果扩展名变了（如 PNG→JPG），需要记下来同步更新 XML
                            if new_ext and new_ext != ext:
                                new_name = item[: -len(ext)] + new_ext
                                rename_map[item] = new_name
                    except Exception:
                        pass

                zout.writestr(zin.getinfo(item), data)

                if progress_callback and image_files:
                    progress_callback(
                        f"压缩中... ({processed}/{len(image_files)} 张, "
                        f"已节省 {_format_size(saved_bytes)})"
                    )

        # 第二步：如果有文件名变更（PNG→JPG），更新 ZIP 内 XML 引用
        if rename_map:
            if progress_callback:
                progress_callback("同步更新 XML 引用...")
            _update_image_references(output_path, rename_map)

    compressed_size = os.path.getsize(output_path)
    ratio = (1 - compressed_size / original_size) * 100 if original_size > 0 else 0

    msg = (
        f"压缩完成: {_format_size(original_size)} → {_format_size(compressed_size)} "
        f"(减小 {ratio:.0f}%, 节省 {_format_size(saved_bytes)})"
    )

    if progress_callback:
        progress_callback(msg)

    print(f"[PPT压缩] {msg}")
    return output_path


def _aggressive_compress(
    data: bytes,
    ext: str,
    max_width: int,
    quality: int,
) -> tuple[bytes | None, str | None]:
    """
    激进压缩单张图片：统一转 JPEG、缩小分辨率、白底填充透明通道。

    返回:
        (压缩后字节, 新扩展名) — 如果压缩后更大则返回 (None, None)
    """
    img = Image.open(io.BytesIO(data))
    original_mode = img.mode
    width, height = img.size

    # ---- 0) 跳过极小图（压缩无意义，可能反而变大）----
    if max(width, height) < 100:
        return None, None

    # ---- 1) 处理透明通道：白底填充 → RGB ----
    if img.mode in ('RGBA', 'LA', 'PA'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'PA':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    elif img.mode == 'P':
        img = img.convert('RGBA')
        background = Image.new('RGB', img.size, (255, 255, 255))
        try:
            background.paste(img, mask=img.split()[-1])
        except Exception:
            background.paste(img)
        img = background
    elif img.mode not in ('RGB', 'L'):
        img = img.convert('RGB')

    # ---- 2) 缩小分辨率 ----
    if width > max_width:
        ratio = max_width / width
        new_size = (max_width, int(height * ratio))
        try:
            img = img.resize(new_size, Image.LANCZOS)
        except Exception:
            img = img.resize(new_size, Image.BILINEAR)
        width, height = img.size

    # 如果高度也很大（竖版图片），同样限制
    max_height = max_width
    if height > max_height:
        ratio = max_height / height
        new_size = (int(width * ratio), max_height)
        try:
            img = img.resize(new_size, Image.LANCZOS)
        except Exception:
            img = img.resize(new_size, Image.BILINEAR)

    # ---- 3) 输出为 JPEG ----
    out_buf = io.BytesIO()
    img.save(out_buf, format='JPEG', quality=quality, optimize=True, subsampling='4:2:0')
    result = out_buf.getvalue()

    # 只有真正减小了才返回
    if len(result) < len(data):
        new_ext = '.jpg' if ext != '.jpg' and ext != '.jpeg' else None
        return result, new_ext

    return None, None


def _update_image_references(zip_path: str, rename_map: dict):
    """
    更新 ZIP 内所有 XML 文件中的图片引用。
    当 PNG 被转为 JPG 时，所有引用该图片的 XML 节点必须同步更新。
    """
    import tempfile

    tmp_path = zip_path + '.tmp'
    with zipfile.ZipFile(zip_path, 'r') as zin:
        with zipfile.ZipFile(tmp_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zout:
            for item in zin.namelist():
                data = zin.read(item)
                # 只处理 XML 和 rels 文件（可能包含图片引用）
                if item.endswith('.xml') or item.endswith('.rels'):
                    try:
                        text = data.decode('utf-8')
                        modified = False
                        for old, new in rename_map.items():
                            old_basename = os.path.basename(old)
                            new_basename = os.path.basename(new)
                            if old_basename in text:
                                text = text.replace(old_basename, new_basename)
                                modified = True
                        if modified:
                            data = text.encode('utf-8')
                    except (UnicodeDecodeError, Exception):
                        pass  # 二进制 XML 不处理
                zout.writestr(zin.getinfo(item), data)

    os.replace(tmp_path, zip_path)


def _format_size(size_bytes: int) -> str:
    """格式化文件大小为人类可读形式"""
    mb = size_bytes / (1024 * 1024)
    if mb >= 1:
        return f"{mb:.1f} MB"
    kb = size_bytes / 1024
    if kb >= 1:
        return f"{kb:.0f} KB"
    return f"{size_bytes} B"
