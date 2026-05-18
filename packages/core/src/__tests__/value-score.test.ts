import { describe, expect, it } from 'vitest';
import { computeValueScore } from '../domain/value-score';

describe('computeValueScore', () => {
  it('valueScore = modelProb - publicPickFraction', () => {
    const { valueScore } = computeValueScore(0.50, 40);
    expect(valueScore).toBeCloseTo(0.10, 10);
  });

  it('positive when model > public', () => {
    const { valueScore } = computeValueScore(0.60, 40);
    expect(valueScore).toBeGreaterThan(0);
  });

  it('negative when model < public', () => {
    const { valueScore } = computeValueScore(0.30, 50);
    expect(valueScore).toBeLessThan(0);
  });

  it('valueRatio = modelProb / publicFrac', () => {
    const { valueRatio } = computeValueScore(0.60, 40);
    expect(valueRatio).toBeCloseTo(0.60 / 0.40, 8);
  });

  it('valueRatio is Infinity when public pick is 0', () => {
    const { valueRatio } = computeValueScore(0.50, 0);
    expect(valueRatio).toBe(Infinity);
  });
});
