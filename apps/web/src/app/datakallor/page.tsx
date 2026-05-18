import { sv } from '@/i18n/sv';
import { StatusBadge } from '@/components/ui/Badge';
import { prisma } from '@/app/api/_lib/db';
import type { DataSourceName, DataSourceStatusValue } from '@tipset/core';

export const dynamic = 'force-dynamic';

export default async function DatakallorPage() {
  const sources = await prisma.dataSourceStatus.findMany();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{sv.datakallor.title}</h1>
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
      </div>
    </div>
  );
}
