import type { AdapterRegistry } from '@tipset/core';
import { mockFootballStatsAdapter } from './football-stats/mock';
import { mockHistoricalAdapter } from './historical/mock';
import { mockOddsAdapter } from './odds/mock';
import { mockPublicPicksAdapter, mockRoundAdapter } from './svenska-spel/mock';

export type AdapterMode = 'mock' | 'imported' | 'live';

function buildMockRegistry(): AdapterRegistry {
  return {
    round: mockRoundAdapter,
    publicPicks: mockPublicPicksAdapter,
    odds: mockOddsAdapter,
    footballStats: mockFootballStatsAdapter,
    historical: mockHistoricalAdapter,
  };
}

export function createAdapterRegistry(mode: AdapterMode = 'mock'): AdapterRegistry {
  switch (mode) {
    case 'live':
    case 'imported':
      // Fall back to mock until live/imported adapters are implemented
      return buildMockRegistry();
    default:
      return buildMockRegistry();
  }
}

export { MOCK_MATCHES, MOCK_PUBLIC_PICKS, MOCK_ROUND, MOCK_ROUND_ID } from './mock-data';
