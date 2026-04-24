import { cn } from "@/lib/utils";

const badgeStyles: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  "Under Review": "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Archived: "bg-slate-200 text-slate-700",
  Open: "bg-rose-100 text-rose-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Closed: "bg-emerald-100 text-emerald-700",
  Verification: "bg-violet-100 text-violet-700",
  Planned: "bg-sky-100 text-sky-700",
  Completed: "bg-emerald-100 text-emerald-700",
  "Awaiting Approval": "bg-orange-100 text-orange-700",
  Rejected: "bg-rose-100 text-rose-700",
  Low: "bg-emerald-100 text-emerald-800",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-rose-100 text-rose-800",
  Active: "bg-emerald-100 text-emerald-800",
  Maintenance: "bg-amber-100 text-amber-800",
  "Calibration Due": "bg-orange-100 text-orange-800",
  Retired: "bg-slate-200 text-slate-700",
  Unread: "bg-sky-100 text-sky-800",
  Read: "bg-slate-100 text-slate-700",
  Pending: "bg-slate-100 text-slate-700",
  Pass: "bg-emerald-100 text-emerald-700",
  Fail: "bg-rose-100 text-rose-700",
  "N/A": "bg-slate-100 text-slate-700",
  Minor: "bg-amber-100 text-amber-700",
  Major: "bg-orange-100 text-orange-700",
  "Action Planned": "bg-sky-100 text-sky-700",
  Corrective: "bg-cyan-100 text-cyan-700",
  Preventive: "bg-lime-100 text-lime-700",
  Blocked: "bg-rose-100 text-rose-700"
};

export function StatusBadge({ value }: { value?: string | number | null }) {
  if (value === undefined || value === null || value === "") {
    return <span className="text-sm text-slate-400">Not set</span>;
  }

  const text = String(value);

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        badgeStyles[text] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {text}
    </span>
  );
}
