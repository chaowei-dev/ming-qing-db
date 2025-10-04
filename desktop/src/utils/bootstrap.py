from __future__ import annotations

from pathlib import Path
from models.database import get_engine
from .paths import get_database_path, get_resource_path


def initialize_database_if_needed() -> None:
    """Create the SQLite database and run init.sql if the DB file is missing.

    This function is idempotent. It checks for the existence of the user data
    database path and, if absent, executes the bundled init.sql once to create
    schema and indexes.
    """
    db_path = get_database_path()
    if db_path.exists():
        return

    db_path.parent.mkdir(parents=True, exist_ok=True)

    init_sql_path = get_resource_path("database", "init.sql")
    sql_text = init_sql_path.read_text(encoding="utf-8")

    engine = get_engine()
    conn = engine.raw_connection()
    try:
        conn.executescript(sql_text)
        conn.commit()
    finally:
        conn.close()
