export const tierRepoLimits = {
  FREE: 1,
  HOBBY: 2,
  PRO: 10,
  ENTERPRISE: null
};

export const tierPreviewLimits = {
  FREE: 1,
  HOBBY: 3,
  PRO: 10,
  ENTERPRISE: null
};

export const tierPortPools = {
  FREE: { min: 5500, max: 5700, exclusive: false },
  HOBBY: { min: 5500, max: 5750, exclusive: false },
  PRO: { min: 5000, max: 5400, exclusive: true },
  ENTERPRISE: { min: 4001, max: 4800, exclusive: true }
};
