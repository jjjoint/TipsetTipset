import type { ModelPredictionData, OutcomeDistribution, PublicPicksData, RiskCategory } from '../types/domain';
import { computeValueScore } from './value-score';

interface TopOutcome {
  outcome: '1' | 'X' | '2';
  prob: number;
  publicPercent: number;
}

function getTopOutcome(probs: OutcomeDistribution, picks: PublicPicksData): TopOutcome {
  const outcomes = [
    { outcome: '1' as const, prob: probs.home, publicPercent: picks.homePercent },
    { outcome: 'X' as const, prob: probs.draw, publicPercent: picks.drawPercent },
    { outcome: '2' as const, prob: probs.away, publicPercent: picks.awayPercent },
  ];
  return outcomes.reduce((a, b) => (a.prob >= b.prob ? a : b));
}

export function classifyRisk(
  prediction: ModelPredictionData,
  picks: PublicPicksData
): RiskCategory {
  const probs = prediction.probabilities;
  const top = getTopOutcome(probs, picks);
  const { valueScore } = computeValueScore(top.prob, top.publicPercent);

  if (top.prob >= 0.70) return 'spik';

  // Skräll: model strongly disagrees with public on the top outcome
  if (valueScore >= 0.12 && top.prob < 0.50) return 'skräll';

  if (top.prob >= 0.55) return 'halv';
  if (top.prob < 0.40) return 'hel';

  // Model discounts favorite — cautious
  if (valueScore < -0.10) return 'avstå';

  return 'halv';
}
