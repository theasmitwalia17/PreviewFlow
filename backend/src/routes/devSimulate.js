import express from "express";
import { prisma } from "../db.js";
import { handlePROpenOrSync, handlePRClosed } from "../services/prHandlers.js";

const router = express.Router();

router.post("/dev/sim-pr", async (req, res) => {
  const { projectId, prNumber, action } = req.body;
  const project = await prisma.project.findUnique({ where: { id: projectId }});
  if (!project) return res.status(404).json({ error: "project not found" });

  if (action === "close") {
    await handlePRClosed({ project, prNumber });
  } else {
    await handlePROpenOrSync({ project, prNumber });
  }

  res.json({ ok: true });
});

export default router;
