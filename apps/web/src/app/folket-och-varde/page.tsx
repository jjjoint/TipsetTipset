'use client';

import { useState, useEffect } from 'react';
import { sv } from '@/i18n/sv';
import type { RoundAnalysis } from '@tipset/core';

export default function FolketOchVardePage() {
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
      <h1 className="text-2xl font-bold">{sv.folketOchVarde.title}</h1>
      <div className="space-y-3">
        {analysis.matches.map(({ match, prediction, publicPicks, recommendation }) => {
          if (!prediction || !publicPicks) return null;
          const p = prediction.probabilities;
          const outcomes = [
            { sign: '1', modelPct: p.home * 100, publicPct: publicPicks.homePercent },
            { sign: 'X', modelPct: p.draw * 100, publicPct: publicPicks.drawPercent },
            { sign: '2', modelPct: p.away * 100, publicPct: publicPicks.awayPercent },
          ];

          return (
            <div key={match.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium">{match.index}. {match.homeTeam} – {match.awayTeam}</span>
                  <span className="ml-2 text-xs text-gray-400">{match.league}</span>
                </div>
                {recommendation && (
                  <span className={`text-xs font-mono ${recommendation.valueScore > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    Värdediff: {recommendation.valueScore > 0 ? '+' : ''}{(recommendation.valueScore * 100).toFixed(1)}pp
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {outcomes.map(({ sign, modelPct, publicPct }) => {
                  const diff = modelPct - publicPct;
                  const isOver = diff < -8;
                  const isUnder = diff > 8;
                  return (
                    <div key={sign} className="flex items-center gap-3 text-sm">
                      <span className="w-4 font-bold text-gray-700">{sign}</span>
                      <div className="flex-1 relative">
                        <div className="flex gap-1">
                          <div className="relative flex-1">
                            <div className="text-xs text-gray-400 mb-0.5">Modell</div>
                            <div className="bg-blue-200 rounded h-5 relative overflow-hidden">
                              <div className="bg-blue-500 h-full rounded" style={{ width: `${modelPct}%` }} />
                              <span className="absolute inset-0 flex items-center px-1 text-xs font-medium text-white">{modelPct.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="relative flex-1">
                            <div className="text-xs text-gray-400 mb-0.5">Folket</div>
                            <div className="bg-gray-200 rounded h-5 relative overflow-hidden">
                              <div className="bg-gray-500 h-full rounded" style={{ width: `${publicPct}%` }} />
                              <span className="absolute inset-0 flex items-center px-1 text-xs font-medium text-white">{publicPct.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        {isOver && <span className="text-xs text-red-600 font-medium">{sv.folketOchVarde.overbet}</span>}
                        {isUnder && <span className="text-xs text-green-600 font-medium">{sv.folketOchVarde.underbet}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
