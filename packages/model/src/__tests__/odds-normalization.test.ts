import { describe, expect, it } from 'vitest';
import { normalizeOdds } from '../odds-normalization';

describe('normalizeOdds', () => {
  it('produces probabilities that sum to 1', () => {
    const result = normalizeOdds({ homeOdds: 1.85, drawOdds: 3.40, awayOdds: 4.20, bookmaker: 'test' });
    const sum = result.probabilities.home + result.probabilities.draw + result.probabilities.away;
    expect(sum).toBeCloseTo(1, 10);
  });

  it('removes overround (implied sum > 1 before normalization)', () => {
    const result = normalizeOdds({ homeOdds: 1.85, drawOdds: 3.40, awayOdds: 4.20, bookmaker: 'test' });
    expect(result.overround).toBeGreaterThan(1);
  });

  it('fair odds are inverse of normalized probabilities', () => {
    const result = normalizeOdds({ homeOdds: 2.00, drawOdds: 3.50, awayOdds: 4.00, bookmaker: 'test' });
    expect(result.fairOdds.home).toBeCloseTo(1 / result.probabilities.home, 8);
    expect(result.fairOdds.draw).toBeCloseTo(1 / result.probabilities.draw, 8);
    expect(result.fairOdds.away).toBeCloseTo(1 / result.probabilities.away, 8);
  });

  it('handles balanced odds (home favourite)', () => {
    const result = normalizeOdds({ homeOdds: 1.50, drawOdds: 4.00, awayOdds: 6.00, bookmaker: 'test' });
    expect(result.probabilities.home).toBeGreaterThan(result.probabilities.draw);
    expect(result.probabilities.draw).toBeGreaterThan(result.probabilities.away);
  });

  it('all probabilities are between 0 and 1', () => {
    const result = normalizeOdds({ homeOdds: 1.65, drawOdds: 3.80, awayOdds: 5.00, bookmaker: 'test' });
    expect(result.probabilities.home).toBeGreaterThan(0);
    expect(result.probabilities.home).toBeLessThan(1);
    expect(result.probabilities.draw).toBeGreaterThan(0);
    expect(result.probabilities.away).toBeGreaterThan(0);
  });
});
