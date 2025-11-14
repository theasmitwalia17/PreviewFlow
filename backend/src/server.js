import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "./auth.js";
import jwt from "jsonwebtoken";
import morgan from "morgan";

import githubRepos from "./routes/githubRepos.js";
import connectRepo from "./routes/connectRepo.js";
import createWebhook from "./routes/createWebhook.js";
import githubWebhook from "./routes/githubWebhook.js";
import devSim from "./routes/devSimulate.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));

//
//  IMPORTANT! Only ONE json parser — bodyParser.json()
//  And it MUST come BEFORE any routes
//
app.use(bodyParser.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

// Session + Passport
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Auth Routes
app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign(
      {
        userId: req.user.id,
        accessToken: req.user.accessToken,
      },
      process.env.JWT_SECRET
    );

    res.redirect(`http://localhost:5173/auth/success?token=${token}`);
  }
);

// API Routes
app.use("/api", githubRepos);
app.use("/api", connectRepo);
app.use("/api", createWebhook);

// Webhook route must receive rawBody intact
app.use("/", githubWebhook);

// Dev testing route
app.use("/", devSim);

app.listen(4000, () =>
  console.log("Backend running at http://localhost:4000")
);
