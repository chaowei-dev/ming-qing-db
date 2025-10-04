from __future__ import annotations

from pathlib import Path
from typing import List, Dict, Any, Optional
import csv
import shutil
import sqlite3
from datetime import datetime
import time

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
    QInputDialog,
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
        self._btn_import = QPushButton("匯入csv", self)
        self._btn_clear = QPushButton("清理目前資料庫", self)
        self._btn_restore = QPushButton("切換到選擇版本", self)
        self._btn_export = QPushButton("匯出選擇版本為 CSV", self)
        self._btn_delete = QPushButton("刪除選擇版本", self)

        self._btn_create.clicked.connect(self.create_backup)
        self._btn_import.clicked.connect(self.import_csv)
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
        # Hide 路徑 column; keep data for actions
        self._table.setColumnHidden(3, True)

        btns = QHBoxLayout()
        btns.addWidget(self._btn_import)
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
            # Ensure 路徑 column remains hidden after model updates
            self._table.setColumnHidden(3, True)
            self._update_buttons()
        except Exception as exc:
            QMessageBox.critical(self, "讀取失敗", f"讀取備份清單時發生錯誤：{exc}")

    def _update_buttons(self) -> None:
        has_selection = self._selected_row() is not None
        self._btn_restore.setEnabled(has_selection)
        self._btn_export.setEnabled(has_selection)
        self._btn_delete.setEnabled(has_selection)

    def _sanitize_remark(self, remark: str) -> str:
        # Sanitize remark for filesystem-safe filename suffix
        import re
        remark = (remark or "").strip()
        if not remark:
            return ""
        # Replace path separators and reserved characters
        for ch in ["/", "\\", ":", "*", "?", '"', "<", ">", "|"]:
            remark = remark.replace(ch, "_")
        # Allow word chars, dash, dot, underscore, and CJK; replace others with underscore
        remark = re.sub(r"[^\w\-.\u4e00-\u9fff]+", "_", remark)
        # Collapse repeats and trim
        remark = re.sub(r"_+", "_", remark).strip("._-")
        return remark

    def _backup_filename(self, remark: Optional[str] = None) -> Path:
        ts = datetime.now().strftime("%Y%m%d-%H%M%S")
        safe = self._sanitize_remark(remark or "")
        if safe:
            return self._backups_dir / f"backup-{ts}-{safe}.db"
        return self._backups_dir / f"backup-{ts}.db"

    def create_backup(self) -> None:
        try:
            if not self._db_path.exists():
                QMessageBox.warning(self, "無資料庫", "找不到目前資料庫檔案，無法建立備份。")
                return

            # Ask for optional remark to append in filename
            remark, ok = QInputDialog.getText(self, "備份備註", "可輸入備註（將加在檔名最後，可留空）：")
            if not ok:
                return
            target = self._backup_filename(str(remark))
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

    def import_csv(self) -> None:
        # 先選擇匯入類別（必選）
        selected_category_id: Optional[int] = None
        try:
            cats: List[Dict[str, Any]] = []
            if self._db_path.exists():
                conn = sqlite3.connect(str(self._db_path))
                try:
                    cur = conn.cursor()
                    cur.execute("SELECT id, name FROM categories ORDER BY name")
                    for cid, name in cur.fetchall():
                        cats.append({"id": int(cid), "name": str(name)})
                finally:
                    conn.close()
            if not cats:
                QMessageBox.information(self, "尚無類別", "尚未建立任何類別，請先到『類別』分頁新增類別後再進行匯入。")
                return

            labels = [c["name"] for c in cats]
            choice, ok = QInputDialog.getItem(
                self,
                "選擇類別",
                "請選擇此次匯入的類別：",
                labels,
                0,
                False,
            )
            if not ok:
                return
            for c in cats:
                if c["name"] == choice:
                    selected_category_id = int(c["id"])
                    break
            if selected_category_id is None:
                QMessageBox.warning(self, "未選擇類別", "必須選擇一個類別才能進行匯入。")
                return
        except Exception as exc:
            QMessageBox.critical(self, "讀取類別失敗", f"無法讀取類別清單：{exc}")
            return

        # 檔案選擇
        csv_path_str, _ = QFileDialog.getOpenFileName(self, "選擇要匯入的 CSV", "", "CSV (*.csv)")
        if not csv_path_str:
            return
        csv_path = Path(csv_path_str)
        if not csv_path.exists():
            QMessageBox.warning(self, "檔案不存在", "找不到所選 CSV 檔案。")
            return

        # 進度視窗
        progress = QProgressDialog("正在匯入資料...", "取消", 0, 0, self)
        progress.setWindowTitle("請稍候")
        progress.setWindowModality(Qt.WindowModality.ApplicationModal)
        progress.setAutoClose(False)
        progress.setAutoReset(False)
        progress.show()
        QApplication.processEvents()

        # 欄位名稱需與匯出一致
        expected_headers = ["書名", "作者", "卷次", "卷名", "篇名", "版本", "備註"]

        # 來源欄位在 CSV 中沒有，使用預設來源值（非 NULL）
        default_source = ""

        inserted_books = 0
        inserted_rolls = 0
        inserted_entries = 0

        try:
            # 使用 utf-8-sig 自動處理 BOM
            with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
                reader = csv.reader(f)
                try:
                    headers = next(reader)
                except StopIteration:
                    QMessageBox.warning(self, "空檔案", "CSV 檔案為空。")
                    progress.close()
                    return

                # 正規化欄位（去除空白與 BOM）
                norm_headers = [h.replace("\ufeff", "").strip() for h in headers]
                if norm_headers != expected_headers:
                    progress.close()
                    QMessageBox.critical(
                        self,
                        "欄位不符",
                        "CSV 欄位必須為：\n" + ",".join(expected_headers),
                    )
                    return

                conn = sqlite3.connect(str(self._db_path))
                try:
                    cur = conn.cursor()
                    # 匯入優化 PRAGMAs（僅在本次連線有效）
                    cur.execute("PRAGMA foreign_keys=ON;")
                    cur.execute("PRAGMA busy_timeout=5000;")
                    cur.execute("PRAGMA synchronous=OFF;")
                    cur.execute("PRAGMA temp_store=MEMORY;")
                    cur.execute("PRAGMA cache_size=-50000;")

                    # 快取避免重複查詢
                    book_cache: Dict[tuple, int] = {}
                    roll_cache: Dict[tuple, int] = {}

                    # 預先準備 statements
                    select_book_sql = (
                        "SELECT id, COALESCE(category_id, 0) FROM books WHERE title=? AND author=? AND version=? AND source=?"
                    )
                    insert_book_sql = (
                        "INSERT OR IGNORE INTO books(title, author, version, source, category_id) VALUES (?,?,?,?,?)"
                    )
                    select_roll_sql = (
                        "SELECT id FROM rolls WHERE book_id=? AND roll=? AND roll_name=?"
                    )
                    insert_roll_sql = (
                        "INSERT OR IGNORE INTO rolls(roll, roll_name, book_id) VALUES (?,?,?)"
                    )
                    insert_entry_sql = (
                        "INSERT OR IGNORE INTO entries(entry_name, roll_id, remarks) VALUES (?,?,?)"
                    )

                    batch_entries: List[tuple] = []
                    batch_size = 5000
                    processed = 0
                    last_ui_update = time.time()

                    conn.execute("BEGIN")
                    for row in reader:
                        if progress.wasCanceled():
                            conn.rollback()
                            progress.close()
                            QMessageBox.information(self, "已取消", f"已取消匯入，已處理 {processed} 筆。")
                            return

                        if not row:
                            continue
                        try:
                            title, author, roll, roll_name, entry_name, version, remarks = [
                                (c.strip() if isinstance(c, str) else c) for c in row
                            ]
                        except ValueError:
                            # 欄位數不正確，跳過此列
                            continue

                        # 取得或建立 book_id
                        book_key = (title, author, version, default_source)
                        book_id = book_cache.get(book_key)
                        if book_id is None:
                            cur.execute(select_book_sql, book_key)
                            r = cur.fetchone()
                            if r is None:
                                cur.execute(
                                    insert_book_sql,
                                    (title, author, version, default_source, selected_category_id),
                                )
                                if cur.rowcount:
                                    inserted_books += 1
                                # 取得 id（不論是否新建）
                                cur.execute(select_book_sql, book_key)
                                r = cur.fetchone()
                            book_id = int(r[0])
                            # 如果已存在且尚未指定類別，而本次有選擇類別，補上類別
                            if selected_category_id is not None and r is not None:
                                existing_cat = int(r[1]) if r[1] is not None else 0
                                if existing_cat == 0:
                                    cur.execute(
                                        "UPDATE books SET category_id = ? WHERE id = ?",
                                        (selected_category_id, book_id),
                                    )
                            book_cache[book_key] = book_id

                        # 取得或建立 roll_id
                        roll_key = (book_id, roll, roll_name)
                        roll_id = roll_cache.get(roll_key)
                        if roll_id is None:
                            cur.execute(select_roll_sql, roll_key)
                            r = cur.fetchone()
                            if r is None:
                                cur.execute(insert_roll_sql, (roll, roll_name, book_id))
                                if cur.rowcount:
                                    inserted_rolls += 1
                                cur.execute(select_roll_sql, roll_key)
                                r = cur.fetchone()
                            roll_id = int(r[0])
                            roll_cache[roll_key] = roll_id

                        # 準備 entries 批次
                        entry_tuple = (entry_name, roll_id, remarks or None)
                        batch_entries.append(entry_tuple)
                        processed += 1

                        if len(batch_entries) >= batch_size:
                            cur.executemany(insert_entry_sql, batch_entries)
                            inserted_entries += cur.rowcount if cur.rowcount is not None else 0
                            batch_entries.clear()

                            # UI 更新（節流）
                            now = time.time()
                            if now - last_ui_update > 0.25:
                                progress.setLabelText(f"正在匯入資料... 已處理 {processed} 筆")
                                QApplication.processEvents()
                                last_ui_update = now

                    # flush 殘餘批次
                    if batch_entries:
                        cur.executemany(insert_entry_sql, batch_entries)
                        inserted_entries += cur.rowcount if cur.rowcount is not None else 0

                    conn.commit()
                finally:
                    conn.close()

            progress.close()
            QMessageBox.information(
                self,
                "匯入完成",
                f"書籍新增 {inserted_books}，卷新增 {inserted_rolls}，篇目新增 {inserted_entries}。",
            )
        except Exception as exc:
            try:
                progress.close()
            except Exception:
                pass
            QMessageBox.critical(self, "匯入失敗", f"匯入 CSV 時發生錯誤：{exc}")


