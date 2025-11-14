import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../db.js";

const router = express.Router();

// POST /api/connect-repo
router.post("/connect-repo", async (req, res) => {
  try {
    const auth = req.headers.authorization?.split(" ")[1];
    if (!auth) return res.status(401).json({ error: "Missing token" });

    const { userId } = jwt.verify(auth, process.env.JWT_SECRET);

    const { repoOwner, repoName } = req.body;

    // Generate webhook secret (used later when webhook arrives)
    const webhookSecret = crypto.randomBytes(32).toString("hex");

    // Save project to DB
    const project = await prisma.project.create({
      data: {
        userId,
        repoOwner,
        repoName,
        webhookSecret,
      }
    });

    return res.json({ success: true, project });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
