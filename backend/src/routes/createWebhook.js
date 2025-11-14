import express from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { prisma } from "../db.js";

const router = express.Router();

router.post("/create-webhook", async (req, res) => {
  try {
    const auth = req.headers.authorization?.split(" ")[1];
    if (!auth) return res.status(401).json({ error: "Missing token" });

    const { accessToken } = jwt.verify(auth, process.env.JWT_SECRET);
    const { projectId } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: "Project not found" });

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

    res.json({ success: true, webhookUrl });
  } catch (err) {
    console.log(err.response?.data || err);
    res.status(500).json({ error: "Failed to create webhook" });
  }
});

export default router;
