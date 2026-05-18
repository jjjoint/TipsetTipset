export type Outcome = '1' | 'X' | '2';
export type RoundStatus = 'upcoming' | 'open' | 'closed' | 'settled';
export type RiskCategory = 'spik' | 'halv' | 'hel' | 'skräll' | 'avstå';
export type SystemStrategy =
  | 'highestProbability'
  | 'highestValue'
  | 'balanced'
  | 'skräll'
  | 'lowRisk';
export type DataSourceName =
  | 'svenskaSpelRound'
  | 'oddsData'
  | 'footballStats'
  | 'publicPicks'
  | 'historicalData';
export type DataSourceStatusValue = 'live' | 'imported' | 'mock' | 'missing';

export interface OutcomeDistribution {
  home: number;
  draw: number;
  away: number;
}

export interface PayoutInfo {
  correct13: number | null;
  correct12: number | null;
  correct11: number | null;
  correct10: number | null;
}

export interface RoundInfo {
  id: string;
  name: string;
  salesCloseAt: Date;
  status: RoundStatus;
  turnover: number | null;
  payoutInfo: PayoutInfo | null;
}

export interface MatchInfo {
  id: string;
  roundId: string;
  index: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: Date;
  finalScore: string | null;
  actualOutcome: Outcome | null;
}

export interface PublicPicksData {
  matchId: string;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
  observedAt: Date;
  source: DataSourceStatusValue;
}

export interface ModelSignals {
  oddsNormalized: OutcomeDistribution | null;
  bayesianPrior: OutcomeDistribution | null;
  poissonDerived: OutcomeDistribution | null;
  calibrated: OutcomeDistribution;
}

export interface ModelPredictionData {
  matchId: string;
  probabilities: OutcomeDistribution;
  fairOdds: OutcomeDistribution;
  uncertainty: number;
  modelVersion: string;
  signals: ModelSignals | null;
}

export interface RecommendationData {
  matchId: string;
  recommendedSigns: Outcome[];
  riskCategory: RiskCategory;
  valueScore: number;
  valueRatio: number;
  rowOwnershipEst: number;
  explanation: string | null;
}

export interface MatchAnalysis {
  match: MatchInfo;
  publicPicks: PublicPicksData | null;
  prediction: ModelPredictionData | null;
  recommendation: RecommendationData | null;
}

export interface RoundAnalysis {
  round: RoundInfo;
  matches: MatchAnalysis[];
  dataSourceStatuses: Record<DataSourceName, DataSourceStatusValue>;
}
