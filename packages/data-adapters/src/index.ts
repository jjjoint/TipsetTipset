import type { AdapterRegistry } from '@tipset/core';
import { mockFootballStatsAdapter } from './football-stats/mock';
import { mockHistoricalAdapter } from './historical/mock';
import { mockOddsAdapter } from './odds/mock';
import { liveOddsAdapter } from './odds/live';
import { mockPublicPicksAdapter, mockRoundAdapter } from './svenska-spel/mock';
import { livePublicPicksAdapter, liveRoundAdapter } from './svenska-spel/live';

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

function buildLiveRegistry(): AdapterRegistry {
  return {
    round: liveRoundAdapter,
    publicPicks: livePublicPicksAdapter,
    odds: liveOddsAdapter,
    footballStats: mockFootballStatsAdapter,
    historical: mockHistoricalAdapter,
  };
}

export function createAdapterRegistry(mode: AdapterMode = 'mock'): AdapterRegistry {
  switch (mode) {
    case 'live':
      return buildLiveRegistry();
    case 'imported':
      // Falls back to mock until imported adapters are implemented
      return buildMockRegistry();
    default:
      return buildMockRegistry();
  }
}

export { MOCK_MATCHES, MOCK_PUBLIC_PICKS, MOCK_ROUND, MOCK_ROUND_ID } from './mock-data';
