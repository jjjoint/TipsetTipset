interface ValueScorePillProps {
  score: number;
}

export function ValueScorePill({ score }: ValueScorePillProps) {
  const pct = (score * 100).toFixed(1);
  const positive = score > 0.03;
  const negative = score < -0.03;
  const color = positive ? 'bg-green-100 text-green-800' : negative ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600';
  const prefix = score > 0 ? '+' : '';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${color}`}>
      {prefix}{pct}pp
    </span>
  );
}
