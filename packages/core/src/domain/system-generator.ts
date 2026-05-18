import type { MatchAnalysis, Outcome, OutcomeDistribution, SystemStrategy } from '../types/domain';
import type { SystemRow } from '../types/system';
import { computeValueScore } from './value-score';

interface SignsPerMatch {
  signs: Outcome[];
  probs: number[];
}

function orderedOutcomes(probs: OutcomeDistribution): { sign: Outcome; prob: number }[] {
  return [
    { sign: '1' as Outcome, prob: probs.home },
    { sign: 'X' as Outcome, prob: probs.draw },
    { sign: '2' as Outcome, prob: probs.away },
  ].sort((a, b) => b.prob - a.prob);
}

function buildCandidateSigns(
  analyses: MatchAnalysis[],
  strategy: SystemStrategy
): SignsPerMatch[] {
  return analyses.map((analysis) => {
    const probs = analysis.prediction?.probabilities ?? { home: 0.45, draw: 0.27, away: 0.28 };
    const picks = analysis.publicPicks;
    const ordered = orderedOutcomes(probs);

    switch (strategy) {
      case 'highestProbability': {
        const top = ordered[0]!;
        if (top.prob >= 0.50) return { signs: [top.sign], probs: [top.prob] };
        if (top.prob >= 0.36) return { signs: [ordered[0]!.sign, ordered[1]!.sign], probs: [ordered[0]!.prob, ordered[1]!.prob] };
        return { signs: ordered.map((o) => o.sign), probs: ordered.map((o) => o.prob) };
      }

      case 'highestValue': {
        if (!picks) return { signs: [ordered[0]!.sign], probs: [ordered[0]!.prob] };
        const withValue = ordered.map((o) => {
          const publicPct = o.sign === '1' ? picks.homePercent : o.sign === 'X' ? picks.drawPercent : picks.awayPercent;
          const { valueScore } = computeValueScore(o.prob, publicPct);
          return { ...o, valueScore };
        });
        const positive = withValue.filter((o) => o.valueScore > 0);
        const signs = positive.length > 0 ? positive : [withValue[0]!];
        return { signs: signs.map((o) => o.sign), probs: signs.map((o) => o.prob) };
      }

      case 'balanced': {
        if (!picks) return { signs: [ordered[0]!.sign], probs: [ordered[0]!.prob] };
        const included = ordered.filter((o) => {
          const publicPct = o.sign === '1' ? picks.homePercent : o.sign === 'X' ? picks.drawPercent : picks.awayPercent;
          const publicFrac = publicPct / 100;
          const { valueScore } = computeValueScore(o.prob, publicPct);
          return o.prob > 0.30 && (o.prob > publicFrac || valueScore > 0.05);
        });
        const signs = included.length > 0 ? included : [ordered[0]!];
        return { signs: signs.map((o) => o.sign), probs: signs.map((o) => o.prob) };
      }

      case 'skräll': {
        if (!picks) return { signs: ordered.map((o) => o.sign), probs: ordered.map((o) => o.prob) };
        const withValue = ordered.map((o) => {
          const publicPct = o.sign === '1' ? picks.homePercent : o.sign === 'X' ? picks.drawPercent : picks.awayPercent;
          const { valueScore } = computeValueScore(o.prob, publicPct);
          return { ...o, valueScore };
        }).filter((o) => o.prob > 0.20);
        const sorted = withValue.sort((a, b) => b.valueScore - a.valueScore);
        const signs = sorted.length > 0 ? sorted.slice(0, 2) : [ordered[0]!];
        return { signs: signs.map((o) => o.sign), probs: signs.map((o) => o.prob) };
      }

      case 'lowRisk': {
        const safe = ordered.filter((o) => o.prob >= 0.45);
        const signs = safe.length > 0 ? safe : [ordered[0]!];
        return { signs: signs.map((o) => o.sign), probs: signs.map((o) => o.prob) };
      }
    }
  });
}

function productOfCounts(candidates: SignsPerMatch[]): number {
  return candidates.reduce((acc, c) => acc * c.signs.length, 1);
}

function greedyTrim(candidates: SignsPerMatch[], budget: number): SignsPerMatch[] {
  const result = candidates.map((c) => ({ ...c, signs: [...c.signs], probs: [...c.probs] }));

  while (productOfCounts(result) > budget) {
    // Find the match where removing the weakest sign reduces product least
    let bestIdx = -1;
    let bestReductionFactor = 0;

    for (let i = 0; i < result.length; i++) {
      const c = result[i]!;
      if (c.signs.length <= 1) continue;
      const reductionFactor = (c.signs.length - 1) / c.signs.length;
      if (reductionFactor > bestReductionFactor) {
        bestReductionFactor = reductionFactor;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break; // can't trim further

    const candidate = result[bestIdx]!;
    // Remove weakest sign (last after sorting by prob desc)
    const sorted = candidate.signs
      .map((sign, i) => ({ sign, prob: candidate.probs[i] ?? 0 }))
      .sort((a, b) => b.prob - a.prob);
    sorted.pop();
    candidate.signs = sorted.map((s) => s.sign);
    candidate.probs = sorted.map((s) => s.prob);
  }

  return result;
}

function* cartesianProduct(arrays: Outcome[][]): Generator<Outcome[]> {
  if (arrays.length === 0) {
    yield [];
    return;
  }
  const [first, ...rest] = arrays as [Outcome[], ...Outcome[][]];
  for (const item of first) {
    for (const combo of cartesianProduct(rest)) {
      yield [item, ...combo];
    }
  }
}

export interface GenerateSystemOptions {
  analyses: MatchAnalysis[];
  budgetSek: number;
  strategy: SystemStrategy;
}

export interface SystemGeneratorResult {
  rows: SystemRow[];
  candidateSigns: Outcome[][];
}

export function generateSystem(options: GenerateSystemOptions): SystemGeneratorResult {
  const { analyses, budgetSek, strategy } = options;

  if (analyses.length !== 13) {
    throw new Error(`Expected 13 matches, got ${analyses.length}`);
  }

  let candidates = buildCandidateSigns(analyses, strategy);
  candidates = greedyTrim(candidates, budgetSek);

  const signArrays = candidates.map((c) => c.signs);
  const rows: SystemRow[] = [];

  for (const combo of cartesianProduct(signArrays)) {
    if (rows.length >= budgetSek) break;
    rows.push(combo as SystemRow);
  }

  // Pad to budget by duplicating first row if needed
  if (rows.length > 0 && rows.length < budgetSek) {
    const firstRow = rows[0]!;
    while (rows.length < budgetSek) {
      rows.push([...firstRow] as SystemRow);
    }
  }

  return { rows, candidateSigns: signArrays };
}

export function exportSystemToJSON(rows: SystemRow[], meta: Record<string, unknown>): string {
  return JSON.stringify({ rows, meta }, null, 2);
}

export function exportSystemToCSV(rows: SystemRow[]): string {
  const header = Array.from({ length: 13 }, (_, i) => `Match${i + 1}`).join(',');
  const dataRows = rows.map((row) => row.join(',')).join('\n');
  return `${header}\n${dataRows}`;
}
