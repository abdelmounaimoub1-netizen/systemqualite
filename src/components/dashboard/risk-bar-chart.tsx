type RiskBarChartProps = {
  data: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
};

const colors = {
  low: "bg-emerald-400",
  medium: "bg-amber-400",
  high: "bg-orange-400",
  critical: "bg-rose-500"
};

export function RiskBarChart({ data }: RiskBarChartProps) {
  const max = Math.max(data.low, data.medium, data.high, data.critical, 1);

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="capitalize text-slate-600">{key}</span>
            <span className="font-semibold text-ink">{value}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className={`${colors[key as keyof typeof colors]} h-3 rounded-full transition-all`}
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
