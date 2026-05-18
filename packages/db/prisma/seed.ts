import { PrismaClient } from '../src/generated/client/index';
import { MOCK_MATCHES, MOCK_PUBLIC_PICKS, MOCK_ROUND } from '../../data-adapters/src/mock-data';
import { runModelForMatch } from '../../model/src/pipeline';
import { MOCK_TEAM_STATS } from './seed-team-stats';
import { MOCK_ODDS } from './seed-odds';
import { classifyRisk } from '../../core/src/domain/risk-category';
import { computeValueScore } from '../../core/src/domain/value-score';
import { estimateRowOwnership } from '../../core/src/domain/row-ownership';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.recommendation.deleteMany();
  await prisma.modelPrediction.deleteMany();
  await prisma.publicPicks.deleteMany();
  await prisma.match.deleteMany();
  await prisma.generatedSystem.deleteMany();
  await prisma.backtestRun.deleteMany();
  await prisma.round.deleteMany();
  await prisma.team.deleteMany();
  await prisma.dataSourceStatus.deleteMany();

  // Seed round
  await prisma.round.create({
    data: {
      id: MOCK_ROUND.id,
      name: MOCK_ROUND.name,
      salesCloseAt: MOCK_ROUND.salesCloseAt,
      status: MOCK_ROUND.status,
      turnover: MOCK_ROUND.turnover ?? null,
      payoutInfo: null,
    },
  });

  // Seed matches
  for (const match of MOCK_MATCHES) {
    await prisma.match.create({
      data: {
        id: match.id,
        roundId: match.roundId,
        index: match.index,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        startTime: match.startTime,
        finalScore: match.finalScore ?? null,
        actualOutcome: match.actualOutcome ?? null,
      },
    });
  }

  // Seed public picks
  for (const picks of MOCK_PUBLIC_PICKS) {
    await prisma.publicPicks.create({
      data: {
        matchId: picks.matchId,
        homePercent: picks.homePercent,
        drawPercent: picks.drawPercent,
        awayPercent: picks.awayPercent,
        observedAt: picks.observedAt,
        source: picks.source,
      },
    });
  }

  // Seed model predictions and recommendations
  for (const match of MOCK_MATCHES) {
    const homeStats = MOCK_TEAM_STATS[match.homeTeam] ?? null;
    const awayStats = MOCK_TEAM_STATS[match.awayTeam] ?? null;
    const odds = MOCK_ODDS[`${match.homeTeam}|${match.awayTeam}`] ?? null;
    const picks = MOCK_PUBLIC_PICKS.find((p) => p.matchId === match.id) ?? null;

    const prediction = runModelForMatch({ match, odds, homeStats, awayStats, publicPicks: picks });

    await prisma.modelPrediction.create({
      data: {
        matchId: match.id,
        homeProbability: prediction.probabilities.home,
        drawProbability: prediction.probabilities.draw,
        awayProbability: prediction.probabilities.away,
        homeFairOdds: prediction.fairOdds.home,
        drawFairOdds: prediction.fairOdds.draw,
        awayFairOdds: prediction.fairOdds.away,
        uncertainty: prediction.uncertainty,
        modelVersion: prediction.modelVersion,
        signals: prediction.signals ? JSON.stringify(prediction.signals) : null,
      },
    });

    if (picks) {
      const riskCategory = classifyRisk(prediction, picks);

      const probs = prediction.probabilities;
      const topProb = Math.max(probs.home, probs.draw, probs.away);
      const topSign = topProb === probs.home ? '1' : topProb === probs.draw ? 'X' : '2';
      const topPublicPct = topSign === '1' ? picks.homePercent : topSign === 'X' ? picks.drawPercent : picks.awayPercent;
      const { valueScore, valueRatio } = computeValueScore(topProb, topPublicPct);

      let recommendedSigns: ('1' | 'X' | '2')[];
      switch (riskCategory) {
        case 'spik': recommendedSigns = [topSign]; break;
        case 'halv': {
          const sorted = [
            { sign: '1' as const, prob: probs.home },
            { sign: 'X' as const, prob: probs.draw },
            { sign: '2' as const, prob: probs.away },
          ].sort((a, b) => b.prob - a.prob);
          recommendedSigns = [sorted[0]!.sign, sorted[1]!.sign];
          break;
        }
        default: recommendedSigns = ['1', 'X', '2']; break;
      }

      const rowOwnershipEst = estimateRowOwnership(
        [picks],
        [recommendedSigns[0]!]
      );

      await prisma.recommendation.create({
        data: {
          matchId: match.id,
          recommendedSigns: JSON.stringify(recommendedSigns),
          riskCategory,
          valueScore,
          valueRatio: isFinite(valueRatio) ? valueRatio : 99,
          rowOwnershipEst,
          explanation: null,
        },
      });
    }
  }

  // Seed teams
  for (const [name, stats] of Object.entries(MOCK_TEAM_STATS)) {
    await prisma.team.create({
      data: {
        name,
        league: stats.league,
        eloRating: stats.eloRating,
        attackStrength: stats.attackStrength,
        defenseStrength: stats.defenseStrength,
        form: stats.form ? JSON.stringify(stats.form) : null,
      },
    });
  }

  // Seed data source statuses
  const sources = ['svenskaSpelRound', 'oddsData', 'footballStats', 'publicPicks', 'historicalData'];
  for (const sourceName of sources) {
    await prisma.dataSourceStatus.create({
      data: { sourceName, status: 'mock', details: null },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
