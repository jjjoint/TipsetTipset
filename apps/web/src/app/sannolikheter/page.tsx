'use client';

import { useState, useEffect } from 'react';
import { sv } from '@/i18n/sv';
import { ProbabilityBar } from '@/components/prediction/ProbabilityBar';
import type { RoundAnalysis } from '@tipset/core';

export default function SannolikheterPage() {
  const [analysis, setAnalysis] = useState<RoundAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rounds/current')
      .then((r) => r.json())
      .then((j: { data: RoundAnalysis }) => { setAnalysis(j.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">{sv.common.loading}</div>;
  if (!analysis) return <div className="text-gray-500">{sv.common.noData}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{sv.sannolikheter.title}</h1>
      <div className="space-y-4">
        {analysis.matches.map(({ match, prediction }) => {
          if (!prediction) return null;
          const { signals } = prediction;
          const signalList = [
            { label: sv.sannolikheter.oddsSignal, dist: signals?.oddsNormalized },
            { label: sv.sannolikheter.bayesianSignal, dist: signals?.bayesianPrior },
            { label: sv.sannolikheter.poissonSignal, dist: signals?.poissonDerived },
            { label: sv.sannolikheter.calibrated, dist: signals?.calibrated },
          ].filter((s) => s.dist !== null && s.dist !== undefined);

          return (
            <div key={match.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium">{match.index}. {match.homeTeam} – {match.awayTeam}</div>
                  <div className="text-xs text-gray-400">{match.league}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{sv.sannolikheter.uncertainty}</div>
                  <div className="font-mono text-sm">{(prediction.uncertainty * 100).toFixed(1)}%</div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-sm font-medium mb-1">{sv.sannolikheter.modelProbabilities}</div>
                <ProbabilityBar
                  home={prediction.probabilities.home}
                  draw={prediction.probabilities.draw}
                  away={prediction.probabilities.away}
                  showLabels
                />
              </div>
              {signalList.length > 0 && (
                <div className="border-t pt-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">{sv.sannolikheter.signalBreakdown}</div>
                  <div className="space-y-1">
                    {signalList.map(({ label, dist }) => (
                      <div key={label}>
                        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                        <ProbabilityBar home={dist!.home} draw={dist!.draw} away={dist!.away} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
