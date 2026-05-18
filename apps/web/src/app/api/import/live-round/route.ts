import { error, ok } from '@/app/api/_lib/response';
import { prisma } from '@/app/api/_lib/db';
import { createAdapterRegistry } from '@tipset/data-adapters';

export async function POST() {
  try {
    const registry = createAdapterRegistry('live');

    const roundResult = await registry.round.fetchCurrentRound();
    if (!roundResult.data) {
      return error(roundResult.error ?? 'Ingen aktiv omgång hittades från Svenska Spel', 404);
    }

    const round = roundResult.data;
    const matchesResult = await registry.round.fetchMatchesForRound(round.id);
    if (!matchesResult.data || matchesResult.data.length === 0) {
      return error('Inga matcher hittades för omgången', 404);
    }

    const picksResult = await registry.publicPicks.fetchPicksForRound(round.id);
    const oddsResult = await registry.odds.fetchOddsForRound?.(round.id) ?? { data: null, status: 'missing' as const, fetchedAt: new Date() };

    const oddsMap = new Map(
      (oddsResult.data ?? []).map((o) => [o.matchId, o])
    );
    const picksMap = new Map(
      (picksResult.data ?? []).map((p) => [p.matchId, p])
    );

    // Upsert round
    await prisma.round.upsert({
      where: { id: round.id },
      create: {
        id: round.id,
        name: round.name,
        salesCloseAt: round.salesCloseAt,
        status: round.status,
        turnover: round.turnover,
        payoutInfo: null,
      },
      update: {
        name: round.name,
        salesCloseAt: round.salesCloseAt,
        status: round.status,
        turnover: round.turnover,
      },
    });

    // Upsert matches, picks, and odds
    for (const match of matchesResult.data) {
      await prisma.match.upsert({
        where: { roundId_index: { roundId: round.id, index: match.index } },
        create: {
          id: match.id,
          roundId: round.id,
          index: match.index,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          league: match.league,
          startTime: match.startTime,
          finalScore: null,
          actualOutcome: null,
        },
        update: {
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          league: match.league,
          startTime: match.startTime,
        },
      });

      const picks = picksMap.get(match.id);
      if (picks) {
        await prisma.publicPicks.create({
          data: {
            matchId: match.id,
            homePercent: picks.homePercent,
            drawPercent: picks.drawPercent,
            awayPercent: picks.awayPercent,
            source: 'live',
          },
        });
      }
    }

    // Update data source statuses
    await prisma.dataSourceStatus.upsert({
      where: { sourceName: 'svenskaSpelRound' },
      create: { sourceName: 'svenskaSpelRound', status: roundResult.status },
      update: { status: roundResult.status, lastCheckedAt: new Date() },
    });
    await prisma.dataSourceStatus.upsert({
      where: { sourceName: 'oddsData' },
      create: { sourceName: 'oddsData', status: oddsResult.status },
      update: { status: oddsResult.status, lastCheckedAt: new Date() },
    });
    await prisma.dataSourceStatus.upsert({
      where: { sourceName: 'publicPicks' },
      create: { sourceName: 'publicPicks', status: picksResult.status },
      update: { status: picksResult.status, lastCheckedAt: new Date() },
    });

    return ok({
      roundId: round.id,
      roundName: round.name,
      matchCount: matchesResult.data.length,
      hasOdds: oddsResult.data !== null,
      hasPicks: picksResult.data !== null,
    });
  } catch (e) {
    console.error(e);
    return error('Serverfel vid import av live-omgång');
  }
}
