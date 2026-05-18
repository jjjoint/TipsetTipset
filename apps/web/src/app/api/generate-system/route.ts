import { error, ok } from '@/app/api/_lib/response';
import { prisma } from '@/app/api/_lib/db';
import { generateSystem, runSimulation } from '@tipset/core';
import type { MatchAnalysis, SystemStrategy } from '@tipset/core';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  roundId: z.string(),
  budgetSek: z.number().int().min(1).max(10000),
  strategy: z.enum(['highestProbability', 'highestValue', 'balanced', 'skräll', 'lowRisk']),
  iterations: z.number().int().min(100).max(100000).optional().default(10000),
});

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json());
    if (!body.success) return error(body.error.message, 400);

    const { roundId, budgetSek, strategy, iterations } = body.data;

    const matches = await prisma.match.findMany({
      where: { roundId },
      orderBy: { index: 'asc' },
      include: {
        publicPicks: { orderBy: { observedAt: 'desc' }, take: 1 },
        predictions: { orderBy: { createdAt: 'desc' }, take: 1 },
        recommendations: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (matches.length !== 13) return error('Omgången måste ha exakt 13 matcher', 400);

    const analyses: MatchAnalysis[] = matches.map((m) => ({
      match: {
        id: m.id, roundId: m.roundId, index: m.index,
        homeTeam: m.homeTeam, awayTeam: m.awayTeam,
        league: m.league, startTime: m.startTime,
        finalScore: m.finalScore, actualOutcome: m.actualOutcome as '1' | 'X' | '2' | null,
      },
      publicPicks: m.publicPicks[0] ? {
        matchId: m.publicPicks[0].matchId,
        homePercent: m.publicPicks[0].homePercent,
        drawPercent: m.publicPicks[0].drawPercent,
        awayPercent: m.publicPicks[0].awayPercent,
        observedAt: m.publicPicks[0].observedAt,
        source: m.publicPicks[0].source as 'live' | 'imported' | 'mock' | 'missing',
      } : null,
      prediction: m.predictions[0] ? {
        matchId: m.predictions[0].matchId,
        probabilities: { home: m.predictions[0].homeProbability, draw: m.predictions[0].drawProbability, away: m.predictions[0].awayProbability },
        fairOdds: { home: m.predictions[0].homeFairOdds, draw: m.predictions[0].drawFairOdds, away: m.predictions[0].awayFairOdds },
        uncertainty: m.predictions[0].uncertainty,
        modelVersion: m.predictions[0].modelVersion,
        signals: m.predictions[0].signals ? JSON.parse(m.predictions[0].signals) : null,
      } : null,
      recommendation: m.recommendations[0] ? {
        matchId: m.recommendations[0].matchId,
        recommendedSigns: JSON.parse(m.recommendations[0].recommendedSigns),
        riskCategory: m.recommendations[0].riskCategory as 'spik' | 'halv' | 'hel' | 'skräll' | 'avstå',
        valueScore: m.recommendations[0].valueScore,
        valueRatio: m.recommendations[0].valueRatio,
        rowOwnershipEst: m.recommendations[0].rowOwnershipEst,
        explanation: m.recommendations[0].explanation,
      } : null,
    }));

    const { rows } = generateSystem({ analyses, budgetSek, strategy: strategy as SystemStrategy });

    const matchProbabilities = analyses.map((a) =>
      a.prediction?.probabilities ?? { home: 0.45, draw: 0.26, away: 0.29 }
    );

    const simResult = runSimulation({ rows, matchProbabilities, iterations });

    await prisma.generatedSystem.create({
      data: {
        roundId,
        budgetSek,
        strategy,
        rows: JSON.stringify(rows),
        estimatedProbability10: simResult.probability10correct,
        estimatedProbability11: simResult.probability11correct,
        estimatedProbability12: simResult.probability12correct,
        estimatedProbability13: simResult.probability13correct,
        estimatedExpectedValue: simResult.expectedValue,
        simulationIterations: iterations,
      },
    });

    return ok({ rows, simulationResult: simResult, rowCount: rows.length });
  } catch (e) {
    console.error(e);
    return error('Systemgenerering misslyckades');
  }
}
