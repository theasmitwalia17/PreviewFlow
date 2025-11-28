import express from "express";
import { prisma } from "../db.js";
import { verifyGithubSignature } from "../utils/gitHubVerify.js";
import { handlePROpenOrSync, handlePRClosed } from "../services/prHandlers.js";

const router = express.Router();

router.post("/webhooks/github", async (req, res) => {
  try {
    const event = req.header("X-GitHub-Event");
    const signature = req.header("X-Hub-Signature-256");
    const payload = req.body;
    const raw = req.rawBody;

    const repoOwner = payload?.repository?.owner?.login;
    const repoName = payload?.repository?.name;
    if (!repoOwner || !repoName) return res.status(400).send("no repo");

    const project = await prisma.project.findFirst({
      where: { repoOwner, repoName },
      include: { user: true }
    });
    if (!project) return res.status(404).send("project not registered");

    const ok = verifyGithubSignature(raw, signature, project.webhookSecret);
    if (!ok) return res.status(401).send("invalid signature");

    if (event !== "pull_request") return res.status(200).send("ignored");

    const action = payload.action;
    const prNumber = payload.pull_request.number;
    const headRef = payload.pull_request.head.ref;
    const headSha = payload.pull_request.head.sha;

    const tier = project.user.tier;

    if (["opened", "synchronize", "reopened"].includes(action)) {
      if (tier === "FREE") {
        return res.status(200).send("free_tier_blocked");
      }

      if (tier === "HOBBY" && action !== "opened") {
        return res.status(200).send("hobby_sync_ignored");
      }

      await handlePROpenOrSync({
        project,
        prNumber,
        ref: headRef || headSha,
        user: project.user
      });
    } else if (action === "closed" || action === "deleted") {
      await handlePRClosed({ project, prNumber });
    }

    res.status(200).send("ok");

  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

export default router;
