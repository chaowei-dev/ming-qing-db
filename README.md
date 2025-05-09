# 明清文獻資料庫系統 (Ming-Qing Database System)

## 專案簡介

這是一個專門用於管理和檢索明清時期文獻資料的數位人文資料庫系統。本系統支援多種文獻類型的管理，包括詩文集、檔案文獻等，並提供強大的檢索和管理功能。專案分為網頁版和單機版兩種形式。

## 資料庫收錄狀態

| 資料庫名稱 | 狀態 | 說明 |
|------------|------|------|
| 明清詩文集篇目索引 | ✅ 已建置 | 主要收錄明清時期的詩文集篇目 |
| 四川巴縣縣署檔案目錄 | 📝 已有資料 | 清代巴縣衙門檔案 |
| 順天府檔案目錄 | 📝 已有資料 | 清代順天府檔案 |
| 南部縣檔案目錄 | 🔄 取得中 | 清代南部縣檔案 |
| 大清律例根原全文資料庫 | 🔄 取得中 | 清代法律文獻 |

## 功能特色

- 進階搜尋（多欄位組合查詢）
- 書籍資料管理（新增、編輯、刪除）
- 篇目資料管理（新增、編輯、刪除）
- 批量資料匯入功能（使用 .csv 格式）
- 一鍵備份資料庫（網頁版和單機版格式共用）

## 資料匯入與匯出格式

系統支援使用標準 CSV 格式進行資料批量匯入與匯出。匯入/匯出資料包含以下欄位：

| 欄位名稱 | 描述 | 備註 |
|---------|------|------|
| title | 書籍標題 | 必填 |
| author | 作者 | 必填 |
| version | 版本 | 必填 |
| source | 來源 | 必填 |
| roll | 卷號 | 必填 |
| rollName | 卷名 | 必填 |
| entry | 篇目名稱 | 必填 |

範例文件：`client/public/entry_example.xlsx`（可另存為 CSV 格式使用）

### 匯入步驟
1. 將資料整理為上述格式的 CSV 文件
2. 請先選擇「類別」，再透過「匯入」功能上傳檔案
3. 系統會自動檢查和處理重複資料

### 匯出格式
系統支援將搜尋結果或完整資料匯出為 CSV 格式，便於資料交換與備份。

## 系統版本

本專案提供兩種使用模式：

### 網頁版 (Web Version)

基於 React + Node.js + PostgreSQL 的完整網頁應用，適合多人協作與遠端訪問。

### 單機版 (Desktop Version) - 開發中

基於 PyQt + SQLite 的桌面應用，適合個人研究與不依賴網路的場景。單機版具有以下特點：

- 一鍵安裝，無需配置環境
- 完全離線使用，無需網路連接
- 資料庫文件可便捷備份與轉移
- 與網頁版保持相同的核心功能
- 針對桌面環境優化的使用者界面

## 技術架構

### 網頁版 (Web Version)

#### 前端 (client)
- React 18
- TypeScript
- React Bootstrap UI 框架
- React Router 路由管理
- Axios HTTP 客戶端

#### 後端 (backend)
- Node.js
- Express.js 框架
- TypeScript
- Prisma ORM
- PostgreSQL 資料庫
- JWT 認證
- Passport.js 身份驗證

### 單機版 (Desktop Version)

- Python 3.9+
- PyQt6 UI 框架
- SQLite 資料庫
- pandas 資料處理
- PyInstaller 打包工具

### 資料庫結構
```
Category (類別)
└── Book (書籍)
    └── Roll (卷)
        └── Entry (條目)
```

## 安裝與部署

### 網頁版 (Web Version)

#### 環境要求
- Node.js 20+
- PostgreSQL 14+
- Docker（選用）

#### 本地開發環境設置

1. 克隆專案
```bash
git clone [repository-url]
cd ming-qing-db
```

2. 後端設置
```bash
cd backend
npm install
touch .env  # 編輯 .env 文件設置資料庫連接等配置
npm run dev
```

3. 後端 (.env) 範例
```
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
```

4. 前端設置
```bash
cd client
npm install
npm run dev
```

#### Docker 部署
```bash
docker-compose up -d
```

### 單機版 (Desktop Version)

#### 使用者安裝

1. 下載最新版本安裝包
2. 雙擊執行安裝檔
3. 安裝完成後，從桌面或開始選單啟動應用程式

#### 開發環境設置

1. 克隆單機版儲存庫
```bash
git clone [desktop-repo-url]
cd ming-qing-db-desktop
```

2. 設置 Python 環境
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. 運行開發版本
```bash
python src/main.py
```

4. 打包應用程式
```bash
pyinstaller build_app.spec
```

## 開發中功能

### 網頁版

#### 備份功能
- [ ] 資料匯出至 .csv 和 .xlsx

#### 後端功能
- [x] Category 資料表建置
- [x] Book 表格關聯 Category
- [x] 更新 Book/Entry API
- [x] Category 列表 API

#### 前端功能
- [x] Category 頁面和選單
- [x] 書目列表頁面優化
- [x] 篇目列表頁面優化
- [x] 篇目匯入功能更新

### 單機版

#### 核心功能
- [ ] 資料庫結構設計與遷移
- [ ] 主界面實現
- [ ] 書籍與篇目管理介面
- [ ] 搜尋功能實現
- [ ] 資料匯入與匯出功能（支援 .csv 格式，與網頁版格式兼容）

#### 發布與部署
- [ ] Windows 安裝包製作
- [ ] macOS 安裝包製作
- [ ] 線上更新機制
