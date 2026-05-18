import type {
  AdapterResult,
  MatchInfo,
  PublicPicksData,
  PublicPicksAdapter,
  RoundAdapter,
  RoundInfo,
} from '@tipset/core';
import { DrawsResponseSchema, type SvsDraw, type SvsDrawEvent } from './schema';

const API_BASE = 'https://api.spela.svenskaspel.se';
const DRAWS_URL = `${API_BASE}/draw/1/stryktipset/draws`;

function parseSwedishNumber(s: string): number {
  return parseFloat(s.replace(',', '.'));
}

function mapDrawState(state: string): 'upcoming' | 'open' | 'closed' | 'settled' {
  switch (state) {
    case 'Open': return 'open';
    case 'Closed': return 'closed';
    case 'Finalized': return 'settled';
    default: return 'upcoming';
  }
}

function mapLeagueName(leagueName: string | undefined): string {
  if (!leagueName) return 'Okänd liga';
  return leagueName;
}

function drawToRoundInfo(draw: SvsDraw): RoundInfo {
  return {
    id: `stryktipset-${draw.drawNumber}`,
    name: draw.drawComment ?? `Stryktipset omgång ${draw.drawNumber}`,
    salesCloseAt: new Date(draw.regCloseTime),
    status: mapDrawState(draw.drawState),
    turnover: draw.currentNetSale ? parseSwedishNumber(draw.currentNetSale) : null,
    payoutInfo: null,
  };
}

function eventToMatchInfo(event: SvsDrawEvent, roundId: string): MatchInfo {
  const home = event.match.participants.find((p) => p.type === 'home');
  const away = event.match.participants.find((p) => p.type === 'away');

  return {
    id: `${roundId}-${event.eventNumber}`,
    roundId,
    index: event.eventNumber,
    homeTeam: home?.name ?? event.eventDescription.split(' - ')[0] ?? 'Hemmalag',
    awayTeam: away?.name ?? event.eventDescription.split(' - ')[1] ?? 'Bortalag',
    league: mapLeagueName(event.match.league?.name),
    startTime: new Date(event.match.matchStart),
    finalScore: null,
    actualOutcome: null,
  };
}

function eventToPublicPicks(event: SvsDrawEvent, matchId: string): PublicPicksData | null {
  const sf = event.svenskaFolket;
  if (sf) {
    const home = parseFloat(sf.one);
    const draw = parseFloat(sf.x);
    const away = parseFloat(sf.two);
    if (!isNaN(home) && !isNaN(draw) && !isNaN(away)) {
      return {
        matchId,
        homePercent: home,
        drawPercent: draw,
        awayPercent: away,
        observedAt: new Date(),
        source: 'live',
      };
    }
  }

  // Fall back to betMetrics distribution
  const bm = event.betMetrics;
  if (bm?.values && bm.values.length >= 3) {
    const byOutcome = Object.fromEntries(
      bm.values.map((v) => [v.outcome, parseFloat(v.distribution.distribution)])
    );
    const home = byOutcome['1'];
    const draw = byOutcome['X'];
    const away = byOutcome['2'];
    if (!isNaN(home) && !isNaN(draw) && !isNaN(away)) {
      return {
        matchId,
        homePercent: home,
        drawPercent: draw,
        awayPercent: away,
        observedAt: new Date(),
        source: 'live',
      };
    }
  }

  return null;
}

async function fetchCurrentDraw(): Promise<AdapterResult<SvsDraw>> {
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
      console.warn('[live] Draw response validation failed:', parsed.error.issues[0]);
      return { data: null, status: 'missing', error: 'Validation failed', fetchedAt: new Date() };
    }

    const openDraw = parsed.data.draws.find((d) => d.drawState === 'Open' || d.drawState === 'Active');
    if (!openDraw) {
      return { data: null, status: 'missing', error: 'No open Stryktipset draw', fetchedAt: new Date() };
    }

    return { data: openDraw, status: 'live', fetchedAt: new Date() };
  } catch (err) {
    return { data: null, status: 'missing', error: String(err), fetchedAt: new Date() };
  }
}

export const liveRoundAdapter: RoundAdapter = {
  async fetchCurrentRound(): Promise<AdapterResult<RoundInfo>> {
    const result = await fetchCurrentDraw();
    if (!result.data) return { data: null, status: result.status, error: result.error, fetchedAt: result.fetchedAt };
    return { data: drawToRoundInfo(result.data), status: 'live', fetchedAt: result.fetchedAt };
  },

  async fetchRoundById(id: string): Promise<AdapterResult<RoundInfo>> {
    const result = await fetchCurrentDraw();
    if (!result.data) return { data: null, status: result.status, error: result.error, fetchedAt: result.fetchedAt };
    const roundId = `stryktipset-${result.data.drawNumber}`;
    if (id !== roundId) return { data: null, status: 'missing', error: `Round ${id} not found`, fetchedAt: new Date() };
    return { data: drawToRoundInfo(result.data), status: 'live', fetchedAt: result.fetchedAt };
  },

  async fetchMatchesForRound(roundId: string): Promise<AdapterResult<MatchInfo[]>> {
    const result = await fetchCurrentDraw();
    if (!result.data) return { data: null, status: result.status, error: result.error, fetchedAt: result.fetchedAt };
    const matches = result.data.drawEvents
      .filter((e) => !e.cancelled)
      .map((e) => eventToMatchInfo(e, roundId));
    return { data: matches, status: 'live', fetchedAt: result.fetchedAt };
  },
};

export const livePublicPicksAdapter: PublicPicksAdapter = {
  async fetchPicksForRound(roundId: string): Promise<AdapterResult<PublicPicksData[]>> {
    const result = await fetchCurrentDraw();
    if (!result.data) return { data: null, status: result.status, error: result.error, fetchedAt: result.fetchedAt };

    const picks: PublicPicksData[] = [];
    for (const event of result.data.drawEvents) {
      if (event.cancelled) continue;
      const matchId = `${roundId}-${event.eventNumber}`;
      const pick = eventToPublicPicks(event, matchId);
      if (pick) picks.push(pick);
    }

    if (picks.length === 0) {
      return { data: null, status: 'missing', error: 'No pick distribution data available yet', fetchedAt: new Date() };
    }

    return { data: picks, status: 'live', fetchedAt: result.fetchedAt };
  },
};
