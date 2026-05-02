# ShadowDB: Ultimate Technical Intelligence & Architectural Specification

This document serves as the "Master File" for ShadowDB. It contains a complete, granular breakdown of every component, logic flow, and design decision within the project. It is intended for both human developers and advanced AI models to achieve 100% project comprehension.

---

## 1. PROJECT VISION: THE CORE "UPLINK"
**ShadowDB** is a high-fidelity Cyber-Intelligence Platform. It is designed to bridge the gap between abstract Database Management (DBMS) and immersive investigative storytelling. 
- **The Concept**: You are "Agent Omega," accessing a secure terminal that monitors criminal activities in real-time.
- **The Dual Purpose**:
  1. **Functional DBMS**: Manages Criminals, Cases, Evidence, and Personnel.
  2. **Educational Engine**: Visualizes SQL operations as a high-tech "data flow" through internal system layers.

---

## 2. FULL TECHNOLOGY STACK
### Frontend (The HUD)
- **Framework**: React.js 19 (Vite)
- **Styling**: Vanilla CSS with a global `design-system.css`.
- **Animations**: Framer Motion (State-driven transitions), GSAP (Micro-interactions).
- **Charts**: Recharts (Customized with neon gradients).
- **Communication**: Socket.IO-Client (Event-driven updates).

### Backend (The Core)
- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket Server**: Socket.IO
- **Database**: SQLite3 (Local file-based persistence for portability).

---

## 3. FILE SYSTEM INVENTORY (THE MAP)

### 📂 Root Directory
- `SETUP_GUIDE.md`: Step-wise deployment instructions.
- `PROJECT_TECHNICAL_DETAILS.md`: This comprehensive master document.

### 📂 Backend (The Server)
- `server.js`: The central entry point. Initializes Express, Socket.IO, and routes. Contains the `simulate_operation` logic.
- `db/`:
  - `connection.js`: Singleton wrapper for the SQLite connection. Includes a `setSocketIO` bridge to broadcast DB events globally.
  - `schema.sql`: The raw blueprint of the intelligence database.
  - `runSchema.js`: Script to initialize the SQLite file from the SQL blueprint.
  - `seed.js`: Populates the database with realistic "initial intelligence" records.
- `routes/`:
  - `criminals.js`, `cases.js`, `evidence.js`, `officers.js`: Standard RESTful CRUD endpoints for each entity.
  - `analytics.js`: Aggregates data for the HUD charts.
  - `dbOperations.js`: Handles raw SQL execution from the "DB Explorer" with built-in keyword filtering.

### 📂 Frontend (The Terminal)
- `src/App.jsx`: Main router and root layout. Manages the global `ambient-bg` and `scan-line-overlay`.
- `src/hooks/`:
  - `useSocket.js`: A specialized React hook that maintains the live WebSocket connection and shared state for `db:operation` events.
  - `useApi.js`: Abstracted data fetching layer with support for loading states and mutations.
- `src/pages/`:
  - `Dashboard.jsx`: High-level system overview with real-time stats.
  - `DetectiveBoardPage.jsx`: The heart of the platform. Features a 2000x2000 canvas for evidence linking and drag-and-drop navigation.
  - `OfficersPage.jsx`: Redesigned as a "Terminal Schedule" for personnel tracking.
  - `DBMSConceptsPage.jsx`: Interactive unit-wise curriculum with "Run Simulation" capabilities.
  - `AnalyticsPage.jsx`: Features the Global Threat Monitor map and real-time system logs.
  - `DBExplorerPage.jsx`: A raw SQL command center with security interception.
- `src/styles/`:
  - `design-system.css`: The "Constitution" of the project. Defines the `neon-cyan`, `neon-red`, and `glitch` keyframes.

---

## 4. THE REAL-TIME VISUALIZATION PIPELINE (THE FLOW)

One of ShadowDB's unique features is the **Data Flow Animation**. When a query is executed, it is visualized through 6 distinct stages:

1. **INTERFACE_LAYER**: The user interacts with the UI.
2. **AUTH_GATEWAY**: Security check (e.g., the 1111 gate).
3. **API_ROUTER**: The request reaches the backend endpoint.
4. **QUERY_BUILDER**: The ORM or raw SQL is prepared.
5. **DB_DRIVER**: The connection buffer between Node and SQLite.
6. **SQLITE_CORE_DB**: The physical data mutation occurs.

**Logic Mechanism**:
- Backend emits `db:operation` with `type`, `sql`, and `duration`.
- Frontend `VisualizationPanel` catches this, starts a 12-second timer (2s per node), and animates the "Data Packet" moving down the chain.

---

## 5. DATABASE RELATIONAL SCHEMA (THE DATA)

The platform is built on a robust relational model to demonstrate SQL concepts:

- **`criminals`**: Primary entity. Fields: `id`, `first_name`, `last_name`, `alias`, `threat_level`, `status`.
- **`cases`**: Investigative containers. Fields: `id`, `title`, `description`, `status` (OPEN/CLOSED/COLD).
- **`evidence`**: Items linked to cases. Fields: `id`, `case_id` (FK), `type`, `description`.
- **`officers`**: Personnel directory. Fields: `id`, `badge_number`, `rank_title`, `status`.
- **`case_assignments`**: Many-to-many junction table linking Officers and Criminals to specific Cases. This allows for complex queries and "Detective Board" relationship tracing.

---

## 6. HACKER AESTHETIC & UI TOKENS

To achieve the "Iron Man HUD" feel, we use several advanced CSS techniques:

### A. The Global Overlay
- **Scanlines**: A repeating linear gradient on the `::after` pseudo-element of the root app, giving a "CRT Monitor" texture.
- **Ambient BG**: A shifting radial gradient that moves with the cursor to simulate glow.

### B. Glitch Animation
Applied to all headers. Uses a 2-second loop that shifts the `clip-path` and `text-shadow` of a pseudo-copy of the text to create a digital corruption effect.

### C. Glassmorphism
Every panel uses `backdrop-filter: blur(12px)` and a semi-transparent border (`rgba(0, 243, 255, 0.2)`) to simulate holographic glass.

---

## 7. SECURITY PROTOCOLS (THE 1111 GATE)

Destructive commands are gated by a system-wide interceptor.
- **Detection**: The UI checks the input string for keywords like `DELETE`, `DROP`, `REMOVE`, `TRUNCATE`.
- **Interception**: If detected, the `PasswordPrompt` component is mounted.
- **Verification**: The system only proceeds if the input matches `1111`.
- **Backend Safety**: The backend additionally logs every mutation to `server.log` for audit trailing.

---

## 8. INTERACTIVE FEATURES

### The Detective Board
- **Panning**: Click and drag the empty background to explore the 2000px board.
- **Physics**: Distance-based threshold ensures that "dragging" a photo doesn't accidentally trigger the "details view" popup.
- **Dotted Lines**: SVG `stroke-dasharray` is calculated between nodes to show evidence connections.

### DBMS Concepts
- **Simulation**: Uses a dummy socket emit to the backend to trigger the visualizer without modifying the database. This allows for safe "learning sessions" where the user can see how an `INNER JOIN` looks in the system flow without needing real data.

---

## 9. API & WEBSOCKET ENDPOINT MAP

### API (REST)
- `GET /api/health`: System health status.
- `GET /api/analytics/overview`: High-level stat counters.
- `POST /api/db/query`: Raw SQL execution (Security gated).

### WebSocket (Event-Driven)
- `connect`: Handshake with client.
- `db:operation`: Broadcasted whenever a database record is touched.
- `simulate_operation`: Inward event from "DBMS Concepts" to trigger visualizer.
- `system:welcome`: Initial packet containing server timestamp.

---

*This document is the definitive source of truth for ShadowDB. Any AI analyzing this project should prioritize these architectural definitions.*
