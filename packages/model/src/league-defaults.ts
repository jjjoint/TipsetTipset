import type { OutcomeDistribution } from '@tipset/core';

// Historical home/draw/away frequencies per league (approximate)
export const LEAGUE_BASELINES: Record<string, OutcomeDistribution> = {
  Allsvenskan:     { home: 0.44, draw: 0.27, away: 0.29 },
  'Premier League':  { home: 0.46, draw: 0.26, away: 0.28 },
  Bundesliga:      { home: 0.46, draw: 0.25, away: 0.29 },
  'Serie A':         { home: 0.44, draw: 0.27, away: 0.29 },
  'La Liga':         { home: 0.47, draw: 0.25, away: 0.28 },
  'Ligue 1':         { home: 0.44, draw: 0.27, away: 0.29 },
  Eredivisie:      { home: 0.48, draw: 0.25, away: 0.27 },
};

export const DEFAULT_BASELINE: OutcomeDistribution = { home: 0.45, draw: 0.26, away: 0.29 };

export const LEAGUE_AVG_GOALS: Record<string, number> = {
  Allsvenskan: 2.6,
  'Premier League': 2.8,
  Bundesliga: 3.0,
  'Serie A': 2.7,
  'La Liga': 2.7,
  'Ligue 1': 2.7,
  Eredivisie: 3.1,
};

export const DEFAULT_AVG_GOALS = 2.7;

export function getLeagueBaseline(league: string): OutcomeDistribution {
  return LEAGUE_BASELINES[league] ?? DEFAULT_BASELINE;
}

export function getLeagueAvgGoals(league: string): number {
  return LEAGUE_AVG_GOALS[league] ?? DEFAULT_AVG_GOALS;
}
