### TODO（桌面版）

### 0. 目標確認
- [ ] 單人使用、離線為主、資料量約 1,0000,000 筆

### 1. 開發環境
- [x] 產生 `requirements.txt`（PyQt6、SQLAlchemy、appdirs）

### 2. 專案骨架
- [x] 建立 `src/`、`resources/`、`data/`、`logs/`
- [x] 新增 `src/main.py`（載入 QSS、主視窗啟動）
- [x] 新增 `src/models/database.py`（單一 Engine，啟用外鍵）
- [x] 新增 `src/views/main_window.py`（分頁：書籍／篇目／搜尋）
- [x] 放置 `resources/styles/main.qss`（可先留白）
- [x] 建立 `resources/database/init.sql`（簡化表；不含觸發器與遷移表）

### 3. 資料庫
- [x] 建立 `categories` / `books` / `rolls` / `entries` 基本表
- [x] 建立唯一鍵與必要索引（避免重複與加速查詢）
- [x] 首次啟動：若無 `data/database.db` 則自動執行 `init.sql`
- [x] 取消：多 Engine、`schema_migrations`、`updated_at` 觸發器（後續需要再加）

### 4. UI
- [x] 分頁或側欄切換：書籍、篇目、搜尋
- [x] 列表 + 基礎 CRUD 對話框
- [x] 搜尋欄：title／author／roll／entry 關鍵字
- [x] 套用 `main.qss`（後續再美化）

### 5. 核心功能
- [x] 類別：列表／新增／編輯／刪除／複製
- [x] 書籍：列表／新增／編輯／刪除／複製
- [x] 篇目：列表／新增／編輯／刪除（以書籍／卷關聯）／複製
- [x] 測試：類別、書籍、篇目的 CRUD 各個功能
- [ ] 匯入：CSV（UTF-8），逐列寫入，遇重複即跳過
- [ ] 匯出：CSV（當前列表或查詢結果）
- [ ] 備份：按鈕複製 `database.db` 到 `data/backups/`
- [ ] 日誌：以 `logging` 輸出到 `logs/app.log`（無需日誌輪轉）

### 6. 啟動與初始化
- [ ] 首次啟動自動建立 `data/`、`logs/`、`backups/`
- [ ] 狀態列顯示資料庫路徑與總筆數

### 7. 後續可考慮
- [ ] PyInstaller 打包與 `build_app.spec`
- [ ] 測試框架、覆蓋率、lint
- [ ] 進階搜尋與 FTS5
- [ ] 大量匯入：staging、分批交易、停用索引
- [ ] 自動遷移與 `schema_migrations`
- [ ] 設定頁、儀表板、備份管理 UI、主題切換
- [ ] Excel 匯入／匯出
