'use client';

import { useState, useEffect } from 'react';
import { sv } from '@/i18n/sv';
import { ProbabilityBar } from '@/components/prediction/ProbabilityBar';
import { ValueScorePill } from '@/components/prediction/ValueScorePill';
import { RiskBadge } from '@/components/ui/Badge';
import type { RoundAnalysis } from '@tipset/core';

export default function KupongPage() {
  const [analysis, setAnalysis] = useState<RoundAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch('/api/rounds/current')
      .then((r) => r.json())
      .then((j: { data: RoundAnalysis }) => { setAnalysis(j.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function runModel() {
    if (!analysis) return;
    setRunning(true);
    await fetch(`/api/predict/${analysis.round.id}`, { method: 'POST' });
    const res = await fetch('/api/rounds/current');
    const json = await res.json() as { data: RoundAnalysis };
    setAnalysis(json.data);
    setRunning(false);
  }

  if (loading) return <div className="text-gray-500">{sv.common.loading}</div>;
  if (!analysis) return <div className="text-gray-500">{sv.common.noData}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{sv.kupong.title}</h1>
        <button
          onClick={runModel}
          disabled={running}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {running ? sv.kupong.loading : sv.kupong.runModel}
        </button>
      </div>

      <div className="text-sm text-gray-500">{analysis.round.name}</div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500 text-xs">
              <th className="py-2 pr-2 w-6">#</th>
              <th className="py-2 pr-4">Match</th>
              <th className="py-2 pr-4">Liga</th>
              <th className="py-2 pr-4 w-36">Modell 1/X/2</th>
              <th className="py-2 pr-4 w-36">Folket 1/X/2</th>
              <th className="py-2 pr-2">Värde</th>
              <th className="py-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {analysis.matches.map(({ match, prediction, publicPicks, recommendation }) => (
              <tr key={match.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-2 text-gray-400 font-mono">{match.index}</td>
                <td className="py-2 pr-4 font-medium">
                  {match.homeTeam}<br />
                  <span className="text-gray-500 text-xs">{match.awayTeam}</span>
                </td>
                <td className="py-2 pr-4 text-gray-500 text-xs">{match.league}</td>
                <td className="py-2 pr-4">
                  {prediction ? (
                    <ProbabilityBar
                      home={prediction.probabilities.home}
                      draw={prediction.probabilities.draw}
                      away={prediction.probabilities.away}
                      showLabels
                    />
                  ) : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="py-2 pr-4">
                  {publicPicks ? (
                    <ProbabilityBar
                      home={publicPicks.homePercent / 100}
                      draw={publicPicks.drawPercent / 100}
                      away={publicPicks.awayPercent / 100}
                      showLabels
                    />
                  ) : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="py-2 pr-2">
                  {recommendation ? <ValueScorePill score={recommendation.valueScore} /> : null}
                </td>
                <td className="py-2">
                  {recommendation ? <RiskBadge category={recommendation.riskCategory} /> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
