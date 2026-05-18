import type { OutcomeDistribution, PriorSignals } from '@tipset/core';
import { getLeagueBaseline } from './league-defaults';
import { poissonModel } from './poisson';

// Weights for each signal source. Must sum to 1 when all present.
const BASE_WEIGHTS = {
  oddsNormalized: 0.50,
  eloStrength: 0.25,
  leagueBaseline: 0.15,
  recentForm: 0.10,
} as const;

function eloToProbabilities(homeElo: number, awayElo: number, homeAdv = 100): OutcomeDistribution {
  const diff = homeElo + homeAdv - awayElo;
  const homeWinProb = 1 / (1 + Math.pow(10, -diff / 400));
  // Approximate draw fraction using a simplified model
  const drawFraction = 0.27 - 0.001 * Math.abs(diff);
  const adjustedHome = homeWinProb * (1 - Math.max(drawFraction, 0.10));
  const adjustedAway = (1 - homeWinProb) * (1 - Math.max(drawFraction, 0.10));
  const total = adjustedHome + Math.max(drawFraction, 0.10) + adjustedAway;
  return {
    home: adjustedHome / total,
    draw: Math.max(drawFraction, 0.10) / total,
    away: adjustedAway / total,
  };
}

function formToAdjustment(
  form: ('W' | 'D' | 'L')[],
  isHome: boolean
): number {
  const recent = form.slice(-5);
  const points = recent.reduce((p, r) => p + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
  const maxPoints = recent.length * 3;
  const ratio = maxPoints > 0 ? points / maxPoints : 0.5;
  return isHome ? ratio : 1 - ratio;
}

function blendDistributions(
  dists: { dist: OutcomeDistribution; weight: number }[]
): OutcomeDistribution {
  const totalWeight = dists.reduce((s, d) => s + d.weight, 0);
  if (totalWeight === 0) return { home: 0.45, draw: 0.26, away: 0.29 };

  const home = dists.reduce((s, d) => s + d.dist.home * d.weight, 0) / totalWeight;
  const draw = dists.reduce((s, d) => s + d.dist.draw * d.weight, 0) / totalWeight;
  const away = dists.reduce((s, d) => s + d.dist.away * d.weight, 0) / totalWeight;

  const total = home + draw + away;
  return { home: home / total, draw: draw / total, away: away / total };
}

export function buildBayesianPrior(signals: PriorSignals): OutcomeDistribution {
  const contributions: { dist: OutcomeDistribution; weight: number }[] = [];

  if (signals.oddsNormalized) {
    contributions.push({ dist: signals.oddsNormalized, weight: BASE_WEIGHTS.oddsNormalized });
  }

  if (signals.eloRating) {
    const eloDist = eloToProbabilities(signals.eloRating.home, signals.eloRating.away);
    contributions.push({ dist: eloDist, weight: BASE_WEIGHTS.eloStrength });
  } else if (signals.homeStats && signals.awayStats) {
    const poissonDist = poissonModel(signals.homeStats, signals.awayStats, signals.league);
    contributions.push({ dist: poissonDist, weight: BASE_WEIGHTS.eloStrength });
  }

  const leagueDist = getLeagueBaseline(signals.league);
  contributions.push({ dist: leagueDist, weight: BASE_WEIGHTS.leagueBaseline });

  if (signals.homeStats?.form && signals.awayStats?.form) {
    const homeFormScore = formToAdjustment(signals.homeStats.form, true);
    const awayFormScore = formToAdjustment(signals.awayStats.form, false);
    const formDist: OutcomeDistribution = {
      home: homeFormScore * 0.6,
      draw: 0.26,
      away: awayFormScore * 0.6,
    };
    const ft = formDist.home + formDist.draw + formDist.away;
    contributions.push({
      dist: { home: formDist.home / ft, draw: formDist.draw / ft, away: formDist.away / ft },
      weight: BASE_WEIGHTS.recentForm,
    });
  }

  return blendDistributions(contributions);
}
