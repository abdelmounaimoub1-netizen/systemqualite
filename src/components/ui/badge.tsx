import { cn } from "@/lib/utils";

const badgeStyles: Record<string, string> = {
  Draft: "bg-[#edf7ff] text-[#2749a0]",
  "Under Review": "bg-[#fff4b8] text-[#6b5500]",
  Approved: "bg-[#d7f8ff] text-[#006a8a]",
  Archived: "bg-slate-100 text-muted",
  Open: "bg-[#fff4b8] text-[#6b5500]",
  "In Progress": "bg-[#d7f8ff] text-[#006a8a]",
  Closed: "bg-[#e3fbf4] text-[#08735f]",
  Verification: "bg-[#edf7ff] text-[#2749a0]",
  Planned: "bg-[#edf7ff] text-[#2749a0]",
  Completed: "bg-[#e3fbf4] text-[#08735f]",
  "Awaiting Approval": "bg-[#fff4b8] text-[#6b5500]",
  Rejected: "bg-danger/10 text-danger",
  Low: "bg-[#e3fbf4] text-[#08735f]",
  Medium: "bg-[#fff4b8] text-[#6b5500]",
  High: "bg-[#ffe6a1] text-[#7a4b00]",
  Critical: "bg-danger/10 text-danger",
  Active: "bg-[#e3fbf4] text-[#08735f]",
  Maintenance: "bg-[#fff4b8] text-[#6b5500]",
  "Calibration Due": "bg-[#ffe6a1] text-[#7a4b00]",
  Retired: "bg-slate-100 text-muted",
  Unread: "bg-[#d7f8ff] text-[#006a8a]",
  Read: "bg-slate-100 text-muted",
  Pending: "bg-[#edf7ff] text-[#2749a0]",
  Pass: "bg-[#e3fbf4] text-[#08735f]",
  Fail: "bg-danger/10 text-danger",
  "N/A": "bg-slate-100 text-muted",
  Minor: "bg-[#fff4b8] text-[#6b5500]",
  Major: "bg-[#ffe6a1] text-[#7a4b00]",
  "Action Planned": "bg-[#d7f8ff] text-[#006a8a]",
  Corrective: "bg-[#d7f8ff] text-[#006a8a]",
  Preventive: "bg-[#e3fbf4] text-[#08735f]",
  Blocked: "bg-danger/10 text-danger"
};

const badgeLabels: Record<string, string> = {
  Draft: "Brouillon",
  "Under Review": "En validation",
  Approved: "Approuve",
  Archived: "Archive",
  Open: "Ouvert",
  "In Progress": "En cours",
  Closed: "Clos",
  Verification: "Verification",
  Planned: "Planifie",
  Completed: "Termine",
  "Awaiting Approval": "En attente d'approbation",
  Rejected: "Rejete",
  Low: "Faible",
  Medium: "Moyen",
  High: "Eleve",
  Critical: "Critique",
  Active: "Actif",
  Maintenance: "Maintenance",
  "Calibration Due": "Etalonnage a prevoir",
  Retired: "Retire",
  Unread: "Non lu",
  Read: "Lu",
  Pending: "En attente",
  Pass: "Conforme",
  Fail: "Non conforme",
  "N/A": "N/A",
  Minor: "Mineur",
  Major: "Majeur",
  "Action Planned": "Action planifiee",
  Corrective: "Corrective",
  Preventive: "Preventive",
  Blocked: "Bloque",
  Submitted: "Soumis",
  Answered: "Repondu",
  Analyzed: "Analyse",
  Expired: "Expire",
  Done: "Realise",
  Ineffective: "Inefficace",
  Accepted: "Accepte",
  Converted: "Converti",
  Skipped: "Ignore",
  "To Acknowledge": "A accuser",
  Acknowledged: "Accuse",
  Overdue: "En retard",
  Cancelled: "Annule",
  Late: "En retard"
};

export function StatusBadge({ value }: { value?: string | number | null }) {
  if (value === undefined || value === null || value === "") {
    return <span className="text-sm text-slate-400">Non renseigne</span>;
  }

  const text = String(value);

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        badgeStyles[text] ?? "bg-[#edf7ff] text-[#2749a0]"
      )}
    >
      {badgeLabels[text] ?? text}
    </span>
  );
}
