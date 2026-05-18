interface ProbabilityBarProps {
  home: number;
  draw: number;
  away: number;
  showLabels?: boolean;
}

export function ProbabilityBar({ home, draw, away, showLabels = false }: ProbabilityBarProps) {
  const fmt = (p: number) => `${(p * 100).toFixed(1)}%`;
  return (
    <div className="w-full">
      <div className="flex rounded overflow-hidden h-4 text-[10px] font-medium">
        <div className="bg-blue-500 text-white flex items-center justify-center" style={{ width: `${home * 100}%` }}>
          {home > 0.15 && fmt(home)}
        </div>
        <div className="bg-gray-400 text-white flex items-center justify-center" style={{ width: `${draw * 100}%` }}>
          {draw > 0.15 && fmt(draw)}
        </div>
        <div className="bg-red-500 text-white flex items-center justify-center" style={{ width: `${away * 100}%` }}>
          {away > 0.15 && fmt(away)}
        </div>
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 {fmt(home)}</span>
          <span>X {fmt(draw)}</span>
          <span>2 {fmt(away)}</span>
        </div>
      )}
    </div>
  );
}
