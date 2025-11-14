import express from "express";
import { prisma } from "../db.js";
import { verifyGithubSignature } from "../utils/gitHubVerify.js";
import { handlePROpenOrSync, handlePRClosed } from "../services/prHandlers.js";

const router = express.Router();

// POST /webhooks/github
router.post("/webhooks/github", async (req, res) => {
  try {
    const event = req.header("X-GitHub-Event");
    const signature = req.header("X-Hub-Signature-256");
    const payload = req.body; // express.json() / bodyParser has set req.body
    const raw = req.rawBody;   // ensure raw saved (see server.js change below)

    const repoOwner = payload?.repository?.owner?.login;
    const repoName = payload?.repository?.name;
    if (!repoOwner || !repoName) return res.status(400).send("no repo");

    const project = await prisma.project.findFirst({ where: { repoOwner, repoName }});
    if (!project) return res.status(404).send("project not registered");

    const ok = verifyGithubSignature(raw, signature, project.webhookSecret);
    if (!ok) return res.status(401).send("invalid signature");

    if (event !== "pull_request") return res.status(200).send("ignored");

    const action = payload.action; // opened, synchronize, closed, reopened...
    const prNumber = payload.number;
    // try get head ref / sha -> pass to clone checkout if you want
    const headRef = payload?.pull_request?.head?.ref;
    const headSha = payload?.pull_request?.head?.sha;

    if (["opened","synchronize","reopened"].includes(action)) {
      // call handler (do not await if you want to return quickly)
      await handlePROpenOrSync({ project, prNumber, ref: headRef || headSha });
    } else if (action === "closed") {
      await handlePRClosed({ project, prNumber });
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

export default router;
