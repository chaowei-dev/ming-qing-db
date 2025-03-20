# ming-qing-db

# to do

- backend:
  [x] 新增 Category table
  [x] 在 Book 新增 FK categoryId
  [ ] 更新所有 book 的 categoryId to "明清詩文集篇目索引"
  [ ] 更新 api for Book/Entry
  [ ] 新增 api for Category list


- frontend:
  [ ] 新增 Book page and Menu bar
  [ ]更新書目列表頁面（table + search）
  [ ] 更新篇目列表頁面（table + search）
  [ ] 更新匯入篇目功能

- 預計建置的資料庫謹備忘如下：
  [ ] 明清詩文集篇目索引。（已建置）
  [ ] 四川巴縣縣署檔案目錄。（已有資料）
  [ ] 順天府檔案目錄。（已有資料）
  [ ] 南部縣檔案目錄。（資料取得中）
  [ ] 大清律例根原全文資料庫。（資料取得中）

# Function

- Show list
  - Pagination
  - Init is searching ""
  - Search multiple keyword ("a"+"b"+"c")
  - Advanced searching (multi-column)
  - Download searching results
- Add book
- Add entry
  - Need roll, roll_name, book
- Sign up
- Login
  - Add
  - Update
  - Remove
  - Import

# Database Structure

- Book
  | book_id | title | author | version | source | remarks | created_by | updated_by |
  | ------- | ----- | ------ | ------- | ------ | ------- | ---------- | ---------- |

- Roll
  | roll_id | roll | roll_name | created_by | updated_by | book_id |
  | ------- | ---- | --------- | ---------- | ---------- | ------- |

- Entry
  | entry_id | entry | remarks | created_by | updated_by | roll_id |
  | -------- | ----- | ------- | ---------- | ---------- | ------- |

# Project Structure

- node version: 20

```
ming-qing-db/
│
├── backend/              # Backend directory
│   ├── src/              # Source code for the backend
│   │   ├── controllers/  # Handle incoming requests, process them, and send responses back to the client
│   │   ├── models/       # Data models represent the structure of your data
│   │   ├── routes/       # API route definitions using a router framework like Express
│   │   └── utils/        # Utility functions that are used across the backend
│   ├── tests/            # Unit tests for backend code using testing frameworks like Jest
│   ├── package.json      # Node.js dependencies and scripts for the backend
│   ├── tsconfig.json     # TypeScript configuration for the backend
│   └── README.md         # Backend-specific documentation
│
└── frontend/             # Frontend directory
    ├── public/           # Static assets (index.html, images, etc.)
    ├── src/              # Source code for the frontend
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # React components representing pages/views
    │   ├── styles/       # CSS or SCSS stylesheets
    │   ├── utils/        # Utility functions
    │   └── App.tsx       # Main React component
    ├── tests/            # Tests for frontend code
    ├── package.json      # Node.js dependencies and scripts for the frontend
    ├── tsconfig.json     # TypeScript configuration for the frontend
    └── README.md         # Frontend-specific documentation
```

# Database (Postgresql)

- backend (.env)

  - `DATABASE_URL=postgresql://user:pass@localhost:5432/dbname`
  - `JWT_SECRET=your_jwt_secret`

- postgresql docker:
  `docker run --name postgres-container --network backend_network -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ming_qing -d -p 5432:5432 -v /home/curry/postgresql/data:/var/lib/postgresql/data postgres`
