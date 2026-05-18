'use client';

import { useState, useEffect } from 'react';
import { sv } from '@/i18n/sv';
import type { BacktestResult, RoundAnalysis } from '@tipset/core';

export default function BacktestPage() {
  const [roundId, setRoundId] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/rounds/current')
      .then((r) => r.json())
      .then((j: { data: RoundAnalysis }) => setRoundId(j.data?.round.id ?? null))
      .catch(() => {});
  }, []);

  async function runBacktest() {
    if (!roundId) return;
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/backtest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundId }),
    });
    const json = await res.json() as { data: BacktestResult | null; error?: string };
    if (json.data) {
      setResult(json.data);
    } else {
      setMessage(json.error ?? 'Fel vid backtest. Matcher måste ha actualOutcome satt.');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{sv.backtest.title}</h1>

      <div className="bg-white rounded-lg border p-4 space-y-3">
        <p className="text-sm text-gray-500">
          Backtesting kräver avgjorda matcher (actualOutcome satt). I MVP används seedade historiska omgångar.
        </p>
        <button
          onClick={runBacktest}
          disabled={loading || !roundId}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? sv.common.loading : sv.backtest.runBacktest}
        </button>
        {message && <p className="text-sm text-red-600">{message}</p>}
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-xl font-bold">{result.brierScore.toFixed(4)}</div>
              <div className="text-xs text-gray-500">{sv.backtest.brierScore}</div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-xl font-bold">{result.logLoss.toFixed(4)}</div>
              <div className="text-xs text-gray-500">{sv.backtest.logLoss}</div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-xl font-bold">{(result.roi * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-500">{sv.backtest.roi}</div>
            </div>
          </div>

          {result.calibrationCurve.length > 0 && (
            <div className="bg-white rounded-lg border p-4">
              <div className="font-medium text-sm mb-3">{sv.backtest.calibration}</div>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="text-left py-1">{sv.backtest.predicted}</th>
                      <th className="text-left py-1">{sv.backtest.observed}</th>
                      <th className="text-left py-1">Antal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.calibrationCurve.map((p) => (
                      <tr key={p.predictedBin} className="border-b">
                        <td className="py-1">{(p.predictedBin * 100).toFixed(0)}%</td>
                        <td className="py-1">{(p.observedFrequency * 100).toFixed(1)}%</td>
                        <td className="py-1">{p.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
