# Task Manager CRUD Application

A production-ready Full Stack MERN (MongoDB, Express, React, Node.js) application built with clean architecture principles.

## Features
- **Frontend**: React + Vite, Custom Hooks, Clean UI
- **Backend**: Express.js, Mongoose, Joi Validation, Custom Error Handling, Standardized API Responses
- **Database**: MongoDB

---

## Project Structure

```
task-manager-crud/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks (e.g., useTasks)
│   │   ├── pages/          # Application pages (e.g., Home)
│   │   ├── services/       # API interaction logic (Axios)
│   │   └── styles/         # Global CSS
│   ├── .env.example        # Frontend environment variables template
│   └── package.json        # Frontend dependencies
│
└── server/                 # Node.js + Express Backend
    ├── src/
    │   ├── config/         # Environment configuration
    │   ├── controllers/    # Route controllers (HTTP logic)
    │   ├── database/       # MongoDB connection setup
    │   ├── middleware/     # Global and route-specific middleware
    │   ├── models/         # Mongoose schemas
    │   ├── routes/         # Express routers
    │   ├── services/       # Core business logic
    │   ├── utils/          # Utility classes (ApiError, ApiResponse)
    │   └── validators/     # Joi validation schemas
    ├── .env.example        # Backend environment variables template
    └── package.json        # Backend dependencies
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Local instance or MongoDB Atlas)

### 1. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   *Make sure `MONGO_URI` points to your running MongoDB instance.*
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend should now be running on `http://localhost:5000`.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   *Ensure `VITE_API_URL` points to your backend (`http://localhost:5000/api/v1/tasks`).*
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend should now be running on `http://localhost:5173`.*

---

## API Endpoints

All endpoints are prefixed with `/api/v1/tasks` and return standardized `ApiResponse` structures.

| Method | Endpoint | Description | Payload Format |
|--------|----------|-------------|----------------|
| GET | `/` | Retrieve all tasks | N/A |
| POST | `/` | Create a new task | `{ "title": "String" }` |
| PUT | `/:id` | Update an existing task | `{ "title": "String" (Optional), "completed": Boolean (Optional) }` |
| DELETE | `/:id` | Delete a task by ID | N/A |

---

## Deployment Steps

To prepare this application for production deployment (e.g., on Render, Heroku, or Vercel):

### Backend
1. Ensure your MongoDB cluster (e.g., Atlas) is ready and the IP allowlist is configured.
2. Set the `NODE_ENV` environment variable to `production` on your hosting provider.
3. Set the `MONGO_URI` to your production database URL.
4. Set the `CLIENT_URL` to your deployed frontend URL to configure CORS correctly.
5. The start script is `npm start` which runs `node src/server.js`.

### Frontend
1. Set the `VITE_API_URL` environment variable to your deployed backend URL (e.g., `https://your-api.onrender.com/api/v1/tasks`).
2. Run the build script:
   ```bash
   npm run build
   ```
3. Deploy the generated `dist/` folder to a static hosting provider (e.g., Vercel, Netlify).
