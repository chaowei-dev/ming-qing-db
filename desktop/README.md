## 明清文獻資料庫單機版

本專案是明清文獻資料庫的單機版本，使用 PyQt6 開發桌面應用程式，SQLite 作為本地資料庫。對應前後端已開發的功能，重置一個本地端的版本。旨在提供完整的文獻管理、搜尋、匯入匯出等功能，與網頁版保持資料格式兼容。

### 1. 開發環境設置

#### 系統要求
- Python 3.9+
- Windows 10+ / macOS 10.15+ / Linux (Ubuntu 18.04+)

#### 所需安裝套件
```bash
# 推薦使用 requirements.txt（已釘選次要版本）
pip install -r requirements.txt

# 或分別安裝（同等版本範圍）
pip install PyQt6==6.6.*
pip install pandas==2.2.*
pip install openpyxl==3.1.*
pip install SQLAlchemy==2.0.*
pip install appdirs==1.4.*

# 開發工具
pip install PyInstaller==6.6.*
pip install pytest==8.3.*
pip install black==24.8.*
pip install flake8==7.1.*
```

### 2. 專案結構設計

```
desktop/
│
├── src/                    # 源代碼目錄
│   ├── main.py            # 程式進入點
│   ├── __init__.py
│   │
│   ├── models/            # 資料模型層
│   │   ├── __init__.py
│   │   ├── database.py    # 資料庫連接與設置
│   │   ├── base.py        # 基礎模型類
│   │   ├── category.py    # Category 模型
│   │   ├── book.py        # Book 模型
│   │   ├── roll.py        # Roll 模型
│   │   └── entry.py       # Entry 模型
│   │
│   ├── views/             # 界面視圖層
│   │   ├── __init__.py
│   │   ├── main_window.py         # 主視窗
│   │   ├── dashboard_view.py      # 統計儀表板
│   │   ├── category_view.py       # 類別管理視圖
│   │   ├── book_view.py           # 書籍管理視圖
│   │   ├── entry_view.py          # 篇目管理視圖
│   │   ├── search_view.py         # 搜尋視圖
│   │   ├── import_export_view.py  # 資料匯入匯出視圖
│   │   └── settings_view.py       # 設定頁面
│   │
│   ├── controllers/       # 控制器層
│   │   ├── __init__.py
│   │   ├── category_controller.py
│   │   ├── book_controller.py
│   │   ├── entry_controller.py
│   │   ├── search_controller.py
│   │   └── import_export_controller.py
│   │
│   └── utils/             # 實用工具
│       ├── __init__.py
│       ├── import_csv.py          # CSV 匯入功能
│       ├── export_csv.py          # CSV 匯出功能
│       ├── backup.py              # 資料庫備份功能
│       ├── logger.py              # 日誌系統
│       ├── validators.py          # 資料驗證
│       ├── database_migrator.py   # 資料庫遷移工具
│       └── constants.py           # 常數定義
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
│       └── migrations/    # 資料庫遷移腳本
│
├── tests/                 # 單元測試
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_controllers.py
│   └── test_utils.py
│
├── data/                  # 資料目錄（安裝後使用）
│   ├── database.db        # SQLite資料庫文件
│   ├── backups/           # 備份文件目錄
│   └── exports/           # 匯出文件目錄
│
├── logs/                  # 日誌目錄
│   └── app.log
│
├── build_app.spec         # PyInstaller打包配置
├── requirements.txt       # 依賴套件
├── setup.py              # 安裝腳本
└── README.md             # 說明文檔
```

### 3. 資料庫設計

#### 3.1 資料表結構（對應 Prisma）
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

#### 3.2 與 Web/Prisma 對齊說明
- 欄位命名：桌面端 SQLite 採用底線風格（如 `created_at`），對應 Prisma / 後端的駝峰（如 `createdAt`）。
- 外鍵行為：`books.category_id` 於刪除類別時採 `SET NULL`，其他外鍵為 `RESTRICT`（與後端一致）。
- 補充索引：為常用查詢路徑添加索引（如 `books(title, author)`、`rolls(book_id)`、`entries(roll_id)`）。
 - 單機桌面版為單使用者，不含認證/登入/權限；認證相關為 Web 版僅。
 

#### 3.3 資料完整性與維護（唯一鍵、觸發器、遷移、PRAGMA）

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

-- updated_at 自動更新觸發器（僅在關鍵欄位變更時觸發，避免遞迴）
-- 類別表：當 name 變更時更新 updated_at
CREATE TRIGGER IF NOT EXISTS categories_set_updated_at
AFTER UPDATE OF name ON categories
BEGIN
  UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 書籍表：當主要資訊或關聯變更時更新 updated_at
CREATE TRIGGER IF NOT EXISTS books_set_updated_at
AFTER UPDATE OF title, author, version, source, category_id, remarks ON books
BEGIN
  UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 卷表：當卷號/卷名/所屬書籍變更時更新 updated_at
CREATE TRIGGER IF NOT EXISTS rolls_set_updated_at
AFTER UPDATE OF roll, roll_name, book_id ON rolls
BEGIN
  UPDATE rolls SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 篇目表：當名稱/所屬卷/備註變更時更新 updated_at
CREATE TRIGGER IF NOT EXISTS entries_set_updated_at
AFTER UPDATE OF entry_name, roll_id, remarks ON entries
BEGIN
  UPDATE entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 簡易遷移版本表（記錄已套用的資料庫版本）
-- 用於記錄每次結構升級的版本與套用時間，避免重複與遺漏
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 連線層 PRAGMA 建議（於程式啟動後設定）
PRAGMA foreign_keys = ON;    -- 啟用外鍵約束
PRAGMA journal_mode = WAL;   -- 提升讀寫並行性
PRAGMA synchronous = NORMAL; -- 與 WAL 搭配的平衡模式
```

範例（SQLAlchemy 2.x 於連線建立時設定 PRAGMA）：

```python
from sqlalchemy import event, create_engine

# UI 主執行緒專用 Engine（讀寫）
ui_engine = create_engine(
    "sqlite:///data/database.db",
    future=True,
    pool_pre_ping=True,
    connect_args={"timeout": 5},  # busy_timeout 仍需以 PRAGMA 設定
)

@event.listens_for(ui_engine, "connect")
def set_sqlite_pragmas_for_ui(dbapi_conn, _):
    cur = dbapi_conn.cursor()
    cur.execute("PRAGMA foreign_keys=ON;")
    cur.execute("PRAGMA journal_mode=WAL;")
    cur.execute("PRAGMA synchronous=NORMAL;")
    cur.execute("PRAGMA busy_timeout=5000;")
    cur.close()

# 匯入背景執行緒專用 Engine（避免共用連線）
import_engine = create_engine(
    "sqlite:///data/database.db",
    future=True,
    pool_pre_ping=True,
)

@event.listens_for(import_engine, "connect")
def set_sqlite_pragmas_for_import(dbapi_conn, _):
    cur = dbapi_conn.cursor()
    cur.execute("PRAGMA foreign_keys=ON;")
    cur.execute("PRAGMA journal_mode=WAL;")
    cur.execute("PRAGMA synchronous=NORMAL;")
    cur.execute("PRAGMA busy_timeout=5000;")
    cur.execute("PRAGMA temp_store=MEMORY;")
    cur.execute("PRAGMA cache_size=-200000;")  # 約 200MB，視記憶體調整
    cur.close()
```

#### 3.4 全文搜尋（可選）
- 需要全文檢索時，採用 SQLite FTS5 以虛表儲存可搜尋內容，並以觸發器同步正表與 FTS 表；本版本先不內建，視需求加入。

### 4. UI 設計概要

#### 主視窗設計
- **頂部選單欄**：檔案、編輯、檢視、工具、幫助
- **左側導航欄**：儀表板、類別管理、書籍管理、篇目管理、搜尋、設定
- **主內容區**：動態切換不同功能視圖
- **狀態欄**：顯示當前狀態、資料庫連接狀態、操作信息

#### 功能視圖設計

1. **儀表板視圖 (Dashboard)**
   - 資料庫統計信息（總書籍數、總篇目數等）
   - 最近操作記錄
   - 快速搜尋框
   - 系統狀態指示器

2. **類別管理視圖**
   - 類別列表（表格顯示）
   - 新增/編輯/刪除類別
   - 類別統計信息
   - 批量操作功能

3. **書籍管理視圖**
   - 書籍列表（表格顯示，支援排序）
   - 進階篩選功能（按類別、作者、版本等）
   - 新增/編輯/刪除書籍
   - 書籍詳情查看
   - 批量匯入/匯出

4. **篇目管理視圖**
   - 篇目列表（表格顯示）
   - 篩選功能（按書籍、卷）
   - 新增/編輯/刪除篇目
   - 篇目搜尋功能
   - 批量操作

5. **搜尋視圖**
   - 多欄位搜尋表單
   - 搜尋歷史記錄
   - 搜尋結果列表
   - 結果匯出功能
   - 進階搜尋選項

6. **匯入/匯出視圖**
   - 檔案選擇界面
   - 匯入進度指示器
   - 資料預覽功能
   - 錯誤處理和報告
   - 匯出格式選擇

7. **設定頁面**
   - 資料庫設定
   - 界面主題選擇
   - 備份設定
   - 匯入/匯出設定
   - 系統資訊

### 5. 核心功能

#### 資料管理
- ✅ 類別管理（新增、編輯、刪除）
- ✅ 書籍管理（新增、編輯、刪除、搜尋）
- ✅ 卷管理（新增、編輯、刪除）
- ✅ 篇目管理（新增、編輯、刪除、搜尋）
- ✅ 資料驗證和完整性檢查

#### 搜尋功能
- （可選）全文搜尋（FTS5）
- ✅ 多欄位組合搜尋
- ✅ 搜尋歷史記錄
- ✅ 搜尋結果排序和篩選
- ✅ 搜尋結果匯出

#### 資料匯入匯出
- ✅ CSV 格式匯入/匯出
- ✅ Excel 格式匯入/匯出
- ✅ 與網頁版格式兼容
- ✅ 批量資料處理
- ✅ 資料驗證和錯誤報告

#### 備份還原
- ✅ 自動備份功能
- ✅ 手動備份功能
- ✅ 備份檔案管理
- ✅ 資料還原功能

#### 系統功能
- ✅ 日誌記錄
- ✅ 錯誤處理
- ✅ 設定管理
- ✅ 資料庫遷移工具

### 6. 安裝與使用說明

#### 開發環境安裝
```bash
# 1. 克隆專案
git clone [repository-url]
cd desktop

# 2. 創建虛擬環境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 安裝依賴
pip install -r requirements.txt

# 4. 初始化資料庫
python src/utils/database_migrator.py

# 5. 運行應用程式
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
# 1. 更新版本號
# 2. 運行測試
python -m pytest tests/

# 3. 打包應用程式
pyinstaller build_app.spec

# 4. 測試打包後的應用程式
# 5. 發布新版本
```

### 8. 資料遷移

#### 從網頁版遷移資料
1. 從網頁版匯出 CSV 格式資料
2. 使用本程式的匯入功能
3. 或使用資料庫遷移工具直接轉換

#### 資料庫升級
- 支援自動資料庫結構升級
- 提供資料庫備份功能
- 支援版本回滾

#### 大量匯入策略（至 1,000,000 筆）
- 目標：在單機 SQLite 上以「可靠、可回復」方式大量匯入，不阻塞 UI、可觀測進度、資料不重複。
- 前提：CSV 欄位順序與 Web 版一致（title, author, roll, rollName, entry, version, source, remarks）。

流程（建議採「分批＋暫存表＋集合式 SQL」）
1) 分批讀取與交易
   - 以 10,000 筆為一批（可調 5k–20k），每批使用單一交易提交。
   - 以背景執行緒處理，回報進度（行數與批次），可取消。

2) 暫存表 staging（每批建立/清空）
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

3) 批次寫入 staging（Python executemany 或 pandas.to_sql(chunksize)）
```python
# 以 executemany 寫入 staging_entries（略）
```

4) 集合式匯入（依唯一鍵去重，具冪等性）
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

可選優化（僅在需要時啟用）
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

#### v1.0.0 (計劃中)
- 基礎功能實現
- 資料管理功能
- 搜尋功能
- 匯入匯出功能

#### 未來計劃
- 支援更多資料格式
- 進階搜尋功能
- 資料視覺化
- 多語言支援

### 11. 前後端功能清單（實作指引）

#### 後端（對照既有 Web API 能力）
- 認證（Web 版僅；桌面端不實作）
  - POST /auth/register：使用者註冊
  - POST /auth/login：使用者登入（取得 Token）
- 類別（Category）
  - 取得列表
  - 新增（Admin）／更新（Admin）／刪除（Admin）
- 書籍（Book）
  - 分頁列表＋條件搜尋（size/page/keyword）
  - 取得單筆／取得統計數（count）
  - 取得書籍細節（含卷、類別摘要）
  - 新增（Admin）／更新（Admin）／刪除（Admin）
- 篇目（Entry）
  - 分頁列表＋條件搜尋（多欄位）
  - 取得統計數（count）
  - 新增（Admin）：按 title/author/version/source 判斷 Book，按 roll/roll_name 判斷 Roll，最後建立 Entry（支援 remarks）

（桌面端採本地 SQLite，不直接呼叫 Web API；此清單用於確保功能語意一致與資料互通。）

#### 桌面端前端（PyQt6）實作清單
- 類別管理：列表／新增／編輯／刪除
- 書籍管理：列表（分頁）／篩選（類別、作者、版本）／詳情／新增／編輯／刪除
- 篇目管理：列表（分頁）／搜尋（多欄位）／新增／編輯／刪除
- 匯入匯出：
  - 匯入 CSV：欄位順序與 Web 版一致（title, author, roll, rollName, entry, version, source, remarks）
  - 匯出 CSV：支援列表或查詢結果匯出
- 搜尋：多欄位關鍵字組合搜尋（可後續加入 FTS5 全文檢索）
- 備份：一鍵備份/還原 SQLite；備份檔案管理
- 設定：資料目錄、主題、匯入/匯出預設

以上清單可作為開發勾選表，逐項完成後即可達到與現有前後端一致的資料與功能語意。