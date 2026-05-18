import type { DataSourceStatusValue, MatchInfo, OutcomeDistribution, PublicPicksData, RoundInfo } from './domain';

export type AdapterResultStatus = DataSourceStatusValue;

export interface AdapterResult<T> {
  data: T | null;
  status: AdapterResultStatus;
  error?: string;
  fetchedAt: Date;
}

export interface RawOdds {
  matchId?: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  bookmaker: string;
}

export interface TeamStats {
  teamName: string;
  eloRating: number;
  attackStrength: number;
  defenseStrength: number;
  form: ('W' | 'D' | 'L')[];
  homeAdvantageBonus: number;
}

export interface HeadToHead {
  homeTeam: string;
  awayTeam: string;
  meetings: { date: Date; homeGoals: number; awayGoals: number }[];
}

export interface RoundAdapter {
  fetchCurrentRound(): Promise<AdapterResult<RoundInfo>>;
  fetchRoundById(id: string): Promise<AdapterResult<RoundInfo>>;
  fetchMatchesForRound(roundId: string): Promise<AdapterResult<MatchInfo[]>>;
}

export interface PublicPicksAdapter {
  fetchPicksForRound(roundId: string): Promise<AdapterResult<PublicPicksData[]>>;
}

export interface OddsAdapter {
  fetchOddsForMatch(homeTeam: string, awayTeam: string, date: Date): Promise<AdapterResult<RawOdds>>;
  fetchOddsForRound?(roundId: string): Promise<AdapterResult<RawOdds[]>>;
}

export interface FootballStatsAdapter {
  fetchTeamStats(teamName: string): Promise<AdapterResult<TeamStats>>;
  fetchHeadToHead(homeTeam: string, awayTeam: string): Promise<AdapterResult<HeadToHead>>;
}

export interface HistoricalAdapter {
  fetchHistoricalRounds(): Promise<AdapterResult<RoundInfo[]>>;
  fetchHistoricalMatches(roundId: string): Promise<AdapterResult<MatchInfo[]>>;
}

export interface AdapterRegistry {
  round: RoundAdapter;
  publicPicks: PublicPicksAdapter;
  odds: OddsAdapter;
  footballStats: FootballStatsAdapter;
  historical: HistoricalAdapter;
}

export interface PriorSignals {
  oddsNormalized: OutcomeDistribution | null;
  eloRating: { home: number; away: number } | null;
  homeStats: TeamStats | null;
  awayStats: TeamStats | null;
  league: string;
}
