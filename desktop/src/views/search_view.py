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
    QComboBox,
)

from models.database import get_engine
from sqlalchemy import text


class _SearchResultModel(QAbstractTableModel):
    def __init__(self, rows: List[Dict[str, Any]]):
        super().__init__()
        self._rows = rows
        self._headers = [
            # ("id", "編號"),
            ("entry_name", "篇目"),
            ("book_title", "書名"),
            ("book_author", "作者"),
            ("roll", "卷"),
            ("roll_name", "卷名"),
            ("category_name", "類別"),
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


class SearchView(QWidget):
    def __init__(self, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)
        self._engine = get_engine()

        # Filters
        self._title_in = QLineEdit(self)
        self._author_in = QLineEdit(self)
        self._roll_in = QLineEdit(self)
        self._entry_in = QLineEdit(self)
        self._category_cb = QComboBox(self)
        self._search_btn = QPushButton("搜尋", self)
        self._search_btn.clicked.connect(self.search)

        self._load_categories()

        row1 = QHBoxLayout()
        row1.addWidget(QLabel("類別"))
        row1.addWidget(self._category_cb)
        row1.addWidget(QLabel("書名"))
        row1.addWidget(self._title_in)

        row2 = QHBoxLayout()
        row2.addWidget(QLabel("作者"))
        row2.addWidget(self._author_in)
        row2.addWidget(QLabel("卷"))
        row2.addWidget(self._roll_in)

        row3 = QHBoxLayout()
        row3.addWidget(QLabel("篇目"))
        row3.addWidget(self._entry_in)
        row3.addWidget(self._search_btn)

        # Results
        self._table = QTableView(self)
        self._model = _SearchResultModel([])
        self._table.setModel(self._model)

        layout = QVBoxLayout(self)
        layout.addLayout(row1)
        layout.addLayout(row2)
        layout.addLayout(row3)
        layout.addWidget(self._table)

    def _query_results(self, title: str, author: str, roll: str, entry: str) -> List[Dict[str, Any]]:
        # Text filters combined by OR; category filter (if any) combined by AND
        text_where: List[str] = []
        params: Dict[str, Any] = {}
        if title:
            text_where.append("b.title LIKE :title")
            params["title"] = f"%{title}%"
        if author:
            text_where.append("b.author LIKE :author")
            params["author"] = f"%{author}%"
        if roll:
            text_where.append("r.roll LIKE :roll OR r.roll_name LIKE :roll")
            params["roll"] = f"%{roll}%"
        if entry:
            text_where.append("e.entry_name LIKE :entry")
            params["entry"] = f"%{entry}%"

        where_parts: List[str] = []
        if text_where:
            where_parts.append("(" + " OR ".join(text_where) + ")")

        cat_id = self._category_cb.currentData()
        if cat_id is not None:
            where_parts.append("b.category_id = :cat_id")
            params["cat_id"] = int(cat_id)

        clauses = (" WHERE " + " AND ".join(where_parts)) if where_parts else ""
        sql = (
            "SELECT e.id AS id, e.entry_name, "
            "b.title AS book_title, b.author AS book_author, "
            "r.roll, r.roll_name, "
            "COALESCE(c.name, '') AS category_name, "
            "COALESCE(e.remarks, '') AS remarks "
            "FROM entries e "
            "JOIN rolls r ON e.roll_id = r.id "
            "JOIN books b ON r.book_id = b.id "
            "LEFT JOIN categories c ON b.category_id = c.id" + clauses + " "
            "ORDER BY b.title, r.roll LIMIT 1000"
        )
        with self._engine.connect() as conn:
            rows = [dict(r._mapping) for r in conn.execute(text(sql), params)]  # type: ignore[attr-defined]
        return rows

    def _load_categories(self) -> None:
        self._category_cb.clear()
        self._category_cb.addItem("全部", None)
        sql = "SELECT id, name FROM categories ORDER BY name"
        with self._engine.connect() as conn:
            for r in conn.execute(text(sql)):
                d = dict(r._mapping)  # type: ignore[attr-defined]
                self._category_cb.addItem(d["name"], d["id"])

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
