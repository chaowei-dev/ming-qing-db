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
    QSizePolicy,
    QCheckBox,
    QHeaderView,
)

from models.database import get_engine
from sqlalchemy import text


class _SearchResultModel(QAbstractTableModel):
    def __init__(self, rows: List[Dict[str, Any]]):
        super().__init__()
        self._rows = rows
        self._row_offset = 0
        self._headers = [
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
        # Global row numbering across pages
        return self._row_offset + section + 1

    def update_rows(self, rows: List[Dict[str, Any]], row_offset: int = 0) -> None:
        self.beginResetModel()
        self._rows = rows
        self._row_offset = int(row_offset)
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
        self._keyword_in = QLineEdit(self)
        self._keyword_toggle = QCheckBox(self)
        self._search_btn = QPushButton("搜尋", self)
        self._search_btn.clicked.connect(self.search)
        self._search_btn.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        self._keyword_toggle.toggled.connect(self._on_keyword_toggle)
        self._keyword_toggle.setToolTip("使用全域搜尋模式")
        # Enter key triggers search
        self._title_in.returnPressed.connect(self.search)
        self._author_in.returnPressed.connect(self.search)
        self._roll_in.returnPressed.connect(self.search)
        self._entry_in.returnPressed.connect(self.search)
        self._keyword_in.returnPressed.connect(self.search)

        # Pagination controls
        self._page_size_cb = QComboBox(self)
        self._page_size_cb.addItems(["100", "500", "1000"])
        self._page_size_cb.setCurrentText("1000")
        self._prev_btn = QPushButton("上一頁", self)
        self._next_btn = QPushButton("下一頁", self)
        self._page_info = QLabel("", self)
        self._page_select_cb = QComboBox(self)
        self._prev_btn.clicked.connect(self._go_prev)
        self._next_btn.clicked.connect(self._go_next)
        self._page_size_cb.currentIndexChanged.connect(self._on_page_size_change)
        self._page_select_cb.currentIndexChanged.connect(self._on_page_select_change)

        # Pagination state
        self._total_count: int = 0
        self._current_page: int = 0
        self._last_filters: Optional[Dict[str, Any]] = None

        # Make disabled inputs visually obvious
        self.setStyleSheet(
            "QLineEdit:disabled { background-color: #f2f2f2; color: #888888; }"
        )

        # Default placeholders
        self._title_in.setPlaceholderText("輸入書名")
        self._author_in.setPlaceholderText("輸入作者")
        self._roll_in.setPlaceholderText("輸入卷或卷名")
        self._entry_in.setPlaceholderText("輸入篇目")
        self._keyword_in.setPlaceholderText("輸入全域搜尋關鍵字")

        self._load_categories()

        # input rows (aligned labels/inputs)
        label_width = 72
        input_width = 320
        combo_width = input_width
        keyword_width = input_width
        mid_gap = 24  # extra horizontal space between left and right groups

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

        lbl_roll = QLabel("卷")
        lbl_roll.setFixedWidth(label_width)
        self._roll_in.setFixedWidth(input_width)

        lbl_entry = QLabel("篇目")
        lbl_entry.setFixedWidth(label_width)
        self._entry_in.setFixedWidth(input_width)

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
        row3.addWidget(lbl_roll)
        row3.addWidget(self._roll_in)
        row3.addSpacing(mid_gap)
        row3.addWidget(lbl_entry)
        row3.addWidget(self._entry_in)
        row3.addStretch(1)

        row4 = QHBoxLayout()
        row4.addWidget(self._search_btn)

        # Results
        self._table = QTableView(self)
        self._model = _SearchResultModel([])
        self._table.setModel(self._model)
        header = self._table.horizontalHeader()
        header.setSectionResizeMode(QHeaderView.ResizeMode.ResizeToContents)
        # Make 篇目(0) 和 書名(1) take most remaining width
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)

        layout = QVBoxLayout(self)
        layout.addLayout(row1)
        layout.addLayout(row2)
        layout.addLayout(row3)
        layout.addLayout(row4)
        # Pagination row (每頁/上一頁/下一頁/資訊)
        row5 = QHBoxLayout()
        row5.addWidget(QLabel("每頁", self))
        row5.addWidget(self._page_size_cb)
        row5.addSpacing(16)
        row5.addWidget(self._prev_btn)
        row5.addWidget(self._page_select_cb)
        row5.addWidget(self._next_btn)
        row5.addSpacing(16)
        row5.addWidget(self._page_info)
        row5.addStretch(1)
        layout.addLayout(row5)
        layout.addWidget(self._table)

        # default: 關鍵字模式關閉（只用單項欄位），故停用關鍵字輸入
        self._keyword_toggle.setChecked(False)
        self._on_keyword_toggle(False)
        self._update_nav_state()

    def _build_where(self, filters: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        # Text filters combined by OR; category filter (if any) combined by AND
        text_where: List[str] = []
        params: Dict[str, Any] = {}
        title = filters.get("title", "")
        author = filters.get("author", "")
        roll = filters.get("roll", "")
        entry = filters.get("entry", "")
        keyword = filters.get("keyword", "")
        cat_id = filters.get("cat_id", None)

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

        if keyword:
            where_parts.append(
                "(b.title LIKE :kw OR b.author LIKE :kw OR r.roll LIKE :kw OR r.roll_name LIKE :kw OR e.entry_name LIKE :kw OR e.remarks LIKE :kw)"
            )
            params["kw"] = f"%{keyword}%"

        if cat_id is not None:
            where_parts.append("b.category_id = :cat_id")
            params["cat_id"] = int(cat_id)

        clauses = (" WHERE " + " AND ".join(where_parts)) if where_parts else ""
        return clauses, params

    def _count_results(self, filters: Dict[str, Any]) -> int:
        clauses, params = self._build_where(filters)
        sql = (
            "SELECT COUNT(1) AS cnt "
            "FROM entries e "
            "JOIN rolls r ON e.roll_id = r.id "
            "JOIN books b ON r.book_id = b.id "
            "LEFT JOIN categories c ON b.category_id = c.id" + clauses
        )
        with self._engine.connect() as conn:
            row = conn.execute(text(sql), params).mappings().first()
            return int(row["cnt"]) if row is not None else 0

    def _query_results(self, filters: Dict[str, Any], limit: int, offset: int) -> List[Dict[str, Any]]:
        clauses, params = self._build_where(filters)
        params = {**params, "limit": int(limit), "offset": int(offset)}
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
            "ORDER BY b.title, r.roll LIMIT :limit OFFSET :offset"
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

    def _on_keyword_toggle(self, enabled: bool) -> None:
        # 關鍵字模式：僅允許輸入關鍵字，其餘文字欄位停用；類別仍可使用
        self._keyword_in.setEnabled(enabled)
        self._title_in.setEnabled(not enabled)
        self._author_in.setEnabled(not enabled)
        self._roll_in.setEnabled(not enabled)
        self._entry_in.setEnabled(not enabled)

        # Update placeholders so the state is obvious at a glance
        if enabled:
            self._keyword_in.setPlaceholderText("輸入全域搜尋關鍵字")
            self._title_in.setPlaceholderText("全域搜尋中停用")
            self._author_in.setPlaceholderText("全域搜尋中停用")
            self._roll_in.setPlaceholderText("全域搜尋中停用")
            self._entry_in.setPlaceholderText("全域搜尋式中停用")
        else:
            self._keyword_in.setPlaceholderText("勾選全域搜尋以啟用")
            self._title_in.setPlaceholderText("輸入書名")
            self._author_in.setPlaceholderText("輸入作者")
            self._roll_in.setPlaceholderText("輸入卷或卷名")
            self._entry_in.setPlaceholderText("輸入篇目")

    def search(self) -> None:
        try:
            self._run_search(reset_page=True)
        except Exception as exc:
            QMessageBox.critical(self, "搜尋失敗", f"無法搜尋：{exc}")

    def _collect_filters(self) -> Dict[str, Any]:
        title = self._title_in.text().strip() if self._title_in.isEnabled() else ""
        author = self._author_in.text().strip() if self._author_in.isEnabled() else ""
        roll = self._roll_in.text().strip() if self._roll_in.isEnabled() else ""
        entry = self._entry_in.text().strip() if self._entry_in.isEnabled() else ""
        keyword = self._keyword_in.text().strip() if self._keyword_in.isEnabled() else ""
        cat_id = self._category_cb.currentData()
        return {
            "title": title,
            "author": author,
            "roll": roll,
            "entry": entry,
            "keyword": keyword,
            "cat_id": cat_id,
        }

    def _current_page_size(self) -> int:
        try:
            return int(self._page_size_cb.currentText())
        except Exception:
            return 100

    def _run_search(self, reset_page: bool) -> None:
        if reset_page or self._last_filters is None:
            self._last_filters = self._collect_filters()
            self._current_page = 0
        assert self._last_filters is not None
        page_size = self._current_page_size()
        self._total_count = self._count_results(self._last_filters)
        offset = self._current_page * page_size
        rows = self._query_results(self._last_filters, page_size, offset)
        self._model.update_rows(rows, row_offset=offset)
        self._update_nav_state()
        try:
            # scroll to top after data reload
            self._table.scrollToTop()
        except Exception:
            pass

    def _update_nav_state(self) -> None:
        page_size = self._current_page_size()
        total = self._total_count
        if total <= 0:
            self._page_info.setText("共 0 筆")
            self._prev_btn.setEnabled(False)
            self._next_btn.setEnabled(False)
            self._page_select_cb.blockSignals(True)
            self._page_select_cb.clear()
            self._page_select_cb.blockSignals(False)
            self._page_select_cb.setEnabled(False)
            return
        total_pages = (total + page_size - 1) // page_size
        current_display_page = self._current_page + 1
        start = self._current_page * page_size + 1
        end = min(total, (self._current_page + 1) * page_size)
        self._page_info.setText(f"第 {current_display_page}/{total_pages} 頁（顯示 {start}-{end} / 共 {total} 筆）")
        self._prev_btn.setEnabled(self._current_page > 0)
        self._next_btn.setEnabled(self._current_page + 1 < total_pages)
        # Populate page selector without triggering change handler
        self._page_select_cb.blockSignals(True)
        self._page_select_cb.setEnabled(True)
        if self._page_select_cb.count() != total_pages:
            self._page_select_cb.clear()
            for i in range(1, total_pages + 1):
                self._page_select_cb.addItem(str(i))
        if 0 <= self._current_page < total_pages:
            self._page_select_cb.setCurrentIndex(self._current_page)
        self._page_select_cb.blockSignals(False)

    def _on_page_size_change(self) -> None:
        # Changing page size resets to first page, keeping current filters
        try:
            self._run_search(reset_page=True)
        except Exception as exc:
            QMessageBox.critical(self, "分頁變更失敗", f"無法變更每頁筆數：{exc}")

    def _go_prev(self) -> None:
        if self._current_page <= 0:
            return
        self._current_page -= 1
        try:
            self._run_search(reset_page=False)
        except Exception as exc:
            QMessageBox.critical(self, "分頁失敗", f"無法前往上一頁：{exc}")

    def _go_next(self) -> None:
        page_size = self._current_page_size()
        total_pages = (self._total_count + page_size - 1) // page_size
        if self._current_page + 1 >= total_pages:
            return
        self._current_page += 1
        try:
            self._run_search(reset_page=False)
        except Exception as exc:
            QMessageBox.critical(self, "分頁失敗", f"無法前往下一頁：{exc}")

    def _on_page_select_change(self) -> None:
        index = self._page_select_cb.currentIndex()
        if index < 0:
            return
        if index == self._current_page:
            return
        self._current_page = index
        try:
            self._run_search(reset_page=False)
        except Exception as exc:
            QMessageBox.critical(self, "分頁失敗", f"無法跳轉頁面：{exc}")


