export const TIER_LIMITS = {
  FREE: {
    maxProjects: 1,
    maxConcurrentBuilds: 1,
    maxPreviews: 1,       
    allowWebhooks: false,
  },
  HOBBY: {
    maxProjects: 2,
    maxConcurrentBuilds: 1,
    maxPreviews: 5,
    allowWebhooks: false,
  },
  PRO: {
    maxProjects: Infinity,
    maxConcurrentBuilds: 3,
    maxPreviews: Infinity,
    allowWebhooks: true,
  },
  ENTERPRISE: {
    maxProjects: Infinity,
    maxConcurrentBuilds: 10,
    maxPreviews: Infinity,
    allowWebhooks: true,
  },
};

const TIER_ORDER = ["FREE", "HOBBY", "PRO", "ENTERPRISE"];

export function normalizeTier(tier) {
  if (!tier) return "FREE";
  const upper = String(tier).toUpperCase();
  return TIER_LIMITS[upper] ? upper : "FREE";
}

export function getTierLimits(tier) {
  return TIER_LIMITS[normalizeTier(tier)];
}

export function compareTier(current, target) {
  const cur = TIER_ORDER.indexOf(normalizeTier(current));
  const tgt = TIER_ORDER.indexOf(normalizeTier(target));
  if (cur === tgt) return 0;
  return tgt > cur ? 1 : -1;
}
