# AAPKIKALAA — Indian Art Marketplace

A full-stack marketplace platform connecting Indian artisans with art lovers worldwide. Built with React, Node.js, Express, and MongoDB.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)

## Features

- **Artist Dashboard** — Manage products, profile, inventory, and upload media
- **Admin Panel** — Approve/reject artists, manage users and product listings
- **Product Listings** — Browse, search, filter, and sort artworks by category
- **Profile Photo Upload** — Real-time avatar upload with camera overlay
- **Responsive Design** — Premium UI that works on all devices
- **Role-Based Access** — Customer, Artist, and Admin roles with JWT auth
- **Auto-Seeded Admin** — First admin account is created automatically from `.env`

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, Vite, React Router, Axios |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB Atlas                       |
| Auth      | JWT, bcryptjs                       |
| Uploads   | Multer (local disk storage)         |
| Styling   | Vanilla CSS (custom design system)  |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/Sairanjan78/AAPKIKALA.git
cd AAPKIKALA

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your MongoDB connection string, JWT secret, and admin credentials.

### Running the App

```bash
# Terminal 1 — Start backend
cd backend
npm run dev

# Terminal 2 — Start frontend
cd frontend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## Project Structure

```
AAPKIKALA/
├── backend/
│   ├── config/
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── uploads/          # User-uploaded media
│   ├── .env.example      # Environment template
│   └── server.js         # App entry point
├── frontend/
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth state management
│       ├── pages/        # Page-level components
│       ├── App.jsx       # Main app with routing
│       └── App.css       # Design system
├── pic/                  # Local media assets
└── README.md
```

## API Endpoints

| Method | Endpoint                  | Auth     | Description             |
|--------|---------------------------|----------|-------------------------|
| POST   | `/api/auth/register`      | —        | Register user           |
| POST   | `/api/auth/login`         | —        | Login                   |
| GET    | `/api/auth/profile`       | Token    | Get current user        |
| PUT    | `/api/auth/profile`       | Token    | Update profile          |
| GET    | `/api/products`           | —        | List all products       |
| POST   | `/api/products`           | Artist   | Create product          |
| GET    | `/api/artists/featured`   | —        | Featured artists        |
| GET    | `/api/admin/dashboard`    | Admin    | Dashboard stats         |
| POST   | `/api/upload`             | Token    | Upload media files      |

## Author

**Sairanjan** — [GitHub](https://github.com/Sairanjan78)