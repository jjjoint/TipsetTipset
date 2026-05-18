export interface ValueScoreResult {
  valueScore: number;
  valueRatio: number;
}

export function computeValueScore(
  modelProb: number,
  publicPickPercent: number
): ValueScoreResult {
  const publicFrac = publicPickPercent / 100;
  return {
    valueScore: modelProb - publicFrac,
    valueRatio: publicFrac > 0 ? modelProb / publicFrac : Infinity,
  };
}
