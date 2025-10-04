from __future__ import annotations

from pathlib import Path
import sys
from models.database import get_engine


def _app_root_dir() -> Path:
    """Return the application root directory for dev and frozen builds."""
    if getattr(sys, "frozen", False):
        return Path(getattr(sys, "_MEIPASS", Path(sys.executable).resolve().parent))
    return Path(__file__).resolve().parent.parent.parent


def initialize_database_if_needed() -> None:
    """Create the SQLite database and run init.sql if the DB file is missing.

    This function is idempotent. It checks for the existence of
    desktop/data/database.db and, if absent, executes
    desktop/resources/database/init.sql once to create schema and indexes.
    """
    root_dir = _app_root_dir()
    db_path = root_dir / "data" / "database.db"
    if db_path.exists():
        return

    db_path.parent.mkdir(parents=True, exist_ok=True)

    init_sql_path = root_dir / "resources" / "database" / "init.sql"
    sql_text = init_sql_path.read_text(encoding="utf-8")

    engine = get_engine()
    conn = engine.raw_connection()
    try:
        conn.executescript(sql_text)
        conn.commit()
    finally:
        conn.close()
