import { error, ok } from '@/app/api/_lib/response';
import { prisma } from '@/app/api/_lib/db';
import { classifyRisk, computeValueScore, estimateRowOwnership } from '@tipset/core';
import { createAdapterRegistry } from '@tipset/data-adapters';
import { runModelForMatch } from '@tipset/model';
import type { NextRequest } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ roundId: string }> }) {
  try {
    const { roundId } = await params;
    const adapterMode = (process.env['ADAPTER_MODE'] ?? 'mock') as 'mock' | 'imported' | 'live';
    const registry = createAdapterRegistry(adapterMode);

    const matchesResult = await registry.round.fetchMatchesForRound(roundId);
    if (!matchesResult.data) return error('Matcher hittades inte', 404);

    const picksResult = await registry.publicPicks.fetchPicksForRound(roundId);

    const predictions = [];

    for (const match of matchesResult.data) {
      const oddsResult = await registry.odds.fetchOddsForMatch(match.homeTeam, match.awayTeam, match.startTime);
      const homeStatsResult = await registry.footballStats.fetchTeamStats(match.homeTeam);
      const awayStatsResult = await registry.footballStats.fetchTeamStats(match.awayTeam);
      const picks = picksResult.data?.find((p) => p.matchId === match.id) ?? null;

      const prediction = runModelForMatch({
        match, odds: oddsResult.data, homeStats: homeStatsResult.data, awayStats: awayStatsResult.data, publicPicks: picks,
      });

      // Upsert prediction
      await prisma.modelPrediction.deleteMany({ where: { matchId: match.id } });
      await prisma.modelPrediction.create({
        data: {
          matchId: match.id,
          homeProbability: prediction.probabilities.home,
          drawProbability: prediction.probabilities.draw,
          awayProbability: prediction.probabilities.away,
          homeFairOdds: prediction.fairOdds.home,
          drawFairOdds: prediction.fairOdds.draw,
          awayFairOdds: prediction.fairOdds.away,
          uncertainty: prediction.uncertainty,
          modelVersion: prediction.modelVersion,
          signals: prediction.signals ? JSON.stringify(prediction.signals) : null,
        },
      });

      if (picks) {
        const riskCategory = classifyRisk(prediction, picks);
        const probs = prediction.probabilities;
        const topProb = Math.max(probs.home, probs.draw, probs.away);
        const topSign = topProb === probs.home ? '1' : topProb === probs.draw ? 'X' : '2';
        const topPublicPct = topSign === '1' ? picks.homePercent : topSign === 'X' ? picks.drawPercent : picks.awayPercent;
        const { valueScore, valueRatio } = computeValueScore(topProb, topPublicPct);

        let recommendedSigns: ('1' | 'X' | '2')[];
        switch (riskCategory) {
          case 'spik': recommendedSigns = [topSign as '1' | 'X' | '2']; break;
          case 'halv': {
            const sorted = [
              { sign: '1' as const, prob: probs.home },
              { sign: 'X' as const, prob: probs.draw },
              { sign: '2' as const, prob: probs.away },
            ].sort((a, b) => b.prob - a.prob);
            recommendedSigns = [sorted[0]!.sign, sorted[1]!.sign];
            break;
          }
          default: recommendedSigns = ['1', 'X', '2']; break;
        }

        const rowOwnershipEst = estimateRowOwnership([picks], [recommendedSigns[0]!]);

        await prisma.recommendation.deleteMany({ where: { matchId: match.id } });
        await prisma.recommendation.create({
          data: {
            matchId: match.id,
            recommendedSigns: JSON.stringify(recommendedSigns),
            riskCategory,
            valueScore,
            valueRatio: isFinite(valueRatio) ? valueRatio : 99,
            rowOwnershipEst,
            explanation: null,
          },
        });
      }

      predictions.push(prediction);
    }

    return ok({ predictions, count: predictions.length });
  } catch (e) {
    console.error(e);
    return error('Modellkörning misslyckades');
  }
}
