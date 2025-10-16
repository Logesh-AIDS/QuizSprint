# 🧩 QuizSprint

> 🚀 **QuizSprint** is a real-time multiplayer quiz platform where users can join a room, compete live, and track results instantly — built with React, TypeScript, Express, and WebSockets.

---

## 🌟 Features

- ⚡ **Real-time gameplay** — Powered by WebSocket for instant updates  
- 🧑‍🤝‍🧑 **Multiplayer rooms** — Create or join rooms using unique codes  
- 🏆 **Live leaderboards** — See scores update after every question  
- 🎨 **Modern UI** — Beautiful neon gradient interface with confetti animations  
- 📷 **Screenshot feature** — Capture your final score page as an image  
- 🔁 **Play Again / New Quiz** options for replayability  
- 🌐 **Responsive PWA** — Works seamlessly on desktop and mobile  

---

## 🖼️ Screenshots

(assets/readme/1st.png)
(assets/readme/2nd.png)
(assets/readme/3rd.png)
(assets/readme/4th.png)
(assets/readme/5th.png)
(assets/readme/6th.png)
(assets/readme/7th.png)
(assets/readme/8th.png)
(assets/readme/9th.png)

> 💡 Tip: Place your screenshots in a folder named `/assets` at the root of the repo and update the paths above accordingly.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Vite |
| Backend | Express + TypeScript + WebSocket |
| Styling | Tailwind CSS + Shadcn UI |
| Build Tool | Vite + Esbuild + TypeScript |
| Deployment | Render (Fullstack Deployment) |

---

## ⚙️ Local Development

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Logesh-AIDS/QuizSprint.git
cd QuizSprint
```

### 2️⃣ Install Dependencies
```bash
# from repo root
npm install
```

### 3️⃣ Environment Variables
- Frontend (Vite) build-time environment:
  - File: `client/.env`
```env
VITE_WS_URL=https://quizsprint.onrender.com
```
- Notes:
  - In development, the app connects to your local server automatically (`ws://localhost:5000/ws`), ignoring `VITE_WS_URL`.
  - In production, if `VITE_WS_URL` is set, it uses `wss://<your-host>/ws`.

### 4️⃣ Build (Production)
```bash
npm run build
```
What it does:
- Builds the frontend into `client/dist` (Vite).
- Compiles the backend to `dist/server` (TypeScript).

### 5️⃣ Run (Production Preview)
```bash
NODE_ENV=production PORT=5000 npm start
# visit http://localhost:5000
```
- Serves compiled backend `dist/server/index.js`.
- Serves frontend from `client/dist`.

### 6️⃣ Start (Local Development)
```bash
npm run dev
# visit http://localhost:5000
```
- Uses Vite middleware (HMR enabled).
- WebSocket connects to `ws://localhost:5000/ws`.

---

## 📦 Scripts

- **dev**: Starts development server with Vite middleware.
- **build**: Builds frontend (`client/dist`) and compiles backend (`dist/server`).
- **start**: Runs compiled backend (`dist/server/index.js`) in production mode.
- **check**: Type-checks TypeScript.

---

## 📁 Project Structure

```
/client
  ├── src/
  ├── dist/              # built frontend (vite build)
  ├── index.html
/server
  ├── index.ts           # express entry
  ├── routes.ts          # HTTP + WebSocket handlers
  ├── storage.ts         # in-memory store
  ├── vite.ts            # dev middleware + production static helper
/shared
  ├── schema.ts          # shared types
/package.json            # root scripts (build/start)
/vite.config.ts          # set root to client/, outDir to client/dist
```

---

## 🚀 Deployment (Render Fullstack)

- Root `package.json`:
  - `postinstall` runs `npm run build` (builds client and server).
  - `start` runs `node dist/server/index.js`.
  - `"engines": { "node": "20.x" }`.
- Render Service settings:
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Environment:
    - `NODE_ENV=production`
    - `PORT` provided by Render
- Frontend WS base:
  - Provide `VITE_WS_URL` for production builds (e.g., `https://quizsprint.onrender.com`).
  - The client connects to `<VITE_WS_URL>/ws`.

---

## 🧪 How to Use Locally

- **Create Room**:
  - Home → Enter your name → Create Room.
  - Redirects to `lobby/:code?name=<you>&host=true`.
- **Join Room**:
  - Share the 6-character room code.
  - Friends join from Home with their name + code.
- **Start Game**:
  - Host clicks “Start Quiz” when everyone is ready.
- **Results**:
  - Leaderboard and winner shown.
  - “Play Again” returns to lobby and restarts same room.
  - “New Quiz” returns to home.

---

## 🛠️ Troubleshooting

- **Slow connect on Create Room**
  - Ensure dev is running locally with `npm run dev`.
  - In dev, the app uses `ws://localhost:5000/ws`. If it’s pointing to production, restart dev and hard refresh.
- **Port already in use (EADDRINUSE: 5000)**
```bash
lsof -iTCP:5000 -sTCP:LISTEN -n -P
kill -TERM <PID>
```
- **Render error: Cannot find module '/opt/render/project/src/dist/index.js'**
  - Ensure backend compiles to `dist/server/` and `npm start` runs `dist/server/index.js`.
  - Ensure `client/dist` exists; Render’s `postinstall` runs `npm run build`.

---

## 📄 License

MIT
