import { describe, expect, it } from 'vitest';
import { poissonModel } from '../poisson';
import type { TeamStats } from '@tipset/core';

const equalStats: TeamStats = {
  teamName: 'Team', eloRating: 1500, attackStrength: 1.0, defenseStrength: 1.0, form: ['W', 'D', 'L', 'W', 'D'], homeAdvantageBonus: 0.10,
};

const strongAttack: TeamStats = {
  teamName: 'Strong', eloRating: 1800, attackStrength: 1.8, defenseStrength: 0.6, form: ['W', 'W', 'W', 'W', 'W'], homeAdvantageBonus: 0.12,
};

const weakTeam: TeamStats = {
  teamName: 'Weak', eloRating: 1200, attackStrength: 0.5, defenseStrength: 1.5, form: ['L', 'L', 'L', 'L', 'L'], homeAdvantageBonus: 0.08,
};

describe('poissonModel', () => {
  it('output probabilities sum to 1', () => {
    const result = poissonModel(equalStats, equalStats, 'Premier League');
    expect(result.home + result.draw + result.away).toBeCloseTo(1, 8);
  });

  it('home team advantage: equal teams give home win > away win', () => {
    const result = poissonModel(equalStats, equalStats, 'Premier League');
    expect(result.home).toBeGreaterThan(result.away);
  });

  it('strong team vs weak team: strong home wins most often', () => {
    const result = poissonModel(strongAttack, weakTeam, 'Premier League');
    expect(result.home).toBeGreaterThan(0.70);
  });

  it('strong team vs weak team away: away likely wins', () => {
    const result = poissonModel(weakTeam, strongAttack, 'Premier League');
    expect(result.away).toBeGreaterThan(result.home);
  });

  it('all probabilities are between 0 and 1', () => {
    const result = poissonModel(equalStats, equalStats, 'Allsvenskan');
    expect(result.home).toBeGreaterThan(0);
    expect(result.home).toBeLessThanOrEqual(1);
    expect(result.draw).toBeGreaterThan(0);
    expect(result.away).toBeGreaterThan(0);
  });
});
