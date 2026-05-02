# ShadowDB: System Setup & Configuration Guide

Follow these steps to deploy and run the ShadowDB Cyber-Intelligence Platform in your local environment.

## 1. Prerequisites
Ensure the following are installed on your machine:
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **SQLite3** (Included as a dependency)
- **VS Code** (Recommended Editor)

## 2. Project Architecture
The project is split into two main directories:
- `/backend`: Node.js/Express server with SQLite database.
- `/frontend`: React/Vite application with Framer Motion animations.

## 3. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize and Seed the Database:
   ```bash
   node db/runSchema.js
   node db/seed.js
   ```
   *This creates the `shadow_db.sqlite` file and populates it with initial intelligence records.*
4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will run on `http://localhost:5000`.*

## 4. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:5173`.*

## 5. Connecting the Intelligence Feed
ShadowDB uses WebSockets (Socket.IO) for real-time visualization.
- Ensure the backend is running first.
- The frontend will automatically attempt to establish an `UPLINK` upon load.
- You can verify the connection status in the top-right corner of the header (`LINK_ACTIVE`).

## 6. Security Override
- **Administrator Password**: `1111`
- Use this code whenever prompted for destructive operations (Delete/Drop).

## 7. Recommended VS Code Extensions
- **ESLint**: For code quality.
- **Prettier**: For consistent formatting.
- **SQLite Viewer**: To inspect the database file directly.
- **ES7+ React/Redux/React-Native snippets**: For faster development.
