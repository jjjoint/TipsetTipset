import { describe, expect, it } from 'vitest';
import { buildBayesianPrior } from '../bayesian-prior';
import { getLeagueBaseline } from '../league-defaults';

describe('buildBayesianPrior', () => {
  it('returns a valid distribution (sums to 1) with no signals', () => {
    const result = buildBayesianPrior({ oddsNormalized: null, eloRating: null, homeStats: null, awayStats: null, league: 'default' });
    expect(result.home + result.draw + result.away).toBeCloseTo(1, 8);
  });

  it('approaches league baseline when only that signal is present', () => {
    const baseline = getLeagueBaseline('Premier League');
    const result = buildBayesianPrior({ oddsNormalized: null, eloRating: null, homeStats: null, awayStats: null, league: 'Premier League' });
    expect(result.home).toBeCloseTo(baseline.home, 2);
    expect(result.draw).toBeCloseTo(baseline.draw, 2);
  });

  it('is strongly influenced by odds when odds are present', () => {
    const odds = { home: 0.70, draw: 0.18, away: 0.12 };
    const result = buildBayesianPrior({ oddsNormalized: odds, eloRating: null, homeStats: null, awayStats: null, league: 'Premier League' });
    // Odds have 0.50 weight — result home should be between baseline and odds
    const baseline = getLeagueBaseline('Premier League');
    expect(result.home).toBeGreaterThan(baseline.home);
    expect(result.home).toBeLessThan(odds.home);
  });

  it('output always sums to 1 regardless of inputs', () => {
    const odds = { home: 0.55, draw: 0.25, away: 0.20 };
    const result = buildBayesianPrior({ oddsNormalized: odds, eloRating: { home: 1800, away: 1650 }, homeStats: null, awayStats: null, league: 'Bundesliga' });
    expect(result.home + result.draw + result.away).toBeCloseTo(1, 8);
  });

  it('all probabilities are strictly positive', () => {
    const result = buildBayesianPrior({ oddsNormalized: { home: 0.90, draw: 0.07, away: 0.03 }, eloRating: null, homeStats: null, awayStats: null, league: 'Allsvenskan' });
    expect(result.home).toBeGreaterThan(0);
    expect(result.draw).toBeGreaterThan(0);
    expect(result.away).toBeGreaterThan(0);
  });
});
