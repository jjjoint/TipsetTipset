import type { OutcomeDistribution, TeamStats } from '@tipset/core';
import { getLeagueAvgGoals } from './league-defaults';

const HOME_ADVANTAGE = 1.15;
// Dixon-Coles draw inflation correction parameter.
// Empirically estimated from historical data (~-0.13 from the original DC paper).
const DC_RHO = -0.13;
const MAX_GOALS = 8;

function poissonPMF(k: number, lambda: number): number {
  let result = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) result *= lambda / i;
  return result;
}

function dixonColesCorrection(i: number, j: number, lambda: number, mu: number): number {
  if (i === 0 && j === 0) return 1 - lambda * mu * DC_RHO;
  if (i === 1 && j === 0) return 1 + mu * DC_RHO;
  if (i === 0 && j === 1) return 1 + lambda * DC_RHO;
  if (i === 1 && j === 1) return 1 - DC_RHO;
  return 1;
}

export function poissonModel(
  homeStats: TeamStats,
  awayStats: TeamStats,
  league: string
): OutcomeDistribution {
  const avgGoals = getLeagueAvgGoals(league);
  const lambda = homeStats.attackStrength * awayStats.defenseStrength * avgGoals * HOME_ADVANTAGE;
  const mu = awayStats.attackStrength * homeStats.defenseStrength * avgGoals;

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      const p = poissonPMF(i, lambda) * poissonPMF(j, mu) * dixonColesCorrection(i, j, lambda, mu);
      if (i > j) homeWin += p;
      else if (i === j) draw += p;
      else awayWin += p;
    }
  }

  // Renormalize (truncation at MAX_GOALS leaves tiny residual)
  const total = homeWin + draw + awayWin;
  return { home: homeWin / total, draw: draw / total, away: awayWin / total };
}
