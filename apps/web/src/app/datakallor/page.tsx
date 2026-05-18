'use client';

import { sv } from '@/i18n/sv';
import { StatusBadge } from '@/components/ui/Badge';
import type { DataSourceName, DataSourceStatusValue } from '@tipset/core';
import { useState, useEffect } from 'react';

interface SourceStatus {
  id: string;
  sourceName: string;
  status: string;
  lastCheckedAt: string;
}

export default function DatakallorPage() {
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/datakallor/status')
      .then((r) => r.json())
      .then((d) => { if (d.data) setSources(d.data); })
      .catch(() => {});
  }, []);

  async function handleImportLive() {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch('/api/import/live-round', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setImportResult(`Fel: ${data.error}`);
      } else {
        setImportResult(`Importerat: ${data.data.roundName} (${data.data.matchCount} matcher)`);
        // Refresh status
        const sr = await fetch('/api/datakallor/status');
        const sd = await sr.json();
        if (sd.data) setSources(sd.data);
      }
    } catch {
      setImportResult('Nätverksfel');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{sv.datakallor.title}</h1>
        <button
          onClick={handleImportLive}
          disabled={importing}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
        >
          {importing ? 'Hämtar...' : 'Hämta live-omgång'}
        </button>
      </div>

      {importResult && (
        <div className={`text-sm p-3 rounded ${importResult.startsWith('Fel') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {importResult}
        </div>
      )}

      <div className="space-y-2">
        {sources.map((s) => (
          <div key={s.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">
                {sv.datakallor.sources[s.sourceName as DataSourceName] ?? s.sourceName}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {sv.datakallor.lastChecked}: {new Date(s.lastCheckedAt).toLocaleString('sv-SE')}
              </div>
            </div>
            <StatusBadge status={s.status as DataSourceStatusValue} />
          </div>
        ))}
        {sources.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-8">Inga datakällor registrerade ännu</div>
        )}
      </div>
    </div>
  );
}
