# 🕵️ ShadowDB: Cyber-Intelligence Platform
## 🏛️ MASTER TECHNICAL SPECIFICATION & SYSTEM ARCHITECTURE
**Document Version**: 1.0.0 // FINAL_RELEASE
**Objective**: 100% Comprehensive System Blueprint for AI Rebuilding & Developer Integration.

---

## 1. 🌐 SYSTEM VISION & PHILOSOPHY
ShadowDB is not merely a Database Management System; it is a **Cyber-Intelligence Simulation**. The platform is designed around the persona of "Agent Omega," a forensic analyst operating within a high-security terminal.

### 1.1 UI/UX Philosophy: The "Uplink" Aesthetic
The interface mimics a futuristic HUD (Heads-Up Display). Every element serves to reinforce the hacker/intelligence narrative:
- **Immersive Feedback**: No operation happens in silence. Every query triggers a visual pulse, sound-like animations (glitches), and a deterministic 6-step data flow.
- **Contextual Immersion**: Data is presented as "Intelligence Records" rather than "Rows." Criminals are "Targets," and Cases are "Active Investigations."
- **Visual Continuity**: Using `framer-motion` and `GSAP`, the UI transitions feel like sliding digital panels rather than static web pages.

---

## 2. 🏗️ CORE TECHNOLOGY STACK
The system utilizes a modern, event-driven JavaScript stack optimized for low-latency real-time updates.

### 2.1 Frontend (The Terminal)
- **React 19 (Vite)**: The engine for component-based UI. React 19 is chosen for its performance optimizations and modern hook support.
- **Framer Motion**: Handles complex state-driven animations, page transitions, and the "Iron Man" drag-and-drop physics in the Criminals tab.
- **GSAP (GreenSock)**: Used for high-performance micro-interactions, specifically the "Glitch" text effects and scanline timing.
- **Recharts**: Renders the holographic analytics charts with custom SVG neon gradients.
- **Socket.IO Client**: Establishes the `UPLINK` for real-time visualization of database queries.

### 2.2 Backend (The Core)
- **Node.js & Express**: The asynchronous runtime and routing framework.
- **SQLite3**: Chosen for portability and "Single File" integrity. It provides a real SQL environment without the overhead of external server setup, making it ideal for a competition-grade portable platform.
- **Socket.IO Server**: The event bridge. It watches the `db/connection.js` module and broadcasts every successful execution to all connected terminals.

---

## 3. 🔁 THE 6-STEP DATA FLOW PIPELINE
Every operation (Create, Read, Update, Delete) initiated by the user passes through a deterministic visual pipeline. This is the heart of the "Educational DBMS" module.

### Stage 1: INTERFACE_LAYER
- **Technical Role**: The React component (e.g., `CriminalsPage.jsx`).
- **Logic**: Captures user input via state-controlled forms.
- **Data Transformation**: Converts raw user intent into a structured JSON payload for the API.

### Stage 2: AUTH_GATEWAY (Security Interception)
- **Technical Role**: Global `PasswordPrompt` component + Backend Regex Filter.
- **Logic**: If the payload contains destructive keywords (`DELETE`, `DROP`, `TRUNCATE`), the UI pauses and requests the override code `1111`.
- **Event Triggering**: Triggers a "Security Intercept" event in the UI.

### Stage 3: API_ROUTER
- **Technical Role**: Express Router (`routes/`).
- **Communication**: Receives the POST/PUT/GET request. 
- **Validation**: Ensures the data types match the SQLite schema requirements.

### Stage 4: QUERY_BUILDER
- **Technical Role**: Backend Logic.
- **Logic**: Dynamically constructs the SQL string. 
- **Example**: `INSERT INTO criminals (first_name, last_name) VALUES (?, ?);`

### Stage 5: DB_DRIVER
- **Technical Role**: `db/connection.js`.
- **Operation**: Executes the query using the `sqlite3` driver. 
- **Measurement**: Captures the exact `execution_time` in milliseconds and the `row_count` affected.

### Stage 6: SQLITE_CORE_DB
- **Technical Role**: The `shadowdb.sqlite` binary file.
- **Result**: Data is persisted. Upon success, the `DB_DRIVER` triggers a WebSocket `io.emit('db:operation')` event, which the Frontend `VisualizationPanel` renders as the final step of the animation.

---

## 4. 🔐 SECURITY & OVERRIDE SYSTEM
ShadowDB implements a multi-layered security gate to prevent accidental data loss while simulating a "Locked Terminal" environment.

### 4.1 Keyword Detection Logic
The system uses a case-insensitive regex to scan every raw query entered in the **DB Explorer**:
- **Pattern**: `/(DELETE|DROP|TRUNCATE|ALTER|REMOVE)/i`
- **Result**: If a match is found, the `dbOperations.js` route denies execution unless a `security_token` (result of the `1111` prompt) is provided.

### 4.2 The 1111 Gate
- **Mechanism**: A React Portal that overlays the entire screen.
- **Logic**: It requires a exact string match (`1111`). It is not stored in plain text in the frontend state; it is validated per-action.

---

## 5. 🎮 ADVANCED FEATURE ANALYSIS

### 5.1 Detective Board (Relationship Canvas)
- **Canvas System**: Uses a relative-positioned `board-container` with a coordinate-mapped grid.
- **Linking Logic**: An SVG layer sits between the background and the nodes. 
- **Connection Calculation**:
  - Finds the `(x, y)` coordinates of Node A and Node B.
  - Draws a `<line>` with `stroke-dasharray` (simulating investigation string).
  - Uses a custom SVG filter `id="shadow"` to create depth.
- **Drag & Drop**: Uses a custom `handleMouseDown/Move` hook that calculates delta movement to update node positions in real-time without refreshing the link layer.

### 5.2 DB Explorer (Direct Terminal)
- **Function**: Allows raw SQL execution.
- **UI**: A monospace terminal with syntax highlighting colors for different result types (Green for Success, Red for Error).
- **Visualization**: Every raw query typed here also triggers the global 6-step animation panel.

### 5.3 DBMS Learning Module
- **Logic**: Each module (SQL, Normalization, etc.) contains "Run Simulation" buttons.
- **Simulation Event**: Instead of hitting a real endpoint, these buttons emit a `simulate_operation` socket event. The backend receives this and broadcasts it back as if it were a real DB operation, allowing users to see the flow of complex queries (like `3NF Normalization`) without modifying their actual records.

---

## 6. 🗄️ DATABASE SCHEMA & RELATIONSHIPS

### 6.1 Entity-Relationship Model
- **Criminals (1) <-> Assignments (M) <-> Cases (1)**: Many-to-Many relationship handled by the `case_assignments` junction table.
- **Cases (1) <-> Evidence (M)**: One-to-Many. Each evidence item belongs to exactly one case.
- **Officers (1) <-> Assignments (M)**: Officers are assigned to cases via the same junction table.

### 6.2 Table Structure (Snapshot)
| Table | Primary Key | Key Foreign Keys | Purpose |
| :--- | :--- | :--- | :--- |
| `criminals` | `id` | - | Primary target records. |
| `cases` | `id` | - | Central investigation files. |
| `evidence` | `id` | `case_id` | Physical/Digital artifacts. |
| `officers` | `id` | - | Authorized personnel. |
| `case_assignments` | `id` | `case_id`, `criminal_id`, `officer_id` | Junction for the Detective Board. |

---

## 7. 📁 FILE-BY-FILE LOGIC BREAKDOWN

### 📂 Backend
- `server.js`: Central initialization. Sets up CORS, Socket.io, and bridges the DB connection to the socket instance.
- `db/connection.js`: The most critical backend file. It wraps `db.run()`/`db.all()` with `io.emit()` logic to ensure every DB hit is visualized.
- `routes/dbOperations.js`: Handles the risky raw SQL execution logic and security keyword filtering.

### 📂 Frontend
- `App.jsx`: The layout root. Manages the global `AnimatePresence` for page transitions.
- `useSocket.js`: A custom hook that maintains a singleton socket connection and a history of the last 50 operations for the monitor.
- `VisualizationPanel.jsx`: The master component for the right sidebar. Orchestrates the 6-step timing (2000ms per step).
- `DetectiveBoardPage.jsx`: Complex coordinate-math page for rendering the investigation board.
- `HoloTerminal.jsx`: A high-fidelity modal that uses `Object.entries(data)` to dynamically map ANY intelligence record into a HUD display.

---

## 8. ⚡ PERFORMANCE & SCALABILITY
- **Optimization**: The `VisualizationPanel` uses `memo` and optimized `useEffect` triggers to prevent re-renders during high-frequency socket events.
- **Scalability**: While SQLite is file-based, the system is architected using RESTful patterns and a clean Event Bridge (`setSocketIO`). Replacing SQLite with MySQL or PostgreSQL would only require swapping the `db/connection.js` driver logic; the entire visualization pipeline would remain intact.

---

## 9. 🚀 FUTURE EXPANSION IDEAS
1. **AI Detective**: Integrate Gemini API to automatically "link" evidence based on description similarity on the Detective Board.
2. **Multi-Agent Mode**: Allow multiple "Agent Omega" instances to see each other's queries in the `SYS_MONITOR` in real-time.
3. **Audio HUD**: Integrate a robotic voice-over for query execution (e.g., "Accessing Database... Query Success").

---
**END OF BLUEPRINT // ENCRYPTED_CONTENT // AUTHORIZED_ACCESS_ONLY**
