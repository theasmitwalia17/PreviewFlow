import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

/**
 * Require Authentication & load user + tier into req.sub
 */
export async function requireSubscription(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });
    if (!user) return res.status(401).json({ error: "User not found" });

    // attach
    req.sub = { user, userId: user.id, accessToken: payload.accessToken, tier: user.tier };

    next();
  } catch (err) {
    console.error("Subscription auth failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Tier-based Repo Connect quota (called inside connect route)
 */
export async function assertRepoQuota(user) {
  const tier = user.tier;
  if (tier === "ENTERPRISE") return true;

  const limits = { FREE: 1, HOBBY: 2, PRO: 10 };
  const max = limits[tier] ?? 1;

  const count = await prisma.project.count({ where: { userId: user.id } });
  if (count >= max) {
    const err = new Error("Tier " + tier + " allows max " + max + " connected repos");
    err.code = "REPO_QUOTA_EXCEEDED";
    throw err;
  }

  return true;
}

/**
 * Tier-based Preview quota
 */
export async function assertPreviewQuota(user) {
  const tier = user.tier;
  if (tier === "ENTERPRISE") return true;

  const limits = { FREE: 1, HOBBY: 3, PRO: 10 };
  const max = limits[tier] ?? 1;

  const live = await prisma.preview.count({
    where: { project: { userId: user.id }, status: "live" }
  });

  if (live >= max) {
    const err = new Error("Tier " + tier + " allows max " + max + " live previews");
    err.code = "PREVIEW_QUOTA_EXCEEDED";
    throw err;
  }

  return true;
}

/**
 * Allowed port pools per tier (exclusive pool for PRO, ENTERPRISE)
 */
export const tierPortPools = {
  FREE: { min: 5500, max: 5700, exclusive: false },
  HOBBY: { min: 5500, max: 5800, exclusive: false },
  PRO: { min: 5000, max: 5400, exclusive: true },
  ENTERPRISE: { min: 4001, max: 4800, exclusive: true }
};

export function getPortPoolForTier(tier) {
  return tierPortPools[tier] || tierPortPools.FREE;
}
