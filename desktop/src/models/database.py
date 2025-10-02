from __future__ import annotations

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine


_engine: Engine = create_engine(
    "sqlite:///data/database.db",
    future=True,
    pool_pre_ping=True,
    connect_args={"timeout": 5},  # busy_timeout is also set via PRAGMA
)


@event.listens_for(_engine, "connect")
def _set_sqlite_pragmas(dbapi_conn, _):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    cursor.execute("PRAGMA busy_timeout=5000;")
    cursor.close()


def get_engine() -> Engine:
    """Return the singleton Engine instance for the application."""
    return _engine
