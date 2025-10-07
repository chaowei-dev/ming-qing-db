from __future__ import annotations

import sys
from pathlib import Path
from appdirs import user_data_dir


APP_NAME: str = "MingQingDB"


def _is_frozen() -> bool:
    return bool(getattr(sys, "frozen", False))


def project_root() -> Path:
    """Return the project root directory when running from source.

    This resolves to the `desktop/` directory containing `src/` and `resources/`.
    """
    return Path(__file__).resolve().parents[2]


def resource_root() -> Path:
    """Return the base directory for bundled resources.

    - In a PyInstaller bundle, resources are placed under `sys._MEIPASS`.
    - In development, resources live under `<project_root>/resources`.
    """
    if _is_frozen():
        base = Path(getattr(sys, "_MEIPASS", project_root()))
        return base / "resources"
    return project_root() / "resources"


def get_resource_path(*relative_parts: str) -> Path:
    """Build an absolute path to a resource inside the resources directory."""
    return resource_root().joinpath(*relative_parts)


def get_data_dir() -> Path:
    """Return the user-writable data directory for the application.

    Examples:
    - macOS: ~/Library/Application Support/MingQingDB
    - Windows: %LOCALAPPDATA%\MingQingDB
    - Linux: ~/.local/share/MingQingDB
    """
    data_dir = Path(user_data_dir(APP_NAME, appauthor=False))
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


def get_database_path() -> Path:
    """Return the path to the main SQLite database file."""
    return get_data_dir() / "database.db"


def get_backups_dir() -> Path:
    """Return the path to the backups directory, creating it if needed."""
    backups = get_data_dir() / "backups"
    backups.mkdir(parents=True, exist_ok=True)
    return backups


