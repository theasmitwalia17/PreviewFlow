// backend/src/services/dockerService.js
import path from "path";
import { exec } from "child_process";
import getPort from "get-port";
import { prisma } from "../db.js";
import { getIO } from "../socket.js";

/**
 * Execute command & stream logs
 */
function runCommand(command, onData) {
  return new Promise((resolve, reject) => {
    const child = exec(command, { maxBuffer: 1024 * 1024 * 50 });

    child.stdout?.on("data", (d) => onData(d.toString()));
    child.stderr?.on("data", (d) => onData(d.toString()));

    child.on("close", (code) => resolve(code));
    child.on("error", reject);
  });
}

export async function buildAndRun({ project, previewId, repoPath, prNumber }) {
  const sanitized = `${project.repoOwner}-${project.repoName}-pr-${prNumber}`
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, "-");

  let containerName = sanitized;
  let imageName = sanitized;

  const dockerfilePath = path.resolve("deploy-templates/vite.Dockerfile");
  const hostPort = await getPort({ port: 40000 });

  let logs = "";

  const append = (chunk) => {
    logs += chunk;
    try {
      getIO().to(previewId).emit("log", { chunk });
    } catch {}
  };

  await prisma.preview.update({
    where: { id: previewId },
    data: { status: "building" }
  });

  const buildCmd = `docker build -t ${imageName} -f "${dockerfilePath}" "${repoPath}"`;
  const runCmd = `docker run -d --name ${containerName} -p ${hostPort}:80 ${imageName}`;

  try {
    append(`> ${buildCmd}\n`);
    await runCommand(buildCmd, append);

    append(`> ${runCmd}\n`);
    await runCommand(runCmd, append);

    // 🔥 Get actual container name in case Docker renamed it
    await new Promise((resolve) => {
      exec(`docker ps -a --format "{{.Names}}"`, (err, stdout) => {
        if (!err) {
          const names = stdout.split("\n").map((n) => n.trim());
          const match = names.find((n) => n.includes(sanitized));
          if (match) containerName = match;
        }
        resolve();
      });
    });

    const url = `http://localhost:${hostPort}`;

    // Save everything
    await prisma.preview.update({
      where: { id: previewId },
      data: {
        url,
        status: "live",
        buildLogs: logs,
        containerName: containerName
      }
    });

    try {
      getIO().to(previewId).emit("log-finish", { url });
    } catch {}

    return { url, containerName, hostPort };
  } catch (err) {
    await prisma.preview.update({
      where: { id: previewId },
      data: {
        status: "error",
        buildLogs: logs + "\n\nBUILD ERROR:\n" + (err.message || String(err))
      }
    });

    try {
      getIO().to(previewId).emit("log-error", { message: err.message });
    } catch {}

    throw err;
  }
}

export async function stopContainer(containerName) {
  try {
    await new Promise((resolve, reject) => {
      exec(`docker rm -f ${containerName}`, (err, stdout) => {
        if (err) {
          console.log("❌ Failed to remove container:", containerName, err.message);
          return reject(err);
        }
        console.log("✔ Removed container:", containerName);
        resolve(stdout);
      });
    });
  } catch (err) {
    console.log("Container remove error:", err.message);
  }
}
