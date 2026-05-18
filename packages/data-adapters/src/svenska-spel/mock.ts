import type { AdapterResult, MatchInfo, PublicPicksAdapter, PublicPicksData, RoundAdapter, RoundInfo } from '@tipset/core';
import { MOCK_MATCHES, MOCK_PUBLIC_PICKS, MOCK_ROUND } from '../mock-data';

export const mockRoundAdapter: RoundAdapter = {
  async fetchCurrentRound(): Promise<AdapterResult<RoundInfo>> {
    return { data: MOCK_ROUND, status: 'mock', fetchedAt: new Date() };
  },
  async fetchRoundById(id: string): Promise<AdapterResult<RoundInfo>> {
    if (id === MOCK_ROUND.id) return { data: MOCK_ROUND, status: 'mock', fetchedAt: new Date() };
    return { data: null, status: 'missing', error: `Round ${id} not found in mock data`, fetchedAt: new Date() };
  },
  async fetchMatchesForRound(roundId: string): Promise<AdapterResult<MatchInfo[]>> {
    const matches = MOCK_MATCHES.filter((m) => m.roundId === roundId);
    if (matches.length === 0) return { data: null, status: 'missing', error: `No matches for round ${roundId}`, fetchedAt: new Date() };
    return { data: matches, status: 'mock', fetchedAt: new Date() };
  },
};

export const mockPublicPicksAdapter: PublicPicksAdapter = {
  async fetchPicksForRound(roundId: string): Promise<AdapterResult<PublicPicksData[]>> {
    const matchIds = MOCK_MATCHES.filter((m) => m.roundId === roundId).map((m) => m.id);
    const picks = MOCK_PUBLIC_PICKS.filter((p) => matchIds.includes(p.matchId));
    if (picks.length === 0) return { data: null, status: 'missing', fetchedAt: new Date() };
    return { data: picks, status: 'mock', fetchedAt: new Date() };
  },
};
