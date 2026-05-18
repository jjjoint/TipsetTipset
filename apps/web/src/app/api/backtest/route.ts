import { error, ok } from '@/app/api/_lib/response';
import { prisma } from '@/app/api/_lib/db';
import { runBacktest } from '@tipset/backtest';
import type { MatchInfo, ModelPredictionData } from '@tipset/core';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  roundId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json());
    if (!body.success) return error(body.error.message, 400);

    const { roundId } = body.data;

    const matches = await prisma.match.findMany({
      where: { roundId, actualOutcome: { not: null } },
      include: { predictions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (matches.length === 0) return error('Inga avgjorda matcher hittades', 400);

    const backtestMatches = matches
      .filter((m) => m.predictions[0] !== undefined)
      .map((m) => ({
        match: {
          id: m.id, roundId: m.roundId, index: m.index,
          homeTeam: m.homeTeam, awayTeam: m.awayTeam,
          league: m.league, startTime: m.startTime,
          finalScore: m.finalScore, actualOutcome: m.actualOutcome as '1' | 'X' | '2' | null,
        } satisfies MatchInfo,
        prediction: {
          matchId: m.predictions[0]!.matchId,
          probabilities: { home: m.predictions[0]!.homeProbability, draw: m.predictions[0]!.drawProbability, away: m.predictions[0]!.awayProbability },
          fairOdds: { home: m.predictions[0]!.homeFairOdds, draw: m.predictions[0]!.drawFairOdds, away: m.predictions[0]!.awayFairOdds },
          uncertainty: m.predictions[0]!.uncertainty,
          modelVersion: m.predictions[0]!.modelVersion,
          signals: null,
        } satisfies ModelPredictionData,
      }));

    const result = runBacktest(roundId, backtestMatches);

    await prisma.backtestRun.create({
      data: {
        roundId,
        modelVersion: result.modelVersion,
        brierScore: result.brierScore,
        logLoss: result.logLoss,
        calibrationData: JSON.stringify(result.calibrationCurve),
        roi: result.roi,
      },
    });

    return ok(result);
  } catch (e) {
    console.error(e);
    return error('Backtest misslyckades');
  }
}
