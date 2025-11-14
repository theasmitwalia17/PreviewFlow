// requires: npm i simple-git get-port
import { exec as _exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import getPort from "get-port";
import simpleGit from "simple-git";
import { detectProjectType } from "./detectProjectType.js";

const exec = promisify(_exec);

// base tmp stores
const TMP_BASE = path.join(process.cwd(), "tmp-builds");
if (!fs.existsSync(TMP_BASE)) fs.mkdirSync(TMP_BASE, { recursive: true });

export async function cloneRepo({ repoOwner, repoName, prNumber, ref }) {
  const repoPath = path.join(TMP_BASE, `${repoOwner}-${repoName}-pr-${prNumber}-${Date.now()}`);
  fs.mkdirSync(repoPath, { recursive: true });
  const git = simpleGit();
  // clone shallow
  await git.clone(`https://github.com/${repoOwner}/${repoName}.git`, repoPath, { "--depth": 1 });
  // optionally checkout a ref (branch/sha) if provided
  if (ref) {
    await git.cwd(repoPath).checkout(ref);
  }
  return repoPath;
}

function getDockerfileForType(type) {
  return {
    vite: path.join(process.cwd(), "deploy-templates", "vite.Dockerfile"),
    static: path.join(process.cwd(), "deploy-templates", "static.Dockerfile"),
    node: path.join(process.cwd(), "deploy-templates", "node-backend.Dockerfile"),
  }[type] || path.join(process.cwd(), "deploy-templates", "node-backend.Dockerfile");
}

export async function buildAndRun({ repoOwner, repoName, prNumber, repoPath }) {
  const type = detectProjectType(repoPath);
  let buildType = type === "vite" ? "vite" : (type === "static" ? "static" : "node");
  const dockerfile = getDockerfileForType(buildType);
  const imageTag = `${repoOwner.toLowerCase()}-${repoName.toLowerCase()}-pr-${prNumber}`.replace(/[^a-z0-9\-]/g, '');
  const containerName = imageTag;

  // Build image
  await exec(`docker build -t ${imageTag} -f "${dockerfile}" "${repoPath}"`, { maxBuffer: 1024 * 1024 * 10 });

  // Choose host port
  const hostPort = await getPort({ port: 40000 });

  const innerPort = (buildType === "vite" || buildType === "static") ? 80 : 3000;

  // Remove previous container if exists
  try { await exec(`docker rm -f ${containerName}`); } catch (e) { }

  await exec(`docker run -d --name ${containerName} -p ${hostPort}:${innerPort} ${imageTag}`);

  const url = `${process.env.PUBLIC_PREVIEW_BASE || "http://localhost"}:${hostPort}`;
  return { url, containerName, hostPort, type: buildType };
}

export async function stopContainer(containerName) {
  try { await exec(`docker rm -f ${containerName}`); } catch (e) { }
}
