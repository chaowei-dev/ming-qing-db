## 明清文獻資料庫單機版

本專案是明清文獻資料庫的單機版本，使用 PyQt6 開發桌面應用程式，SQLite 作為本地資料庫。對應前後端已開發的功能，重置一個本地端的版本。旨在提供完整的文獻管理、搜尋、匯入匯出等功能，與網頁版保持資料格式兼容。

### 1. 開發環境設置

#### 系統要求
- Python 3.9+
- Windows 10+ / macOS 10.15+ / Linux (Ubuntu 18.04+)

#### 所需安裝套件
```bash
# 核心依賴
pip install PyQt6>=6.4.0
pip install pandas>=2.0.0
pip install openpyxl>=3.1.0
pip install SQLAlchemy>=2.0.0

# 開發工具
pip install PyInstaller>=5.0.0
pip install pytest>=7.0.0
pip install black>=23.0.0
pip install flake8>=6.0.0

# 或使用 requirements.txt
pip install -r requirements.txt
```

### 2. 專案結構設計

```
ming-qing-db-desktop/
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

#### 資料表結構（對應 Prisma）
```sql
-- 使用者表（對應 Prisma: User）
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN','USER'))
);

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

-- 注意：updated_at 欄位請在應用程式更新資料時同步寫入 CURRENT_TIMESTAMP。
```

#### 與 Prisma 對齊說明
- 欄位命名：桌面端 SQLite 採用底線風格（如 `created_at`），對應 Prisma / 後端的駝峰（如 `createdAt`）。
- 外鍵行為：`books.category_id` 於刪除類別時採 `SET NULL`，其他外鍵為 `RESTRICT`（與後端一致）。
- 補充索引：為常用查詢路徑添加索引（如 `books(title, author)`、`rolls(book_id)`、`entries(roll_id)`）。
- 全文搜尋：若需要 SQLite FTS5，建議另建虛表與同步策略（可在後續版本加入）。

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
- ✅ 全文搜尋
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
cd ming-qing-db-desktop

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
- 認證
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