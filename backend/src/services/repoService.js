// backend/src/services/repoService.js
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import os from "os";

export async function cloneRepo({ repoOwner, repoName, ref }) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pr-build-"));

  const url = `https://github.com/${repoOwner}/${repoName}.git`;

  const git = simpleGit();

  // clone repo
  await git.clone(url, tempDir);

  // checkout PR branch/sha if provided
  if (ref) {
    await git.cwd(tempDir).checkout(ref);
  }

  return tempDir;
}
