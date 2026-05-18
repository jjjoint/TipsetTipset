import type { OutcomeDistribution } from '@tipset/core';

// Empirical draw probability calibration factor.
// Draws are systematically underestimated by the Poisson model in pool betting contexts.
// This factor is tunable and should be re-estimated from backtest results.
const DEFAULT_DRAW_CALIBRATION_FACTOR = 1.08;

export function calibrateDrawProbability(
  dist: OutcomeDistribution,
  factor = DEFAULT_DRAW_CALIBRATION_FACTOR
): OutcomeDistribution {
  const drawCalibrated = Math.min(dist.draw * factor, 0.99);
  const excess = drawCalibrated - dist.draw;
  const nonDrawTotal = dist.home + dist.away;

  const home = dist.home - excess * (nonDrawTotal > 0 ? dist.home / nonDrawTotal : 0.5);
  const away = dist.away - excess * (nonDrawTotal > 0 ? dist.away / nonDrawTotal : 0.5);

  const total = home + drawCalibrated + away;
  return {
    home: home / total,
    draw: drawCalibrated / total,
    away: away / total,
  };
}
