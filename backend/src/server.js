import express from "express";
import http from "http";
import cors from "cors";
import passport from "./auth.js";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import { prisma } from "./db.js";
import { initSocket } from "./socket.js";

import githubRepos from "./routes/githubRepos.js";
import connectRepo from "./routes/connectRepo.js";
import createWebhook from "./routes/createWebhook.js";
import githubWebhook from "./routes/githubWebhook.js";
import previewActions from "./routes/previewActions.js";
import projectDashboard from "./routes/projectDashboard.js";
import logsRoute from "./routes/logs.js";
import devSim from "./routes/devSimulate.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// --- ✅ CORS & JSON ---
app.use(cors({ origin: "*", allowedHeaders: "*", credentials: true }));
app.use(express.json());

// --- ✅ Logger ---
app.use(morgan("dev"));
app.use(cors({ origin: "*", allowedHeaders: "*" }));
app.use(morgan("dev"));

// --- ✅ Raw body (for GitHub webhook signature verify) ---
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);

// --- ✅ GitHub OAuth (NO session mode needed because you're using JWT) ---
app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/" }),
  async (req, res) => {
    try {
      const user = req.user;
      const freshUser = await prisma.user.findUnique({ where: { id: user.id }});

      const token = jwt.sign(
        {
          userId: freshUser.id,
          accessToken: req.user.accessToken,
          tier: freshUser.tier, // ✅ embed latest DB tier
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.redirect(`http://localhost:5173/auth/success?token=${token}`);
    } catch (err) {
      console.error(err);
      return res.status(500).send("auth_failed");
    }
  }
);

// --- ✅ API Routes (mount at root paths they expect) ---
app.use("/api", githubRepos);
app.use("/api", connectRepo);
app.use("/api", createWebhook);
app.use("/api", previewActions);
app.use("/api", projectDashboard);
app.use("/api", logsRoute);

// --- ✅ GitHub webhook receiver ---
app.use("/", githubWebhook);

// --- ✅ Dev simulation (must come LAST so it doesn't steal routes) ---
app.use("/dev/simulate", devSim);

// --- ✅ Init WebSockets properly ---
initSocket(server);

// --- ✅ Start server ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
