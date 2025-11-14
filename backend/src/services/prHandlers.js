import { prisma } from "../db.js";
import { cloneRepo, buildAndRun, stopContainer } from "./dockerService.js";
import path from "path";
import fs from "fs";

export async function handlePROpenOrSync({ project, prNumber, ref }) {
  // upsert preview entry
  const prev = await prisma.preview.upsert({
    where: { projectId_prNumber: { projectId: project.id, prNumber } },
    update: { status: "building" },
    create: { projectId: project.id, prNumber, status: "building" }
  });

  try {
    // clone repo (optionally checkout ref if provided)
    const repoPath = await cloneRepo({ repoOwner: project.repoOwner, repoName: project.repoName, prNumber, ref });

    // build & run container
    const { url, containerName } = await buildAndRun({ repoOwner: project.repoOwner, repoName: project.repoName, prNumber, repoPath });

    await prisma.preview.update({ where: { id: prev.id }, data: { status: "live", url } });

    // cleanup cloned repo to save space (optional)
    try { fs.rmSync(repoPath, { recursive: true, force: true }); } catch(e){}

    return { url, containerName };
  } catch (err) {
    console.error("build error:", err);
    await prisma.preview.update({ where: { id: prev.id }, data: { status: "error" } });
    throw err;
  }
}

export async function handlePRClosed({ project, prNumber }) {
  const prev = await prisma.preview.findFirst({ where: { projectId: project.id, prNumber } });
  if (!prev) return;
  const containerName = `${project.repoOwner.toLowerCase()}-${project.repoName.toLowerCase()}-pr-${prNumber}`.replace(/[^a-z0-9\-]/g,'');
  await stopContainer(containerName);
  await prisma.preview.update({ where: { id: prev.id }, data: { status: "deleted", url: null } });
}
