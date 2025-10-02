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
    QDialog,
    QFormLayout,
    QLineEdit,
    QDialogButtonBox,
    QComboBox,
)

from models.database import get_engine
from sqlalchemy import text


class _BooksTableModel(QAbstractTableModel):
    def __init__(self, rows: List[Dict[str, Any]]):
        super().__init__()
        self._rows = rows
        self._headers = [
            ("id", "ID"),
            ("title", "標題"),
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

    def get_row(self, row: int) -> Dict[str, Any]:
        return self._rows[row]

    def update_rows(self, rows: List[Dict[str, Any]]) -> None:
        self.beginResetModel()
        self._rows = rows
        self.endResetModel()


class _BookDialog(QDialog):
    def __init__(self, engine, parent: Optional[QWidget] = None, init_values: Optional[Dict[str, Any]] = None):
        super().__init__(parent)
        self.setWindowTitle("書籍")
        self._engine = engine

        self.title_edit = QLineEdit(self)
        self.author_edit = QLineEdit(self)
        self.version_edit = QLineEdit(self)
        self.source_edit = QLineEdit(self)
        self.remarks_edit = QLineEdit(self)
        self.category_cb = QComboBox(self)

        self._load_categories()

        if init_values:
            self.title_edit.setText(init_values.get("title", ""))
            self.author_edit.setText(init_values.get("author", ""))
            self.version_edit.setText(init_values.get("version", ""))
            self.source_edit.setText(init_values.get("source", ""))
            self.remarks_edit.setText(init_values.get("remarks", ""))
            # set category selection
            init_cat_id = init_values.get("category_id")
            if init_cat_id is None:
                self.category_cb.setCurrentIndex(0)
            else:
                for i in range(self.category_cb.count()):
                    if self.category_cb.itemData(i) == init_cat_id:
                        self.category_cb.setCurrentIndex(i)
                        break

        form = QFormLayout()
        form.addRow("標題", self.title_edit)
        form.addRow("作者", self.author_edit)
        form.addRow("版本", self.version_edit)
        form.addRow("來源", self.source_edit)
        form.addRow("類別", self.category_cb)
        form.addRow("備註", self.remarks_edit)

        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel, self)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)

        layout = QVBoxLayout(self)
        layout.addLayout(form)
        layout.addWidget(buttons)

    def _load_categories(self) -> None:
        # First item: no category
        self.category_cb.clear()
        self.category_cb.addItem("（未分類）", None)
        sql = "SELECT id, name FROM categories ORDER BY name"
        with self._engine.connect() as conn:
            for r in conn.execute(text(sql)):
                d = dict(r._mapping)  # type: ignore[attr-defined]
                self.category_cb.addItem(d["name"], d["id"])

    def get_values(self) -> Dict[str, Any]:
        return {
            "title": self.title_edit.text().strip(),
            "author": self.author_edit.text().strip(),
            "version": self.version_edit.text().strip(),
            "source": self.source_edit.text().strip(),
            "category_id": self.category_cb.currentData(),
            "remarks": self.remarks_edit.text().strip() or None,
        }


class BookView(QWidget):
    def __init__(self, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)
        self._engine = get_engine()

        self._table = QTableView(self)
        self._model = _BooksTableModel([])
        self._table.setModel(self._model)
        self._table.setSelectionBehavior(QTableView.SelectionBehavior.SelectRows)
        self._table.setSelectionMode(QTableView.SelectionMode.SingleSelection)
        self._table.setEditTriggers(QTableView.EditTrigger.NoEditTriggers)

        self._btn_reload = QPushButton("重新整理", self)
        self._btn_add = QPushButton("新增", self)
        self._btn_edit = QPushButton("編輯", self)
        self._btn_delete = QPushButton("刪除", self)

        self._btn_reload.clicked.connect(self.reload)
        self._btn_add.clicked.connect(self.add_book)
        self._btn_edit.clicked.connect(self.edit_selected)
        self._btn_delete.clicked.connect(self.delete_selected)

        btns = QHBoxLayout()
        btns.addWidget(self._btn_reload)
        btns.addStretch(1)
        btns.addWidget(self._btn_add)
        btns.addWidget(self._btn_edit)
        btns.addWidget(self._btn_delete)

        layout = QVBoxLayout(self)
        layout.addLayout(btns)
        layout.addWidget(self._table)

        self.reload()

    # Data operations
    def _fetch_books(self) -> List[Dict[str, Any]]:
        sql = (
            "SELECT b.id, b.title, b.author, b.version, b.source, "
            "b.category_id, COALESCE(c.name, '') AS category_name, "
            "COALESCE(b.remarks, '') AS remarks "
            "FROM books b LEFT JOIN categories c ON b.category_id = c.id "
            "ORDER BY b.title, b.author, b.version, b.source"
        )
        with self._engine.connect() as conn:
            rows = [dict(r._mapping) for r in conn.execute(text(sql))]  # type: ignore[attr-defined]
        return rows

    def reload(self) -> None:
        try:
            self._model.update_rows(self._fetch_books())
        except Exception as exc:
            QMessageBox.critical(self, "讀取失敗", f"讀取書籍時發生錯誤：{exc}")

    def add_book(self) -> None:
        dlg = _BookDialog(self._engine, self)
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return
        values = dlg.get_values()
        if not all(values[k] for k in ("title", "author", "version", "source")):
            QMessageBox.warning(self, "輸入不完整", "請填寫標題、作者、版本、來源。")
            return
        sql = (
            "INSERT INTO books(title, author, version, source, category_id, remarks) "
            "VALUES (:title, :author, :version, :source, :category_id, :remarks)"
        )
        try:
            with self._engine.begin() as conn:
                conn.execute(text(sql), values)
        except Exception as exc:
            QMessageBox.critical(self, "新增失敗", f"無法新增書籍：{exc}")
            return
        self.reload()

    def _selected_row(self) -> Optional[int]:
        indexes = self._table.selectionModel().selectedRows()
        if not indexes:
            return None
        return indexes[0].row()

    def edit_selected(self) -> None:
        row = self._selected_row()
        if row is None:
            QMessageBox.information(self, "未選擇", "請先選擇一筆書籍。")
            return
        data = self._model.get_row(row)
        dlg = _BookDialog(self._engine, self, init_values=data)
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return
        values = dlg.get_values()
        values["id"] = data["id"]
        sql = (
            "UPDATE books SET title=:title, author=:author, version=:version, "
            "source=:source, category_id=:category_id, remarks=:remarks WHERE id=:id"
        )
        try:
            with self._engine.begin() as conn:
                conn.execute(text(sql), values)
        except Exception as exc:
            QMessageBox.critical(self, "更新失敗", f"無法更新書籍：{exc}")
            return
        self.reload()

    def delete_selected(self) -> None:
        row = self._selected_row()
        if row is None:
            QMessageBox.information(self, "未選擇", "請先選擇一筆書籍。")
            return
        data = self._model.get_row(row)
        if QMessageBox.question(self, "確認刪除", f"確定要刪除「{data['title']}」嗎？") != QMessageBox.StandardButton.Yes:
            return
        sql = "DELETE FROM books WHERE id=:id"
        try:
            with self._engine.begin() as conn:
                conn.execute(text(sql), {"id": data["id"]})
        except Exception as exc:
            QMessageBox.critical(self, "刪除失敗", f"無法刪除書籍：{exc}")
            return
        self.reload()
