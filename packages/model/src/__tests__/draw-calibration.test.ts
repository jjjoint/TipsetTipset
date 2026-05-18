import { describe, expect, it } from 'vitest';
import { calibrateDrawProbability } from '../draw-calibration';

describe('calibrateDrawProbability', () => {
  it('increases draw probability', () => {
    const input = { home: 0.50, draw: 0.25, away: 0.25 };
    const result = calibrateDrawProbability(input);
    expect(result.draw).toBeGreaterThan(input.draw);
  });

  it('output probabilities sum to 1', () => {
    const input = { home: 0.45, draw: 0.27, away: 0.28 };
    const result = calibrateDrawProbability(input);
    expect(result.home + result.draw + result.away).toBeCloseTo(1, 10);
  });

  it('respects custom factor', () => {
    const input = { home: 0.45, draw: 0.27, away: 0.28 };
    const r1 = calibrateDrawProbability(input, 1.0);
    expect(r1.draw).toBeCloseTo(input.draw / (input.home + input.draw + input.away), 5);
    const r2 = calibrateDrawProbability(input, 1.2);
    expect(r2.draw).toBeGreaterThan(r1.draw);
  });

  it('home and away decrease when draw increases', () => {
    const input = { home: 0.45, draw: 0.27, away: 0.28 };
    const result = calibrateDrawProbability(input);
    expect(result.home).toBeLessThan(input.home);
    expect(result.away).toBeLessThan(input.away);
  });
});
