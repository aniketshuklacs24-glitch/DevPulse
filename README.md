# DevPulse — Real-Time Collaborative Code Review War Room

**DevPulse** is a world-class, production-ready, interactive pull request collaboration and telemetry dashboard designed for high-performing engineering teams. It unites real-time WebSocket syncing (Socket.io) with deep analytics metrics (Recharts) backed by PostgreSQL/SQLite databases and dockerized multi-stage container pipelines.

---

## 🚀 Key Features

*   **Interactive Line-by-Line Code Annotations**:
    View color-coded code diffs (added/removed lines), click on line numbers to open inline annotation forms, write review notes, and watch them render instantly on your peers' screens.
*   **Real-Time Collaborative War Room**:
    Dynamically logs and synchronizes general PR reviews and line annotations across all active users. Clicking a code-linked comment in the sidebar highlights and scrolls directly to that line in the code diff.
*   **Dual-Engine Persistence Layer**:
    Connects to a PostgreSQL database inside containerized environments, falling back automatically to a local JSON file-based database for zero-config bare-metal execution.
*   **Live Metrics & Telemetry Dashboard**:
    Utilizes Recharts to render Postgres-stored data including:
    *   *Average Time to Merge*
    *   *Code Volume Profiles* (Lines Added vs. Lines Removed)
    *   *Code Modifications Density* (Files Modified vs. Merged stats)
*   **Interactive Reviewer Simulator**:
    Demonstrate WebSocket sync immediately in "single-player mode" with a single click. Simulates live peer reviews from architectural and security staff streaming comments in real-time.
*   **Resilient API Rate-Limit Fallback**:
    Intercepts GitHub API rate limits (HTTP 403) and credential invalidations to fallback to offline sandbox data, preventing broken UI states.

---

## 🛠️ Technology Stack

*   **Frontend**: React 19, Redux Toolkit (RTK Query), Vite, TypeScript, Recharts, Lucide Icons, CSS.
*   **Backend**: Node.js, Express, Socket.io (WebSockets), TypeScript.
*   **Database**: PostgreSQL, SQLite File Fallback.
*   **DevOps**: Docker, Docker Compose (Multi-stage build pipelines).

---

## 📂 Project Architecture

```
devpulse-monorepo/
├── backend/
│   ├── Dockerfile
│   ├── tsconfig.json
│   ├── package.json
│   ├── server.ts         # Express server & WebSocket gateway
│   └── db.ts             # Database Manager (Postgres + SQLite Fallback)
├── frontend/
│   ├── Dockerfile
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── package.json
│   └── src/
│       ├── App.tsx       # Router & protected entry point
│       ├── main.tsx      # Application entrypoint
│       ├── socket.ts     # Client WebSocket configuration
│       ├── mockData.ts   # Resilient Sandbox datasets & diff files
│       ├── index.css     # Premium dark-mode glassmorphic theme
│       ├── pages/        # Login, Dashboard, PRDetail
│       └── components/   # Metrics (Recharts visualizations)
├── docker-compose.yml    # Orchestrates Postgres, Backend, and Frontend
└── package.json          # Root Monorepo configuration
```

---

## 🔌 Running the Project

### Option A: With Docker Compose (Recommended)
This spins up PostgreSQL, the backend WebSocket server, and the React client concurrently without installing local dependencies.

1.  Make sure Docker and Docker Compose are installed and running.
2.  Run the following command in the root folder:
    ```bash
    docker-compose up --build
    ```
3.  Access the web client at: [http://localhost:3000](http://localhost:3000). The backend runs at [http://localhost:3001](http://localhost:3001) and database on port `5432`.

### Option B: Bare-Metal Local Dev
1.  From the root folder, install monorepo root configurations and peer packages:
    ```bash
    npm install
    npm install --prefix backend
    npm install --prefix frontend
    ```
2.  Launch backend and frontend concurrently in development mode:
    ```bash
    npm run dev
    ```
3.  Access the frontend in your browser at: [http://localhost:3000](http://localhost:3000).

---
