// backend/src/routes/accountTier.js
import express from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getTierLimits, compareTier, normalizeTier } from "../middleware/tierLimits.js";
import { removeContainer } from "../services/dockerService.js";

const router = express.Router();

const VALID_TIERS = ["FREE", "HOBBY", "PRO", "ENTERPRISE"];

/**
 * POST /api/account/change-tier
 *
 * Body:
 *  {
 *    newTier: "FREE" | "HOBBY" | "PRO" | "ENTERPRISE",
 *    confirmCleanup?: boolean   // if false/omitted => dry-run (no deletion)
 *  }
 *
 * Response (dry-run when cleanup needed):
 *  {
 *    needsCleanup: true,
 *    currentTier,
 *    newTier,
 *    totalProjects,
 *    totalPreviews,
 *    willDeleteProjects: [{ id, repoOwner, repoName }],
 *    willDeletePreviews: [{ id, projectId, prNumber, status }]
 *  }
 *
 * Response (after confirmed cleanup & update):
 *  {
 *    needsCleanup: false,
 *    changed: true,
 *    currentTier,
 *    newTier,
 *    totalProjects,
 *    totalPreviews,
 *    deletedProjectsCount,
 *    deletedPreviewsCount
 *  }
 */
router.post("/change-tier", requireAuth, async (req, res) => {
  try {
    const { newTier, confirmCleanup } = req.body || {};
    const user = req.auth.user;

    if (!newTier) {
      return res.status(400).json({ error: "newTier is required" });
    }

    const targetTier = normalizeTier(newTier);
    if (!VALID_TIERS.includes(targetTier)) {
      return res.status(400).json({ error: "Invalid tier" });
    }

    const currentTier = normalizeTier(user.tier);
    const tierComparison = compareTier(currentTier, targetTier);
    const limits = getTierLimits(targetTier);

    // If not actually changing, just echo back
    if (tierComparison === 0) {
      return res.json({
        needsCleanup: false,
        changed: false,
        currentTier,
        newTier: targetTier,
      });
    }

    // If upgrading → no cleanup, just update tier
    if (tierComparison === 1) {
      await prisma.user.update({
        where: { id: user.id },
        data: { tier: targetTier },
      });

      return res.json({
        needsCleanup: false,
        changed: true,
        currentTier,
        newTier: targetTier,
      });
    }

    // From here on → it's a downgrade (target < current)
    // We need to see what must be deleted to fit new limits.

    const maxProjects = limits.maxProjects;
    const maxPreviews = limits.maxPreviews;

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: { previews: true },
    });

    const totalPreviews = projects.reduce(
      (acc, p) => acc + p.previews.length,
      0
    );

    // Decide which projects to keep vs delete
    let projectsToKeep = projects;
    let projectsToDelete = [];

    if (Number.isFinite(maxProjects) && projects.length > maxProjects) {
      // Keep the first N projects (arbitrary but deterministic by array order)
      projectsToKeep = projects.slice(0, maxProjects);
      projectsToDelete = projects.slice(maxProjects);
    }

    // Previews inside projects we're keeping
    const previewsInKeptProjects = projectsToKeep.flatMap((p) =>
      p.previews.map((pre) => ({
        ...pre,
        projectId: p.id,
      }))
    );

    // Previews inside projects to delete
    const previewsInDeletedProjects = projectsToDelete.flatMap((p) =>
      p.previews.map((pre) => ({
        ...pre,
        projectId: p.id,
      }))
    );

    // Among kept projects, enforce maxPreviews limit
    let previewsToDeleteFromKept = [];
    if (Number.isFinite(maxPreviews) && previewsInKeptProjects.length > maxPreviews) {
      // Keep the first maxPreviews previews, delete the rest
      previewsToDeleteFromKept = previewsInKeptProjects.slice(maxPreviews);
    }

    // Combined deletions
    const allPreviewsToDelete = [
      ...previewsInDeletedProjects,
      ...previewsToDeleteFromKept,
    ];

    const projectIdsToDelete = projectsToDelete.map((p) => p.id);
    const previewIdsToDelete = allPreviewsToDelete.map((p) => p.id);

    const responseSummary = {
      needsCleanup:
        projectIdsToDelete.length > 0 || previewIdsToDelete.length > 0,
      currentTier,
      newTier: targetTier,
      totalProjects: projects.length,
      totalPreviews,
      willDeleteProjects: projectsToDelete.map((p) => ({
        id: p.id,
        repoOwner: p.repoOwner,
        repoName: p.repoName,
      })),
      willDeletePreviews: allPreviewsToDelete.map((pre) => ({
        id: pre.id,
        projectId: pre.projectId,
        prNumber: pre.prNumber,
        status: pre.status,
      })),
    };

    // If cleanup is needed but the user hasn't confirmed yet → dry-run response
    if (responseSummary.needsCleanup && !confirmCleanup) {
      return res.json(responseSummary);
    }

    // If no cleanup needed → just update tier
    if (!responseSummary.needsCleanup) {
      await prisma.user.update({
        where: { id: user.id },
        data: { tier: targetTier },
      });

      return res.json({
        ...responseSummary,
        needsCleanup: false,
        changed: true,
        deletedProjectsCount: 0,
        deletedPreviewsCount: 0,
      });
    }

    // Cleanup has been confirmed → perform deletions + tier update
    // 1. Stop containers for previews that will be deleted (best-effort)
    for (const pre of allPreviewsToDelete) {
      if (pre.containerName) {
        try {
          await removeContainer(pre.containerName);
        } catch (e) {
          console.error(
            `Failed to remove container for preview ${pre.id}:`,
            e.message
          );
        }
      }
    }

    // 2. Delete previews + projects + update user.tier in a transaction
    await prisma.$transaction(async (tx) => {
      if (previewIdsToDelete.length > 0) {
        await tx.preview.deleteMany({
          where: { id: { in: previewIdsToDelete } },
        });
      }

      if (projectIdsToDelete.length > 0) {
        await tx.project.deleteMany({
          where: { id: { in: projectIdsToDelete } },
        });
      }

      await tx.user.update({
        where: { id: user.id },
        data: { tier: targetTier },
      });
    });

    return res.json({
      ...responseSummary,
      needsCleanup: false,
      changed: true,
      deletedProjectsCount: projectIdsToDelete.length,
      deletedPreviewsCount: previewIdsToDelete.length,
    });
  } catch (err) {
    console.error("change-tier error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
