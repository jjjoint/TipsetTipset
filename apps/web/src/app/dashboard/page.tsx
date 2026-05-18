import { sv } from '@/i18n/sv';
import { StatusBadge } from '@/components/ui/Badge';
import { RiskBadge } from '@/components/ui/Badge';
import type { RoundAnalysis } from '@tipset/core';

async function getRoundAnalysis(): Promise<RoundAnalysis | null> {
  try {
    const base = process.env['NEXTAUTH_URL'] ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/rounds/current`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json() as { data: RoundAnalysis | null };
    return json.data;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const analysis = await getRoundAnalysis();

  const deadline = analysis?.round.salesCloseAt
    ? new Date(analysis.round.salesCloseAt).toLocaleString('sv-SE', { dateStyle: 'full', timeStyle: 'short' })
    : null;

  const topRecs = analysis?.matches
    .filter((m) => m.recommendation !== null)
    .sort((a, b) => Math.abs(b.recommendation!.valueScore) - Math.abs(a.recommendation!.valueScore))
    .slice(0, 3) ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{sv.dashboard.title}</h1>

      {analysis ? (
        <>
          <div className="bg-white rounded-lg border p-4 space-y-2">
            <div className="text-sm text-gray-500">{sv.dashboard.nextDeadline}</div>
            <div className="text-lg font-semibold">{deadline}</div>
            <div className="text-sm text-gray-600">{analysis.round.name}</div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold mb-3">{sv.dashboard.topRecommendations}</h2>
            {topRecs.length === 0 ? (
              <p className="text-gray-500 text-sm">Kör modellen på kupongsidan för att se rekommendationer.</p>
            ) : (
              <div className="space-y-2">
                {topRecs.map(({ match, recommendation }) => (
                  <div key={match.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <span className="font-medium">{match.index}. {match.homeTeam} – {match.awayTeam}</span>
                    <div className="flex items-center gap-2">
                      <RiskBadge category={recommendation!.riskCategory} />
                      <span className={`font-mono text-xs ${recommendation!.valueScore > 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {recommendation!.valueScore > 0 ? '+' : ''}{(recommendation!.valueScore * 100).toFixed(1)}pp
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold mb-3">{sv.datakallor.title}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(analysis.dataSourceStatuses).map(([name, status]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-gray-600">{sv.datakallor.sources[name as keyof typeof sv.datakallor.sources] ?? name}</span>
                  <StatusBadge status={status} />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          Ingen aktiv omgång hittades. Se till att databasen är seedad med <code>pnpm db:seed</code>.
        </div>
      )}
    </div>
  );
}
