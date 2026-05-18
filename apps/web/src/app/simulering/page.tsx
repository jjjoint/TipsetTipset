'use client';

import { useState, useEffect } from 'react';
import { sv } from '@/i18n/sv';
import type { RoundAnalysis, SimulationResult, SystemRow } from '@tipset/core';

export default function SimuleringPage() {
  const [analysis, setAnalysis] = useState<RoundAnalysis | null>(null);
  const [rows, setRows] = useState<SystemRow[] | null>(null);
  const [iterations, setIterations] = useState(10000);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/rounds/current')
      .then((r) => r.json())
      .then((j: { data: RoundAnalysis }) => setAnalysis(j.data))
      .catch(() => {});
  }, []);

  async function runSim() {
    if (!analysis) return;
    setLoading(true);

    // Use single row (all top predictions) if no system loaded
    const matchProbabilities = analysis.matches.map((m) =>
      m.prediction?.probabilities ?? { home: 0.45, draw: 0.26, away: 0.29 }
    );

    const simRows: SystemRow[] = rows ?? [
      analysis.matches.map((m) => {
        const p = m.prediction?.probabilities ?? { home: 0.45, draw: 0.26, away: 0.29 };
        return p.home >= p.draw && p.home >= p.away ? '1' : p.draw >= p.away ? 'X' : '2';
      }) as SystemRow,
    ];

    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: simRows, matchProbabilities, iterations }),
    });
    const json = await res.json() as { data: SimulationResult };
    setResult(json.data);
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{sv.simulering.title}</h1>

      <div className="bg-white rounded-lg border p-4 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{sv.simulering.iterations}</label>
          <input
            type="number" min={100} max={100000} value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value, 10) || 10000)}
            className="border rounded px-3 py-2 text-sm w-32"
          />
        </div>
        <button
          onClick={runSim}
          disabled={loading || !analysis}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? sv.common.loading : sv.simulering.run}
        </button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {[10, 11, 12, 13].map((n) => {
              const key = `probability${n}correct` as keyof SimulationResult;
              const prob = result[key] as number;
              return (
                <div key={n} className="bg-white rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">{(prob * 100).toFixed(2)}%</div>
                  <div className="text-sm text-gray-500 mt-1">{n} {sv.simulering.correct}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm font-medium mb-3">Histogram</div>
            <div className="flex items-end gap-1 h-32">
              {result.histogram.filter((b) => b.correct >= 6).map((bin) => (
                <div key={bin.correct} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t ${bin.correct >= 10 ? 'bg-blue-500' : 'bg-gray-300'}`}
                    style={{ height: `${Math.max(bin.probability * 400, 2)}px` }}
                    title={`${bin.correct} rätt: ${(bin.probability * 100).toFixed(2)}%`}
                  />
                  <span className="text-xs text-gray-400">{bin.correct}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4 text-sm">
            {sv.simulering.expectedValue}: <span className={`font-mono font-medium ${result.expectedValue >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {result.expectedValue >= 0 ? '+' : ''}{result.expectedValue.toFixed(0)} SEK
            </span>
            <span className="text-gray-400 ml-2">({result.iterations.toLocaleString('sv-SE')} simuleringar)</span>
          </div>
        </>
      )}
    </div>
  );
}
