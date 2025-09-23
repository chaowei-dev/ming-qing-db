### TODO（桌面端設計對照章節）

### 1. 開發環境設置
- [ ] 產生並釘選 `requirements.txt` 版本
- [ ] 完成 `build_app.spec` 並含入 `resources/`

### 2. 專案結構設計
- [ ] 建立 `src/` 目錄骨架與 `__init__.py`
- [ ] 實作 `src/main.py`（載入 QSS、主視窗啟動）
- [ ] 放置 `resources/icons`、`resources/styles` 並驗證載入
- [ ] 建立 `tests/` 基礎測試檔

### 3. 資料庫設計
- [ ] 建立 `resources/database/init.sql`（3.1 表結構）
- [ ] 實作 `models/database.py`（SQLAlchemy engine 與連線 PRAGMA）
- [ ] 實作 `utils/database_migrator.py`（3.3 索引/觸發器/遷移表）
- [ ] 測試唯一鍵違反與 `updated_at` 觸發器生效
- [ ]（可選）FTS5 規劃留白，暫不實作（3.4）

### 4. UI 設計概要
- [ ] 實作 `views/main_window.py`（左側導航＋內容切換）
- [ ] 綁定選單與狀態列更新
- [ ] 套用 `resources/styles/*.qss`

### 5. 核心功能
- [ ] 類別：控制器與視圖 CRUD（列表、增改刪）
- [ ] 書籍：列表/篩選/詳情/CRUD
- [ ] 卷：CRUD 與書籍關聯
- [ ] 篇目：列表/搜尋/CRUD
- [ ] 搜尋：多欄位查詢（非 FTS）、結果匯出 CSV
- [ ] 匯入：CSV/Excel 批次匯入、進度與錯誤報表
- [ ] 匯出：列表或查詢結果 CSV/Excel
- [ ] 備份：SQLite 線上備份或 `VACUUM INTO`
- [ ] 還原：關閉連線後安全還原與 UI 鎖定
- [ ] 設定：使用 `appdirs` 儲存資料/備份/日誌路徑與偏好
- [ ] 日誌：旋轉日誌至 `logs/app.log`

### 6. 安裝與使用說明
- [ ] `database_migrator.py` 可初始化資料庫與目錄
- [ ] 首次啟動建立 `data/`、`backups/`、`logs/`

### 7. 開發指南
- [ ] 加入 pytest 設定與範例測試（models/controllers/utils）
- [ ] 加入 black/flake8 設定

### 8. 資料遷移與大量匯入
- [ ] 實作暫存表 staging 與批次寫入（5k–20k）
- [ ] 集合式 SQL：補齊 books/rolls/entries（INSERT OR IGNORE）
- [ ] 匯入進度、可取消、錯誤列報表輸出
- [ ]（可選）匯入前後停用/重建非唯一索引
- [ ] 匯入完成執行 WAL checkpoint 與 `ANALYZE`

### 9. 常見問題
- [ ] 文件化 `database is locked` 與權限疑難排解
- [ ] 文件化資料與備份路徑（appdirs）

### 10. 版本歷史
- [ ] 彙整 v1.0.0 出貨檢查清單與釋出流程

### 11. 前後端功能清單（對齊說明）
- [ ] 標注桌面端不含認證（Web 僅），移除相關 UI/邏輯
- [ ] 確認桌面端與 Web 欄位對應與匯入/匯出相容


