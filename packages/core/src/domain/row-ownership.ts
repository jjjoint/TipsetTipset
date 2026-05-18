import type { Outcome, PublicPicksData } from '../types/domain';

function getPickFraction(picks: PublicPicksData, sign: Outcome): number {
  switch (sign) {
    case '1': return picks.homePercent / 100;
    case 'X': return picks.drawPercent / 100;
    case '2': return picks.awayPercent / 100;
  }
}

/**
 * Estimates the fraction of all public rows that contain the given signs per match.
 * For helgardering (all 3 signs), the match contributes factor 1.0.
 * For halvgardering (2 signs), the match contributes the sum of the two fractions.
 * For spik (1 sign), the match contributes that sign's fraction.
 */
export function estimateRowOwnership(
  picksPerMatch: PublicPicksData[],
  rowSigns: Outcome[]
): number {
  if (picksPerMatch.length !== rowSigns.length) {
    throw new Error('picksPerMatch and rowSigns must have the same length');
  }
  return picksPerMatch.reduce((product, picks, i) => {
    const sign = rowSigns[i];
    if (sign === undefined) return product;
    return product * getPickFraction(picks, sign);
  }, 1);
}
