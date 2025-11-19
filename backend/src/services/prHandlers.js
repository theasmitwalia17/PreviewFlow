// backend/src/services/prHandlers.js
import { prisma } from "../db.js";
import fs from "fs";
import { cloneRepo } from "./repoService.js";
import { buildAndRun, stopContainer } from "./dockerService.js";

export async function handlePROpenOrSync({ project, prNumber, ref }) {
  const preview = await prisma.preview.upsert({
    where: { projectId_prNumber: { projectId: project.id, prNumber } },
    update: { status: "building" },
    create: { projectId: project.id, prNumber, status: "building" }
  });

  try {
    const repoPath = await cloneRepo({
      repoOwner: project.repoOwner,
      repoName: project.repoName,
      ref
    });

    const { url } = await buildAndRun({
      project,
      previewId: preview.id,
      repoPath,
      prNumber
    });

    try {
      fs.rmSync(repoPath, { recursive: true, force: true });
    } catch {}

    return { url };
  } catch (err) {
    console.error("BUILD ERROR:", err);
    throw err;
  }
}

export async function handlePRClosed({ project, prNumber }) {
  const prev = await prisma.preview.findFirst({
    where: { projectId: project.id, prNumber }
  });
  if (!prev) return;

  const containerName = prev.containerName;

  if (containerName) {
    await stopContainer(containerName);
  }

  await prisma.preview.update({
    where: { id: prev.id },
    data: { status: "deleted", url: null }
  });
}
