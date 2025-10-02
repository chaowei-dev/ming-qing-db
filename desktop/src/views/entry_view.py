from __future__ import annotations

from typing import List, Dict, Any, Optional, Tuple

from PyQt6.QtCore import QAbstractTableModel, QModelIndex, Qt, QVariant
from PyQt6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QTableView,
    QMessageBox,
    QPushButton,
    QDialog,
    QFormLayout,
    QComboBox,
    QLineEdit,
    QDialogButtonBox,
)

from models.database import get_engine


class _EntriesTableModel(QAbstractTableModel):
    def __init__(self, rows: List[Dict[str, Any]]):
        super().__init__()
        self._rows = rows
        self._headers = [
            ("id", "ID"),
            ("book_title", "書名"),
            ("book_author", "作者"),
            ("roll", "卷"),
            ("roll_name", "卷名"),
            ("entry_name", "篇目"),
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

    def get_row(self, row: int) -> Dict[str, Any]:
        return self._rows[row]


class _EntryDialog(QDialog):
    def __init__(self, engine, parent: Optional[QWidget] = None, init_values: Optional[Dict[str, Any]] = None):
        super().__init__(parent)
        self.setWindowTitle("篇目")
        self._engine = engine

        self.book_cb = QComboBox(self)
        self.roll_edit = QLineEdit(self)
        self.roll_name_edit = QLineEdit(self)
        self.entry_name_edit = QLineEdit(self)
        self.remarks_edit = QLineEdit(self)

        self._load_books()

        if init_values:
            self._set_initial(init_values)

        form = QFormLayout()
        form.addRow("書籍", self.book_cb)
        form.addRow("卷", self.roll_edit)
        form.addRow("卷名", self.roll_name_edit)
        form.addRow("篇目", self.entry_name_edit)
        form.addRow("備註", self.remarks_edit)

        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel, self)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)

        layout = QVBoxLayout(self)
        layout.addLayout(form)
        layout.addWidget(buttons)

    def _load_books(self) -> None:
        sql = (
            "SELECT id, title, author, version, source FROM books ORDER BY title, author, version, source"
        )
        self.book_cb.clear()
        with self._engine.connect() as conn:
            for r in conn.execute(sql):
                d = dict(r._mapping)  # type: ignore[attr-defined]
                label = f"{d['title']} — {d['author']} — {d['version']}/{d['source']}"
                self.book_cb.addItem(label, d["id"])  # book_id in itemData

    def _set_initial(self, values: Dict[str, Any]) -> None:
        # book
        book_id = values.get("book_id")
        if book_id is not None:
            for i in range(self.book_cb.count()):
                if int(self.book_cb.itemData(i)) == int(book_id):
                    self.book_cb.setCurrentIndex(i)
                    break
        # roll
        self.roll_edit.setText(str(values.get("roll", "")))
        self.roll_name_edit.setText(str(values.get("roll_name", "")))
        # entry
        self.entry_name_edit.setText(str(values.get("entry_name", "")))
        self.remarks_edit.setText(str(values.get("remarks", "")))

    def get_values(self) -> Dict[str, Any]:
        return {
            "book_id": int(self.book_cb.currentData()),
            "roll": self.roll_edit.text().strip(),
            "roll_name": self.roll_name_edit.text().strip(),
            "entry_name": self.entry_name_edit.text().strip(),
            "remarks": (self.remarks_edit.text().strip() or None),
        }


class EntryView(QWidget):
    def __init__(self, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)
        self._engine = get_engine()

        self._table = QTableView(self)
        self._model = _EntriesTableModel([])
        self._table.setModel(self._model)
        self._table.setSelectionBehavior(QTableView.SelectionBehavior.SelectRows)
        self._table.setSelectionMode(QTableView.SelectionMode.SingleSelection)

        self._btn_reload = QPushButton("重新整理", self)
        self._btn_add = QPushButton("新增", self)
        self._btn_edit = QPushButton("編輯", self)
        self._btn_delete = QPushButton("刪除", self)

        self._btn_reload.clicked.connect(self.reload)
        self._btn_add.clicked.connect(self.add_entry)
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

    def _fetch_entries(self) -> List[Dict[str, Any]]:
        sql = (
            "SELECT e.id, e.entry_name, COALESCE(e.remarks, '') AS remarks, "
            "r.id AS roll_id, r.roll, r.roll_name, b.id AS book_id, b.title AS book_title, b.author AS book_author "
            "FROM entries e "
            "JOIN rolls r ON e.roll_id = r.id "
            "JOIN books b ON r.book_id = b.id "
            "ORDER BY b.title, r.roll, e.entry_name LIMIT 1000"
        )
        with self._engine.connect() as conn:
            rows = [dict(r._mapping) for r in conn.execute(sql)]  # type: ignore[attr-defined]
        return rows

    def reload(self) -> None:
        try:
            self._model.update_rows(self._fetch_entries())
        except Exception as exc:
            QMessageBox.critical(self, "讀取失敗", f"讀取篇目時發生錯誤：{exc}")

    def _selected_row(self) -> Optional[int]:
        indexes = self._table.selectionModel().selectedRows()
        if not indexes:
            return None
        return indexes[0].row()

    def _ensure_roll(self, book_id: int, roll: str, roll_name: str) -> int:
        if not roll or not roll_name:
            raise ValueError("卷與卷名不得為空")
        with self._engine.begin() as conn:
            row = conn.execute(
                "SELECT id FROM rolls WHERE book_id=:bid AND roll=:r AND roll_name=:rn",
                {"bid": book_id, "r": roll, "rn": roll_name},
            ).fetchone()
            if row:
                return int(row[0])
            res = conn.execute(
                "INSERT INTO rolls(roll, roll_name, book_id) VALUES (:r, :rn, :bid)",
                {"r": roll, "rn": roll_name, "bid": book_id},
            )
        # After transaction, fetch created id in a new read connection
        with self._engine.connect() as conn:
            row = conn.execute(
                "SELECT id FROM rolls WHERE book_id=:bid AND roll=:r AND roll_name=:rn",
                {"bid": book_id, "r": roll, "rn": roll_name},
            ).fetchone()
            return int(row[0])

    def add_entry(self) -> None:
        dlg = _EntryDialog(self._engine, self)
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return
        values = dlg.get_values()
        if not values["entry_name"]:
            QMessageBox.warning(self, "輸入不完整", "請填寫篇目。")
            return
        try:
            roll_id = self._ensure_roll(values["book_id"], values["roll"], values["roll_name"])
            with self._engine.begin() as conn:
                conn.execute(
                    "INSERT INTO entries(entry_name, roll_id, remarks) VALUES (:en, :rid, :rm)",
                    {"en": values["entry_name"], "rid": roll_id, "rm": values["remarks"]},
                )
        except Exception as exc:
            QMessageBox.critical(self, "新增失敗", f"無法新增篇目：{exc}")
            return
        self.reload()

    def edit_selected(self) -> None:
        row_idx = self._selected_row()
        if row_idx is None:
            QMessageBox.information(self, "未選擇", "請先選擇一筆篇目。")
            return
        data = self._model.get_row(row_idx)
        init_vals = {
            "book_id": data["book_id"],
            "roll": data["roll"],
            "roll_name": data["roll_name"],
            "entry_name": data["entry_name"],
            "remarks": data.get("remarks", ""),
        }
        dlg = _EntryDialog(self._engine, self, init_values=init_vals)
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return
        values = dlg.get_values()
        if not values["entry_name"]:
            QMessageBox.warning(self, "輸入不完整", "請填寫篇目。")
            return
        try:
            new_roll_id = self._ensure_roll(values["book_id"], values["roll"], values["roll_name"])
            with self._engine.begin() as conn:
                conn.execute(
                    "UPDATE entries SET entry_name=:en, roll_id=:rid, remarks=:rm WHERE id=:id",
                    {"en": values["entry_name"], "rid": new_roll_id, "rm": values["remarks"], "id": data["id"]},
                )
        except Exception as exc:
            QMessageBox.critical(self, "更新失敗", f"無法更新篇目：{exc}")
            return
        self.reload()

    def delete_selected(self) -> None:
        row_idx = self._selected_row()
        if row_idx is None:
            QMessageBox.information(self, "未選擇", "請先選擇一筆篇目。")
            return
        data = self._model.get_row(row_idx)
        if QMessageBox.question(self, "確認刪除", f"確定要刪除「{data['entry_name']}」嗎？") != QMessageBox.StandardButton.Yes:
            return
        try:
            with self._engine.begin() as conn:
                conn.execute("DELETE FROM entries WHERE id=:id", {"id": data["id"]})
        except Exception as exc:
            QMessageBox.critical(self, "刪除失敗", f"無法刪除篇目：{exc}")
            return
        self.reload()
