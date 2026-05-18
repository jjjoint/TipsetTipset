import { describe, expect, it } from 'vitest';
import { exportSystemToCSV, generateSystem } from '../domain/system-generator';
import type { MatchAnalysis } from '../types/domain';

function makeAnalysis(homeProb: number, drawProb: number, awayProb: number, matchId: string): MatchAnalysis {
  return {
    match: {
      id: matchId, roundId: 'r1', index: 1,
      homeTeam: 'A', awayTeam: 'B', league: 'PL',
      startTime: new Date(), finalScore: null, actualOutcome: null,
    },
    publicPicks: { matchId, homePercent: 40, drawPercent: 30, awayPercent: 30, observedAt: new Date(), source: 'mock' },
    prediction: {
      matchId,
      probabilities: { home: homeProb, draw: drawProb, away: awayProb },
      fairOdds: { home: 1 / homeProb, draw: 1 / drawProb, away: 1 / awayProb },
      uncertainty: 0.5, modelVersion: '0.1.0', signals: null,
    },
    recommendation: null,
  };
}

function makeRound(probs: [number, number, number][]): MatchAnalysis[] {
  return probs.map(([h, d, a], i) => makeAnalysis(h, d, a, `m${i}`));
}

describe('generateSystem', () => {
  it('respects budget: number of rows <= budgetSek', () => {
    const analyses = makeRound(Array(13).fill([0.45, 0.30, 0.25]));
    const { rows } = generateSystem({ analyses, budgetSek: 10, strategy: 'highestProbability' });
    expect(rows.length).toBeLessThanOrEqual(10);
  });

  it('each row has exactly 13 signs', () => {
    const analyses = makeRound(Array(13).fill([0.50, 0.30, 0.20]));
    const { rows } = generateSystem({ analyses, budgetSek: 8, strategy: 'balanced' });
    for (const row of rows) {
      expect(row.length).toBe(13);
    }
  });

  it('all signs are valid outcomes', () => {
    const analyses = makeRound(Array(13).fill([0.45, 0.30, 0.25]));
    const { rows } = generateSystem({ analyses, budgetSek: 16, strategy: 'highestValue' });
    for (const row of rows) {
      for (const sign of row) {
        expect(['1', 'X', '2']).toContain(sign);
      }
    }
  });

  it('throws if not exactly 13 matches', () => {
    const analyses = makeRound(Array(12).fill([0.45, 0.30, 0.25]));
    expect(() => generateSystem({ analyses, budgetSek: 8, strategy: 'balanced' })).toThrow();
  });

  it('CSV export produces correct header and data rows', () => {
    const analyses = makeRound(Array(13).fill([0.80, 0.12, 0.08]));
    const { rows } = generateSystem({ analyses, budgetSek: 1, strategy: 'lowRisk' });
    const csv = exportSystemToCSV(rows);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Match1,Match2,Match3,Match4,Match5,Match6,Match7,Match8,Match9,Match10,Match11,Match12,Match13');
    expect(lines[1]?.split(',').length).toBe(13);
  });
});
