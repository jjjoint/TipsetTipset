import { describe, expect, it } from 'vitest';
import { runSimulation } from '../domain/simulator';
import type { OutcomeDistribution, SystemRow } from '../types/index';

// All matches home wins for sure
const certainHome: OutcomeDistribution = { home: 1, draw: 0, away: 0 };
const certainProbs: OutcomeDistribution[] = Array(13).fill(certainHome);
const correctRow: SystemRow = Array(13).fill('1') as SystemRow;

describe('runSimulation', () => {
  it('P(13 correct) = 1 when all outcomes are certain and row matches', () => {
    const result = runSimulation({ rows: [correctRow], matchProbabilities: certainProbs, iterations: 100, rngSeed: 42 });
    expect(result.probability13correct).toBeCloseTo(1, 5);
  });

  it('P(13 correct) = 0 when row never matches certain outcomes', () => {
    const wrongRow: SystemRow = Array(13).fill('2') as SystemRow;
    const result = runSimulation({ rows: [wrongRow], matchProbabilities: certainProbs, iterations: 100, rngSeed: 42 });
    expect(result.probability13correct).toBe(0);
    expect(result.probability12correct).toBe(0);
  });

  it('histogram counts sum to iterations', () => {
    const result = runSimulation({ rows: [correctRow], matchProbabilities: certainProbs, iterations: 500, rngSeed: 1 });
    const total = result.histogram.reduce((s, b) => s + b.count, 0);
    expect(total).toBe(500);
  });

  it('throws with wrong number of match probabilities', () => {
    const probs = Array(12).fill(certainHome) as OutcomeDistribution[];
    expect(() => runSimulation({ rows: [correctRow], matchProbabilities: probs, iterations: 100 })).toThrow();
  });

  it('returns valid simulation result structure', () => {
    const uniform: OutcomeDistribution = { home: 1 / 3, draw: 1 / 3, away: 1 / 3 };
    const uniformProbs = Array(13).fill(uniform) as OutcomeDistribution[];
    const result = runSimulation({ rows: [correctRow], matchProbabilities: uniformProbs, iterations: 1000, rngSeed: 99 });
    expect(result.iterations).toBe(1000);
    expect(result.probability10correct).toBeGreaterThanOrEqual(0);
    expect(result.probability10correct).toBeLessThanOrEqual(1);
  });
});
