"""
DocMaster — LibreOffice 命令行工具
"""

import os
import subprocess
import shutil
import tempfile
from pathlib import Path


def convert_with_libreoffice(
    input_path: str,
    output_path: str,
    target_format: str = 'pdf',
    timeout: int = 300,
) -> bool:
    """
    使用 LibreOffice 命令行进行文档格式转换
    适配 Railway Linux 无头环境：设置 HOME、UserInstallation、LANG
    """
    soffice = _find_libreoffice()
    if not soffice:
        print('[LibreOffice] 未找到 soffice/libreoffice 可执行文件')
        return False

    print(f'[LibreOffice] 找到: {soffice}')
    print(f'[LibreOffice] 输入: {input_path} ({os.path.getsize(input_path)} bytes)')

    output_dir = os.path.dirname(output_path)
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # LibreOffice 在无头 Linux 上需要：
    # 1. 可写的 HOME 目录
    # 2. 可写的 UserInstallation 路径
    # 3. 正确的 locale
    lo_home = '/tmp/libreoffice-home'
    os.makedirs(lo_home, exist_ok=True)

    user_install = 'file:///tmp/libreoffice-user-install'
    os.makedirs('/tmp/libreoffice-user-install', exist_ok=True)

    env = os.environ.copy()
    env['HOME'] = lo_home
    env['LANG'] = 'en_US.UTF-8'
    env['LC_ALL'] = 'en_US.UTF-8'

    cmd = [
        soffice,
        '--headless',
        '-env:UserInstallation=' + user_install,
        '--convert-to', target_format,
        '--outdir', output_dir,
        input_path,
    ]

    print(f'[LibreOffice] 命令: {" ".join(str(c) for c in cmd)}')

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            env=env,
        )

        if result.returncode != 0:
            stderr = (result.stderr or '')[:300]
            stdout = (result.stdout or '')[:200]
            print(f'[LibreOffice] 转换失败 (exit={result.returncode})')
            print(f'[LibreOffice] stderr: {stderr}')
            print(f'[LibreOffice] stdout: {stdout}')
            # 把 LibreOffice 的原始错误抛出去
            raise RuntimeError(
                f'LibreOffice 转换失败 (exit={result.returncode}): {stderr or "请检查文件格式"}'
            )

        print(f'[LibreOffice] stdout: {result.stdout[:200]}')

        # LibreOffice 输出文件与输入同名但扩展名不同
        input_stem = os.path.splitext(os.path.basename(input_path))[0]
        generated = os.path.join(output_dir, f'{input_stem}.{target_format}')

        if os.path.exists(generated) and generated != output_path:
            if os.path.exists(output_path):
                os.remove(output_path)
            os.rename(generated, output_path)

        success = os.path.exists(output_path)
        if success:
            print(f'[LibreOffice] 转换成功: {output_path} ({os.path.getsize(output_path)} bytes)')
        else:
            print(f'[LibreOffice] 输出文件未找到: {output_path}')
        return success

    except subprocess.TimeoutExpired:
        print(f'[LibreOffice] 转换超时 ({timeout}s)')
        raise RuntimeError(f'LibreOffice 转换超时 ({timeout}秒)，文件可能过大')
    except FileNotFoundError as e:
        print(f'[LibreOffice] 文件未找到: {e}')
        raise RuntimeError(f'LibreOffice 找不到输入文件: {e}')
    except PermissionError as e:
        print(f'[LibreOffice] 权限错误: {e}')
        raise RuntimeError(f'LibreOffice 权限不足: {e}')


def is_libreoffice_available() -> bool:
    """检查 LibreOffice 是否已安装"""
    return _find_libreoffice() is not None


def _find_libreoffice() -> str | None:
    """跨平台查找 LibreOffice 可执行文件路径"""
    if os.name == 'nt':
        for p in [
            r'C:\Program Files\LibreOffice\program\soffice.exe',
            r'C:\Program Files (x86)\LibreOffice\program\soffice.exe',
        ]:
            if os.path.exists(p):
                return p

    mac = '/Applications/LibreOffice.app/Contents/MacOS/soffice'
    if os.path.exists(mac):
        return mac

    linux_paths = [
        '/usr/bin/libreoffice',
        '/usr/bin/soffice',
        '/usr/lib/libreoffice/program/soffice',
        '/usr/local/bin/libreoffice',
        '/snap/bin/libreoffice',
        '/bin/libreoffice',
        '/bin/soffice',
    ]
    for p in linux_paths:
        if os.path.exists(p):
            return p

    for name in ['soffice', 'libreoffice']:
        found = shutil.which(name)
        if found:
            return found

    return None
