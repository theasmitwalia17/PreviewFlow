import express from "express";
import axios from "axios";
import { prisma } from "../db.js";
import { requireSubscription } from "../middleware/subscription.js";

const router = express.Router();

router.post("/create-webhook", requireSubscription, async (req, res) => {
  try {
    const { tier, userId, accessToken } = req.sub;
    const { projectId } = req.body;

    if (!projectId) return res.status(400).json({ error: "Missing projectId" });

    if (tier !== "PRO" && tier !== "ENTERPRISE") {
      return res.status(403).json({
        error: "Tier " + tier + " is not allowed to create webhooks (requires PRO or ENTERPRISE)",
        tier
      });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });
    if (!project) return res.status(404).json({ error: "Project not found or not yours" });

    const webhookUrl = `${process.env.PUBLIC_WEBHOOK_URL}/webhooks/github`;

    await axios.post(
      `https://api.github.com/repos/${project.repoOwner}/${project.repoName}/hooks`,
      {
        name: "web",
        active: true,
        events: ["pull_request"],
        config: {
          url: webhookUrl,
          content_type: "json",
          secret: project.webhookSecret
        }
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    return res.json({ success: true, webhookUrl });

  } catch (err) {
    console.error(err.response?.data || err);
    return res.status(500).json({ error: "Failed to create webhook" });
  }
});

export default router;
