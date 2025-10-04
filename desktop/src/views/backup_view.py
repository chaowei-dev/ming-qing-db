from __future__ import annotations

from pathlib import Path
from typing import List, Dict, Any, Optional
import csv
import shutil
import sqlite3
from datetime import datetime

from PyQt6.QtCore import QAbstractTableModel, QModelIndex, Qt, QVariant
from PyQt6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QTableView,
    QHeaderView,
    QPushButton,
    QMessageBox,
    QFileDialog,
    QProgressDialog,
    QApplication,
)

from models.database import get_engine


class _BackupsTableModel(QAbstractTableModel):
    def __init__(self, rows: List[Dict[str, Any]]):
        super().__init__()
        self._rows = rows
        self._headers = [
            ("name", "檔名"),
            ("created_at", "建立時間"),
            ("size", "大小 (KB)"),
            ("path", "路徑"),
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
        value = self._rows[index.row()].get(key, "")
        return value

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


class BackupView(QWidget):
    def __init__(self, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)

        self._engine = get_engine()
        self._root_dir = Path(__file__).resolve().parent.parent.parent
        self._data_dir = self._root_dir / "data"
        self._db_path = self._data_dir / "database.db"
        self._backups_dir = self._data_dir / "backups"
        self._backups_dir.mkdir(parents=True, exist_ok=True)

        self._btn_create = QPushButton("建立備份", self)
        self._btn_clear = QPushButton("清理目前資料庫", self)
        self._btn_restore = QPushButton("切換到選擇版本", self)
        self._btn_export = QPushButton("匯出選擇版本為 CSV", self)
        self._btn_delete = QPushButton("刪除選擇版本", self)

        self._btn_create.clicked.connect(self.create_backup)
        self._btn_clear.clicked.connect(self.clear_current_database)
        self._btn_restore.clicked.connect(self.restore_selected)
        self._btn_export.clicked.connect(self.export_selected_csv)
        self._btn_delete.clicked.connect(self.delete_selected_backup)

        self._table = QTableView(self)
        self._model = _BackupsTableModel([])
        self._table.setModel(self._model)
        self._table.setSelectionBehavior(QTableView.SelectionBehavior.SelectRows)
        self._table.setSelectionMode(QTableView.SelectionMode.SingleSelection)
        self._table.setSortingEnabled(True)
        # Enable/disable action buttons when selection changes
        self._table.selectionModel().selectionChanged.connect(lambda *_: self._update_buttons())
        # Auto-resize columns: stretch File Name and Created At
        header = self._table.horizontalHeader()
        header.setSectionResizeMode(QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)

        btns = QHBoxLayout()
        btns.addWidget(self._btn_create)
        btns.addWidget(self._btn_clear)
        btns.addStretch(1)
        btns.addWidget(self._btn_restore)
        btns.addWidget(self._btn_delete)
        btns.addWidget(self._btn_export)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(16)
        layout.addLayout(btns)
        layout.addWidget(self._table)

        self.reload()

    def _selected_row(self) -> Optional[int]:
        indexes = self._table.selectionModel().selectedRows()
        if not indexes:
            return None
        return indexes[0].row()

    def reload(self) -> None:
        try:
            rows: List[Dict[str, Any]] = []
            for p in sorted(self._backups_dir.glob("*.db"), key=lambda x: x.stat().st_mtime, reverse=True):
                stat = p.stat()
                rows.append(
                    {
                        "name": p.name,
                        "created_at": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                        "size": f"{stat.st_size // 1024}",
                        "path": str(p),
                    }
                )
            self._model.update_rows(rows)
            # Auto-select the first row if available so actions are ready
            if rows:
                self._table.selectRow(0)
            self._update_buttons()
        except Exception as exc:
            QMessageBox.critical(self, "讀取失敗", f"讀取備份清單時發生錯誤：{exc}")

    def _update_buttons(self) -> None:
        has_selection = self._selected_row() is not None
        self._btn_restore.setEnabled(has_selection)
        self._btn_export.setEnabled(has_selection)
        self._btn_delete.setEnabled(has_selection)

    def _backup_filename(self) -> Path:
        ts = datetime.now().strftime("%Y%m%d-%H%M%S")
        return self._backups_dir / f"backup-{ts}.db"

    def create_backup(self) -> None:
        try:
            if not self._db_path.exists():
                QMessageBox.warning(self, "無資料庫", "找不到目前資料庫檔案，無法建立備份。")
                return

            target = self._backup_filename()
            # 使用 SQLite 線上備份 API 以取得一致快照（WAL 模式安全）
            src_conn = self._engine.raw_connection()
            try:
                dst_conn = sqlite3.connect(str(target))
                try:
                    src_conn.backup(dst_conn)
                    dst_conn.commit()
                finally:
                    dst_conn.close()
            finally:
                src_conn.close()

            self.reload()
            QMessageBox.information(self, "完成", f"已建立備份：\n{target}")
        except Exception as exc:
            QMessageBox.critical(self, "備份失敗", f"建立備份時發生錯誤：{exc}")

    def restore_selected(self) -> None:
        row_idx = self._selected_row()
        if row_idx is None:
            QMessageBox.information(self, "未選擇", "請先選擇一個備份版本。")
            return
        row = self._model.get_row(row_idx)
        backup_path = Path(row["path"])  # type: ignore[index]
        if QMessageBox.question(
            self,
            "確認切換",
            f"將以所選備份覆寫目前資料庫，是否繼續？\n\n{backup_path}",
        ) != QMessageBox.StandardButton.Yes:
            return
        try:
            # 關閉現有連線
            self._engine.dispose()

            # 移除現有 WAL/SHM，以避免舊快取干擾
            for suffix in ("-wal", "-shm"):
                sidecar = Path(str(self._db_path) + suffix)
                if sidecar.exists():
                    try:
                        sidecar.unlink()
                    except Exception:
                        pass

            # 覆寫資料庫檔案
            shutil.copyfile(backup_path, self._db_path)

            QMessageBox.information(self, "已切換", "已切換到所選版本。建議重新整理檢視或重新啟動應用程式。")
        except Exception as exc:
            QMessageBox.critical(self, "切換失敗", f"切換至備份時發生錯誤：{exc}")

    def export_selected_csv(self) -> None:
        row_idx = self._selected_row()
        if row_idx is None:
            QMessageBox.information(self, "未選擇", "請先選擇一個備份版本。")
            return
        row = self._model.get_row(row_idx)
        backup_path = Path(row["path"])  # type: ignore[index]

        # 優先使用備份建立時間決定檔名
        default_name = backup_path.stem.replace("backup-", "entries-") + ".csv"
        out_path_str, _ = QFileDialog.getSaveFileName(self, "另存新檔", default_name, "CSV (*.csv)")
        if not out_path_str:
            return
        out_path = Path(out_path_str)

        try:
            conn = sqlite3.connect(str(backup_path))
            try:
                sql = (
                    "SELECT b.title AS 書名, b.author AS 作者, "
                    "r.roll AS 卷次, r.roll_name AS 卷名, "
                    "e.entry_name AS 篇名, b.version AS 版本, "
                    "COALESCE(e.remarks, '') AS 備註 "
                    "FROM entries e "
                    "JOIN rolls r ON e.roll_id = r.id "
                    "JOIN books b ON r.book_id = b.id "
                    "ORDER BY b.title, r.roll, e.entry_name"
                )
                cur = conn.cursor()
                cur.execute(sql)
                rows = cur.fetchall()
                headers = ["書名", "作者", "卷次", "卷名", "篇名", "版本", "備註"]

                with out_path.open("w", newline="", encoding="utf-8") as f:
                    writer = csv.writer(f)
                    writer.writerow(headers)
                    for r in rows:
                        writer.writerow(list(r))
            finally:
                conn.close()

            QMessageBox.information(self, "匯出完成", f"已匯出 CSV：\n{out_path}")
        except Exception as exc:
            QMessageBox.critical(self, "匯出失敗", f"匯出 CSV 時發生錯誤：{exc}")


    def clear_current_database(self) -> None:
        if not self._db_path.exists():
            QMessageBox.warning(self, "無資料庫", "找不到目前資料庫檔案，無法清理。")
            return
        if QMessageBox.question(
            self,
            "確認清理",
            "將清空目前資料庫中的所有資料（書籍/卷/篇目/類別）。\n系統會先自動建立備份，是否繼續？",
        ) != QMessageBox.StandardButton.Yes:
            return
        try:
            # 顯示等待視窗：備份階段
            progress = QProgressDialog("正在備份目前資料庫...", "", 0, 0, self)
            progress.setWindowTitle("請稍候")
            progress.setWindowModality(Qt.WindowModality.ApplicationModal)
            progress.setAutoClose(False)
            progress.setAutoReset(False)
            progress.show()
            QApplication.processEvents()

            # 先建立備份
            backup_target = self._backup_filename()
            src_conn = self._engine.raw_connection()
            try:
                dst_conn = sqlite3.connect(str(backup_target))
                try:
                    src_conn.backup(dst_conn)
                    dst_conn.commit()
                finally:
                    dst_conn.close()
            finally:
                src_conn.close()
            # 更新清單
            self.reload()

            # 進入清理階段
            progress.setLabelText("正在清理資料庫...")
            QApplication.processEvents()

            # 依相依關係順序刪除資料，並重設自增序號
            with self._engine.begin() as conn:
                conn.exec_driver_sql("PRAGMA foreign_keys=ON;")
                conn.exec_driver_sql("DELETE FROM entries;")
                conn.exec_driver_sql("DELETE FROM rolls;")
                conn.exec_driver_sql("DELETE FROM books;")
                conn.exec_driver_sql("DELETE FROM categories;")
                # reset autoincrement counters if present
                try:
                    conn.exec_driver_sql(
                        "DELETE FROM sqlite_sequence WHERE name IN ('entries','rolls','books','categories');"
                    )
                except Exception:
                    # sqlite_sequence might not exist; ignore
                    pass

            # 釋放連線後壓縮資料庫
            self._engine.dispose()
            try:
                conn = sqlite3.connect(str(self._db_path))
                try:
                    conn.execute("VACUUM")
                    conn.commit()
                finally:
                    conn.close()
            except Exception:
                # 如果 VACUUM 失敗，不影響資料清理結果
                pass

            progress.close()
            QMessageBox.information(self, "已清理", "資料庫已清空，並已自動建立備份。")
        except Exception as exc:
            try:
                progress.close()
            except Exception:
                pass
            QMessageBox.critical(self, "清理失敗", f"清理資料庫時發生錯誤：{exc}")

    def delete_selected_backup(self) -> None:
        row_idx = self._selected_row()
        if row_idx is None:
            QMessageBox.information(self, "未選擇", "請先選擇一個備份版本。")
            return
        row = self._model.get_row(row_idx)
        backup_path = Path(row.get("path", ""))
        if not backup_path or not backup_path.exists():
            QMessageBox.information(self, "檔案不存在", "找不到該備份檔案，清單將重新整理。")
            self.reload()
            return

        # 第一次確認
        if QMessageBox.question(
            self,
            "確認刪除",
            f"確定要刪除此備份？\n\n{backup_path}",
        ) != QMessageBox.StandardButton.Yes:
            return
        # 第二次確認（不可復原）
        if QMessageBox.question(
            self,
            "再次確認",
            "此操作無法復原，是否仍要刪除？",
        ) != QMessageBox.StandardButton.Yes:
            return

        try:
            backup_path.unlink()
            self.reload()
            QMessageBox.information(self, "已刪除", "選擇的備份已刪除。")
        except Exception as exc:
            QMessageBox.critical(self, "刪除失敗", f"刪除備份時發生錯誤：{exc}")


