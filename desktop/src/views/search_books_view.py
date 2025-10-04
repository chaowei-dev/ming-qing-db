from __future__ import annotations

from typing import List, Dict, Any, Optional

from PyQt6.QtCore import QAbstractTableModel, QModelIndex, Qt, QVariant
from PyQt6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QTableView,
    QPushButton,
    QMessageBox,
    QLineEdit,
    QComboBox,
    QLabel,
    QSizePolicy,
    QCheckBox,
    QHeaderView,
)

from models.database import get_engine
from sqlalchemy import text


class _BookSearchResultModel(QAbstractTableModel):
    def __init__(self, rows: List[Dict[str, Any]]):
        super().__init__()
        self._rows = rows
        self._headers = [
            ("title", "書名"),
            ("author", "作者"),
            ("version", "版本"),
            ("source", "來源"),
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


class SearchBookView(QWidget):
    def __init__(self, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)
        self._engine = get_engine()

        # Filters
        self._title_in = QLineEdit(self)
        self._author_in = QLineEdit(self)
        self._version_in = QLineEdit(self)
        self._source_in = QLineEdit(self)
        self._category_cb = QComboBox(self)
        self._keyword_in = QLineEdit(self)
        self._keyword_toggle = QCheckBox(self)
        self._search_btn = QPushButton("搜尋", self)
        self._search_btn.clicked.connect(self.search)
        self._search_btn.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        self._keyword_toggle.toggled.connect(self._on_keyword_toggle)
        self._keyword_toggle.setToolTip("使用全域搜尋模式")

        # Make disabled inputs visually obvious
        self.setStyleSheet(
            "QLineEdit:disabled { background-color: #f2f2f2; color: #888888; }"
        )

        # Default placeholders
        self._title_in.setPlaceholderText("輸入書名")
        self._author_in.setPlaceholderText("輸入作者")
        self._version_in.setPlaceholderText("輸入版本")
        self._source_in.setPlaceholderText("輸入來源")
        self._keyword_in.setPlaceholderText("輸入全域搜尋關鍵字")

        self._load_categories()

        # input rows (aligned labels/inputs)
        label_width = 72
        input_width = 320
        combo_width = input_width
        keyword_width = input_width
        mid_gap = 24

        lbl_cat = QLabel("類別")
        lbl_cat.setFixedWidth(label_width)
        self._category_cb.setFixedWidth(combo_width)

        lbl_kw = QLabel("全域搜尋")
        lbl_kw.setFixedWidth(label_width)
        self._keyword_in.setFixedWidth(keyword_width)

        lbl_title = QLabel("書名")
        lbl_title.setFixedWidth(label_width)
        self._title_in.setFixedWidth(input_width)

        lbl_author = QLabel("作者")
        lbl_author.setFixedWidth(label_width)
        self._author_in.setFixedWidth(input_width)

        lbl_version = QLabel("版本")
        lbl_version.setFixedWidth(label_width)
        self._version_in.setFixedWidth(input_width)

        lbl_source = QLabel("來源")
        lbl_source.setFixedWidth(label_width)
        self._source_in.setFixedWidth(input_width)

        row1 = QHBoxLayout()
        row1.addWidget(lbl_cat)
        row1.addWidget(self._category_cb)
        row1.addSpacing(mid_gap)
        row1.addWidget(lbl_kw)
        row1.addWidget(self._keyword_in)
        row1.addWidget(self._keyword_toggle)
        row1.addStretch(1)

        row2 = QHBoxLayout()
        row2.addWidget(lbl_title)
        row2.addWidget(self._title_in)
        row2.addSpacing(mid_gap)
        row2.addWidget(lbl_author)
        row2.addWidget(self._author_in)
        row2.addStretch(1)

        row3 = QHBoxLayout()
        row3.addWidget(lbl_version)
        row3.addWidget(self._version_in)
        row3.addSpacing(mid_gap)
        row3.addWidget(lbl_source)
        row3.addWidget(self._source_in)
        row3.addStretch(1)

        row4 = QHBoxLayout()
        row4.addWidget(self._search_btn)

        # Results
        self._table = QTableView(self)
        self._model = _BookSearchResultModel([])
        self._table.setModel(self._model)
        header = self._table.horizontalHeader()
        header.setSectionResizeMode(QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)

        layout = QVBoxLayout(self)
        layout.addLayout(row1)
        layout.addLayout(row2)
        layout.addLayout(row3)
        layout.addLayout(row4)
        layout.addWidget(self._table)

        self._keyword_toggle.setChecked(False)
        self._on_keyword_toggle(False)

    def _load_categories(self) -> None:
        self._category_cb.clear()
        self._category_cb.addItem("全部", None)
        sql = "SELECT id, name FROM categories ORDER BY name"
        with self._engine.connect() as conn:
            for r in conn.execute(text(sql)):
                d = dict(r._mapping)  # type: ignore[attr-defined]
                self._category_cb.addItem(d["name"], d["id"])

    def _query_results(self, title: str, author: str, version: str, source: str, keyword: str) -> List[Dict[str, Any]]:
        text_where: List[str] = []
        params: Dict[str, Any] = {}
        if title:
            text_where.append("b.title LIKE :title")
            params["title"] = f"%{title}%"
        if author:
            text_where.append("b.author LIKE :author")
            params["author"] = f"%{author}%"
        if version:
            text_where.append("b.version LIKE :version")
            params["version"] = f"%{version}%"
        if source:
            text_where.append("b.source LIKE :source")
            params["source"] = f"%{source}%"

        where_parts: List[str] = []
        if text_where:
            where_parts.append("(" + " OR ".join(text_where) + ")")

        if keyword:
            where_parts.append(
                "(b.title LIKE :kw OR b.author LIKE :kw OR b.version LIKE :kw OR b.source LIKE :kw)"
            )
            params["kw"] = f"%{keyword}%"

        cat_id = self._category_cb.currentData()
        if cat_id is not None:
            where_parts.append("b.category_id = :cat_id")
            params["cat_id"] = int(cat_id)

        clauses = (" WHERE " + " AND ".join(where_parts)) if where_parts else ""
        sql = (
            "SELECT b.title, b.author, b.version, b.source, "
            "COALESCE(c.name, '') AS category_name, "
            "COALESCE(b.remarks, '') AS remarks "
            "FROM books b LEFT JOIN categories c ON b.category_id = c.id" + clauses + " "
            "ORDER BY b.title, b.author, b.version, b.source LIMIT 1000"
        )
        with self._engine.connect() as conn:
            rows = [dict(r._mapping) for r in conn.execute(text(sql), params)]  # type: ignore[attr-defined]
        return rows

    def _on_keyword_toggle(self, enabled: bool) -> None:
        self._keyword_in.setEnabled(enabled)
        self._title_in.setEnabled(not enabled)
        self._author_in.setEnabled(not enabled)
        self._version_in.setEnabled(not enabled)
        self._source_in.setEnabled(not enabled)

        if enabled:
            self._keyword_in.setPlaceholderText("輸入全域搜尋關鍵字")
            self._title_in.setPlaceholderText("全域搜尋中停用")
            self._author_in.setPlaceholderText("全域搜尋中停用")
            self._version_in.setPlaceholderText("全域搜尋中停用")
            self._source_in.setPlaceholderText("全域搜尋中停用")
        else:
            self._keyword_in.setPlaceholderText("勾選全域搜尋以啟用")
            self._title_in.setPlaceholderText("輸入書名")
            self._author_in.setPlaceholderText("輸入作者")
            self._version_in.setPlaceholderText("輸入版本")
            self._source_in.setPlaceholderText("輸入來源")

    def search(self) -> None:
        try:
            title = self._title_in.text().strip() if self._title_in.isEnabled() else ""
            author = self._author_in.text().strip() if self._author_in.isEnabled() else ""
            version = self._version_in.text().strip() if self._version_in.isEnabled() else ""
            source = self._source_in.text().strip() if self._source_in.isEnabled() else ""
            keyword = self._keyword_in.text().strip() if self._keyword_in.isEnabled() else ""

            rows = self._query_results(title, author, version, source, keyword)
            self._model.update_rows(rows)
        except Exception as exc:
            QMessageBox.critical(self, "搜尋失敗", f"無法搜尋：{exc}")


