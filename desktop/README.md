## 明清文獻資料庫單機版

本專案是明清文獻資料庫的單機版本，使用 PyQt6 開發桌面應用程式，SQLite 作為本地資料庫。提供完整的文獻管理、搜尋、匯入匯出等功能。

### 1. 開發環境設置

#### 所需安裝套件
```
pip install PyQt6 pandas openpyxl SQLAlchemy PyInstaller
```

### 2. 專案結構設計

建議的單機版專案目錄結構：
```
ming-qing-db-desktop/
│
├── src/                # 源代碼目錄
│   ├── main.py         # 程式進入點
│   │   └── __init__.py
│   ├── models/         # 資料模型
│   │   ├── database.py # 資料庫連接與設置
│   │   ├── book.py     # Book 模型
│   │   ├── category.py # Category 模型
│   │   ├── roll.py     # Roll 模型
│   │   └── entry.py    # Entry 模型
│   │
│   ├── views/          # 界面視圖
│   │   ├── __init__.py
│   │   ├── main_window.py     # 主視窗
│   │   ├── book_view.py       # 書籍管理視圖
│   │   ├── entry_view.py      # 篇目管理視圖
│   │   ├── search_view.py     # 搜尋視圖
│   │   └── import_export.py   # 資料匯入匯出視圖
│   │
│   └── utils/          # 實用工具
│       ├── __init__.py
│       ├── import_csv.py      # CSV 匯入功能
│       ├── export_csv.py      # CSV 匯出功能
│       └── backup.py          # 資料庫備份功能
│
├── resources/          # 資源文件
│   ├── icons/          # 圖標
│   └── styles/         # 樣式文件
│
├── tests/              # 單元測試
│
├── data/               # 資料目錄（安裝後使用）
│   └── database.db     # SQLite資料庫文件（默認位置）
│
├── build_app.spec      # PyInstaller打包配置
├── requirements.txt    # 依賴套件
└── README.md           # 說明文檔
```

### 3. UI 設計概要

主要界面設計：

1. **主視窗**
   - 頂部選單：檔案、編輯、檢視、工具、幫助
   - 左側導航：類別、書籍管理、篇目管理、搜尋
   - 狀態欄：顯示當前狀態和操作信息

2. **書籍管理視圖**
   - 書籍列表（表格顯示）
   - 搜尋篩選功能
   - 新增/編輯/刪除按鈕

3. **篇目管理視圖**
   - 篇目列表（表格顯示）
   - 篩選功能（按書籍、卷）
   - 新增/編輯/刪除按鈕

4. **搜尋視圖**
   - 多欄位搜尋表單
   - 結果列表
   - 匯出功能

5. **匯入/匯出視圖**
   - 選擇文件界面
   - 進度指示器
   - 操作結果顯示

6. **備份/還原界面**
   - 備份設置
   - 還原選項
   - 操作日誌

### 4. 安裝與使用說明

#### 安裝步驟
1. 下載最新版本的安裝包
2. 運行安裝程式
3. 按照安裝嚮導完成安裝
4. 首次運行時會自動創建資料庫

#### 基本使用
1. 啟動程式後，可以通過左側導航欄訪問不同功能
2. 使用頂部選單進行檔案操作、工具使用等
3. 資料會自動保存在本地資料庫中

### 5. 開發指南

#### 開發流程
1. 克隆專案到本地
2. 安裝所需依賴套件
3. 運行 `src/main.py` 開始開發
4. 使用 PyInstaller 打包應用程式

#### 測試
- 運行單元測試：`python -m pytest tests/`
- 手動測試：確保所有功能正常運作

#### 打包發布
1. 更新版本號
2. 運行 `pyinstaller build_app.spec`
3. 測試打包後的應用程式
4. 發布新版本

### 6. 常見問題

#### 資料庫相關
- 資料庫文件位置：`data/database.db`
- 備份文件位置：`data/backups/`

#### 匯入匯出
- 支援的格式：CSV、Excel
- 檔案編碼：UTF-8