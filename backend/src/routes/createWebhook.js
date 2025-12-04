import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getTierLimits } from "../middleware/tierLimits.js";
import { prisma } from "../db.js";
import crypto from "crypto";
import axios from "axios";

const router = express.Router();

router.post("/create-webhook", requireAuth, async (req, res) => {
  try {
    const { projectId } = req.body;
    const tier = req.auth.user.tier;
    const limits = getTierLimits(tier);

    if (!limits.allowWebhooks) {
      return res.status(403).json({
        error: "webhook_not_allowed",
        message: `GitHub webhooks are only available on PRO and ENTERPRISE plans.`,
      });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== req.auth.user.id) {
      return res.status(404).json({ error: "project_not_found" });
    }

    const webhookUrl = process.env.APP_BASE_URL + `/api/github/webhook`;
    const githubApiUrl = `https://api.github.com/repos/${project.repoOwner}/${project.repoName}/hooks`;

    const ghResponse = await axios.post(
      githubApiUrl,
      {
        name: "web",
        config: {
          url: webhookUrl,
          content_type: "json",
          secret: project.webhookSecret,
        },
        events: ["pull_request"],
        active: true,
      },
      {
        headers: {
          Authorization: `token ${project.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    await prisma.project.update({
      where: { id: projectId },
      data: { webhookId: ghResponse.data.id.toString() },
    });

    return res.json({ ok: true, webhook: ghResponse.data });

  } catch (err) {
    console.error("create-webhook error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
