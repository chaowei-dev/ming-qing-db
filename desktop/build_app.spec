# -*- mode: python ; coding: utf-8 -*-

import sys
from pathlib import Path

block_cipher = None

project_dir = Path.cwd()
src_dir = project_dir / "src"
resources_dir = project_dir / "resources"

added_datas = [
    (str(resources_dir), "resources"),
]

a = Analysis(
    [str(src_dir / "main.py")],
    pathex=[str(src_dir)],
    binaries=[],
    datas=added_datas,
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    name="MingQingDB",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=True if sys.platform == "darwin" else False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    exclude_binaries=True,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="MingQingDB",
)

app = BUNDLE(
    coll,
    name="MingQingDB.app",
    icon=None,
    bundle_identifier="local.mingqingdb",
    info_plist={
        "NSHighResolutionCapable": "True",
        "CFBundleName": "MingQingDB",
    },
)

