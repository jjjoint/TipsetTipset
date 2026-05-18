import type { OutcomeDistribution } from '@tipset/core';

const MAX_ENTROPY = Math.log2(3);

export function computeUncertainty(dist: OutcomeDistribution): number {
  const probs = [dist.home, dist.draw, dist.away];
  const entropy = probs.reduce((h, p) => {
    if (p <= 0) return h;
    return h - p * Math.log2(p);
  }, 0);
  return entropy / MAX_ENTROPY;
}
