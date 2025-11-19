import express from "express";
import { prisma } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/preview/:id/logs", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // optional: verify that this user owns the preview
    const preview = await prisma.preview.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });
    if (!preview) return res.status(404).json({ error: "Preview not found" });
    if (preview.project.userId !== payload.userId) return res.status(403).json({ error: "Forbidden" });

    res.json({ logs: preview.buildLogs || "" });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
