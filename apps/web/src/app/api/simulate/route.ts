import { error, ok } from '@/app/api/_lib/response';
import { runSimulation } from '@tipset/core';
import type { OutcomeDistribution, SystemRow } from '@tipset/core';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  rows: z.array(z.array(z.enum(['1', 'X', '2'])).length(13)),
  matchProbabilities: z.array(
    z.object({ home: z.number(), draw: z.number(), away: z.number() })
  ).length(13),
  iterations: z.number().int().min(100).max(100000).optional().default(10000),
});

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json());
    if (!body.success) return error(body.error.message, 400);

    const { rows, matchProbabilities, iterations } = body.data;

    const result = runSimulation({
      rows: rows as SystemRow[],
      matchProbabilities: matchProbabilities as OutcomeDistribution[],
      iterations,
    });

    return ok(result);
  } catch (e) {
    console.error(e);
    return error('Simulering misslyckades');
  }
}
