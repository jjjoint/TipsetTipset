import type { MatchInfo, PublicPicksData, RoundInfo } from '@tipset/core';

export const MOCK_ROUND_ID = 'mock-round-2025-22';

export const MOCK_ROUND: RoundInfo = {
  id: MOCK_ROUND_ID,
  name: 'Omgång 22 — 2025-05-17',
  salesCloseAt: new Date('2025-05-17T14:00:00+02:00'),
  status: 'open',
  turnover: null,
  payoutInfo: null,
};

export const MOCK_MATCHES: MatchInfo[] = [
  { id: 'm01', roundId: MOCK_ROUND_ID, index: 1,  homeTeam: 'Malmö FF',          awayTeam: 'IFK Göteborg',    league: 'Allsvenskan',    startTime: new Date('2025-05-17T15:00:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm02', roundId: MOCK_ROUND_ID, index: 2,  homeTeam: 'AIK',               awayTeam: 'Djurgårdens IF',  league: 'Allsvenskan',    startTime: new Date('2025-05-17T15:00:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm03', roundId: MOCK_ROUND_ID, index: 3,  homeTeam: 'Arsenal',           awayTeam: 'Chelsea',         league: 'Premier League', startTime: new Date('2025-05-17T16:00:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm04', roundId: MOCK_ROUND_ID, index: 4,  homeTeam: 'Manchester City',   awayTeam: 'Liverpool',       league: 'Premier League', startTime: new Date('2025-05-17T18:30:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm05', roundId: MOCK_ROUND_ID, index: 5,  homeTeam: 'Brighton',          awayTeam: 'Brentford',       league: 'Premier League', startTime: new Date('2025-05-17T16:00:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm06', roundId: MOCK_ROUND_ID, index: 6,  homeTeam: 'Bayern München',    awayTeam: 'Dortmund',        league: 'Bundesliga',     startTime: new Date('2025-05-17T18:30:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm07', roundId: MOCK_ROUND_ID, index: 7,  homeTeam: 'Wolfsburg',         awayTeam: 'Freiburg',        league: 'Bundesliga',     startTime: new Date('2025-05-17T15:30:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm08', roundId: MOCK_ROUND_ID, index: 8,  homeTeam: 'Inter Milan',       awayTeam: 'AC Milan',        league: 'Serie A',        startTime: new Date('2025-05-17T18:00:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm09', roundId: MOCK_ROUND_ID, index: 9,  homeTeam: 'Napoli',            awayTeam: 'Juventus',        league: 'Serie A',        startTime: new Date('2025-05-17T20:45:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm10', roundId: MOCK_ROUND_ID, index: 10, homeTeam: 'Real Madrid',       awayTeam: 'Barcelona',       league: 'La Liga',        startTime: new Date('2025-05-17T21:00:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm11', roundId: MOCK_ROUND_ID, index: 11, homeTeam: 'Atlético Madrid',   awayTeam: 'Sevilla',         league: 'La Liga',        startTime: new Date('2025-05-17T18:30:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm12', roundId: MOCK_ROUND_ID, index: 12, homeTeam: 'PSG',               awayTeam: 'Lyon',            league: 'Ligue 1',        startTime: new Date('2025-05-17T21:00:00+02:00'), finalScore: null, actualOutcome: null },
  { id: 'm13', roundId: MOCK_ROUND_ID, index: 13, homeTeam: 'Ajax',              awayTeam: 'PSV',             league: 'Eredivisie',     startTime: new Date('2025-05-17T14:30:00+02:00'), finalScore: null, actualOutcome: null },
];

export const MOCK_PUBLIC_PICKS: PublicPicksData[] = [
  { matchId: 'm01', homePercent: 52, drawPercent: 28, awayPercent: 20, observedAt: new Date(), source: 'mock' },
  { matchId: 'm02', homePercent: 40, drawPercent: 30, awayPercent: 30, observedAt: new Date(), source: 'mock' },
  { matchId: 'm03', homePercent: 44, drawPercent: 26, awayPercent: 30, observedAt: new Date(), source: 'mock' },
  { matchId: 'm04', homePercent: 38, drawPercent: 25, awayPercent: 37, observedAt: new Date(), source: 'mock' },
  { matchId: 'm05', homePercent: 42, drawPercent: 30, awayPercent: 28, observedAt: new Date(), source: 'mock' },
  { matchId: 'm06', homePercent: 58, drawPercent: 24, awayPercent: 18, observedAt: new Date(), source: 'mock' },
  { matchId: 'm07', homePercent: 38, drawPercent: 32, awayPercent: 30, observedAt: new Date(), source: 'mock' },
  { matchId: 'm08', homePercent: 43, drawPercent: 28, awayPercent: 29, observedAt: new Date(), source: 'mock' },
  { matchId: 'm09', homePercent: 45, drawPercent: 27, awayPercent: 28, observedAt: new Date(), source: 'mock' },
  { matchId: 'm10', homePercent: 40, drawPercent: 24, awayPercent: 36, observedAt: new Date(), source: 'mock' },
  { matchId: 'm11', homePercent: 46, drawPercent: 28, awayPercent: 26, observedAt: new Date(), source: 'mock' },
  { matchId: 'm12', homePercent: 62, drawPercent: 22, awayPercent: 16, observedAt: new Date(), source: 'mock' },
  { matchId: 'm13', homePercent: 39, drawPercent: 27, awayPercent: 34, observedAt: new Date(), source: 'mock' },
];
