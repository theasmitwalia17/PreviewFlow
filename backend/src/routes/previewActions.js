import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";
import { cloneRepo } from "../services/repoService.js";
import { buildPreview, removeContainer } from "../services/dockerService.js";
import { getIO } from "../socket.js";
import fs from "fs";

const router = express.Router();

// ✅ AUTH middleware
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) return res.status(401).json({ error: "missing_jwt" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { userId: payload.userId, accessToken: payload.accessToken };
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid_jwt" });
  }
}

// ✅ REBUILD PREVIEW
router.post("/preview/:id/rebuild", auth, async (req, res) => {
  try {
    const preview = await prisma.preview.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!preview) return res.status(404).json({ error: "preview_not_found" });
    if (preview.project.userId !== req.auth.userId) return res.status(403).json({ error: "forbidden" });

    // ✅ Stop old container if exists
    if (preview.containerName) {
      await removeContainer(preview.containerName);
    }

    // ✅ Update DB → building
    await prisma.preview.update({
      where: { id: preview.id },
      data: {
        status: "building",
        url: null,
        buildStartedAt: new Date(),
        buildCompletedAt: null,
        containerName: null
      }
    });

    // ✅ Emit update to UI
    getIO().emit("preview-status-update", {
      projectId: preview.projectId,
      prNumber: preview.prNumber,
      status: "building",
      url: null,
      containerName: null,
      buildStartedAt: new Date()
    });

    // ✅ Clone repo & start build
    const repoPath = await cloneRepo({
      repoOwner: preview.project.repoOwner,
      repoName: preview.project.repoName
    });

    try {
      const url = await buildPreview({
        project: preview.project,
        previewId: preview.id,
        repoPath,
        prNumber: preview.prNumber
      });

      // ✅ Cleanup cloned folder safely
      try { fs.rmSync(repoPath, { recursive: true, force: true }); } catch {}

      // ✅ Fetch final state and emit again
      const updated = await prisma.preview.findUnique({ where: { id: preview.id }});

      getIO().emit("preview-status-update", {
        projectId: updated.projectId,
        prNumber: updated.prNumber,
        status: updated.status,
        url: updated.url,
        containerName: updated.containerName,
        buildStartedAt: updated.buildStartedAt,
        buildCompletedAt: updated.buildCompletedAt
      });

      return res.json({ ok: true, url });

    } catch (err) {
      // ✅ Build failed → mark error in DB
      await prisma.preview.update({
        where: { id: preview.id },
        data: {
          status: "error",
          url: null,
          containerName: null,
          buildCompletedAt: new Date()
        }
      });

      const updated = await prisma.preview.findUnique({ where: { id: preview.id }});

      getIO().emit("preview-status-update", {
        projectId: updated.projectId,
        prNumber: updated.prNumber,
        status: updated.status,
        url: null,
        containerName: null,
        buildStartedAt: updated.buildStartedAt,
        buildCompletedAt: updated.buildCompletedAt
      });

      try { fs.rmSync(repoPath, { recursive: true, force: true }); } catch {}

      return res.status(500).json({ ok: false, error: "build_failed" });
    }

  } catch (err) {
    console.error("rebuild_unexpected:", err);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
});

// ✅ DELETE PREVIEW
router.post("/preview/:id/delete", auth, async (req, res) => {
  try {
    const preview = await prisma.preview.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!preview) return res.status(404).json({ error: "preview_not_found" });
    if (preview.project.userId !== req.auth.userId) return res.status(403).json({ error: "forbidden" });

    // ✅ Stop container if running
    if (preview.containerName) {
      await removeContainer(preview.containerName);
    }

    // ✅ Update DB → deleted
    await prisma.preview.update({
      where: { id: preview.id },
      data: {
        status: "deleted",
        url: null,
        containerName: null,
        port: null,
        buildCompletedAt: new Date()
      }
    });

    const updated = await prisma.preview.findUnique({ where: { id: preview.id }});

    // ✅ Emit final delete update to UI
    getIO().emit("preview-status-update", {
      projectId: updated.projectId,
      prNumber: updated.prNumber,
      status: updated.status,
      url: null,
      containerName: null,
      buildCompletedAt: updated.buildCompletedAt
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("delete_unexpected:", err);
    return res.status(500).json({ ok: false, error: "delete_failed" });
  }
});

export default router;
