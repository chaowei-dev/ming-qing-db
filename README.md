# ming-qing-db

# Project Structure
- node version: 20
```
my-project/
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