# ming-qing-db

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

# .env

- backend
  - `DATABASE_URL=postgresql://user:pass@localhost:5432/dbname`
  - `JWT_SECRET=your_jwt_secret`
- frontend
