# PyInstaller spec for MingQingDB desktop app

import sys
from PyInstaller.utils.hooks import collect_submodules
from PyInstaller.building.build_main import Analysis, PYZ, EXE, COLLECT, BUNDLE
from PyInstaller.building.datastruct import Tree

app_name = "MingQingDB"

hiddenimports = collect_submodules("PyQt6")

a = Analysis(
    ["src/main.py"],
    pathex=["."],
    binaries=[],
    datas=[
        # Package the entire resources directory preserving structure
        Tree("resources", prefix="resources"),
    ],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    name=app_name,
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    target_arch=None,
)

if sys.platform == "darwin":
    app = BUNDLE(
        exe,
        name=f"{app_name}.app",
        icon=None,
        bundle_identifier="local.mingqing.db",
        info_plist=None,
    )
    dist_target = app
else:
    dist_target = COLLECT(
        exe,
        a.binaries,
        a.zipfiles,
        a.datas,
        name=app_name,
        strip=False,
        upx=True,
        upx_exclude=[],
    )


