import { describe, expect, it } from 'vitest';
import { computeUncertainty } from '../uncertainty';

describe('computeUncertainty', () => {
  it('returns 0 for a certain outcome', () => {
    expect(computeUncertainty({ home: 1, draw: 0, away: 0 })).toBeCloseTo(0, 10);
  });

  it('returns 1 for a uniform distribution', () => {
    expect(computeUncertainty({ home: 1 / 3, draw: 1 / 3, away: 1 / 3 })).toBeCloseTo(1, 5);
  });

  it('is between 0 and 1', () => {
    const u = computeUncertainty({ home: 0.60, draw: 0.25, away: 0.15 });
    expect(u).toBeGreaterThan(0);
    expect(u).toBeLessThan(1);
  });

  it('increases as distribution becomes more uniform', () => {
    const u1 = computeUncertainty({ home: 0.80, draw: 0.15, away: 0.05 });
    const u2 = computeUncertainty({ home: 0.50, draw: 0.30, away: 0.20 });
    const u3 = computeUncertainty({ home: 1 / 3, draw: 1 / 3, away: 1 / 3 });
    expect(u1).toBeLessThan(u2);
    expect(u2).toBeLessThan(u3);
  });
});
