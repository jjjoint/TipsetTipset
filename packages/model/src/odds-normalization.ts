import type { OutcomeDistribution } from '@tipset/core';
import type { RawOdds } from '@tipset/core';

export interface NormalizedOddsResult {
  probabilities: OutcomeDistribution;
  fairOdds: OutcomeDistribution;
  overround: number;
}

export function normalizeOdds(raw: RawOdds): NormalizedOddsResult {
  const impliedHome = 1 / raw.homeOdds;
  const impliedDraw = 1 / raw.drawOdds;
  const impliedAway = 1 / raw.awayOdds;
  const overround = impliedHome + impliedDraw + impliedAway;

  const home = impliedHome / overround;
  const draw = impliedDraw / overround;
  const away = impliedAway / overround;

  return {
    probabilities: { home, draw, away },
    fairOdds: {
      home: 1 / home,
      draw: 1 / draw,
      away: 1 / away,
    },
    overround,
  };
}
