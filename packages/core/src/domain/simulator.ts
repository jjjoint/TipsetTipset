import type { Outcome, OutcomeDistribution, PayoutInfo } from '../types/domain';
import type { HistogramBin, SimulationResult, SystemRow } from '../types/system';

// Seedable PRNG (mulberry32) for deterministic tests
export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleOutcome(dist: OutcomeDistribution, rand: number): Outcome {
  if (rand < dist.home) return '1';
  if (rand < dist.home + dist.draw) return 'X';
  return '2';
}

function countCorrect(row: SystemRow, outcomes: Outcome[]): number {
  return row.reduce((n, sign, i) => n + (sign === outcomes[i] ? 1 : 0), 0);
}

const DEFAULT_PAYOUT: PayoutInfo = {
  correct13: 1_000_000,
  correct12: 5_000,
  correct11: 300,
  correct10: 50,
};

export interface SimulationInput {
  rows: SystemRow[];
  matchProbabilities: OutcomeDistribution[];
  iterations?: number;
  payoutInfo?: PayoutInfo | null;
  rngSeed?: number;
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const { rows, matchProbabilities, iterations = 10_000, payoutInfo, rngSeed } = input;

  if (matchProbabilities.length !== 13) {
    throw new Error(`Expected 13 match probabilities, got ${matchProbabilities.length}`);
  }

  const rand = rngSeed !== undefined ? mulberry32(rngSeed) : () => Math.random();
  const correctCounts = new Array<number>(14).fill(0);

  for (let iter = 0; iter < iterations; iter++) {
    const sampledOutcomes: Outcome[] = matchProbabilities.map((dist) =>
      sampleOutcome(dist, rand())
    );

    let bestCorrect = 0;
    for (const row of rows) {
      const correct = countCorrect(row, sampledOutcomes);
      if (correct > bestCorrect) bestCorrect = correct;
    }

    correctCounts[bestCorrect]!++;
  }

  const histogram: HistogramBin[] = correctCounts.map((count, correct) => ({
    correct,
    count,
    probability: count / iterations,
  }));

  const payout = payoutInfo ?? DEFAULT_PAYOUT;
  const p10 = (correctCounts[10] ?? 0) / iterations;
  const p11 = (correctCounts[11] ?? 0) / iterations;
  const p12 = (correctCounts[12] ?? 0) / iterations;
  const p13 = (correctCounts[13] ?? 0) / iterations;

  const expectedValue =
    p10 * (payout.correct10 ?? 50) +
    p11 * (payout.correct11 ?? 300) +
    p12 * (payout.correct12 ?? 5_000) +
    p13 * (payout.correct13 ?? 1_000_000) -
    rows.length;

  return {
    iterations,
    probability10correct: p10,
    probability11correct: p11,
    probability12correct: p12,
    probability13correct: p13,
    expectedValue,
    histogram,
  };
}
