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
    QInputDialog,
)

from models.database import get_engine


class _CategoryTableModel(QAbstractTableModel):
    def __init__(self, rows: List[Dict[str, Any]]):
        super().__init__()
        self._rows = rows
        self._headers = [
            ("id", "ID"),
            ("name", "名稱"),
            ("created_at", "建立時間"),
            ("updated_at", "更新時間"),
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

    def get_row(self, row: int) -> Optional[Dict[str, Any]]:
        if 0 <= row < len(self._rows):
            return self._rows[row]
        return None

    def update_rows(self, rows: List[Dict[str, Any]]) -> None:
        self.beginResetModel()
        self._rows = rows
        self.endResetModel()


class CategoryView(QWidget):
    def __init__(self, parent: Optional[Widget] = None) -> None:  # type: ignore[name-defined]
        super().__init__(parent)
        self._engine = get_engine()

        self._table = QTableView(self)
        self._model = _CategoryTableModel([])
        self._table.setModel(self._model)
        self._table.setSelectionBehavior(QTableView.SelectionBehavior.SelectRows)
        self._table.setSelectionMode(QTableView.SelectionMode.SingleSelection)

        self._btn_refresh = QPushButton("重新整理", self)
        self._btn_add = QPushButton("新增", self)
        self._btn_edit = QPushButton("編輯", self)
        self._btn_delete = QPushButton("刪除", self)

        self._btn_refresh.clicked.connect(self.refresh)
        self._btn_add.clicked.connect(self.add_category)
        self._btn_edit.clicked.connect(self.edit_category)
        self._btn_delete.clicked.connect(self.delete_category)

        btns = QHBoxLayout()
        btns.addWidget(self._btn_refresh)
        btns.addStretch(1)
        btns.addWidget(self._btn_add)
        btns.addWidget(self._btn_edit)
        btns.addWidget(self._btn_delete)

        layout = QVBoxLayout(self)
        layout.addLayout(btns)
        layout.addWidget(self._table)

        self.refresh()

    def _fetch_rows(self) -> List[Dict[str, Any]]:
        sql = (
            "SELECT id, name, created_at, updated_at FROM categories ORDER BY name"
        )
        with self._engine.connect() as conn:
            return [dict(r._mapping) for r in conn.execute(sql)]  # type: ignore[attr-defined]

    def refresh(self) -> None:
        try:
            self._model.update_rows(self._fetch_rows())
        except Exception as exc:
            QMessageBox.critical(self, "載入失敗", f"無法讀取類別：{exc}")

    def _selected_id(self) -> Optional[int]:
        sel = self._table.selectionModel().selectedRows()
        if not sel:
            return None
        row = sel[0].row()
        data = self._model.get_row(row)
        return None if data is None else int(data.get("id"))

    def add_category(self) -> None:
        name, ok = QInputDialog.getText(self, "新增類別", "名稱：")
        if not ok:
            return
        name = name.strip()
        if not name:
            QMessageBox.warning(self, "無效輸入", "名稱不得為空")
            return
        try:
            with self._engine.begin() as conn:
                conn.execute("INSERT INTO categories(name) VALUES (:name)", {"name": name})
            self.refresh()
        except Exception as exc:
            QMessageBox.critical(self, "新增失敗", f"無法新增：{exc}")

    def edit_category(self) -> None:
        category_id = self._selected_id()
        if category_id is None:
            QMessageBox.information(self, "請選擇", "請先選擇一筆資料")
            return
        row = next((r for r in self._model._rows if r.get("id") == category_id), None)
        current = "" if row is None else str(row.get("name", ""))
        name, ok = QInputDialog.getText(self, "編輯類別", "名稱：", text=current)
        if not ok:
            return
        name = name.strip()
        if not name:
            QMessageBox.warning(self, "無效輸入", "名稱不得為空")
            return
        try:
            with self._engine.begin() as conn:
                conn.execute(
                    "UPDATE categories SET name = :name WHERE id = :id",
                    {"name": name, "id": category_id},
                )
            self.refresh()
        except Exception as exc:
            QMessageBox.critical(self, "更新失敗", f"無法更新：{exc}")

    def delete_category(self) -> None:
        category_id = self._selected_id()
        if category_id is None:
            QMessageBox.information(self, "請選擇", "請先選擇一筆資料")
            return
        if QMessageBox.question(self, "刪除確認", "確定要刪除此類別？") != QMessageBox.StandardButton.Yes:
            return
        try:
            with self._engine.begin() as conn:
                conn.execute("DELETE FROM categories WHERE id = :id", {"id": category_id})
            self.refresh()
        except Exception as exc:
            QMessageBox.critical(self, "刪除失敗", f"無法刪除：{exc}")


