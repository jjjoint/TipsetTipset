import type { BacktestResult, CalibrationPoint, MatchInfo, ModelPredictionData, Outcome } from '@tipset/core';
import { MODEL_VERSION } from '@tipset/model';

interface BacktestMatch {
  match: MatchInfo;
  prediction: ModelPredictionData;
}

function getOutcomeProbability(pred: ModelPredictionData, outcome: Outcome): number {
  switch (outcome) {
    case '1': return pred.probabilities.home;
    case 'X': return pred.probabilities.draw;
    case '2': return pred.probabilities.away;
  }
}

function computeBrierScore(matches: BacktestMatch[]): number {
  const settled = matches.filter((m) => m.match.actualOutcome !== null);
  if (settled.length === 0) return 0;

  const total = settled.reduce((sum, { match, prediction }) => {
    const outcome = match.actualOutcome!;
    const ph = prediction.probabilities.home;
    const pd = prediction.probabilities.draw;
    const pa = prediction.probabilities.away;
    return (
      sum +
      Math.pow(ph - (outcome === '1' ? 1 : 0), 2) +
      Math.pow(pd - (outcome === 'X' ? 1 : 0), 2) +
      Math.pow(pa - (outcome === '2' ? 1 : 0), 2)
    );
  }, 0);

  return total / settled.length;
}

function computeLogLoss(matches: BacktestMatch[]): number {
  const settled = matches.filter((m) => m.match.actualOutcome !== null);
  if (settled.length === 0) return 0;

  const total = settled.reduce((sum, { match, prediction }) => {
    const outcome = match.actualOutcome!;
    const p = Math.max(getOutcomeProbability(prediction, outcome), 1e-10);
    return sum - Math.log(p);
  }, 0);

  return total / settled.length;
}

function computeCalibrationCurve(matches: BacktestMatch[]): CalibrationPoint[] {
  const bins = 10;
  const settled = matches.filter((m) => m.match.actualOutcome !== null);
  const points: { predicted: number; correct: boolean }[] = [];

  for (const { match, prediction } of settled) {
    const outcome = match.actualOutcome!;
    const topProb = Math.max(prediction.probabilities.home, prediction.probabilities.draw, prediction.probabilities.away);
    const topOutcome = topProb === prediction.probabilities.home ? '1' : topProb === prediction.probabilities.draw ? 'X' : '2';
    points.push({ predicted: topProb, correct: topOutcome === outcome });
  }

  const curve: CalibrationPoint[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = i / bins;
    const hi = (i + 1) / bins;
    const binPoints = points.filter((p) => p.predicted >= lo && p.predicted < hi);
    if (binPoints.length > 0) {
      curve.push({
        predictedBin: (lo + hi) / 2,
        observedFrequency: binPoints.filter((p) => p.correct).length / binPoints.length,
        count: binPoints.length,
      });
    }
  }

  return curve;
}

export function runBacktest(roundId: string, matches: BacktestMatch[]): BacktestResult {
  return {
    roundId,
    modelVersion: MODEL_VERSION,
    brierScore: computeBrierScore(matches),
    logLoss: computeLogLoss(matches),
    calibrationCurve: computeCalibrationCurve(matches),
    roi: 0, // ROI calculation requires payout data — set externally
  };
}

export type { BacktestMatch };
