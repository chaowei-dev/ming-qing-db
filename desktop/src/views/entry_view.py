from __future__ import annotations

from typing import List, Dict, Any, Optional

from PyQt6.QtCore import QAbstractTableModel, QModelIndex, Qt, QVariant
from PyQt6.QtWidgets import QWidget, QVBoxLayout, QTableView, QMessageBox

from models.database import get_engine


class _EntriesTableModel(QAbstractTableModel):
    def __init__(self, rows: List[Dict[str, Any]]):
        super().__init__()
        self._rows = rows
        self._headers = [
            ("id", "ID"),
            ("entry_name", "篇目"),
            ("roll_id", "卷 ID"),
            ("remarks", "備註"),
        ]

    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:  # type: ignore[override]
        return 0 if parent.isValid() else len(self._rows)

    def columnCount(self, parent: QModelIndex = QModelIndex()) -> int:  # type: ignore[override]
        return 0 if parent.isValid() else len(self._headers)

    def data(self, index: QModelIndex, role: int = Qt.ItemDataRole.DisplayRole) -> Any:  # type: ignore[override]
        if not index.isValid() or not (0 <= index.row() < len(self._rows)):
            return QVariant()
        if role not in (Qt.ItemDataRole.DisplayRole, Qt.ItemDataRole.EditRole):
            return QVariant()
        key = self._headers[index.column()][0]
        return self._rows[index.row()].get(key, "")

    def headerData(self, section: int, orientation: Qt.Orientation, role: int = Qt.ItemDataRole.DisplayRole):  # type: ignore[override]
        if role != Qt.ItemDataRole.DisplayRole:
            return QVariant()
        if orientation == Qt.Orientation.Horizontal:
            return self._headers[section][1]
        return section + 1

    def update_rows(self, rows: List[Dict[str, Any]]) -> None:
        self.beginResetModel()
        self._rows = rows
        self.endResetModel()


class EntryView(QWidget):
    def __init__(self, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)
        self._engine = get_engine()

        self._table = QTableView(self)
        self._model = _EntriesTableModel([])
        self._table.setModel(self._model)

        layout = QVBoxLayout(self)
        layout.addWidget(self._table)

        self.reload()

    def _fetch_entries(self) -> List[Dict[str, Any]]:
        sql = (
            "SELECT id, entry_name, roll_id, COALESCE(remarks, '') AS remarks "
            "FROM entries ORDER BY id DESC LIMIT 500"
        )
        with self._engine.connect() as conn:
            rows = [dict(r._mapping) for r in conn.execute(sql)]  # type: ignore[attr-defined]
        return rows

    def reload(self) -> None:
        try:
            self._model.update_rows(self._fetch_entries())
        except Exception as exc:
            QMessageBox.critical(self, "讀取失敗", f"讀取篇目時發生錯誤：{exc}")
