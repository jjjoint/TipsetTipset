import type { AdapterResult, HistoricalAdapter, MatchInfo, RoundInfo } from '@tipset/core';

export const mockHistoricalAdapter: HistoricalAdapter = {
  async fetchHistoricalRounds(): Promise<AdapterResult<RoundInfo[]>> {
    return { data: [], status: 'mock', fetchedAt: new Date() };
  },
  async fetchHistoricalMatches(_roundId: string): Promise<AdapterResult<MatchInfo[]>> {
    return { data: [], status: 'mock', fetchedAt: new Date() };
  },
};
