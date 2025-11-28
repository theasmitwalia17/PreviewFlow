import express from "express";
import crypto from "crypto";
import { prisma } from "../db.js";
import { requireSubscription, assertRepoQuota } from "../middleware/subscription.js";

const router = express.Router();

// POST /api/connect-repo
router.post("/connect-repo", requireSubscription, async (req, res) => {
  try {
    const { user } = req.sub;
    const { repoOwner, repoName } = req.body;

    if (!repoOwner || !repoName) {
      return res.status(400).json({ error: "Missing repoOwner or repoName" });
    }

    // enforce tier quota for repos
    try {
      await assertRepoQuota(user);
    } catch (e) {
      return res.status(403).json({ error: e.message, code: e.code });
    }

    // generate secret to verify webhooks
    const webhookSecret = crypto.randomBytes(32).toString("hex");

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        repoOwner,
        repoName,
        webhookSecret
      }
    });

    return res.json({ success: true, project });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
