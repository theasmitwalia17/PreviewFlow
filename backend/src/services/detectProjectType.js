import fs from "fs";
import path from "path";

export function detectProjectType(repoPath) {
  const f = p => fs.existsSync(path.join(repoPath, p));
  if (f("vite.config.js") || f("vite.config.ts")) return "vite";
  if (f("next.config.js") || f("next.config.mjs")) return "nextjs";
  if (f("package.json")) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(repoPath, "package.json")));
      const scripts = pkg.scripts || {};
      if (scripts.start && scripts.build && (pkg.dependencies?.react || pkg.devDependencies?.vite)) {
        if (f("vite.config.js") || f("vite.config.ts")) return "vite";
      }
    } catch(e){}
    return "node-backend";
  }
  if (f("index.html")) return "static";
  return "unknown";
}
