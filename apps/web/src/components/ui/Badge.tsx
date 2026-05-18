import type { DataSourceStatusValue, RiskCategory } from '@tipset/core';
import { sv } from '@/i18n/sv';

const statusColors: Record<DataSourceStatusValue, string> = {
  live: 'bg-green-100 text-green-800',
  imported: 'bg-blue-100 text-blue-800',
  mock: 'bg-yellow-100 text-yellow-800',
  missing: 'bg-red-100 text-red-800',
};

const riskColors: Record<RiskCategory, string> = {
  spik: 'bg-green-100 text-green-800',
  halv: 'bg-blue-100 text-blue-800',
  hel: 'bg-purple-100 text-purple-800',
  skräll: 'bg-orange-100 text-orange-800',
  avstå: 'bg-gray-100 text-gray-600',
};

interface StatusBadgeProps {
  status: DataSourceStatusValue;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>
      {sv.dataStatus[status]}
    </span>
  );
}

interface RiskBadgeProps {
  category: RiskCategory;
}

export function RiskBadge({ category }: RiskBadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${riskColors[category]}`}>
      {sv.riskCategories[category]}
    </span>
  );
}
