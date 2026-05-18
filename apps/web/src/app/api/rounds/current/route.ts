import { error, ok } from '@/app/api/_lib/response';
import { prisma } from '@/app/api/_lib/db';
import type { DataSourceName, DataSourceStatusValue, MatchAnalysis, RoundAnalysis } from '@tipset/core';

export async function GET() {
  try {
    const round = await prisma.round.findFirst({
      where: { status: { in: ['open', 'upcoming'] } },
      orderBy: { salesCloseAt: 'asc' },
      include: {
        matches: {
          orderBy: { index: 'asc' },
          include: {
            publicPicks: { orderBy: { observedAt: 'desc' }, take: 1 },
            predictions: { orderBy: { createdAt: 'desc' }, take: 1 },
            recommendations: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!round) {
      return error('Ingen aktiv omgång hittades', 404);
    }

    const sourceStatuses = await prisma.dataSourceStatus.findMany();
    const statuses = Object.fromEntries(
      sourceStatuses.map((s) => [s.sourceName, s.status as DataSourceStatusValue])
    ) as Record<DataSourceName, DataSourceStatusValue>;

    const matches: MatchAnalysis[] = round.matches.map((m) => {
      const picks = m.publicPicks[0] ?? null;
      const pred = m.predictions[0] ?? null;
      const rec = m.recommendations[0] ?? null;

      return {
        match: {
          id: m.id, roundId: m.roundId, index: m.index,
          homeTeam: m.homeTeam, awayTeam: m.awayTeam,
          league: m.league, startTime: m.startTime,
          finalScore: m.finalScore, actualOutcome: m.actualOutcome as '1' | 'X' | '2' | null,
        },
        publicPicks: picks ? {
          matchId: picks.matchId, homePercent: picks.homePercent,
          drawPercent: picks.drawPercent, awayPercent: picks.awayPercent,
          observedAt: picks.observedAt, source: picks.source as DataSourceStatusValue,
        } : null,
        prediction: pred ? {
          matchId: pred.matchId,
          probabilities: { home: pred.homeProbability, draw: pred.drawProbability, away: pred.awayProbability },
          fairOdds: { home: pred.homeFairOdds, draw: pred.drawFairOdds, away: pred.awayFairOdds },
          uncertainty: pred.uncertainty, modelVersion: pred.modelVersion,
          signals: pred.signals ? JSON.parse(pred.signals) : null,
        } : null,
        recommendation: rec ? {
          matchId: rec.matchId,
          recommendedSigns: JSON.parse(rec.recommendedSigns),
          riskCategory: rec.riskCategory as 'spik' | 'halv' | 'hel' | 'skräll' | 'avstå',
          valueScore: rec.valueScore, valueRatio: rec.valueRatio,
          rowOwnershipEst: rec.rowOwnershipEst, explanation: rec.explanation,
        } : null,
      };
    });

    const analysis: RoundAnalysis = {
      round: {
        id: round.id, name: round.name, salesCloseAt: round.salesCloseAt,
        status: round.status as 'upcoming' | 'open' | 'closed' | 'settled',
        turnover: round.turnover, payoutInfo: round.payoutInfo ? JSON.parse(round.payoutInfo) : null,
      },
      matches,
      dataSourceStatuses: statuses,
    };

    return ok(analysis);
  } catch (e) {
    console.error(e);
    return error('Serverfel');
  }
}
