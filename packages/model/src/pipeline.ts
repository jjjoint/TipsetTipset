import type { MatchInfo, ModelPredictionData, ModelSignals, PublicPicksData, TeamStats } from '@tipset/core';
import type { RawOdds } from '@tipset/core';
import { buildBayesianPrior } from './bayesian-prior';
import { calibrateDrawProbability } from './draw-calibration';
import { normalizeOdds } from './odds-normalization';
import { poissonModel } from './poisson';
import { computeUncertainty } from './uncertainty';
import { MODEL_VERSION } from './version';

export interface ModelPipelineInput {
  match: MatchInfo;
  odds: RawOdds | null;
  homeStats: TeamStats | null;
  awayStats: TeamStats | null;
  publicPicks: PublicPicksData | null;
}

export function runModelForMatch(input: ModelPipelineInput): ModelPredictionData {
  const { match, odds, homeStats, awayStats } = input;

  const oddsNormalized = odds ? normalizeOdds(odds).probabilities : null;
  const poissonDerived =
    homeStats && awayStats ? poissonModel(homeStats, awayStats, match.league) : null;

  const prior = buildBayesianPrior({
    oddsNormalized,
    eloRating:
      homeStats && awayStats
        ? { home: homeStats.eloRating, away: awayStats.eloRating }
        : null,
    homeStats,
    awayStats,
    league: match.league,
  });

  const calibrated = calibrateDrawProbability(prior);
  const uncertainty = computeUncertainty(calibrated);

  const signals: ModelSignals = {
    oddsNormalized,
    bayesianPrior: prior,
    poissonDerived,
    calibrated,
  };

  return {
    matchId: match.id,
    probabilities: calibrated,
    fairOdds: {
      home: 1 / calibrated.home,
      draw: 1 / calibrated.draw,
      away: 1 / calibrated.away,
    },
    uncertainty,
    modelVersion: MODEL_VERSION,
    signals,
  };
}
