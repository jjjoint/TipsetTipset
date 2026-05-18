import type { AdapterResult, OddsAdapter, RawOdds } from '@tipset/core';
import { DrawsResponseSchema } from '../svenska-spel/schema';

const DRAWS_URL = 'https://api.spela.svenskaspel.se/draw/1/stryktipset/draws';

function parseOdds(s: string): number {
  return parseFloat(s.replace(',', '.'));
}

export const liveOddsAdapter: OddsAdapter = {
  async fetchOddsForMatch(homeTeam: string, awayTeam: string, _date: Date): Promise<AdapterResult<RawOdds>> {
    return { data: null, status: 'missing', error: `Per-match odds not supported in live adapter; use fetchOddsForRound`, fetchedAt: new Date() };
  },

  async fetchOddsForRound(roundId: string): Promise<AdapterResult<RawOdds[]>> {
    try {
      const res = await fetch(DRAWS_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        return { data: null, status: 'missing', error: `HTTP ${res.status}`, fetchedAt: new Date() };
      }

      const raw = await res.json();
      const parsed = DrawsResponseSchema.safeParse(raw);
      if (!parsed.success) {
        return { data: null, status: 'missing', error: 'Validation failed', fetchedAt: new Date() };
      }

      const draw = parsed.data.draws.find((d) => d.drawState === 'Open' || d.drawState === 'Active');
      if (!draw) {
        return { data: null, status: 'missing', error: 'No open draw', fetchedAt: new Date() };
      }

      const odds: RawOdds[] = draw.drawEvents
        .filter((e) => !e.cancelled && e.odds)
        .map((e) => ({
          matchId: `${roundId}-${e.eventNumber}`,
          homeOdds: parseOdds(e.odds!.one),
          drawOdds: parseOdds(e.odds!.x),
          awayOdds: parseOdds(e.odds!.two),
          bookmaker: 'SvenskaSpel',
        }));

      return { data: odds, status: 'live', fetchedAt: new Date() };
    } catch (err) {
      return { data: null, status: 'missing', error: String(err), fetchedAt: new Date() };
    }
  },
};
