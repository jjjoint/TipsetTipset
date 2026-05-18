import type { AdapterResult, FootballStatsAdapter, HeadToHead, TeamStats } from '@tipset/core';

const MOCK_TEAM_STATS: Record<string, TeamStats> = {
  'Malmö FF':        { teamName: 'Malmö FF',        eloRating: 1620, attackStrength: 1.2, defenseStrength: 0.85, form: ['W','W','D','W','L'], homeAdvantageBonus: 0.15 },
  'IFK Göteborg':    { teamName: 'IFK Göteborg',    eloRating: 1540, attackStrength: 0.9, defenseStrength: 1.10, form: ['D','W','L','D','W'], homeAdvantageBonus: 0.10 },
  'AIK':             { teamName: 'AIK',             eloRating: 1580, attackStrength: 1.0, defenseStrength: 0.95, form: ['W','L','W','D','W'], homeAdvantageBonus: 0.12 },
  'Djurgårdens IF':  { teamName: 'Djurgårdens IF',  eloRating: 1570, attackStrength: 1.05, defenseStrength: 1.0, form: ['W','W','D','L','W'], homeAdvantageBonus: 0.10 },
  'Arsenal':         { teamName: 'Arsenal',         eloRating: 1810, attackStrength: 1.35, defenseStrength: 0.75, form: ['W','W','W','D','W'], homeAdvantageBonus: 0.12 },
  'Chelsea':         { teamName: 'Chelsea',         eloRating: 1760, attackStrength: 1.20, defenseStrength: 0.90, form: ['W','D','W','W','L'], homeAdvantageBonus: 0.10 },
  'Manchester City': { teamName: 'Manchester City', eloRating: 1850, attackStrength: 1.45, defenseStrength: 0.70, form: ['W','W','W','W','D'], homeAdvantageBonus: 0.13 },
  'Liverpool':       { teamName: 'Liverpool',       eloRating: 1840, attackStrength: 1.40, defenseStrength: 0.72, form: ['W','W','W','D','W'], homeAdvantageBonus: 0.12 },
  'Brighton':        { teamName: 'Brighton',        eloRating: 1700, attackStrength: 1.15, defenseStrength: 0.92, form: ['W','D','W','L','W'], homeAdvantageBonus: 0.10 },
  'Brentford':       { teamName: 'Brentford',       eloRating: 1660, attackStrength: 1.10, defenseStrength: 0.98, form: ['W','L','D','W','D'], homeAdvantageBonus: 0.10 },
  'Bayern München':  { teamName: 'Bayern München',  eloRating: 1920, attackStrength: 1.55, defenseStrength: 0.65, form: ['W','W','W','W','W'], homeAdvantageBonus: 0.14 },
  'Dortmund':        { teamName: 'Dortmund',        eloRating: 1780, attackStrength: 1.30, defenseStrength: 0.88, form: ['W','D','W','L','W'], homeAdvantageBonus: 0.12 },
  'Wolfsburg':       { teamName: 'Wolfsburg',       eloRating: 1620, attackStrength: 0.95, defenseStrength: 1.05, form: ['D','W','L','D','W'], homeAdvantageBonus: 0.10 },
  'Freiburg':        { teamName: 'Freiburg',        eloRating: 1640, attackStrength: 1.00, defenseStrength: 0.98, form: ['W','D','W','D','L'], homeAdvantageBonus: 0.10 },
  'Inter Milan':     { teamName: 'Inter Milan',     eloRating: 1830, attackStrength: 1.35, defenseStrength: 0.75, form: ['W','W','D','W','W'], homeAdvantageBonus: 0.13 },
  'AC Milan':        { teamName: 'AC Milan',        eloRating: 1780, attackStrength: 1.20, defenseStrength: 0.90, form: ['W','L','W','D','W'], homeAdvantageBonus: 0.10 },
  'Napoli':          { teamName: 'Napoli',          eloRating: 1770, attackStrength: 1.25, defenseStrength: 0.85, form: ['W','W','L','W','D'], homeAdvantageBonus: 0.12 },
  'Juventus':        { teamName: 'Juventus',        eloRating: 1780, attackStrength: 1.15, defenseStrength: 0.88, form: ['W','D','W','W','D'], homeAdvantageBonus: 0.10 },
  'Real Madrid':     { teamName: 'Real Madrid',     eloRating: 1920, attackStrength: 1.40, defenseStrength: 0.72, form: ['W','W','D','W','W'], homeAdvantageBonus: 0.14 },
  'Barcelona':       { teamName: 'Barcelona',       eloRating: 1890, attackStrength: 1.45, defenseStrength: 0.70, form: ['W','W','W','D','W'], homeAdvantageBonus: 0.10 },
  'Atlético Madrid': { teamName: 'Atlético Madrid', eloRating: 1830, attackStrength: 1.20, defenseStrength: 0.78, form: ['W','D','W','W','L'], homeAdvantageBonus: 0.13 },
  'Sevilla':         { teamName: 'Sevilla',         eloRating: 1700, attackStrength: 1.00, defenseStrength: 1.00, form: ['D','W','L','W','D'], homeAdvantageBonus: 0.10 },
  'PSG':             { teamName: 'PSG',             eloRating: 1870, attackStrength: 1.50, defenseStrength: 0.68, form: ['W','W','W','W','D'], homeAdvantageBonus: 0.15 },
  'Lyon':            { teamName: 'Lyon',            eloRating: 1700, attackStrength: 1.05, defenseStrength: 1.05, form: ['L','W','D','L','W'], homeAdvantageBonus: 0.10 },
  'Ajax':            { teamName: 'Ajax',            eloRating: 1750, attackStrength: 1.30, defenseStrength: 0.85, form: ['W','W','D','W','L'], homeAdvantageBonus: 0.13 },
  'PSV':             { teamName: 'PSV',             eloRating: 1790, attackStrength: 1.40, defenseStrength: 0.82, form: ['W','W','W','D','W'], homeAdvantageBonus: 0.10 },
};

export const mockFootballStatsAdapter: FootballStatsAdapter = {
  async fetchTeamStats(teamName: string): Promise<AdapterResult<TeamStats>> {
    const stats = MOCK_TEAM_STATS[teamName];
    if (!stats) return { data: null, status: 'missing', error: `No mock stats for ${teamName}`, fetchedAt: new Date() };
    return { data: stats, status: 'mock', fetchedAt: new Date() };
  },
  async fetchHeadToHead(_homeTeam: string, _awayTeam: string): Promise<AdapterResult<HeadToHead>> {
    return { data: null, status: 'missing', error: 'Head-to-head not implemented in mock', fetchedAt: new Date() };
  },
};
