## 明清文獻資料庫（桌面版）

本專案為個人使用的桌面版，使用 PyQt6 與 SQLite。目標是離線管理與查找資料，支援基本的書籍／卷／篇目維護與 CSV 匯入匯出。

### 1. 開發環境設置

#### 系統要求

- Python 3.10+
- Windows / macOS / Linux

#### 所需安裝套件

```bash
# 推薦：使用 requirements.txt（僅最小依賴）
pip install -r requirements.txt

# 或分別安裝
pip install PyQt6==6.6.*
pip install SQLAlchemy==2.0.*
pip install appdirs==1.4.*

# 需要 Excel 或大量匯入時再安裝
pip install pandas==2.2.*
pip install openpyxl==3.1.*
```

### 2. 專案結構

```
desktop/
│
├── src/                    # 源代碼目錄
│   ├── main.py            # 程式進入點
│   ├── __init__.py
│   │
│   ├── models/            # 資料模型層
│   │   ├── __init__.py
│   │   └── database.py    # 資料庫連接（單一 Engine）
│   │
│   ├── views/             # 界面視圖層
│   │   ├── __init__.py
│   │   ├── main_window.py         # 主視窗（書籍／篇目／搜尋）
│   │   ├── book_view.py           # 書籍管理視圖
│   │   ├── entry_view.py          # 篇目管理視圖
│   │   ├── search_entries_view.py # 搜尋篇目視圖
│   │   └── search_books_view.py   # 搜尋書籍視圖
│   │
│   ├── controllers/       # 控制器層（可與 views 合併）
│   │   ├── __init__.py
│   │   ├── book_controller.py
│   │   └── entry_controller.py
│   │
│   └── utils/             # 實用工具
│       ├── __init__.py
│       ├── import_csv.py          # CSV 匯入功能
│       ├── export_csv.py          # CSV 匯出功能
│       ├── backup.py              # 簡易備份
│       └── logger.py              # 日誌（基本）
│
├── resources/             # 資源文件
│   ├── icons/             # 圖標文件
│   │   ├── app.ico
│   │   ├── category.png
│   │   ├── book.png
│   │   └── search.png
│   ├── styles/            # 樣式文件
│   │   ├── main.qss
│   │   └── dark_theme.qss
│   └── database/          # 資料庫相關
│       ├── init.sql       # 初始化腳本
│       └── migrations/
│
├── data/                  # 資料目錄（安裝後使用）
│   ├── database.db        # SQLite資料庫文件
│   ├── backups/           # 備份文件目錄
│   └── exports/           # 匯出文件目錄
│
├── logs/                  # 日誌目錄
│   └── app.log
│
├── build_app.spec
├── requirements.txt       # 依賴套件
├── setup.py
└── README.md             # 說明文檔
```

### 3. 資料庫設計

#### 3.1 資料表結構

```sql
-- 類別表（對應 Prisma: Category）
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_categories_name ON categories(name);

-- 書籍表（對應 Prisma: Book）
CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    version TEXT NOT NULL,
    source TEXT NOT NULL,
    category_id INTEGER NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_books_title_author ON books(title, author);

-- 卷表（對應 Prisma: Roll）
CREATE TABLE rolls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll TEXT NOT NULL,
    roll_name TEXT NOT NULL,
    book_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX idx_rolls_book_id ON rolls(book_id);

-- 條目表（對應 Prisma: Entry）
CREATE TABLE entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_name TEXT NOT NULL,
    roll_id INTEGER NOT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roll_id) REFERENCES rolls(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX idx_entries_roll_id ON entries(roll_id);

-- 注意：`updated_at` 欄位由觸發器自動維護（見下方觸發器），
-- 新插入使用 DEFAULT CURRENT_TIMESTAMP。
```

#### 3.2 設計備註

- 單機單人，不含認證／權限。
- 採底線命名（如 `created_at`）。
- 僅保留必要索引與唯一鍵，避免過度設計。

#### 3.3 資料完整性

```sql
-- 唯一性約束（避免重複資料）
-- 書籍唯一鍵：以 title/author/version/source 決定一本書，避免重複建冊
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_unique
ON books(title, author, version, source);

-- 卷唯一鍵：同一本書內，(roll, roll_name) 不可重複
CREATE UNIQUE INDEX IF NOT EXISTS idx_rolls_unique
ON rolls(book_id, roll, roll_name);

-- 篇目唯一鍵：同一卷內，篇目名稱不可重複
CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_unique
ON entries(roll_id, entry_name);

-- 觸發器與遷移表：目前不實作（需要時再加入）
-- PRAGMA 建議：啟動後設定 foreign_keys/WAL/synchronous/busy_timeout
```

範例（SQLAlchemy 2.x，單一 Engine 設定 PRAGMA）：

```python
from sqlalchemy import event, create_engine

# 單一 Engine（UI 與匯入共用即可）
engine = create_engine(
    "sqlite:///data/database.db",
    future=True,
    pool_pre_ping=True,
    connect_args={"timeout": 5},  # busy_timeout 仍需以 PRAGMA 設定
)

@event.listens_for(engine, "connect")
def set_sqlite_pragmas(dbapi_conn, _):
    cur = dbapi_conn.cursor()
    cur.execute("PRAGMA foreign_keys=ON;")
    cur.execute("PRAGMA journal_mode=WAL;")
    cur.execute("PRAGMA synchronous=NORMAL;")
    cur.execute("PRAGMA busy_timeout=5000;")
    cur.close()
```

#### 3.4 全文搜尋

- 需要全文檢索時，可採用 SQLite FTS5 以虛表儲存可搜尋內容，並以觸發器同步正表與 FTS 表。

### 4. UI 設計概要

#### 主視窗設計

- **頂部選單欄**：檔案、編輯、檢視、工具、幫助
- **左側導航欄**：儀表板、類別管理、書籍管理、篇目管理、搜尋、設定
- **主內容區**：動態切換不同功能視圖
- **狀態欄**：顯示當前狀態、資料庫連接狀態、操作信息

#### 功能視圖設計

1. 儀表板可省略，於狀態列顯示基本資訊

2. 類別管理可後續加入（可先在書籍中以自由文字）

3. 書籍管理：列表／新增／編輯／刪除；關鍵字搜尋（title/author）

4. 篇目管理：列表／新增／編輯／刪除；按書籍／卷篩選

5. 搜尋視圖：單頁關鍵字搜尋（多欄位 OR），結果可導出 CSV

6. 匯入/匯出：單視窗；匯入 CSV（遇重複可跳過）、匯出 CSV

7. 設定可先用簡單對話框設定資料目錄（可寫入檔）

### 5. 核心功能

#### 資料管理

- ✅ 書籍管理（新增／編輯／刪除／搜尋）
- ✅ 卷管理（新增／編輯／刪除）
- ✅ 篇目管理（新增／編輯／刪除／搜尋）

#### 搜尋功能

- ✅ 多欄位關鍵字 OR 搜尋（title/author/roll/entry）
- ✅ 搜尋結果匯出 CSV
- FTS5、搜尋歷史、排序篩選可於需要時加入

#### 資料匯入匯出

- ✅ CSV 匯入／匯出（UTF-8）
- Excel 匯入／匯出可於需要時安裝後使用
- 大量批次處理、錯誤報表可於需要時加入

#### 備份還原

- ✅ 一鍵備份（複製檔案）與手動還原
- 備份排程與備份管理 UI 可於需要時加入

#### 系統功能

- ✅ 基本日誌與錯誤處理
- 設定頁、資料庫遷移工具可於需要時加入

### 6. 安裝與使用說明

#### 開發環境安裝

```bash
# 1. 克隆專案
git clone [repository-url]
cd desktop

# 2. 創建虛擬環境
python -m venv mignqing
source mignqing/bin/activate  # Windows: venv\Scripts\activate

# 3. 安裝依賴
pip install -r requirements.txt

# 4. 運行應用程式（首次啟動自動建立資料庫與目錄）
python src/main.py
```

#### 使用者安裝

1. 下載最新版本安裝包
2. 運行安裝程式
3. 按照安裝嚮導完成安裝
4. 首次運行時會自動創建資料庫和必要目錄

#### 基本使用流程

1. 啟動程式後，首先在「類別管理」中建立文獻類別
2. 在「書籍管理」中新增書籍資料
3. 在「篇目管理」中新增篇目資料
4. 使用「搜尋」功能查找所需資料
5. 使用「匯入/匯出」功能進行資料交換

### 7. 開發指南

#### 開發流程

1. 克隆專案到本地
2. 設置開發環境
3. 運行 `python src/main.py` 開始開發
4. 使用 `pytest` 運行測試
5. 使用 `black` 格式化代碼
6. 使用 PyInstaller 打包應用程式

#### 代碼規範

- 使用 Python 類型提示
- 遵循 PEP 8 代碼風格
- 編寫單元測試
- 添加適當的註釋和文檔

#### 測試

```bash
# 運行所有測試
python -m pytest tests/

# 運行特定測試
python -m pytest tests/test_models.py

# 生成測試覆蓋率報告
python -m pytest --cov=src tests/
```

#### 打包發布

```bash
# macOS（產生 .app 與可分發目錄）
./package-mac.sh

# Windows（PowerShell）
pwsh -File ./package-win.ps1 -UseSystemPython
```

打包輸出目錄：`desktop/dist/MingQingDB/`

說明：

- 已內嵌 `resources/`（樣式與初始化 SQL）。
- 執行期資料放置於使用者資料目錄：
  - macOS: `~/Library/Application Support/MingQingDB`
  - Windows: `%LOCALAPPDATA%\MingQingDB`
  - Linux: `~/.local/share/MingQingDB`
- 首次啟動會自動於上述資料目錄建立 `database.db` 與 `backups/`。

### 8. 資料遷移

#### 從網頁版遷移資料

1. 從網頁版匯出 CSV 格式資料
2. 使用本程式的匯入功能
3. 或使用資料庫遷移工具直接轉換

#### 資料庫升級

- 不提供自動遷移；若未來調整結構，請先備份後再重建

#### 大量匯入策略（需要時再採用）

- 目標：在單機 SQLite 上以「可靠、可回復」方式大量匯入，不阻塞 UI、可觀測進度、資料不重複。
- 前提：CSV 欄位順序與 Web 版一致（title, author, roll, rollName, entry, version, source, remarks）。

流程（建議採「分批＋暫存表＋集合式 SQL」）

1. 分批讀取與交易

   - 以 10,000 筆為一批（可調 5k–20k），每批使用單一交易提交。
   - 以背景執行緒處理，回報進度（行數與批次），可取消。

2. 暫存表 staging（每批建立/清空）

```sql
-- 暫存匯入資料（每批重建或 TRUNCATE 等效）
DROP TABLE IF EXISTS staging_entries;
CREATE TABLE staging_entries (
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  roll TEXT NOT NULL,
  rollName TEXT NOT NULL,
  entry TEXT NOT NULL,
  version TEXT NOT NULL,
  source TEXT NOT NULL,
  remarks TEXT NULL
);
```

3. 批次寫入 staging（Python executemany 或 pandas.to_sql(chunksize)）

```python
# 以 executemany 寫入 staging_entries（略）
```

4. 集合式匯入（依唯一鍵去重，具冪等性）

```sql
-- 4.1 補齊缺少的書籍（以唯一鍵定義一本書）
INSERT OR IGNORE INTO books(title, author, version, source, category_id, remarks)
SELECT DISTINCT s.title, s.author, s.version, s.source, NULL, NULL
FROM staging_entries s;

-- 4.2 補齊缺少的卷（由 staging 對應到剛補齊/既有的書籍）
INSERT OR IGNORE INTO rolls(roll, roll_name, book_id)
SELECT DISTINCT s.roll, s.rollName, b.id
FROM staging_entries s
JOIN books b ON b.title = s.title AND b.author = s.author AND b.version = s.version AND b.source = s.source;

-- 4.3 補齊缺少的篇目（由 staging 對應到 rolls）
INSERT INTO entries(entry_name, roll_id, remarks)
SELECT s.entry, r.id, s.remarks
FROM staging_entries s
JOIN books b ON b.title = s.title AND b.author = s.author AND b.version = s.version AND b.source = s.source
JOIN rolls r ON r.book_id = b.id AND r.roll = s.roll AND r.roll_name = s.rollName
ON CONFLICT(roll_id, entry_name) DO UPDATE SET
  remarks = COALESCE(excluded.remarks, entries.remarks);
```

特性與說明

- 冪等：依賴唯一索引（見 3.3）。books/rolls 採 `INSERT OR IGNORE` 去重；entries 採 UPSERT，僅當來源 `remarks` 非空時覆蓋原值（透過 `COALESCE(excluded.remarks, entries.remarks)`）。
- 原子性：每批以單一交易提交；失敗可回滾到批次起點。
- 效能：集合式 SQL 大幅減少往返與逐列查詢；staging 可讓 SQLite 以索引有效合併。
- 驗證：匯入前可在應用層驗證欄位空值/長度/非法字元；錯誤列輸出到報表（CSV/Excel）不影響主流程。

可考慮的優化（僅在需要時啟用）

- 暫時關閉非唯一索引（如 `idx_books_title_author`、`idx_rolls_book_id`、`idx_entries_roll_id`）於大量匯入前，匯入完畢再重建；唯一索引需保留以確保冪等。
- 匯入會話期間可調整 PRAGMA（僅針對此匯入連線）：
  - `PRAGMA busy_timeout=5000;`（避免短暫鎖直接失敗）
  - `PRAGMA cache_size=-200000;`（約 200MB 快取，依記憶體調整）
  - `PRAGMA temp_store=MEMORY;`
  - 不建議 `locking_mode=EXCLUSIVE`（會阻塞 UI 讀取）。
  - 完成後恢復預設；`foreign_keys=ON` 請保持不變。

收尾步驟（必做）

- 若匯入前有停用非唯一索引，請先重建（與表結構一致）。
- 執行 `ANALYZE;` 以更新統計資訊，優化查詢計劃。
- 執行 `PRAGMA wal_checkpoint(TRUNCATE);` 釋放 WAL 檔案空間。

恢復與續傳

- 任何批次失敗都不影響先前批次；修正來源檔或清理 staging 後可從失敗批次重新開始。
- 因為採用 `INSERT OR IGNORE` 與唯一鍵，重覆執行批次不會產生重複資料。

FTS（若啟用）

- 建議在全部匯入完成後再重建 FTS 索引或觸發重建，避免匯入期間頻繁維護造成額外成本。

### 9. 常見問題

#### 資料庫相關

- **資料庫文件位置**：`data/database.db`
- **備份文件位置**：`data/backups/`
- **日誌文件位置**：`logs/app.log`

#### 匯入匯出

- **支援的格式**：CSV、Excel (.xlsx)
- **檔案編碼**：UTF-8
- **欄位對應**：與網頁版完全兼容

#### 性能優化

- 使用索引優化搜尋性能
- 支援大量資料的批量處理
- 記憶體使用優化

#### 故障排除

- 檢查日誌文件 `logs/app.log`
- 確認資料庫文件權限
- 重新初始化資料庫（會清空資料）

### 10. 版本歷史

#### v0.1.0（規劃）

- 書籍／卷／篇目 CRUD
- 關鍵字搜尋與 CSV 匯出
- CSV 匯入（遇重複跳過）

#### 未來計劃

- Excel 匯入／匯出
- 進階搜尋（排序、篩選、FTS5）
- 類別管理與設定頁
- 打包安裝程式

### 11. 功能清單（對齊說明）

（桌面端採本地 SQLite，不呼叫 Web API；此段僅為與網頁版語意對齊的參考，可略讀。）

#### 桌面端（PyQt6）實作清單

- 書籍管理：列表／搜尋（title/author）／新增／編輯／刪除
- 篇目管理：列表／搜尋（roll/entry）／新增／編輯／刪除
- 匯入匯出：CSV 匯入（欄位：title, author, roll, rollName, entry, version, source, remarks）；CSV 匯出
- 備份：一鍵備份與手動還原
- 類別管理、設定頁、進階搜尋、Excel、FTS5 可於需要時加入

以上清單可作為開發勾選表，逐項完成後即可達到與現有前後端一致的資料與功能語意。
