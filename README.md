# PR Review – GitHub Pull Request Preview Environments

PR Review is a full‑stack app that creates **ephemeral preview environments for GitHub pull requests**.  
When a PR opens or updates, it clones the repo, builds a Docker image, runs the preview, streams build logs live, and cleans everything up when the PR is closed.

---

## Features

- **GitHub OAuth login** via [`backend/src/auth.js`](backend/src/auth.js)
- **Repo onboarding** & project dashboard via [`backend/src/routes/githubRepos.js`](backend/src/routes/githubRepos.js) and [`backend/src/routes/connectRepo.js`](backend/src/routes/connectRepo.js)
- **Automatic webhook creation** using [`backend/src/routes/createWebhook.js`](backend/src/routes/createWebhook.js)
- **Secure webhook verification** with [`backend/src/utils/gitHubVerify.verifyGithubSignature`](backend/src/utils/gitHubVerify.js)
- **Per‑PR preview records** stored via [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)
- **Clone & checkout PR ref** using [`backend/src/services/repoService.cloneRepo`](backend/src/services/repoService.js)
- **Docker‑based deployments** orchestrated by [`backend/src/services/dockerService.buildAndRun`](backend/src/services/dockerService.js)
- **Automatic container teardown** through [`backend/src/services/dockerService.stopContainer`](backend/src/services/dockerService.js)
- **Real‑time build logs** over Socket.IO via [`backend/src/socket.js`](backend/src/socket.js) and [`frontend/src/pages/Logs.jsx`](frontend/src/pages/Logs.jsx)
- **Project/preview dashboard** in [`frontend/src/pages/Dashboard.jsx`](frontend/src/pages/Dashboard.jsx)

---

## Architecture Overview

### High‑level flow

1. **User login**
   - Frontend shows “Sign in with GitHub” from [`frontend/src/App.jsx`](frontend/src/App.jsx).
   - Backend GitHub OAuth handled in [`backend/src/auth.js`](backend/src/auth.js) and [`backend/src/server.js`](backend/src/server.js).
   - On success, backend issues a JWT (user id + GitHub access token) and redirects to `/auth/success`.
   - [`frontend/src/pages/AuthSuccess.jsx`](frontend/src/pages/AuthSuccess.jsx) stores the token in `localStorage`.

2. **Connect a repository**
   - Frontend calls `GET /api/repos` from [`backend/src/routes/githubRepos.js`](backend/src/routes/githubRepos.js) to list accessible repos.
   - User selects a repo; frontend posts to `POST /api/connect-repo` handled by [`backend/src/routes/connectRepo.js`](backend/src/routes/connectRepo.js).
   - A `Project` is created in the DB with a generated `webhookSecret`.

3. **Create GitHub webhook**
   - After saving the project, frontend immediately calls `POST /api/create-webhook` from [`backend/src/routes/createWebhook.js`](backend/src/routes/createWebhook.js).
   - This uses the user’s GitHub token to create a `pull_request` webhook pointing at  
     `${PUBLIC_WEBHOOK_URL}/webhooks/github`.

4. **Handle PR webhooks**
   - GitHub sends events to `POST /webhooks/github` implemented in [`backend/src/routes/githubWebhook.js`](backend/src/routes/githubWebhook.js).
   - Raw body and signature are verified via [`backend/src/utils/gitHubVerify.verifyGithubSignature`](backend/src/utils/gitHubVerify.js).
   - For `opened`, `reopened`, `synchronize` actions, [`backend/src/services/prHandlers.handlePROpenOrSync`](backend/src/services/prHandlers.js) runs.
   - For `closed` actions, [`backend/src/services/prHandlers.handlePRClosed`](backend/src/services/prHandlers.js) runs.

5. **Build & run preview**
   - `handlePROpenOrSync`:
     - Upserts a `Preview` row for `(projectId, prNumber)` via Prisma.
     - Clones repo & optional ref using [`backend/src/services/repoService.cloneRepo`](backend/src/services/repoService.js).
     - Calls [`backend/src/services/dockerService.buildAndRun`](backend/src/services/dockerService.js) to:
       - Build a Docker image (currently using `deploy-templates/vite.Dockerfile`).
       - Run a container on a dynamic host port (`get-port`).
       - Stream build output through Socket.IO room keyed by `previewId`.
       - Persist `url`, `status`, `buildLogs`, and `containerName` on the `Preview`.

6. **View dashboard & logs**
   - `GET /api/projects` from [`backend/src/routes/projectDashboard.js`](backend/src/routes/projectDashboard.js) powers  
     [`frontend/src/pages/Dashboard.jsx`](frontend/src/pages/Dashboard.jsx).
   - Users can click into `/logs/:id` which renders [`frontend/src/pages/Logs.jsx`](frontend/src/pages/Logs.jsx):
     - Loads saved logs via `GET /api/preview/:id/logs` from [`backend/src/routes/logs.js`](backend/src/routes/logs.js).
     - Connects to Socket.IO (`/register` event) to stream new build chunks.

7. **Teardown on PR close**
   - `handlePRClosed` finds the related `Preview`, stops the container via  
     [`backend/src/services/dockerService.stopContainer`](backend/src/services/dockerService.js), and marks the preview as `deleted`.

---

## Tech Stack

- **Frontend**
  - React 19, React Router (`BrowserRouter`) – [`frontend/src/App.jsx`](frontend/src/App.jsx)
  - Vite – [`frontend/vite.config.js`](frontend/vite.config.js)
  - Tailwind CSS – [`frontend/tailwind.config.js`](frontend/tailwind.config.js), [`frontend/src/index.css`](frontend/src/index.css)
  - Axios – [`frontend/src/pages/Dashboard.jsx`](frontend/src/pages/Dashboard.jsx), [`frontend/src/pages/ConnectRepo.jsx`](frontend/src/pages/ConnectRepo.jsx)
  - Socket.IO client – [`frontend/src/pages/Logs.jsx`](frontend/src/pages/Logs.jsx)

- **Backend**
  - Express 5 – [`backend/src/server.js`](backend/src/server.js)
  - Passport + GitHub OAuth2 – [`backend/src/auth.js`](backend/src/auth.js)
  - Prisma + PostgreSQL – [`backend/src/db.js`](backend/src/db.js), [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)
  - Socket.IO – [`backend/src/socket.js`](backend/src/socket.js)
  - Docker CLI – [`backend/src/services/dockerService.js`](backend/src/services/dockerService.js)
  - simple-git – [`backend/src/services/repoService.js`](backend/src/services/repoService.js)

- **Deployment templates**
  - Vite (SPA) – [`backend/deploy-templates/vite.Dockerfile`](backend/deploy-templates/vite.Dockerfile)
  - Static – [`backend/deploy-templates/static.Dockerfile`](backend/deploy-templates/static.Dockerfile)
  - Node backend – [`backend/deploy-templates/node-backend.Dockerfile`](backend/deploy-templates/node-backend.Dockerfile)

---

## Project Structure

```text
pr-review/
├── LICENSE.txt
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── deploy-templates/
│   └── src/
│       ├── server.js
│       ├── auth.js
│       ├── db.js
│       ├── socket.js
│       ├── routes/
│       ├── services/
│       └── utils/
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── pages/
        └── index.css
```

---

## Prerequisites

- Node.js ≥ 18
- Docker installed and running
- PostgreSQL database
- GitHub OAuth App (Client ID & Secret)
- Public HTTPS URL for webhooks (`ngrok`, `cloudflared`, or deployed server)

---

## Backend Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**

   Copy [`backend/.env.exxample`](backend/.env.exxample) to `.env`:

   ```bash
   DATABASE_URL="postgres connection string"
   GITHUB_CLIENT_ID="your github client id"
   GITHUB_CLIENT_SECRET="your github client secret"
   JWT_SECRET="a strong secret"
   PUBLIC_WEBHOOK_URL="https://your-public-backend-url"
   PUBLIC_PREVIEW_BASE="http://localhost"
   PORT=4000
   ```

3. **Run Prisma migrations**

   ```bash
   npx prisma migrate dev
   ```

4. **Start backend (with Socket.IO)**

   ```bash
   npm run dev
   ```

   Backend runs at `http://localhost:4000`.

---

## Frontend Setup

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Run dev server**

   ```bash
   npm run dev
   ```

   Frontend runs at `http://localhost:5173`.

---

## Using the App

1. **Login**
   - Visit `http://localhost:5173`.
   - Click “Sign in with GitHub” (redirects to `/auth/github` on backend).
   - After redirect back to `/auth/success`, the JWT is stored and you’re taken to `/`.

2. **Connect a repository**
   - Navigate to `/connect` (Connect Repo page) implemented in [`frontend/src/pages/ConnectRepo.jsx`](frontend/src/pages/ConnectRepo.jsx).
   - Pick a repo and click **Connect**.
   - This:
     - Saves a `Project` via `POST /api/connect-repo`.
     - Immediately calls `POST /api/create-webhook` to register the GitHub webhook.

3. **Open/update a PR on GitHub**
   - A `pull_request` webhook hits `POST /webhooks/github`.
   - A `Preview` row is created/updated and a Docker build starts.

4. **Watch logs**
   - Go to `/logs/:previewId` served by [`frontend/src/pages/Logs.jsx`](frontend/src/pages/Logs.jsx).
   - The page:
     - Fetches saved logs from `GET /api/preview/:id/logs`.
     - Subscribes to Socket.IO room for that preview to stream new logs until build finishes.

5. **Access the preview**
   - Once build is live, the preview URL is stored on the `Preview` and listed in the dashboard (`/`), rendered by [`frontend/src/pages/Dashboard.jsx`](frontend/src/pages/Dashboard.jsx).

6. **Close the PR**
   - `handlePRClosed` stops the Docker container and marks the preview as `deleted`.

---

## Development Utilities

- **Simulate PR events without GitHub**

  [`backend/src/routes/devSimulate.js`](backend/src/routes/devSimulate.js) exposes:

  ```bash
  curl -X POST http://localhost:4000/dev/sim-pr \
    -H "Content-Type: application/json" \
    -d '{"projectId":"<project-id>","prNumber":1,"action":"open"}'
  ```

- **Logs API**

  - `GET /api/preview/:id/logs` – [`backend/src/routes/logs.js`](backend/src/routes/logs.js)

---

## License

This project is licensed under a **custom non‑commercial license** – see [`LICENSE.txt`](LICENSE.txt) for full terms.

In summary:

- Free to use for personal, hobby, educational, research, or internal non‑commercial purposes.
- Any commercial or revenue‑generating use requires prior written permission and a separate license agreement from the copyright holder.
- Any production use must include clear attribution:  
  “This project includes software created by Abhijat Sinha.”
- Redistribution must include this license text and copyright notice.