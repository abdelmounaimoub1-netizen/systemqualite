import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export function KpiCard({
  title,
  value,
  hint,
  icon: Icon
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-4 top-4 rounded-2xl bg-brand/10 p-3 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-ink">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{hint}</div>
    </Card>
  );
}
