'use client';

import { useState, useEffect } from 'react';
import { sv } from '@/i18n/sv';
import type { RoundAnalysis, SimulationResult, SystemRow, SystemStrategy } from '@tipset/core';
import { exportSystemToCSV, exportSystemToJSON } from '@tipset/core';

interface GenerateResult {
  rows: SystemRow[];
  simulationResult: SimulationResult;
  rowCount: number;
}

export default function SystembyggarePage() {
  const [roundId, setRoundId] = useState<string | null>(null);
  const [budget, setBudget] = useState(24);
  const [strategy, setStrategy] = useState<SystemStrategy>('balanced');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/rounds/current')
      .then((r) => r.json())
      .then((j: { data: RoundAnalysis }) => setRoundId(j.data?.round.id ?? null))
      .catch(() => {});
  }, []);

  async function generate() {
    if (!roundId) return;
    setLoading(true);
    const res = await fetch('/api/generate-system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundId, budgetSek: budget, strategy }),
    });
    const json = await res.json() as { data: GenerateResult };
    setResult(json.data);
    setLoading(false);
  }

  function downloadJSON() {
    if (!result) return;
    const content = exportSystemToJSON(result.rows, { strategy, budgetSek: budget });
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'system.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadCSV() {
    if (!result) return;
    const content = exportSystemToCSV(result.rows);
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'system.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const strategyLabels: Record<SystemStrategy, string> = {
    highestProbability: sv.systembyggare.strategies.highestProbability,
    highestValue: sv.systembyggare.strategies.highestValue,
    balanced: sv.systembyggare.strategies.balanced,
    skräll: sv.systembyggare.strategies.skräll,
    lowRisk: sv.systembyggare.strategies.lowRisk,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{sv.systembyggare.title}</h1>

      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex gap-6 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sv.systembyggare.budget}</label>
            <input
              type="number" min={1} max={10000} value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value, 10) || 1)}
              className="border rounded px-3 py-2 text-sm w-28"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sv.systembyggare.strategy}</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as SystemStrategy)}
              className="border rounded px-3 py-2 text-sm"
            >
              {(Object.keys(strategyLabels) as SystemStrategy[]).map((s) => (
                <option key={s} value={s}>{strategyLabels[s]}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || !roundId}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? sv.common.loading : sv.systembyggare.generate}
        </button>
      </div>

      {result && (
        <>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{result.rowCount} {sv.systembyggare.rows}</span>
              <div className="flex gap-2">
                <button onClick={downloadJSON} className="px-3 py-1 border rounded text-sm hover:bg-gray-50">{sv.systembyggare.exportJSON}</button>
                <button onClick={downloadCSV} className="px-3 py-1 border rounded text-sm hover:bg-gray-50">{sv.systembyggare.exportCSV}</button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              {(['10', '11', '12', '13'] as const).map((n) => {
                const key = `probability${n}correct` as keyof SimulationResult;
                const prob = result.simulationResult[key] as number;
                return (
                  <div key={n} className="bg-gray-50 rounded p-3">
                    <div className="text-lg font-bold text-blue-700">{(prob * 100).toFixed(2)}%</div>
                    <div className="text-xs text-gray-500">{n} rätt</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Förväntat värde: <span className={`font-mono font-medium ${result.simulationResult.expectedValue >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {result.simulationResult.expectedValue >= 0 ? '+' : ''}{result.simulationResult.expectedValue.toFixed(0)} SEK
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="font-medium mb-2 text-sm">Rader (visar max 50)</div>
            <div className="overflow-x-auto">
              <table className="text-xs font-mono border-collapse w-full">
                <thead>
                  <tr>
                    {Array.from({ length: 13 }, (_, i) => (
                      <th key={i} className="border px-1 py-0.5 bg-gray-50 text-center">{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {row.map((sign, j) => (
                        <td key={j} className="border px-1 py-0.5 text-center">{sign}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
