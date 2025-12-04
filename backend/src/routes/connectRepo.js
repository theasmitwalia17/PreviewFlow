import express from "express";
import crypto from "crypto";
import axios from "axios"; // needed only if webhook is later allowed in PRO
import { prisma } from "../db.js";
import { requireSubscription, assertRepoQuota } from "../middleware/subscription.js";

const router = express.Router();

// Optional tiers that support auto-deploy
const WEBHOOK_TIERS = ["PRO", "ENTERPRISE"];

router.post("/connect-repo", requireSubscription, async (req, res) => {
  try {
    const { user, tier = "FREE", accessToken } = req.sub; // tier may come from subscription
    const { repoOwner, repoName } = req.body;

    // 1️⃣ Input validation (prevents injection/parsing bugs)
    if (typeof repoOwner !== "string" || typeof repoName !== "string") {
      return res.status(400).json({ error: "invalid_input_format" });
    }

    if (!repoOwner.trim() || !repoName.trim()) {
      return res.status(400).json({ error: "missing_repo_details" });
    }

    // 2️⃣ Enforce repo quota (rate & subscription guard)
    try {
      await assertRepoQuota(user);
    } catch (e) {
      return res.status(429).json({ error: e.message, code: e.code });
    }

    // 3️⃣ Prevent container/project name collision (duplicate project protection)
    const existing = await prisma.project.findFirst({
      where: { userId: user.id, repoOwner, repoName }
    });

    if (existing) {
      return res.status(304).json({ success: true, project: existing, note: "already_connected" });
    }

    // 4️⃣ Generate secrets safely
    const webhookSecret = crypto.randomBytes(32).toString("hex");

    // 5️⃣ DB write with try/catch safety
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        repoOwner,
        repoName,
        webhookSecret // ✅ Required field fixed
      }
    });

    // (Optional – only if you add webhook later for PRO tiers)
    if (WEBHOOK_TIERS.includes(tier.toUpperCase())) {
      const webhookURL = `${process.env.PUBLIC_WEBHOOK_URL}/webhooks/github`;

      await axios.post(
        `https://api.github.com/repos/${repoOwner}/${repoName}/hooks`,
        {
          name: "web",
          active: true,
          events: ["pull_request"],
          config: {
            url: webhookURL,
            content_type: "json",
            secret: webhookSecret
          }
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }

    return res.json({ success: true, project });

  } catch (err) {
    console.error("connect-repo error:", err);
    return res.status(500).json({ success: false, error: "connection_failed" });
  }
});

export default router;
