from __future__ import annotations

from typing import List, Dict, Any, Optional

from PyQt6.QtCore import QAbstractTableModel, QModelIndex, Qt, QVariant
from PyQt6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QTableView,
    QLineEdit,
    QPushButton,
    QLabel,
    QMessageBox,
)

from models.database import get_engine


class _SearchResultModel(QAbstractTableModel):
    def __init__(self, rows: List[Dict[str, Any]]):
        super().__init__()
        self._rows = rows
        self._headers = [
            ("book_title", "書名"),
            ("book_author", "作者"),
            ("roll", "卷"),
            ("roll_name", "卷名"),
            ("entry_name", "篇目"),
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


class SearchView(QWidget):
    def __init__(self, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)
        self._engine = get_engine()

        # Filters
        self._title_in = QLineEdit(self)
        self._author_in = QLineEdit(self)
        self._roll_in = QLineEdit(self)
        self._entry_in = QLineEdit(self)
        self._search_btn = QPushButton("搜尋", self)
        self._search_btn.clicked.connect(self.search)

        filters = QHBoxLayout()
        filters.addWidget(QLabel("書名"))
        filters.addWidget(self._title_in)
        filters.addWidget(QLabel("作者"))
        filters.addWidget(self._author_in)
        filters.addWidget(QLabel("卷"))
        filters.addWidget(self._roll_in)
        filters.addWidget(QLabel("篇目"))
        filters.addWidget(self._entry_in)
        filters.addWidget(self._search_btn)

        # Results
        self._table = QTableView(self)
        self._model = _SearchResultModel([])
        self._table.setModel(self._model)

        layout = QVBoxLayout(self)
        layout.addLayout(filters)
        layout.addWidget(self._table)

    def _query_results(self, title: str, author: str, roll: str, entry: str) -> List[Dict[str, Any]]:
        # OR search among fields, empty filters ignored
        where = []
        params: Dict[str, Any] = {}
        if title:
            where.append("b.title LIKE :title")
            params["title"] = f"%{title}%"
        if author:
            where.append("b.author LIKE :author")
            params["author"] = f"%{author}%"
        if roll:
            where.append("r.roll LIKE :roll OR r.roll_name LIKE :roll")
            params["roll"] = f"%{roll}%"
        if entry:
            where.append("e.entry_name LIKE :entry")
            params["entry"] = f"%{entry}%"

        clauses = (" WHERE " + " OR ".join(where)) if where else ""
        sql = (
            "SELECT b.title AS book_title, b.author AS book_author, "
            "r.roll, r.roll_name, e.entry_name "
            "FROM entries e "
            "JOIN rolls r ON e.roll_id = r.id "
            "JOIN books b ON r.book_id = b.id" + clauses + " "
            "ORDER BY b.title, r.roll LIMIT 1000"
        )
        with self._engine.connect() as conn:
            rows = [dict(r._mapping) for r in conn.execute(sql, params)]  # type: ignore[attr-defined]
        return rows

    def search(self) -> None:
        try:
            rows = self._query_results(
                self._title_in.text().strip(),
                self._author_in.text().strip(),
                self._roll_in.text().strip(),
                self._entry_in.text().strip(),
            )
            self._model.update_rows(rows)
        except Exception as exc:
            QMessageBox.critical(self, "搜尋失敗", f"無法搜尋：{exc}")
