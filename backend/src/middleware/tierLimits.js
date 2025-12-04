export const TIER_LIMITS = {
  FREE: {
    maxProjects: 1,
    maxConcurrentBuilds: 1,
    allowWebhooks: false,
  },
  HOBBY: {
    maxProjects: 2,
    maxConcurrentBuilds: 1,
    allowWebhooks: false,
  },
  PRO: {
    maxProjects: Infinity,
    maxConcurrentBuilds: 3,
    allowWebhooks: true,
  },
  ENTERPRISE: {
    maxProjects: Infinity,
    maxConcurrentBuilds: 10,
    allowWebhooks: true,
  },
};

export function getTierLimits(tier) {
  return TIER_LIMITS[tier] || TIER_LIMITS.FREE;
}
